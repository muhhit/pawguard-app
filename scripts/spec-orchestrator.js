#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function readJSON(p, d = null) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return d; } }
function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { start: "T0", watch: true, max: Infinity };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if ((a === "-s" || a === "--start") && args[i + 1]) out.start = args[++i];
    else if (a === "--no-watch") out.watch = false;
    else if ((a === "-n" || a === "--max") && args[i + 1]) out.max = Number(args[++i]) || Infinity;
  }
  return out;
}

function loadConfig() {
  const cfg = readJSON(path.resolve(process.cwd(), "spec.config.json"), {});
  return cfg;
}

function loadSpec() {
  const cfg = loadConfig();
  const specPath = path.resolve(process.cwd(), cfg.specFile || "SPEC.md");
  const md = fs.readFileSync(specPath, "utf8");
  const lines = md.split(/\n/);
  const tasks = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^###\s+(T\d+:[^\n]+)/);
    if (m) tasks.push(m[1]);
  }
  return tasks;
}

function numericId(id) {
  const m = String(id).match(/T(\d+)/i); return m ? parseInt(m[1], 10) : 9999;
}

function buildQueue(startId) {
  const cfg = loadConfig();
  const specTasks = loadSpec();
  const configTasks = Object.keys(cfg.tasks || {});
  // Merge & unique by ID
  const set = new Set();
  const all = [];
  // Add SPEC tasks first (T0..T12), then config tasks (T43..)
  [...specTasks, ...configTasks].forEach((id) => {
    if (!set.has(id)) { set.add(id); all.push(id); }
  });
  // Sort by numeric T value
  all.sort((a, b) => numericId(a) - numericId(b));
  // Start from requested
  const startIndex = Math.max(0, all.findIndex((x) => x.toLowerCase().startsWith(startId.toLowerCase())));
  return all.slice(startIndex);
}

function statusFor(id) {
  const safe = id.replace(/[^a-zA-Z0-9_:-]/g, "_");
  const p = path.resolve(process.cwd(), "spec_tasks", safe, "status.json");
  return readJSON(p, { state: "unknown" });
}

function prepareTask(id) {
  console.log(`\n[orchestrator] Prepare ${id}`);
  const r = spawnSync(process.execPath, [path.resolve("scripts/spec-kit.js"), "-t", id, "--branch"], { stdio: "inherit" });
  if (r.status !== 0) {
    console.warn(`[orchestrator] spec-kit failed for ${id} (exit ${r.status}). Continuing.`);
  }
}

function main() {
  const args = parseArgs();
  const queue = buildQueue(args.start);
  console.log("[orchestrator] Queue:", queue.join(", "));

  let prepared = 0;
  for (const id of queue) {
    if (prepared >= args.max) break;
    // Skip if already completed
    const st = statusFor(id);
    if (st && (st.state === "completed" || st.state === "done")) {
      console.log(`[orchestrator] Skip ${id} (already completed)`);
      continue;
    }
    // Skip if already prepared
    if (st && st.state === "prepared" && args.watch) {
      console.log(`[orchestrator] Already prepared ${id}, waiting for completion...`);
    } else {
      prepareTask(id);
    }

    prepared++;
    if (args.watch) {
      // Poll until completed
      const safe = id.replace(/[^a-zA-Z0-9_:-]/g, "_");
      const p = path.resolve(process.cwd(), "spec_tasks", safe, "status.json");
      let tries = 0;
      while (true) {
        const s = readJSON(p, {});
        if (s && (s.state === "completed" || s.state === "done")) {
          console.log(`[orchestrator] Completed ${id}`);
          break;
        }
        tries++;
        if (tries % 60 === 0) console.log(`[orchestrator] Waiting on ${id}... (${tries/60}m)`);
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5_000); // sleep 5s
      }
    }
  }

  console.log(`\n[orchestrator] Done. Prepared ${prepared} task(s).`);
}

main();


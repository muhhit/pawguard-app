#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { provider: null, task: null, mode: "run" };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if ((a === "-p" || a === "--provider") && args[i + 1]) out.provider = args[++i];
    else if ((a === "-t" || a === "--task") && args[i + 1]) out.task = args[++i];
    else if ((a === "-m" || a === "--mode") && args[i + 1]) out.mode = args[++i];
  }
  return out;
}

function loadConfig() {
  const cfgPath = path.resolve(process.cwd(), "spec.config.json");
  if (!fs.existsSync(cfgPath)) throw new Error("spec.config.json not found");
  const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  if (!cfg.specFile) throw new Error("spec.config.json missing specFile");
  return cfg;
}

function loadSpec(specFile) {
  const p = path.resolve(process.cwd(), specFile);
  if (!fs.existsSync(p)) throw new Error(`Spec file not found: ${specFile}`);
  return fs.readFileSync(p, "utf8");
}

function extractTasks(md) {
  // naive split on headings starting with '### '
  return md
    .split(/\n(?=###\s+)/g)
    .filter((s) => s.startsWith("### "))
    .map((s) => {
      const firstLine = s.split(/\n/)[0];
      const title = firstLine.replace(/^###\s+/, "").trim();
      return { title, body: s };
    });
}

function main() {
  const { provider, task, mode } = parseArgs();
  const cfg = loadConfig();
  const md = loadSpec(cfg.specFile);
  const tasks = extractTasks(md);

  if (mode === "list") {
    console.log("Tasks:");
    tasks.forEach((t, i) => console.log(`- T${i + 1}: ${t.title}`));
    process.exit(0);
  }

  // Default to Claude (anthropic) task ordering in spec.config.json
  const wanted = task || Object.keys(cfg.tasks || {})[0] || 'mobile:claude';
  const needle = (wanted || "").split(":").pop().replace(/^[^a-z0-9]+/i, "").toLowerCase();
  let tdef = tasks.find((t) => t.title.toLowerCase().includes(needle));
  // Fallback: if no matching task title (e.g. 'claude|openai|gemini'), pick the first SPEC task (typically T0)
  if (!tdef) {
    tdef = tasks[0];
  }
  const selection = cfg.tasks[wanted] || { provider };
  const prov = selection.provider || provider || "openai";
  const model = selection.model || process.env.SPEC_MODEL || "gpt-4o";

  if (!tdef) {
    console.error("Task not found in SPEC.md. Use `node scripts/spec-kit.js -m list` to see tasks.");
    process.exit(2);
  }

  // Stub runner – real LLM calls are delegated to editor agents (Cline/Continue).
  // Here we validate env and print a structured plan for the chosen provider.
  const neededEnv = {
    openai: ["OPENAI_API_KEY"],
    anthropic: ["ANTHROPIC_API_KEY"],
    google: ["GOOGLE_API_KEY"],
  }[prov] || [];

  const missing = neededEnv.filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn(`Warning: Missing env for provider ${prov}: ${missing.join(", ")}`);
  }

  console.log("\n=== Spec Runner ===");
  console.log(`Provider: ${prov}`);
  console.log(`Model: ${model}`);
  console.log(`Task: ${tdef.title}`);
  console.log("--- Plan ---");
  console.log("1) Read SPEC task and repo files");
  console.log("2) Propose minimal diffs");
  console.log("3) Apply changes, update docs/env examples");
  console.log("4) Validate via lint/build and exit");
  console.log("\n--- Task Body ---\n");
  console.log(tdef.body.trim());
  console.log("\nNote: Use Cline/Continue to execute the plan interactively inside Codespaces. This CLI is a thin orchestrator.");
}

main();

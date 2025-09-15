#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { provider: null, model: null, task: null, mode: "run", branch: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if ((a === "-p" || a === "--provider") && args[i + 1]) out.provider = args[++i];
    else if ((a === "--model") && args[i + 1]) out.model = args[++i];
    else if ((a === "-t" || a === "--task") && args[i + 1]) out.task = args[++i];
    else if ((a === "-m" || a === "--mode") && args[i + 1]) out.mode = args[++i];
    else if (a === "--branch") out.branch = true;
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

function extractSpecTasks(md) {
  const chunks = md.split(/\n(?=###\s+)/g).filter((s) => s.startsWith("### "));
  return chunks.map((s) => {
    const firstLine = s.split(/\n/)[0];
    const title = firstLine.replace(/^###\s+/, "").trim();
    return { title, body: s };
  });
}

function pickConfigTask(cfg, wanted) {
  if (wanted && cfg.tasks && cfg.tasks[wanted]) return { id: wanted, def: cfg.tasks[wanted] };
  if (wanted && cfg.legacy && cfg.legacy[wanted]) return { id: wanted, def: cfg.legacy[wanted] };
  // No explicit request: let SPEC drive task selection (do not auto-pick from config)
  return null;
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function writeTaskScaffold(taskId, selection, specBody, prov, model) {
  const safeId = String(taskId).replace(/[^a-zA-Z0-9_:-]/g, "_");
  const dir = path.resolve(process.cwd(), "spec_tasks", safeId);
  ensureDir(dir);
  const planPath = path.join(dir, "plan.json");
  const promptPath = path.join(dir, "agent-handoff.md");
  const statusPath = path.join(dir, "status.json");

  const plan = {
    id: taskId,
    provider: selection.provider || null,
    model: selection.model || null,
    description: selection.description || null,
    difficulty: selection.difficulty || null,
    priority: selection.priority || null,
    dependencies: selection.dependencies || [],
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));

  const prompt = `Task: ${taskId} — ${selection.description || "SPEC task"}

Context:
- Provider: ${prov || "(defer)"}
- Model: ${model || "(defer)"}
- Priority: ${selection.priority ?? "n/a"}
- Difficulty: ${selection.difficulty ?? "n/a"}
- Dependencies: ${Array.isArray(selection.dependencies) ? selection.dependencies.join(", ") : "n/a"}

SPEC Excerpt:\n\n${specBody.trim()}\n\nRules:\n- Keep diffs minimal; follow repo style.\n- Update docs/tests and .env.example when needed.\n- Do not commit secrets.\n- Small, verifiable commits.\n- When this task is completed, update status.json to {\"state\": \"completed\"} to allow the orchestrator to proceed.\n`;
  fs.writeFileSync(promptPath, prompt);

  const status = { state: "prepared", notes: "Hand off this folder to IDE agent (Cline) to execute." };
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));

  return { dir, planPath, promptPath, statusPath };
}

function main() {
  const { provider, model: cliModel, task, mode, branch } = parseArgs();
  const cfg = loadConfig();
  const md = loadSpec(cfg.specFile);
  const specTasks = extractSpecTasks(md);

  if (mode === "list") {
    console.log("Config tasks:");
    Object.keys(cfg.tasks || {}).forEach((k) => console.log(`- ${k}`));
    console.log("\nSPEC sections:");
    specTasks.forEach((t) => console.log(`- ${t.title}`));
    process.exit(0);
  }

  const picked = pickConfigTask(cfg, task);
  let selection = picked ? picked.def : {};
  // If user provided an explicit task id/needle that isn't in config, honor it as SPEC needle
  let taskId = picked ? picked.id : (task || (specTasks[0] ? specTasks[0].title : "unknown"));

  const needle = String(taskId).split(":").pop().toLowerCase();
  const specMatch = specTasks.find((t) => t.title.toLowerCase().includes(needle)) || specTasks[0];

  // Resolve provider/model: Spec‑Kit routes to best agent unless explicitly overridden
  function includesAny(text, keys) {
    const t = (text || "").toLowerCase();
    return keys.some((k) => t.includes(k));
  }
  function routeProviderModel(sel, title, body) {
    const hay = `${title}\n${body}\n${sel?.description || ""}`.toLowerCase();
    // Vision/Brandify/Parallax → Gemini 2.5 Pro
    if (includesAny(hay, ["brandify","parallax","image","poster","collage","vision"])) {
      return { provider: "google", model: "gemini-2.5-pro" };
    }
    // API/Integration/HTTP/Container/Docker/Scalability/Caching/Performance → GPT‑5 Pro
    if (includesAny(hay, ["api","integration","http","client","container","docker","scalability","caching","performance","latency","throughput"])) {
      return { provider: "openai", model: "gpt-5-pro" };
    }
    // RLS/Policy/SQL/Supabase → Anthropic Claude Sonnet 4; hard/complex → Opus 4.1
    const isPolicySql = includesAny(hay, ["rls","policy","sql","supabase","privacy","security"]);
    const difficulty = (sel?.difficulty || "").toLowerCase();
    const isComplex = difficulty === "hard" || includesAny(hay, ["architecture","migration","microservices","orchestration","complex","refactor large","design doc","planning"]);
    if (isPolicySql || includesAny(hay, ["typescript","devex","lint","eslint","type-check"])) {
      return { provider: "anthropic", model: isComplex ? "claude-4.1-opus" : "claude-4-sonnet" };
    }
    // Docs/planning → Anthropic Sonnet 4 (Opus only if explicitly set)
    if (includesAny(hay, ["architecture","roadmap","design","documentation"])) {
      return { provider: "anthropic", model: isComplex ? "claude-4.1-opus" : "claude-4-sonnet" };
    }
    // Fallback: Anthropic Sonnet 4
    return { provider: "anthropic", model: "claude-4-sonnet" };
  }
  const routed = routeProviderModel(selection, specMatch?.title || "", specMatch?.body || "");
  const prov = selection.provider || provider || routed.provider || null;
  const model = selection.model || cliModel || process.env.SPEC_MODEL || routed.model || null;

  const neededEnv = { openai: ["OPENAI_API_KEY"], anthropic: ["ANTHROPIC_API_KEY"], google: ["GOOGLE_API_KEY"] }[prov] || [];
  const missing = neededEnv.filter((k) => !process.env[k]);
  if (missing.length) console.warn(`Warning: Missing env for provider ${prov}: ${missing.join(", ")}`);

  const scaffold = writeTaskScaffold(taskId, { ...selection, provider: prov, model }, specMatch ? specMatch.body : md, prov, model);

  if (branch) {
    try {
      const safe = String(taskId).replace(/[^a-zA-Z0-9_-]/g, "-");
      execSync(`git checkout -b task/${safe}`, { stdio: "ignore" });
    } catch {}
  }

  console.log("\n=== Spec Runner ===");
  console.log(`Provider: ${prov}`);
  console.log(`Model: ${model}`);
  console.log(`Selected: ${taskId}`);
  console.log(`Prepared: ${path.relative(process.cwd(), scaffold.dir)}`);
  console.log("Files:");
  console.log("- " + path.relative(process.cwd(), scaffold.planPath));
  console.log("- " + path.relative(process.cwd(), scaffold.promptPath));
  console.log("- " + path.relative(process.cwd(), scaffold.statusPath));
  console.log("\nHand this folder to your IDE agent (e.g., Cline). Then implement and commit changes per the prompt.\n");
}

main();

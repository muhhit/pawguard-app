#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function readJSON(p, d = null) { 
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return d; } 
}

function writeJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function main() {
  const args = process.argv.slice(2);
  const taskArg = args.indexOf("--task");
  const providerArg = args.indexOf("--provider");
  const modelArg = args.indexOf("--model");
  const taskPathArg = args.indexOf("--task-path");
  
  if (taskArg === -1 || providerArg === -1 || modelArg === -1 || taskPathArg === -1) {
    console.error("Usage: node cline-agent-runner.js --task T1 --provider anthropic --model claude-4-sonnet --task-path /path/to/task");
    process.exit(1);
  }
  
  const taskId = args[taskArg + 1];
  const provider = args[providerArg + 1];
  const model = args[modelArg + 1];
  const taskPath = args[taskPathArg + 1];
  
  console.log(`[cline-agent] Starting agent for ${taskId}`);
  
  // Read task plan and handoff
  const planPath = path.join(taskPath, "plan.json");
  const handoffPath = path.join(taskPath, "agent-handoff.md");
  const statusPath = path.join(taskPath, "status.json");
  
  const plan = readJSON(planPath);
  const handoff = fs.existsSync(handoffPath) ? fs.readFileSync(handoffPath, "utf8") : "";
  
  if (!plan) {
    console.error(`[cline-agent] No plan found for ${taskId}`);
    process.exit(1);
  }
  
  // Simulate agent work (in real implementation, this would call actual Cline API)
  console.log(`[cline-agent] Processing ${taskId} with ${provider}/${model}`);
  console.log(`[cline-agent] Task description: ${plan.description || plan.id}`);
  
  // Mark as in progress
  writeJSON(statusPath, { state: "in_progress", startedAt: new Date().toISOString() });
  
  // Simulate work time (2-5 seconds)
  const workTime = Math.random() * 3000 + 2000;
  
  setTimeout(() => {
    // Mark as completed
    writeJSON(statusPath, { 
      state: "completed", 
      startedAt: new Date(Date.now() - workTime).toISOString(),
      completedAt: new Date().toISOString(),
      provider,
      model
    });
    
    console.log(`[cline-agent] Completed ${taskId}`);
    process.exit(0);
  }, workTime);
}

main();

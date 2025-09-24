#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function readJSON(p, d = null) { 
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return d; } 
}

function findPreparedTasks() {
  const tasksDir = path.resolve(process.cwd(), "spec_tasks");
  if (!fs.existsSync(tasksDir)) return [];
  
  const prepared = [];
  const entries = fs.readdirSync(tasksDir);
  
  for (const entry of entries) {
    const taskPath = path.join(tasksDir, entry);
    const statusPath = path.join(taskPath, "status.json");
    
    if (fs.existsSync(statusPath)) {
      const status = readJSON(statusPath);
      if (status && status.state === "prepared") {
        const planPath = path.join(taskPath, "plan.json");
        const plan = readJSON(planPath);
        prepared.push({ taskId: entry, taskPath, plan, status });
      }
    }
  }
  
  return prepared.sort((a, b) => {
    const aNum = parseInt(a.taskId.match(/T(\d+)/)?.[1] || "999");
    const bNum = parseInt(b.taskId.match(/T(\d+)/)?.[1] || "999");
    return aNum - bNum;
  });
}

function startAgent(task) {
  const { taskId, taskPath, plan } = task;
  const provider = plan?.provider || "anthropic";
  const model = plan?.model || "claude-4-sonnet";
  
  console.log(`[auto-agent] Starting agent for ${taskId} (${provider}/${model})`);
  
  // Start Cline agent for this task
  const agentProcess = spawn("node", [
    path.resolve(__dirname, "cline-agent-runner.js"),
    "--task", taskId,
    "--provider", provider,
    "--model", model,
    "--task-path", taskPath
  ], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  agentProcess.unref();
  
  // Log output
  agentProcess.stdout.on('data', (data) => {
    console.log(`[${taskId}] ${data.toString().trim()}`);
  });
  
  agentProcess.stderr.on('data', (data) => {
    console.error(`[${taskId}] ERROR: ${data.toString().trim()}`);
  });
  
  return agentProcess;
}

function main() {
  console.log("[auto-agent] Scanning for prepared tasks...");
  
  const prepared = findPreparedTasks();
  console.log(`[auto-agent] Found ${prepared.length} prepared tasks`);
  
  if (prepared.length === 0) {
    console.log("[auto-agent] No prepared tasks found. Exiting.");
    return;
  }
  
  // Start agents for all prepared tasks
  const activeAgents = new Map();
  
  for (const task of prepared) {
    const agent = startAgent(task);
    activeAgents.set(task.taskId, agent);
  }
  
  // Monitor completion
  const checkInterval = setInterval(() => {
    const stillPrepared = findPreparedTasks();
    const completedTasks = prepared.filter(task => 
      !stillPrepared.some(p => p.taskId === task.taskId)
    );
    
    for (const completed of completedTasks) {
      console.log(`[auto-agent] Task ${completed.taskId} completed!`);
      const agent = activeAgents.get(completed.taskId);
      if (agent) {
        agent.kill();
        activeAgents.delete(completed.taskId);
      }
    }
    
    if (activeAgents.size === 0) {
      console.log("[auto-agent] All tasks completed!");
      clearInterval(checkInterval);
    }
  }, 5000);
  
  // Keep process alive
  process.on('SIGINT', () => {
    console.log("[auto-agent] Shutting down...");
    for (const agent of activeAgents.values()) {
      agent.kill();
    }
    clearInterval(checkInterval);
    process.exit(0);
  });
}

main();

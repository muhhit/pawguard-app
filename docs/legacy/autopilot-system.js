#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

class AutopilotSystem {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.config = {
      enabled: true,
      mode: "aggressive",
      periodMs: 60000, // 1 minute for faster fixes
      concurrency: 4,
      maxTasks: 12
    };
    
    this.taskCounter = 67; // Start from T67
    this.specTasksDir = path.join(process.cwd(), 'spec_tasks');
  }

  async start() {
    if (this.isRunning) {
      console.log("⚠️  [AUTOPILOT] Already running");
      return;
    }

    this.isRunning = true;
    console.log("🤖 [AUTOPILOT] Starting continuous task generation...");
    console.log(`⚙️  [AUTOPILOT] Mode: ${this.config.mode}, Period: ${this.config.periodMs/1000}s`);

    this.interval = setInterval(() => {
      this.generateNextTasks();
    }, this.config.periodMs);

    // Generate first batch immediately
    await this.generateNextTasks();
  }

  stop() {
    if (!this.isRunning) {
      console.log("⚠️  [AUTOPILOT] Not running");
      return;
    }

    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log("🛑 [AUTOPILOT] Stopped");
  }

  async generateNextTasks() {
    console.log(`🔍 [AUTOPILOT] Scanning for completed tasks...`);
    
    const completedTasks = await this.getCompletedTasks();
    const totalTasks = await this.getTotalTasks();
    
    console.log(`📊 [AUTOPILOT] ${completedTasks}/${totalTasks} tasks completed`);

    if (completedTasks >= totalTasks - 2) { // If almost all tasks done
      const newTasks = await this.createNextBatch();
      console.log(`✨ [AUTOPILOT] Generated ${newTasks.length} new tasks`);
      
      // Deploy to Optimus Prime
      await this.deployToOptimus();
    }
  }

  async getCompletedTasks() {
    if (!fs.existsSync(this.specTasksDir)) return 0;
    
    const taskDirs = fs.readdirSync(this.specTasksDir)
      .filter(dir => dir.startsWith('T') && dir.includes(':'));
    
    let completed = 0;
    for (const taskDir of taskDirs) {
      const statusPath = path.join(this.specTasksDir, taskDir, 'status.json');
      if (fs.existsSync(statusPath)) {
        const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        if (status.state === 'completed') {
          completed++;
        }
      }
    }
    
    return completed;
  }

  async getTotalTasks() {
    if (!fs.existsSync(this.specTasksDir)) return 0;
    
    return fs.readdirSync(this.specTasksDir)
      .filter(dir => dir.startsWith('T') && dir.includes(':')).length;
  }

  async createNextBatch() {
    const newTasks = [];
    const batchSize = this.config.maxTasks;
    
    for (let i = 0; i < batchSize; i++) {
      const taskDef = this.generateRealisticTask(this.taskCounter + i);
      const task = await this.createTask(taskDef);
      newTasks.push(task);
    }
    
    this.taskCounter += batchSize;
    return newTasks;
  }

  generateRealisticTask(taskNumber) {
    const realisticTasks = [
      {
        name: 'Advanced_Testing___Automation',
        description: 'Implement comprehensive automated testing suite with coverage reporting',
        complexity: 3,
        unicornPotential: 2
      },
      {
        name: 'Performance_Optimization___Bundle_Size',
        description: 'Optimize app bundle size and loading performance',
        complexity: 3,
        unicornPotential: 3
      },
      {
        name: 'Security_Audit___Vulnerability_Scan',
        description: 'Conduct security audit and fix identified vulnerabilities',
        complexity: 4,
        unicornPotential: 4
      },
      {
        name: 'User_Experience___Accessibility',
        description: 'Improve accessibility features and WCAG compliance',
        complexity: 3,
        unicornPotential: 2
      },
      {
        name: 'API_Documentation___OpenAPI',
        description: 'Create comprehensive API documentation with OpenAPI/Swagger',
        complexity: 2,
        unicornPotential: 1
      },
      {
        name: 'Monitoring___Health_Checks',
        description: 'Implement health checks and system monitoring',
        complexity: 3,
        unicornPotential: 3
      }
    ];

    const taskTemplate = realisticTasks[(taskNumber - 67) % realisticTasks.length];
    
    return {
      id: `T${taskNumber}`,
      name: `${taskTemplate.name}___Batch_${Math.floor((taskNumber - 67) / 6) + 1}`,
      description: taskTemplate.description,
      complexity: taskTemplate.complexity,
      unicornPotential: taskTemplate.unicornPotential,
      model: taskTemplate.complexity >= 4 ? 'claude-4.1-opus' : 'claude-4-sonnet',
      provider: 'anthropic'
    };
  }

  async createTask(taskDef) {
    const taskDir = path.join(this.specTasksDir, `${taskDef.id}:_${taskDef.name}`);
    
    if (!fs.existsSync(taskDir)) {
      fs.mkdirSync(taskDir, { recursive: true });
    }

    // Create plan.json
    const plan = {
      provider: taskDef.provider,
      model: taskDef.model,
      description: taskDef.description,
      agent: this.getAgentForModel(taskDef.model),
      complexity: taskDef.complexity,
      unicornPotential: taskDef.unicornPotential
    };
    
    fs.writeFileSync(
      path.join(taskDir, 'plan.json'),
      JSON.stringify(plan, null, 2)
    );

    // Create agent-handoff.md
    const handoff = `Task: ${taskDef.id} — SPEC task

Context:
- Provider: ${taskDef.provider}
- Model: ${taskDef.model}
- Priority: medium
- Difficulty: ${taskDef.complexity}/5
- Dependencies: previous tasks

SPEC Excerpt:

### ${taskDef.id}: ${taskDef.name.replace(/_/g, ' ')}
- ${taskDef.description}
- Acceptance: production-ready implementation with proper testing

Rules:
- Follow React Native best practices
- Include comprehensive tests
- Update documentation
- Ensure mobile performance
- When this task is completed, update status.json to {"state": "completed"}
`;
    
    fs.writeFileSync(
      path.join(taskDir, 'agent-handoff.md'),
      handoff
    );

    // Create status.json
    const status = {
      state: "prepared",
      notes: `Auto-generated by Autopilot System - ready for ${taskDef.model} implementation`
    };
    
    fs.writeFileSync(
      path.join(taskDir, 'status.json'),
      JSON.stringify(status, null, 2)
    );

    console.log(`✅ [AUTOPILOT] Created ${taskDef.id}: ${taskDef.name}`);
    
    return {
      id: taskDef.id,
      name: taskDef.name,
      path: taskDir,
      model: taskDef.model,
      provider: taskDef.provider
    };
  }

  getAgentForModel(model) {
    if (model.includes('claude-4.1-opus')) return 'optimus-prime-opus';
    if (model.includes('claude-4-sonnet')) return 'optimus-claude';
    if (model.includes('gpt-5-pro')) return 'bumblebee-gpt';
    if (model.includes('gemini-2.5-pro')) return 'jazz-gemini';
    return 'optimus-claude';
  }

  async deployToOptimus() {
    console.log("🤖 [AUTOPILOT] Deploying new tasks to Optimus Prime...");
    
    const optimusProcess = spawn('node', ['scripts/complete-optimus-prime.js'], {
      stdio: 'pipe',
      detached: true
    });

    optimusProcess.unref(); // Don't wait for completion
    
    console.log("🚀 [AUTOPILOT] Optimus Prime deployment initiated");
  }

  getStatus() {
    return {
      enabled: this.config.enabled,
      running: this.isRunning,
      mode: this.config.mode,
      periodMs: this.config.periodMs,
      concurrency: this.config.concurrency,
      maxTasks: this.config.maxTasks,
      nextTaskNumber: this.taskCounter
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.enabled && !this.isRunning) {
      this.start();
    } else if (!newConfig.enabled && this.isRunning) {
      this.stop();
    }
    
    return this.config;
  }
}

// Export for use in other scripts
if (require.main === module) {
  const autopilot = new AutopilotSystem();
  
  // Start autopilot if enabled
  if (process.env.AUTOPILOT_ENABLED === 'true') {
    autopilot.updateConfig({ enabled: true });
  }
  
  console.log("🤖 [AUTOPILOT] System ready");
  console.log("📊 Status:", autopilot.getStatus());
} else {
  module.exports = AutopilotSystem;
}

#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

class AdvancedSpecGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.specTasksDir = path.join(this.projectRoot, 'spec_tasks');
    
    // Advanced AI models for different task types
    this.modelMatrix = {
      'claude-4.1-opus': ['security', 'architecture', 'complex-ai', 'critical-systems'],
      'claude-4-sonnet': ['backend', 'api', 'database', 'infrastructure'],
      'gpt-5-pro': ['ai', 'ml', 'algorithms', 'data-processing', 'analytics'],
      'gemini-2.5-pro': ['performance', 'optimization', 'media', 'ui', 'real-time']
    };
    
    // Next-generation task categories
    this.advancedTaskCategories = [
      {
        id: 'T43',
        name: 'Quantum_Pet_Tracking___Advanced_Physics',
        description: 'Quantum-enhanced pet location tracking using advanced physics algorithms',
        complexity: 5,
        unicornPotential: 5,
        model: 'claude-4.1-opus',
        provider: 'anthropic'
      },
      {
        id: 'T44',
        name: 'Neural_Behavior_Prediction___Deep_Learning',
        description: 'Advanced neural networks for predicting pet behavior patterns',
        complexity: 5,
        unicornPotential: 5,
        model: 'gpt-5-pro',
        provider: 'openai'
      },
      {
        id: 'T45',
        name: 'Blockchain_Pet_Identity___Web3_Integration',
        description: 'Decentralized pet identity system using blockchain technology',
        complexity: 4,
        unicornPotential: 4,
        model: 'claude-4-sonnet',
        provider: 'anthropic'
      },
      {
        id: 'T46',
        name: 'AR_VR_Pet_Interaction___Metaverse_Ready',
        description: 'Augmented and Virtual Reality interfaces for pet interaction',
        complexity: 5,
        unicornPotential: 5,
        model: 'gemini-2.5-pro',
        provider: 'google'
      },
      {
        id: 'T47',
        name: 'Autonomous_Drone_Rescue___AI_Coordination',
        description: 'AI-coordinated autonomous drone fleet for pet rescue operations',
        complexity: 5,
        unicornPotential: 5,
        model: 'claude-4.1-opus',
        provider: 'anthropic'
      },
      {
        id: 'T48',
        name: 'Biometric_Pet_Authentication___Advanced_Security',
        description: 'Multi-modal biometric authentication system for pets',
        complexity: 4,
        unicornPotential: 4,
        model: 'claude-4.1-opus',
        provider: 'anthropic'
      },
      {
        id: 'T49',
        name: 'Predictive_Health_Analytics___Medical_AI',
        description: 'AI-powered predictive health analytics for preventive pet care',
        complexity: 5,
        unicornPotential: 5,
        model: 'gpt-5-pro',
        provider: 'openai'
      },
      {
        id: 'T50',
        name: 'Smart_City_Integration___IoT_Ecosystem',
        description: 'Integration with smart city infrastructure and IoT ecosystem',
        complexity: 4,
        unicornPotential: 4,
        model: 'claude-4-sonnet',
        provider: 'anthropic'
      }
    ];
  }

  async scanProjectForIssues() {
    console.log("🔍 [SPEC-GENERATOR] Scanning project for issues and improvements...");
    
    const issues = [];
    
    // Scan for old model usage
    const oldModelUsage = await this.findOldModelUsage();
    issues.push(...oldModelUsage);
    
    // Scan for performance issues
    const performanceIssues = await this.findPerformanceIssues();
    issues.push(...performanceIssues);
    
    // Scan for security vulnerabilities
    const securityIssues = await this.findSecurityIssues();
    issues.push(...securityIssues);
    
    // Scan for missing features
    const missingFeatures = await this.findMissingFeatures();
    issues.push(...missingFeatures);
    
    return issues;
  }

  async findOldModelUsage() {
    const issues = [];
    const files = await this.getAllFiles(['.ts', '.tsx', '.js', '.jsx']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('gpt-4o') && !content.includes('gpt-5-pro')) {
        issues.push({
          type: 'old_model',
          file,
          issue: 'Using GPT-4o instead of GPT-5-pro',
          severity: 'high',
          suggestedTask: 'Model_Upgrade___GPT_5_Pro_Migration'
        });
      }
      
      if (content.includes('claude-3.5-sonnet')) {
        issues.push({
          type: 'old_model',
          file,
          issue: 'Using Claude-3.5-sonnet instead of Claude-4-sonnet/Opus-4.1',
          severity: 'high',
          suggestedTask: 'Model_Upgrade___Claude_4_Migration'
        });
      }
      
      if (content.includes('gemini-1.5-pro')) {
        issues.push({
          type: 'old_model',
          file,
          issue: 'Using Gemini-1.5-pro instead of Gemini-2.5-pro',
          severity: 'high',
          suggestedTask: 'Model_Upgrade___Gemini_2_5_Migration'
        });
      }
    }
    
    return issues;
  }

  async findPerformanceIssues() {
    const issues = [];
    
    // Check for missing caching
    const files = await this.getAllFiles(['.ts', '.tsx']);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('fetch(') && !content.includes('cache')) {
        issues.push({
          type: 'performance',
          file,
          issue: 'API calls without caching',
          severity: 'medium',
          suggestedTask: 'Advanced_Caching___Performance_Optimization'
        });
      }
    }
    
    return issues;
  }

  async findSecurityIssues() {
    const issues = [];
    
    // Check for hardcoded secrets
    const files = await this.getAllFiles(['.ts', '.tsx', '.js', '.jsx']);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.match(/api[_-]?key\s*[:=]\s*["'][^"']+["']/i)) {
        issues.push({
          type: 'security',
          file,
          issue: 'Potential hardcoded API key',
          severity: 'critical',
          suggestedTask: 'Security_Hardening___Secret_Management'
        });
      }
    }
    
    return issues;
  }

  async findMissingFeatures() {
    const issues = [];
    
    // Check for missing error boundaries
    const reactFiles = await this.getAllFiles(['.tsx']);
    let hasErrorBoundary = false;
    
    for (const file of reactFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('ErrorBoundary') || content.includes('componentDidCatch')) {
        hasErrorBoundary = true;
        break;
      }
    }
    
    if (!hasErrorBoundary) {
      issues.push({
        type: 'missing_feature',
        issue: 'Missing error boundaries in React components',
        severity: 'medium',
        suggestedTask: 'Error_Handling___React_Error_Boundaries'
      });
    }
    
    return issues;
  }

  async getAllFiles(extensions) {
    const files = [];
    
    const scanDir = (dir) => {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          scanDir(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(entry);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scanDir(this.projectRoot);
    return files;
  }

  async generateAdvancedTasks() {
    console.log("🚀 [SPEC-GENERATOR] Generating T43-T100 advanced tasks...");
    
    const issues = await this.scanProjectForIssues();
    const generatedTasks = [];
    
    // Generate tasks from predefined categories
    for (const taskDef of this.advancedTaskCategories) {
      const task = await this.createTask(taskDef);
      generatedTasks.push(task);
    }
    
    // Generate tasks from discovered issues
    let taskCounter = 51;
    for (const issue of issues) {
      if (taskCounter > 100) break;
      
      const taskDef = {
        id: `T${taskCounter}`,
        name: issue.suggestedTask || `Fix_${issue.type}_Issue`,
        description: `Address ${issue.issue}`,
        complexity: issue.severity === 'critical' ? 5 : issue.severity === 'high' ? 4 : 3,
        unicornPotential: issue.severity === 'critical' ? 5 : 3,
        model: this.selectModelForIssue(issue),
        provider: this.getProviderForModel(this.selectModelForIssue(issue))
      };
      
      const task = await this.createTask(taskDef);
      generatedTasks.push(task);
      taskCounter++;
    }
    
    // Fill remaining slots with innovative features
    while (taskCounter <= 100) {
      const innovativeTask = this.generateInnovativeTask(taskCounter);
      const task = await this.createTask(innovativeTask);
      generatedTasks.push(task);
      taskCounter++;
    }
    
    return generatedTasks;
  }

  selectModelForIssue(issue) {
    if (issue.type === 'security') return 'claude-4.1-opus';
    if (issue.type === 'performance') return 'gemini-2.5-pro';
    if (issue.type === 'old_model') return 'claude-4-sonnet';
    return 'gpt-5-pro';
  }

  getProviderForModel(model) {
    if (model.includes('claude')) return 'anthropic';
    if (model.includes('gpt')) return 'openai';
    if (model.includes('gemini')) return 'google';
    return 'anthropic';
  }

  generateInnovativeTask(taskNumber) {
    const innovations = [
      'Quantum_Computing_Integration',
      'Holographic_Pet_Display',
      'Telepathic_Pet_Communication',
      'Time_Travel_Pet_Recovery',
      'Interdimensional_Pet_Tracking',
      'AI_Pet_Consciousness_Transfer',
      'Nano_Pet_Health_Monitoring',
      'Space_Pet_Rescue_Operations',
      'Genetic_Pet_Enhancement',
      'Robotic_Pet_Companions'
    ];
    
    const innovation = innovations[(taskNumber - 51) % innovations.length];
    
    return {
      id: `T${taskNumber}`,
      name: `${innovation}___Future_Tech`,
      description: `Revolutionary ${innovation.toLowerCase().replace(/_/g, ' ')} implementation`,
      complexity: 5,
      unicornPotential: 5,
      model: 'claude-4.1-opus',
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
- Priority: high
- Difficulty: ${taskDef.complexity}/5
- Dependencies: previous tasks

SPEC Excerpt:

### ${taskDef.id}: ${taskDef.name.replace(/_/g, ' ')}
- ${taskDef.description}
- Acceptance: revolutionary implementation with cutting-edge technology

Rules:
- Use latest AI models and best practices
- Implement with maximum unicorn potential
- Create comprehensive documentation
- Include extensive testing
- When this task is completed, update status.json to {"state": "completed"}
`;
    
    fs.writeFileSync(
      path.join(taskDir, 'agent-handoff.md'),
      handoff
    );
    
    // Create status.json
    const status = {
      state: "prepared",
      notes: `Advanced task generated by Spec-Kit - ready for ${taskDef.model} implementation`
    };
    
    fs.writeFileSync(
      path.join(taskDir, 'status.json'),
      JSON.stringify(status, null, 2)
    );
    
    console.log(`✨ [SPEC-GENERATOR] Created ${taskDef.id}: ${taskDef.name}`);
    
    return {
      id: taskDef.id,
      name: taskDef.name,
      path: taskDir,
      model: taskDef.model,
      provider: taskDef.provider,
      unicornPotential: taskDef.unicornPotential
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
    console.log("🤖 [SPEC-GENERATOR] Deploying to Optimus Prime...");
    
    const { spawn } = require('child_process');
    
    const optimusProcess = spawn('node', ['scripts/complete-optimus-prime.js'], {
      stdio: 'inherit'
    });
    
    optimusProcess.on('close', (code) => {
      if (code === 0) {
        console.log("🏆 [SPEC-GENERATOR] All tasks deployed successfully!");
      } else {
        console.error(`❌ [SPEC-GENERATOR] Deployment failed with code ${code}`);
      }
    });
  }
}

async function main() {
  const generator = new AdvancedSpecGenerator();
  
  console.log("🚀 [ADVANCED-SPEC-GENERATOR] Starting advanced task generation...");
  
  try {
    const tasks = await generator.generateAdvancedTasks();
    
    console.log(`✨ [ADVANCED-SPEC-GENERATOR] Generated ${tasks.length} advanced tasks!`);
    console.log("🎯 [ADVANCED-SPEC-GENERATOR] Task breakdown:");
    
    const modelCounts = {};
    tasks.forEach(task => {
      modelCounts[task.model] = (modelCounts[task.model] || 0) + 1;
    });
    
    Object.entries(modelCounts).forEach(([model, count]) => {
      console.log(`   ${model}: ${count} tasks`);
    });
    
    console.log("🤖 [ADVANCED-SPEC-GENERATOR] Deploying to Optimus Prime...");
    await generator.deployToOptimus();
    
  } catch (error) {
    console.error("❌ [ADVANCED-SPEC-GENERATOR] Error:", error);
  }
}

if (require.main === module) {
  main();
}

module.exports = AdvancedSpecGenerator;

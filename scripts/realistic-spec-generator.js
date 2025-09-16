#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

class RealisticSpecGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.specTasksDir = path.join(this.projectRoot, 'spec_tasks');
  }

  async scanForRealIssues() {
    console.log("🔍 Scanning for real project issues...");
    
    const issues = [];
    
    // Check for missing tests
    const hasTests = fs.existsSync(path.join(this.projectRoot, '__tests__')) || 
                     fs.existsSync(path.join(this.projectRoot, 'tests'));
    if (!hasTests) {
      issues.push({
        id: 'T43',
        name: 'Testing_Infrastructure___Jest_Setup',
        description: 'Set up comprehensive testing infrastructure with Jest and React Native Testing Library',
        priority: 'high'
      });
    }

    // Check for missing CI/CD
    const hasGithubActions = fs.existsSync(path.join(this.projectRoot, '.github/workflows'));
    if (!hasGithubActions) {
      issues.push({
        id: 'T44',
        name: 'CI_CD_Pipeline___GitHub_Actions',
        description: 'Set up automated CI/CD pipeline with GitHub Actions',
        priority: 'high'
      });
    }

    // Check for missing error tracking
    const hasErrorTracking = this.checkForErrorTracking();
    if (!hasErrorTracking) {
      issues.push({
        id: 'T45',
        name: 'Error_Tracking___Sentry_Integration',
        description: 'Integrate Sentry for production error tracking and monitoring',
        priority: 'medium'
      });
    }

    // Check for missing analytics
    const hasAnalytics = this.checkForAnalytics();
    if (!hasAnalytics) {
      issues.push({
        id: 'T46',
        name: 'Analytics___Firebase_Google_Analytics',
        description: 'Implement user analytics with Firebase and Google Analytics',
        priority: 'medium'
      });
    }

    // Check for missing offline support
    const hasOfflineSupport = this.checkForOfflineSupport();
    if (!hasOfflineSupport) {
      issues.push({
        id: 'T47',
        name: 'Offline_Support___AsyncStorage_Cache',
        description: 'Implement offline data caching and synchronization',
        priority: 'high'
      });
    }

    // Add more realistic features
    const additionalFeatures = [
      {
        id: 'T48',
        name: 'Push_Notifications___OneSignal_Enhancement',
        description: 'Enhanced push notification system with rich media and actions',
        priority: 'medium'
      },
      {
        id: 'T49',
        name: 'Image_Optimization___WebP_Compression',
        description: 'Implement image optimization and WebP compression',
        priority: 'medium'
      },
      {
        id: 'T50',
        name: 'Performance_Monitoring___Flipper_Integration',
        description: 'Integrate Flipper for development performance monitoring',
        priority: 'low'
      }
    ];

    issues.push(...additionalFeatures);
    return issues.slice(0, 8); // Limit to 8 realistic tasks
  }

  checkForErrorTracking() {
    const files = ['package.json'];
    for (const file of files) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('sentry') || content.includes('bugsnag')) {
          return true;
        }
      }
    }
    return false;
  }

  checkForAnalytics() {
    const files = ['package.json'];
    for (const file of files) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('analytics') || content.includes('firebase')) {
          return true;
        }
      }
    }
    return false;
  }

  checkForOfflineSupport() {
    const files = ['package.json'];
    for (const file of files) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('async-storage') || content.includes('offline')) {
          return true;
        }
      }
    }
    return false;
  }

  async createRealisticTask(taskDef) {
    const taskDir = path.join(this.specTasksDir, `${taskDef.id}:_${taskDef.name}`);
    
    if (!fs.existsSync(taskDir)) {
      fs.mkdirSync(taskDir, { recursive: true });
    }

    // Create plan.json
    const plan = {
      provider: "anthropic",
      model: "claude-4-sonnet",
      description: taskDef.description,
      agent: "optimus-claude",
      complexity: 3,
      unicornPotential: 2
    };
    
    fs.writeFileSync(
      path.join(taskDir, 'plan.json'),
      JSON.stringify(plan, null, 2)
    );

    // Create agent-handoff.md
    const handoff = `Task: ${taskDef.id} — SPEC task

Context:
- Provider: anthropic
- Model: claude-4-sonnet
- Priority: ${taskDef.priority}
- Difficulty: 3/5
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
      notes: `Realistic task - ready for implementation`
    };
    
    fs.writeFileSync(
      path.join(taskDir, 'status.json'),
      JSON.stringify(status, null, 2)
    );

    console.log(`✅ Created ${taskDef.id}: ${taskDef.name}`);
  }

  async generateRealisticTasks() {
    console.log("🚀 Generating realistic T43-T50 tasks...");
    
    const issues = await this.scanForRealIssues();
    
    for (const issue of issues) {
      await this.createRealisticTask(issue);
    }
    
    console.log(`✅ Generated ${issues.length} realistic tasks`);
    return issues;
  }
}

async function main() {
  const generator = new RealisticSpecGenerator();
  
  try {
    const tasks = await generator.generateRealisticTasks();
    console.log("🎯 Realistic tasks created for production app");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

if (require.main === module) {
  main();
}

module.exports = RealisticSpecGenerator;

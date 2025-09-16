#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function clearScreen() {
  console.clear();
}

function getTaskStatus(taskDir) {
  try {
    const statusPath = path.join('spec_tasks', taskDir, 'status.json');
    if (fs.existsSync(statusPath)) {
      const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
      return status.state || 'unknown';
    }
    return 'not_found';
  } catch (error) {
    return 'error';
  }
}

function getTaskAgent(taskDir) {
  try {
    const handoffPath = path.join('spec_tasks', taskDir, 'agent-handoff.md');
    if (fs.existsSync(handoffPath)) {
      const content = fs.readFileSync(handoffPath, 'utf8');
      const providerMatch = content.match(/- Provider: (\w+)/);
      const modelMatch = content.match(/- Model: ([\w-]+)/);
      if (providerMatch && modelMatch) {
        return `${providerMatch[1]}/${modelMatch[1]}`;
      }
    }
    return 'unknown';
  } catch (error) {
    return 'error';
  }
}

function getTaskDescription(taskDir) {
  try {
    const handoffPath = path.join('spec_tasks', taskDir, 'agent-handoff.md');
    if (fs.existsSync(handoffPath)) {
      const content = fs.readFileSync(handoffPath, 'utf8');
      const titleMatch = content.match(/Task: (.+?) — SPEC task/);
      if (titleMatch) {
        return titleMatch[1];
      }
    }
    return taskDir.replace(/[_:]/g, ' ');
  } catch (error) {
    return taskDir;
  }
}

function getCurrentBranch() {
  try {
    const { execSync } = require('child_process');
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'completed': return `${colors.green}✅${colors.reset}`;
    case 'prepared': return `${colors.yellow}⏳${colors.reset}`;
    case 'in_progress': return `${colors.blue}🔄${colors.reset}`;
    case 'error': return `${colors.red}❌${colors.reset}`;
    default: return `${colors.gray}❓${colors.reset}`;
  }
}

function displayDashboard() {
  clearScreen();
  
  console.log(`${colors.bright}${colors.cyan}🚀 PawGuard Spec Orchestrator Dashboard${colors.reset}`);
  console.log(`${colors.gray}═══════════════════════════════════════════════════════════════${colors.reset}`);
  
  const currentBranch = getCurrentBranch();
  console.log(`${colors.bright}Current Branch:${colors.reset} ${colors.yellow}${currentBranch}${colors.reset}`);
  console.log(`${colors.bright}Last Updated:${colors.reset} ${new Date().toLocaleTimeString()}`);
  console.log('');
  
  // Get all task directories
  const specTasksDir = 'spec_tasks';
  if (!fs.existsSync(specTasksDir)) {
    console.log(`${colors.red}Error: spec_tasks directory not found${colors.reset}`);
    return;
  }
  
  const taskDirs = fs.readdirSync(specTasksDir)
    .filter(dir => fs.statSync(path.join(specTasksDir, dir)).isDirectory())
    .filter(dir => dir.startsWith('T') && dir.includes(':'))
    .sort((a, b) => {
      const aNum = parseInt(a.match(/T(\d+)/)?.[1] || '0');
      const bNum = parseInt(b.match(/T(\d+)/)?.[1] || '0');
      return aNum - bNum;
    });
  
  console.log(`${colors.bright}📋 Task Progress (${taskDirs.length} tasks)${colors.reset}`);
  console.log(`${colors.gray}─────────────────────────────────────────────────────────────${colors.reset}`);
  
  // Table header
  console.log(`${colors.bright}Task  Status  Agent              Description${colors.reset}`);
  console.log(`${colors.gray}────  ──────  ─────              ───────────${colors.reset}`);
  
  let completedCount = 0;
  let inProgressCount = 0;
  let preparedCount = 0;
  
  taskDirs.forEach(taskDir => {
    const taskNum = taskDir.match(/T(\d+)/)?.[1] || '?';
    const status = getTaskStatus(taskDir);
    const agent = getTaskAgent(taskDir);
    const description = getTaskDescription(taskDir);
    const icon = getStatusIcon(status);
    
    // Count statuses
    if (status === 'completed') completedCount++;
    else if (status === 'in_progress') inProgressCount++;
    else if (status === 'prepared') preparedCount++;
    
    // Truncate description if too long
    const shortDesc = description.length > 40 ? description.substring(0, 37) + '...' : description;
    
    // Highlight current task
    const isCurrentTask = currentBranch.includes(`T${taskNum}--`);
    const taskColor = isCurrentTask ? colors.bright + colors.yellow : colors.reset;
    
    console.log(`${taskColor}T${taskNum.padStart(2, '0')}   ${icon}     ${agent.padEnd(18)} ${shortDesc}${colors.reset}`);
  });
  
  console.log(`${colors.gray}─────────────────────────────────────────────────────────────${colors.reset}`);
  console.log(`${colors.bright}Summary:${colors.reset} ${colors.green}${completedCount} completed${colors.reset}, ${colors.yellow}${preparedCount} prepared${colors.reset}, ${colors.blue}${inProgressCount} in progress${colors.reset}`);
  
  // Show mobile tasks
  const mobileTasks = fs.readdirSync(specTasksDir)
    .filter(dir => dir.startsWith('mobile:'))
    .sort();
  
  if (mobileTasks.length > 0) {
    console.log('');
    console.log(`${colors.bright}📱 Mobile Agent Tasks${colors.reset}`);
    console.log(`${colors.gray}─────────────────────${colors.reset}`);
    
    mobileTasks.forEach(taskDir => {
      const status = getTaskStatus(taskDir);
      const agent = getTaskAgent(taskDir);
      const icon = getStatusIcon(status);
      
      console.log(`${taskDir.padEnd(15)} ${icon} ${agent}`);
    });
  }
  
  console.log('');
  console.log(`${colors.gray}Press Ctrl+C to exit | Refreshing every 5 seconds...${colors.reset}`);
}

// Main execution
if (require.main === module) {
  console.log(`${colors.bright}Starting Spec Dashboard...${colors.reset}`);
  
  // Initial display
  displayDashboard();
  
  // Auto-refresh every 5 seconds
  const interval = setInterval(displayDashboard, 5000);
  
  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log(`\n${colors.bright}Dashboard stopped.${colors.reset}`);
    process.exit(0);
  });
}

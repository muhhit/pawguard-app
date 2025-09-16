#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

// SPEC verilerini okuma fonksiyonları
function getTaskStatus(taskDir) {
  try {
    const statusPath = path.join('spec_tasks', taskDir, 'status.json');
    if (fs.existsSync(statusPath)) {
      const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
      return status.state || 'not_started';
    }
    return 'not_started';
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
    return null;
  } catch (error) {
    return null;
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

function getTaskDetails(taskDir) {
  try {
    const handoffPath = path.join('spec_tasks', taskDir, 'agent-handoff.md');
    if (fs.existsSync(handoffPath)) {
      const content = fs.readFileSync(handoffPath, 'utf8');
      
      // SPEC excerpt'i bul
      const specMatch = content.match(/SPEC Excerpt:\s*\n\n([\s\S]*?)(?:\n\nRules:|$)/);
      if (specMatch) {
        const specContent = specMatch[1].trim();
        
        // Goal, Actions, Acceptance'ı parse et
        const goalMatch = specContent.match(/- Goal: (.+?)(?:\n|$)/);
        const actionsMatch = specContent.match(/- Actions: (.+?)(?:\n|$)/);
        const acceptanceMatch = specContent.match(/- Acceptance: (.+?)(?:\n|$)/);
        
        return {
          goal: goalMatch ? goalMatch[1] : '',
          actions: actionsMatch ? actionsMatch[1] : '',
          acceptance: acceptanceMatch ? acceptanceMatch[1] : ''
        };
      }
    }
    return { goal: '', actions: '', acceptance: '' };
  } catch (error) {
    return { goal: '', actions: '', acceptance: '' };
  }
}

function getCurrentBranch() {
  try {
    const { execSync } = require('child_process');
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'main';
  }
}

function getLastCommit() {
  try {
    const { execSync } = require('child_process');
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const message = execSync('git log -1 --pretty=%s', { encoding: 'utf8' }).trim();
    const date = execSync('git log -1 --pretty=%cd --date=relative', { encoding: 'utf8' }).trim();
    return { hash, message, date };
  } catch (error) {
    return { hash: 'unknown', message: 'No commits', date: 'unknown' };
  }
}

function getAllTasks() {
  const specTasksDir = 'spec_tasks';
  if (!fs.existsSync(specTasksDir)) {
    return [];
  }
  
  const taskDirs = fs.readdirSync(specTasksDir)
    .filter(dir => fs.statSync(path.join(specTasksDir, dir)).isDirectory())
    .filter(dir => dir.startsWith('T') && dir.includes(':'))
    .sort((a, b) => {
      const aNum = parseInt(a.match(/T(\d+)/)?.[1] || '0');
      const bNum = parseInt(b.match(/T(\d+)/)?.[1] || '0');
      return aNum - bNum;
    });
  
  return taskDirs.map(taskDir => {
    const taskNum = taskDir.match(/T(\d+)/)?.[1] || '?';
    const status = getTaskStatus(taskDir);
    const agent = getTaskAgent(taskDir);
    const description = getTaskDescription(taskDir);
    const details = getTaskDetails(taskDir);
    
    // Progress hesaplama
    let progress = 0;
    switch (status) {
      case 'completed': progress = 100; break;
      case 'in_progress': progress = 50; break;
      case 'prepared': progress = 10; break;
      default: progress = 0;
    }
    
    return {
      id: `T${taskNum}`,
      title: description,
      status: status,
      agent: agent,
      assignee: agent ? getAssigneeFromAgent(agent) : null,
      description: details.goal || description,
      progress: progress,
      lastUpdated: getFileModificationDate(path.join('spec_tasks', taskDir, 'status.json')),
      details: details
    };
  });
}

function getAssigneeFromAgent(agent) {
  if (agent.includes('claude')) return 'AI Team (Claude)';
  if (agent.includes('gpt')) return 'AI Team (GPT)';
  if (agent.includes('gemini')) return 'AI Team (Gemini)';
  return 'AI Team';
}

function getFileModificationDate(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return stats.mtime.toLocaleString('tr-TR');
    }
    return null;
  } catch (error) {
    return null;
  }
}

function getMobileAgents() {
  const specTasksDir = 'spec_tasks';
  if (!fs.existsSync(specTasksDir)) {
    return [];
  }
  
  const mobileDirs = fs.readdirSync(specTasksDir)
    .filter(dir => dir.startsWith('mobile:'))
    .sort();
  
  return mobileDirs.map(dir => {
    const status = getTaskStatus(dir);
    const agent = getTaskAgent(dir);
    const name = dir.replace('mobile:', '');
    
    return {
      name: agent || name,
      currentTask: status === 'in_progress' ? 'Mobile Development' : null,
      status: status === 'completed' ? 'idle' : status === 'in_progress' ? 'active' : 'idle',
      lastActivity: getFileModificationDate(path.join('spec_tasks', dir, 'status.json')) || 'Bilinmiyor',
      tasksCompleted: status === 'completed' ? 1 : 0
    };
  });
}

function updateTaskStatus(taskId, newStatus) {
  const taskDir = `T${taskId.replace('T', '')}:*`;
  const specTasksDir = 'spec_tasks';
  
  try {
    const dirs = fs.readdirSync(specTasksDir)
      .filter(dir => dir.startsWith(`T${taskId.replace('T', '')}:`));
    
    if (dirs.length > 0) {
      const statusPath = path.join(specTasksDir, dirs[0], 'status.json');
      const statusData = { state: newStatus };
      fs.writeFileSync(statusPath, JSON.stringify(statusData, null, 2));
      return true;
    }
  } catch (error) {
    console.error('Error updating task status:', error);
  }
  
  return false;
}

// HTTP Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (pathname === '/api/tasks') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const tasks = getAllTasks();
    res.end(JSON.stringify(tasks));
    
  } else if (pathname === '/api/agents') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const agents = getMobileAgents();
    res.end(JSON.stringify(agents));
    
  } else if (pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const tasks = getAllTasks();
    const branch = getCurrentBranch();
    const commit = getLastCommit();
    
    const stats = {
      completed: tasks.filter(t => t.status === 'completed').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      prepared: tasks.filter(t => t.status === 'prepared').length,
      total: tasks.length,
      branch: branch,
      commit: commit,
      lastUpdate: new Date().toISOString()
    };
    
    res.end(JSON.stringify(stats));
    
  } else if (pathname.startsWith('/api/tasks/') && req.method === 'PUT') {
    const taskId = pathname.split('/')[3];
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const success = updateTaskStatus(taskId, data.status);
        
        res.writeHead(success ? 200 : 404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    
  } else if (pathname === '/') {
    // Serve the dashboard HTML
    try {
      const htmlContent = fs.readFileSync('spec-dashboard.html', 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(htmlContent);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Dashboard not found');
    }
    
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 PawGuard Spec Dashboard Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api/tasks`);
  console.log('');
  console.log('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Dashboard server stopped.');
  process.exit(0);
});

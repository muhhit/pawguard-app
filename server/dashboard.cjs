#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

// Runtime modüllerini import et
const { buildReport, getHealthCheck } = require('./runtime/report.cjs');
const { getSpecStats } = require('./runtime/spec-bridge.cjs');
const { status: getMCPStatus } = require('./runtime/mcp-status.cjs');

/**
 * Git bilgilerini al
 */
function getGitInfo() {
  try {
    const { execSync } = require('child_process');
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const message = execSync('git log -1 --pretty=%s', { encoding: 'utf8' }).trim();
    const date = execSync('git log -1 --pretty=%cd --date=relative', { encoding: 'utf8' }).trim();
    
    return { branch, hash, message, date };
  } catch (error) {
    return { 
      branch: 'unknown', 
      hash: 'unknown', 
      message: 'No commits', 
      date: 'unknown' 
    };
  }
}

/**
 * spec_tasks klasöründen görevleri yükle
 */
function loadTasksFromSpecTasks() {
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
    
    // Status dosyasını oku
    let status = 'not_started';
    let agent = null;
    let model = null;
    let lastUpdated = null;
    
    try {
      const statusPath = path.join(specTasksDir, taskDir, 'status.json');
      if (fs.existsSync(statusPath)) {
        const statusData = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        status = statusData.state || 'not_started';
        agent = statusData.agent;
        model = statusData.model;
        lastUpdated = statusData.completedAt || statusData.startedAt || statusData.updatedAt;
        
        // Dosya değişiklik tarihini de kontrol et
        if (!lastUpdated) {
          const stats = fs.statSync(statusPath);
          lastUpdated = stats.mtime.toISOString();
        }
      }
    } catch (error) {
      console.error(`Status okunamadı (${taskDir}):`, error.message);
    }
    
    // Agent handoff dosyasından detayları oku
    let details = { goal: 'N/A', actions: 'N/A', acceptance: 'N/A' };
    let title = taskDir.replace(/T\d+:_?/, '').replace(/_/g, ' ');
    
    try {
      const handoffPath = path.join(specTasksDir, taskDir, 'agent-handoff.md');
      if (fs.existsSync(handoffPath)) {
        const content = fs.readFileSync(handoffPath, 'utf8');
        
        // Title'ı çıkar
        const titleMatch = content.match(/Task: T\d+: (.+?) — SPEC task/) || 
                          content.match(/Task: (.+?) — SPEC task/);
        if (titleMatch) {
          title = titleMatch[1];
        }
        
        // SPEC excerpt'ten detayları çıkar
        const specMatch = content.match(/SPEC Excerpt:\s*\n\n([\s\S]*?)(?:\n\nRules:|$)/);
        if (specMatch) {
          const specContent = specMatch[1].trim();
          
          const goalMatch = specContent.match(/- Goal: (.+?)(?:\n|$)/);
          const actionsMatch = specContent.match(/- Actions: (.+?)(?:\n|$)/);
          const acceptanceMatch = specContent.match(/- Acceptance: (.+?)(?:\n|$)/);
          
          if (goalMatch) details.goal = goalMatch[1];
          if (actionsMatch) details.actions = actionsMatch[1];
          if (acceptanceMatch) details.acceptance = acceptanceMatch[1];
        }
      }
    } catch (error) {
      console.error(`Handoff okunamadı (${taskDir}):`, error.message);
    }
    
    return {
      id: `T${taskNum}`,
      title: title,
      status: status,
      agent: agent,
      model: model,
      details: details,
      progress: getProgressFromStatus(status),
      lastUpdated: lastUpdated,
      taskDir: taskDir
    };
  });
}

/**
 * Status'tan progress hesapla
 */
function getProgressFromStatus(status) {
  switch (status) {
    case 'completed': return 100;
    case 'in_progress': return 50;
    case 'prepared': return 10;
    default: return 0;
  }
}

/**
 * Events memory'den eventleri yükle (mock)
 */
function loadEvents() {
  // Bu gerçek implementasyonda orchestrator'dan gelecek
  return [
    {
      id: 'evt_001',
      type: 'task_completed',
      taskId: 'T43',
      agent: 'optimus-claude',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      message: 'Quantum Pet Tracking completed successfully'
    },
    {
      id: 'evt_002',
      type: 'task_started',
      taskId: 'T66',
      agent: 'jazz-gemini',
      timestamp: new Date().toISOString(),
      message: 'AI Pet Consciousness Transfer started'
    }
  ];
}

/**
 * Guard taraması çalıştır (tsc/jest/expo-doctor ve TODO/FIXME taraması)
 */
async function runGuardScan() {
  const { execSync } = require('child_process');
  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    failures: [],
    todos: [],
    fixmes: [],
    summary: { passed: 0, failed: 0, warnings: 0 }
  };

  // TypeScript kontrolü
  try {
    console.log('🔍 TypeScript kontrolü başlatılıyor...');
    execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
    results.checks.push({ name: 'TypeScript', status: 'passed', message: 'No type errors found' });
    results.summary.passed++;
  } catch (error) {
    results.checks.push({ name: 'TypeScript', status: 'failed', message: error.message });
    results.failures.push({ type: 'tsc', details: error.message });
    results.summary.failed++;
  }

  // Jest testleri
  try {
    console.log('🧪 Jest testleri kontrol ediliyor...');
    execSync('npm test -- --passWithNoTests --silent', { encoding: 'utf8', stdio: 'pipe' });
    results.checks.push({ name: 'Jest Tests', status: 'passed', message: 'All tests passed' });
    results.summary.passed++;
  } catch (error) {
    results.checks.push({ name: 'Jest Tests', status: 'failed', message: error.message });
    results.failures.push({ type: 'jest', details: error.message });
    results.summary.failed++;
  }

  // Expo Doctor kontrolü
  try {
    console.log('🩺 Expo Doctor kontrolü...');
    execSync('npx expo doctor', { encoding: 'utf8', stdio: 'pipe' });
    results.checks.push({ name: 'Expo Doctor', status: 'passed', message: 'No issues found' });
    results.summary.passed++;
  } catch (error) {
    results.checks.push({ name: 'Expo Doctor', status: 'failed', message: error.message });
    results.failures.push({ type: 'expo-doctor', details: error.message });
    results.summary.failed++;
  }

  // TODO/FIXME taraması
  try {
    console.log('📝 TODO/FIXME taraması...');
    const todoResults = execSync('grep -r "TODO\\|FIXME" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . || true', { encoding: 'utf8' });
    
    if (todoResults.trim()) {
      const lines = todoResults.trim().split('\n');
      lines.forEach(line => {
        if (line.includes('TODO')) {
          results.todos.push(line);
        } else if (line.includes('FIXME')) {
          results.fixmes.push(line);
        }
      });
      results.summary.warnings += lines.length;
    }
    
    results.checks.push({ 
      name: 'TODO/FIXME Scan', 
      status: 'completed', 
      message: `Found ${results.todos.length} TODOs and ${results.fixmes.length} FIXMEs` 
    });
  } catch (error) {
    console.error('TODO/FIXME tarama hatası:', error);
  }

  return results;
}

/**
 * Başarısız kontroller için Fix görevleri oluştur
 */
function createFixTasks(guardResults) {
  const fixTasks = [];
  
  guardResults.failures.forEach((failure, index) => {
    const taskId = `FIX-${Date.now()}-${index}`;
    const taskTitle = `Fix: ${failure.type.toUpperCase()} Issues`;
    
    const fixTask = {
      id: taskId,
      title: taskTitle,
      type: 'fix',
      priority: 'high',
      status: 'created',
      createdAt: new Date().toISOString(),
      source: 'guard-scan',
      details: {
        failureType: failure.type,
        errorDetails: failure.details,
        suggestedActions: getSuggestedActions(failure.type)
      }
    };
    
    fixTasks.push(fixTask);
    
    // Fix görevini spec_tasks klasörüne kaydet
    saveFixTask(fixTask);
  });
  
  return fixTasks;
}

/**
 * Failure tipine göre önerilen aksiyonlar
 */
function getSuggestedActions(failureType) {
  const actions = {
    'tsc': [
      'Type hatalarını düzelt',
      'Missing type definitions ekle',
      'tsconfig.json ayarlarını kontrol et'
    ],
    'jest': [
      'Başarısız testleri düzelt',
      'Test coverage artır',
      'Mock implementasyonları güncelle'
    ],
    'expo-doctor': [
      'Expo konfigürasyonunu düzelt',
      'Uyumsuz paketleri güncelle',
      'Platform-specific sorunları çöz'
    ]
  };
  
  return actions[failureType] || ['Genel kod kalitesi iyileştirmeleri yap'];
}

/**
 * Fix görevini dosya sistemine kaydet
 */
function saveFixTask(fixTask) {
  const fixTaskDir = path.join('spec_tasks', `${fixTask.id}:_${fixTask.title.replace(/[^a-zA-Z0-9]/g, '_')}`);
  
  try {
    // Klasör oluştur
    if (!fs.existsSync(fixTaskDir)) {
      fs.mkdirSync(fixTaskDir, { recursive: true });
    }
    
    // Status dosyası
    const statusData = {
      state: 'prepared',
      type: 'fix',
      priority: fixTask.priority,
      createdAt: fixTask.createdAt,
      source: 'guard-scan',
      failureType: fixTask.details.failureType
    };
    
    fs.writeFileSync(
      path.join(fixTaskDir, 'status.json'),
      JSON.stringify(statusData, null, 2)
    );
    
    // Agent handoff dosyası
    const handoffContent = `# Task: ${fixTask.id}: ${fixTask.title} — SPEC task

## SPEC Excerpt:

- Goal: ${fixTask.details.failureType.toUpperCase()} hatalarını düzelt ve kod kalitesini artır
- Actions: ${fixTask.details.suggestedActions.join(', ')}
- Acceptance: Tüm ${fixTask.details.failureType} kontrolleri başarılı olmalı

## Rules:
- Bu bir otomatik oluşturulan fix görevidir
- Guard taraması sonucu tespit edilen sorunları çöz
- Değişikliklerden sonra guard taramasını tekrar çalıştır

## Error Details:
\`\`\`
${fixTask.details.errorDetails}
\`\`\`

## Suggested Actions:
${fixTask.details.suggestedActions.map(action => `- ${action}`).join('\n')}
`;
    
    fs.writeFileSync(
      path.join(fixTaskDir, 'agent-handoff.md'),
      handoffContent
    );
    
    console.log(`✅ Fix görevi oluşturuldu: ${fixTask.id}`);
    
  } catch (error) {
    console.error(`❌ Fix görevi kaydedilemedi (${fixTask.id}):`, error);
  }
}

/**
 * HTTP Server
 */
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
  
  try {
    if (pathname === '/health') {
      // Health Check endpoint
      const tasks = loadTasksFromSpecTasks();
      const healthData = getHealthCheck(tasks);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(healthData, null, 2));
      
    } else if (pathname === '/report') {
      // Report endpoint - ReportBuilder kullan
      const tasks = loadTasksFromSpecTasks();
      const events = loadEvents();
      const gitInfo = getGitInfo();
      
      const report = buildReport({ 
        tasks, 
        events, 
        artifactsDir: fs.existsSync('artifacts') ? 'artifacts' : null 
      });
      
      // Git bilgilerini ekle
      report.git = gitInfo;
      report.summary.branch = gitInfo.branch;
      report.summary.commit = gitInfo;
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="pawguard-spec-report.json"'
      });
      res.end(JSON.stringify(report, null, 2));
      
    } else if (pathname === '/api/tasks') {
      // Tasks API
      const tasks = loadTasksFromSpecTasks();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tasks));
      
    } else if (pathname === '/api/status') {
      // Status API
      const tasks = loadTasksFromSpecTasks();
      const gitInfo = getGitInfo();
      
      const stats = {
        completed: tasks.filter(t => t.status === 'completed').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        prepared: tasks.filter(t => t.status === 'prepared').length,
        not_started: tasks.filter(t => t.status === 'not_started').length,
        total: tasks.length,
        ...gitInfo,
        lastUpdate: new Date().toISOString()
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
      
    } else if (pathname === '/mcp/status' && req.method === 'GET') {
      // MCP Status endpoint
      const mcpStatus = getMCPStatus();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ items: mcpStatus.servers, ...mcpStatus }));
      
    } else if (pathname === '/tasks' && req.method === 'GET') {
      // Tasks endpoint - buildReport kullan
      const tasks = loadTasksFromSpecTasks();
      const events = loadEvents();
      const specStats = getSpecStats();
      
      const report = buildReport({ 
        events: events, 
        specTasks: specStats, 
        artifactsDir: fs.existsSync('artifacts') ? path.join(process.cwd(), 'artifacts') : null 
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ tasks: report.tasks || tasks }));
      
    } else if (pathname === '/agents' && req.method === 'GET') {
      // Agents endpoint - mock stats
      const mockStats = {
        agents: {
          'optimus-claude': {
            lastActivity: Date.now() - 300000, // 5 dakika önce
            completed: 12,
            running: 2
          },
          'jazz-gemini': {
            lastActivity: Date.now() - 120000, // 2 dakika önce
            completed: 8,
            running: 1
          },
          'bumblebee-gpt4': {
            lastActivity: Date.now() - 600000, // 10 dakika önce
            completed: 15,
            running: 0
          }
        }
      };
      
      const agentsArray = Object.entries(mockStats.agents || {}).map(([name, v]) => ({
        name,
        lastActivity: v.lastActivity || 0,
        completed: v.completed || 0,
        running: v.running || 0
      }));
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ agents: agentsArray }));
      
    } else if (pathname === '/guard/run' && req.method === 'POST') {
      // Guard taraması endpoint'i
      try {
        console.log('🔍 Guard taraması başlatılıyor...');
        runGuardScan().then(guardResults => {
        
        // Başarısız kontroller için fix görevleri oluştur
        let fixTasks = [];
        if (guardResults.failures.length > 0) {
          fixTasks = createFixTasks(guardResults);
          console.log(`✅ ${fixTasks.length} fix görevi oluşturuldu`);
        }
        
        const response = {
          success: true,
          timestamp: guardResults.timestamp,
          summary: guardResults.summary,
          checks: guardResults.checks,
          failures: guardResults.failures,
          todos: guardResults.todos.length,
          fixmes: guardResults.fixmes.length,
          fixTasksCreated: fixTasks.length,
          fixTasks: fixTasks.map(task => ({ id: task.id, title: task.title }))
        };
        
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response, null, 2));
        }).catch(error => {
          console.error('Guard taraması hatası:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }));
        });
      } catch (error) {
        console.error('Guard endpoint hatası:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        }));
      }
      
    } else if (pathname === '/logs' && req.method === 'GET') {
      // Logs endpoint'i
      const events = loadEvents();
      const tasks = loadTasksFromSpecTasks();
      
      // Son 50 eventi al ve sırala
      const recentEvents = events
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 50);
      
      // Task durumlarından da event'ler oluştur
      const taskEvents = tasks
        .filter(task => task.lastUpdated)
        .map(task => ({
          id: `task_${task.id}`,
          type: 'task_status_change',
          taskId: task.id,
          agent: task.agent || 'system',
          timestamp: task.lastUpdated,
          message: `Task ${task.id} status: ${task.status}`
        }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);
      
      // Tüm event'leri birleştir ve sırala
      const allEvents = [...recentEvents, ...taskEvents]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 50);
      
      const response = {
        events: allEvents,
        count: allEvents.length,
        timestamp: new Date().toISOString()
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response, null, 2));
      
    } else if (pathname === '/api/spec-stats') {
      // SPEC istatistikleri
      const specStats = getSpecStats();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(specStats));
      
    } else if (pathname === '/run-batch' && req.method === 'POST') {
      // Run batch endpoint with fairness and concurrency
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const tasks = data.tasks || [];
          
          // Concurrency parametresi yoksa ajan sayısı kadar ata
          const agents = await getAvailableAgents();
          const concurrency = data.concurrency || agents.length || 3;
          
          // Fairness motoru ile görev dağılımı
          const distribution = distributeTasks(tasks, agents, concurrency);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            tasksScheduled: tasks.length,
            concurrency: concurrency,
            distribution: distribution,
            message: `${tasks.length} görev ${concurrency} eşzamanlı işlem ile başlatıldı`
          }));
          
          // Arka planda görevleri başlat
          setTimeout(() => {
            executeBatchTasks(distribution);
          }, 100);
          
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON: ' + error.message }));
        }
      });
      
    } else if (pathname.startsWith('/api/tasks/') && req.method === 'PUT') {
      // Task status güncelleme
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
      // Dashboard HTML serve et
      try {
        const htmlPath = path.join(__dirname, '..', 'spec-dashboard.html');
        if (fs.existsSync(htmlPath)) {
          const htmlContent = fs.readFileSync(htmlPath, 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(htmlContent);
        } else {
          // Basit dashboard HTML
          const simpleHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>PawGuard Spec Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .health-check { background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .issue { color: #d32f2f; }
        .ok { color: #388e3c; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🚀 PawGuard Spec Dashboard</h1>
    
    <div class="health-check">
        <h2>Health Check</h2>
        <button onclick="checkHealth()">Run Health Check</button>
        <div id="health-results"></div>
    </div>
    
    <div>
        <h2>Actions</h2>
        <button onclick="downloadReport()">Download Report</button>
        <button onclick="viewTasks()">View Tasks</button>
        <button onclick="viewSpecStats()">SPEC Stats</button>
    </div>
    
    <div id="content"></div>
    
    <script>
        async function checkHealth() {
            try {
                const response = await fetch('/health');
                const health = await response.json();
                
                const resultsDiv = document.getElementById('health-results');
                let html = '<h3>Health Check Results</h3>';
                
                if (health.totalIssues === 0) {
                    html += '<p class="ok">✅ All systems healthy!</p>';
                } else {
                    html += '<p class="issue">⚠️ Found ' + health.totalIssues + ' issues:</p>';
                    html += '<ul>';
                    if (health.duplicateIds.length > 0) {
                        html += '<li class="issue">Duplicate IDs: ' + health.duplicateIds.length + '</li>';
                    }
                    if (health.emptyDetailsCount > 0) {
                        html += '<li class="issue">Empty details: ' + health.emptyDetailsCount + '</li>';
                    }
                    if (health.stalePreparedCount > 0) {
                        html += '<li class="issue">Stale prepared tasks: ' + health.stalePreparedCount + '</li>';
                    }
                    if (health.artifactsMissingCount > 0) {
                        html += '<li class="issue">Missing artifacts: ' + health.artifactsMissingCount + '</li>';
                    }
                    html += '</ul>';
                }
                
                html += '<p><small>Checked at: ' + new Date(health.checkedAt).toLocaleString() + '</small></p>';
                resultsDiv.innerHTML = html;
            } catch (error) {
                document.getElementById('health-results').innerHTML = '<p class="issue">Error: ' + error.message + '</p>';
            }
        }
        
        async function downloadReport() {
            window.open('/report', '_blank');
        }
        
        async function viewTasks() {
            try {
                const response = await fetch('/api/tasks');
                const tasks = await response.json();
                
                let html = '<h2>Tasks (' + tasks.length + ')</h2>';
                html += '<table border="1" style="width:100%; border-collapse: collapse;">';
                html += '<tr><th>ID</th><th>Title</th><th>Status</th><th>Agent</th><th>Progress</th></tr>';
                
                tasks.forEach(task => {
                    html += '<tr>';
                    html += '<td>' + task.id + '</td>';
                    html += '<td>' + task.title + '</td>';
                    html += '<td>' + task.status + '</td>';
                    html += '<td>' + (task.agent || 'N/A') + '</td>';
                    html += '<td>' + task.progress + '%</td>';
                    html += '</tr>';
                });
                
                html += '</table>';
                document.getElementById('content').innerHTML = html;
            } catch (error) {
                document.getElementById('content').innerHTML = '<p class="issue">Error: ' + error.message + '</p>';
            }
        }
        
        async function viewSpecStats() {
            try {
                const response = await fetch('/api/spec-stats');
                const stats = await response.json();
                
                let html = '<h2>SPEC Statistics</h2>';
                html += '<p><strong>Total Tasks:</strong> ' + stats.totalTasks + '</p>';
                html += '<p><strong>Average Difficulty:</strong> ' + stats.averageDifficulty + '/5</p>';
                html += '<h3>By Priority</h3>';
                html += '<ul>';
                html += '<li>High: ' + stats.byPriority.high + '</li>';
                html += '<li>Medium: ' + stats.byPriority.medium + '</li>';
                html += '<li>Low: ' + stats.byPriority.low + '</li>';
                html += '</ul>';
                html += '<h3>By Difficulty</h3>';
                html += '<ul>';
                for (let i = 1; i <= 5; i++) {
                    html += '<li>Level ' + i + ': ' + stats.byDifficulty[i] + '</li>';
                }
                html += '</ul>';
                html += '<p><strong>Tasks with Dependencies:</strong> ' + stats.withDependencies + '</p>';
                
                document.getElementById('content').innerHTML = html;
            } catch (error) {
                document.getElementById('content').innerHTML = '<p class="issue">Error: ' + error.message + '</p>';
            }
        }
    </script>
</body>
</html>`;
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(simpleHtml);
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Dashboard error: ' + error.message);
      }
      
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
    
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

/**
 * Mevcut ajanları al
 */
async function getAvailableAgents() {
  return [
    { name: 'optimus-claude', load: 2, preference: ['backend', 'api'] },
    { name: 'jazz-gemini', load: 1, preference: ['frontend', 'ui'] },
    { name: 'bumblebee-gpt4', load: 0, preference: ['testing', 'docs'] }
  ];
}

/**
 * Fairness motoru ile görev dağılımı
 */
function distributeTasks(tasks, agents, concurrency) {
  const distribution = [];
  const agentLoads = {};
  
  // Ajan yüklerini initialize et
  agents.forEach(agent => {
    agentLoads[agent.name] = agent.load || 0;
  });
  
  // Görevleri fairness algoritması ile dağıt
  tasks.forEach((task, index) => {
    // En az yüklü ajanı bul (yük cezası)
    const availableAgents = agents.filter(agent => agentLoads[agent.name] < concurrency);
    
    if (availableAgents.length === 0) {
      // Tüm ajanlar dolu, en az yüklü olanı seç
      const leastLoadedAgent = agents.reduce((min, agent) => 
        agentLoads[agent.name] < agentLoads[min.name] ? agent : min
      );
      
      distribution.push({
        taskId: task.id || `task_${index}`,
        agent: leastLoadedAgent.name,
        priority: calculatePriority(task, leastLoadedAgent),
        estimatedStart: Date.now() + (agentLoads[leastLoadedAgent.name] * 300000) // 5dk per task
      });
      
      agentLoads[leastLoadedAgent.name]++;
    } else {
      // Tag tercihi + epsilon greedy
      let selectedAgent;
      
      if (Math.random() < 0.1) { // %10 epsilon exploration
        selectedAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
      } else {
        // Tag tercihi ile en uygun ajanı seç
        selectedAgent = availableAgents.reduce((best, agent) => {
          const bestScore = calculateAgentScore(task, best, agentLoads[best.name]);
          const agentScore = calculateAgentScore(task, agent, agentLoads[agent.name]);
          return agentScore > bestScore ? agent : best;
        });
      }
      
      distribution.push({
        taskId: task.id || `task_${index}`,
        agent: selectedAgent.name,
        priority: calculatePriority(task, selectedAgent),
        estimatedStart: Date.now() + (agentLoads[selectedAgent.name] * 300000)
      });
      
      agentLoads[selectedAgent.name]++;
    }
  });
  
  return {
    assignments: distribution,
    finalLoads: agentLoads,
    totalTasks: tasks.length,
    concurrency: concurrency
  };
}

/**
 * Ajan skoru hesapla (tag tercihi + yük cezası)
 */
function calculateAgentScore(task, agent, currentLoad) {
  let score = 10; // Base score
  
  // Yük cezası
  score -= currentLoad * 2;
  
  // Tag tercihi bonusu
  if (task.tags && agent.preference) {
    const matchingTags = task.tags.filter(tag => 
      agent.preference.some(pref => tag.toLowerCase().includes(pref.toLowerCase()))
    );
    score += matchingTags.length * 3;
  }
  
  // Task title'dan çıkarım
  if (task.title && agent.preference) {
    const titleLower = task.title.toLowerCase();
    agent.preference.forEach(pref => {
      if (titleLower.includes(pref.toLowerCase())) {
        score += 2;
      }
    });
  }
  
  return score;
}

/**
 * Görev önceliği hesapla
 */
function calculatePriority(task, agent) {
  let priority = 5; // Normal priority
  
  if (task.status === 'prepared') priority += 2;
  if (task.status === 'in_progress') priority += 5;
  
  // Dependency kontrolü
  if (task.dependencies && task.dependencies.length > 0) {
    priority -= 1;
  }
  
  return Math.max(1, Math.min(10, priority));
}

/**
 * Batch görevleri çalıştır
 */
async function executeBatchTasks(distribution) {
  console.log(`🚀 [BATCH] ${distribution.assignments.length} görev başlatılıyor...`);
  
  const { spawn } = require('child_process');
  
  // Her ajan için görevleri grupla
  const agentTasks = {};
  distribution.assignments.forEach(assignment => {
    if (!agentTasks[assignment.agent]) {
      agentTasks[assignment.agent] = [];
    }
    agentTasks[assignment.agent].push(assignment);
  });
  
  // Her ajan için paralel process başlat
  Object.entries(agentTasks).forEach(([agentName, tasks]) => {
    console.log(`🤖 [${agentName}] ${tasks.length} görev atandı`);
    
    // Optimus Prime orchestrator'ı çağır
    const optimusProcess = spawn('node', ['scripts/complete-optimus-prime.js'], {
      stdio: 'pipe',
      detached: true,
      env: {
        ...process.env,
        AGENT_NAME: agentName,
        ASSIGNED_TASKS: JSON.stringify(tasks.map(t => t.taskId))
      }
    });
    
    optimusProcess.unref();
  });
  
  console.log(`✅ [BATCH] Tüm ajanlar başlatıldı`);
}

/**
 * Task status güncelleme
 */
function updateTaskStatus(taskId, newStatus) {
  const specTasksDir = 'spec_tasks';
  
  try {
    const dirs = fs.readdirSync(specTasksDir)
      .filter(dir => dir.startsWith(`${taskId}:`));
    
    if (dirs.length > 0) {
      const statusPath = path.join(specTasksDir, dirs[0], 'status.json');
      let statusData = { state: newStatus };
      
      // Mevcut status'u oku ve güncelle
      if (fs.existsSync(statusPath)) {
        const existing = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        statusData = { ...existing, state: newStatus };
      }
      
      // Timestamp'leri güncelle
      const now = new Date().toISOString();
      if (newStatus === 'completed' && !statusData.completedAt) {
        statusData.completedAt = now;
      }
      if (newStatus === 'in_progress' && !statusData.startedAt) {
        statusData.startedAt = now;
      }
      statusData.updatedAt = now;
      
      fs.writeFileSync(statusPath, JSON.stringify(statusData, null, 2));
      return true;
    }
  } catch (error) {
    console.error('Task status güncelleme hatası:', error);
  }
  
  return false;
}

// Server'ı başlat
const PORT = process.env.PORT || 5173;

server.listen(PORT, () => {
  console.log(`🚀 PawGuard Dashboard Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log(`📋 Report: http://localhost:${PORT}/report`);
  console.log('');
  console.log('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Dashboard server stopped.');
  process.exit(0);
});

module.exports = server;

#!/usr/bin/env node

/**
 * Cline Paste D: Aynı Topic'ten Onlarca Batch'i Tekilleştirip Çalıştır
 * 
 * Amaç: Hazır (prepared) görevlerde aynı başlıkları bir kez çalıştır.
 * UI'de şişmeyi engeller ve ajan dağılımını dengeli tutar.
 * 
 * Kullanım:
 *   node scripts/cline-paste-d-dedup-batch.js
 *   
 * Bu script:
 * 1. SPEC tarayıp prepared görevleri çıkarır
 * 2. Aynı title'ları tekilleştir (deduplication)
 * 3. Batch çalıştırır
 * 4. Ajan dağılımını izler
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Renkli console output için
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * HTTP request helper
 */
async function makeRequest(url, options = {}) {
  const http = require('http');
  const urlParsed = require('url').parse(url);
  
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: urlParsed.hostname,
      port: urlParsed.port || 80,
      path: urlParsed.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * Dashboard server'ının çalışıp çalışmadığını kontrol et
 */
async function checkDashboardServer() {
  try {
    await makeRequest('http://localhost:5173/health');
    return { port: 5173, url: 'http://localhost:5173' };
  } catch (error) {
    return false;
  }
}

/**
 * Dashboard server'ını başlat
 */
function startDashboardServer() {
  log('🚀 Dashboard server başlatılıyor...', 'yellow');
  
  const { spawn } = require('child_process');
  const serverProcess = spawn('node', ['server/dashboard.cjs'], {
    stdio: 'pipe',
    detached: true
  });
  
  serverProcess.unref();
  
  // Server'ın başlaması için bekle
  return new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
}

/**
 * SPEC tarayıp prepared görevleri çıkar
 */
async function scanPreparedTasks() {
  log('🔍 SPEC taranıyor, prepared görevler aranıyor...', 'cyan');
  
  try {
    const response = await makeRequest('http://localhost:5173/spec/scan');
    
    if (response && response.tasks) {
      log(`✅ ${response.tasks.length} prepared görev bulundu`, 'green');
      return response;
    } else {
      throw new Error('API response invalid');
    }
    
  } catch (error) {
    log('⚠️  API endpoint bulunamadı, local scan yapılıyor...', 'yellow');
    return await localScanPreparedTasks();
  }
}

/**
 * Local olarak prepared görevleri tara
 */
async function localScanPreparedTasks() {
  const specTasksDir = 'spec_tasks';
  if (!fs.existsSync(specTasksDir)) {
    log('❌ spec_tasks klasörü bulunamadı', 'red');
    return { tasks: [] };
  }
  
  const taskDirs = fs.readdirSync(specTasksDir)
    .filter(dir => fs.statSync(path.join(specTasksDir, dir)).isDirectory())
    .filter(dir => (dir.startsWith('T') && dir.includes(':')) || dir.startsWith('mobile:'));
  
  const preparedTasks = [];
  
  for (const taskDir of taskDirs) {
    try {
      const statusPath = path.join(specTasksDir, taskDir, 'status.json');
      
      if (fs.existsSync(statusPath)) {
        const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        
        if (!status.state || status.state === 'prepared') {
          let taskId, title;
          
          if (taskDir.startsWith('mobile:')) {
            taskId = taskDir;
            title = taskDir.replace('mobile:', '').toUpperCase() + ' Mobile Agent';
          } else {
            taskId = taskDir.match(/T(\d+)/)?.[1] || '?';
            taskId = `T${taskId}`;
            title = taskDir.replace(/T\d+:_?/, '').replace(/_/g, ' ');
          }
          
          // Task detaylarını oku
          const handoffPath = path.join(specTasksDir, taskDir, 'agent-handoff.md');
          
          if (fs.existsSync(handoffPath)) {
            const content = fs.readFileSync(handoffPath, 'utf8');
            const titleMatch = content.match(/Task: T\d+: (.+?) — SPEC task/) || 
                              content.match(/Task: (.+?) — SPEC task/);
            if (titleMatch) {
              title = titleMatch[1];
            }
          }
          
          preparedTasks.push({
            id: taskId,
            title: title,
            status: status.state || 'prepared',
            taskDir: taskDir
          });
        }
      }
    } catch (error) {
      log(`⚠️  ${taskDir} okunamadı: ${error.message}`, 'yellow');
    }
  }
  
  log(`✅ ${preparedTasks.length} prepared görev bulundu (local scan)`, 'green');
  return { tasks: preparedTasks };
}

/**
 * Görevleri title'a göre tekilleştir (deduplication)
 */
function deduplicateTasksByTitle(tasks) {
  log('🔄 Görevler tekilleştiriliyor...', 'cyan');
  
  const seen = new Map();
  const deduplicated = [];
  let duplicatesRemoved = 0;
  
  tasks.forEach(task => {
    const title = task.title || task.id || 'untitled';
    
    if (!seen.has(title)) {
      seen.set(title, true);
      deduplicated.push(task);
    } else {
      log(`   🗑️  Duplicate kaldırıldı: ${title} (${task.id})`, 'yellow');
      duplicatesRemoved++;
    }
  });
  
  log(`✅ ${tasks.length} görevden ${duplicatesRemoved} duplicate kaldırıldı, ${deduplicated.length} unique görev kaldı`, 'green');
  
  return {
    tasks: deduplicated,
    originalCount: tasks.length,
    duplicatesRemoved: duplicatesRemoved
  };
}

/**
 * Batch çalıştırma
 */
async function runBatch(tasks) {
  log(`🚀 ${tasks.length} unique görev batch olarak başlatılıyor...`, 'cyan');
  
  try {
    const response = await makeRequest('http://localhost:5173/run-batch', {
      method: 'POST',
      body: {
        tasks: tasks
      }
    });
    
    if (response.success) {
      log('✅ Batch çalıştırma başarılı!', 'green');
      log(`📊 Orijinal görev sayısı: ${response.originalTaskCount}`, 'blue');
      log(`🗑️  Kaldırılan duplicate: ${response.duplicatesRemoved}`, 'blue');
      log(`📋 Planlanan görev sayısı: ${response.tasksScheduled}`, 'blue');
      log(`⚡ Eşzamanlılık: ${response.concurrency}`, 'blue');
      
      if (response.distribution && response.distribution.finalLoads) {
        log('📋 Ajan Dağılımı:', 'magenta');
        Object.entries(response.distribution.finalLoads).forEach(([agent, load]) => {
          log(`   🤖 ${agent}: ${load} görev`, 'blue');
        });
      }
      
      return response;
    } else {
      throw new Error(response.error || 'Batch çalıştırma başarısız');
    }
    
  } catch (error) {
    log(`❌ Batch çalıştırma hatası: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Ajan dağılımını izle
 */
async function monitorAgentDistribution(duration = 30000) {
  log(`👀 ${duration/1000} saniye boyunca ajan dağılımı izleniyor...`, 'cyan');
  
  const startTime = Date.now();
  const interval = setInterval(async () => {
    try {
      const agentsResponse = await makeRequest('http://localhost:5173/agents');
      
      if (agentsResponse && agentsResponse.agents) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        log(`[${elapsed}s] Ajan Durumu:`, 'blue');
        
        agentsResponse.agents.forEach(agent => {
          const lastActivityAgo = Math.round((Date.now() - agent.lastActivity) / 1000);
          log(`   🤖 ${agent.name}: ${agent.completed} tamamlandı, ${agent.running} çalışıyor (${lastActivityAgo}s önce aktif)`, 'blue');
        });
        
        // Dağılım dengeli mi kontrol et
        const completedCounts = agentsResponse.agents.map(a => a.completed);
        const minCompleted = Math.min(...completedCounts);
        const maxCompleted = Math.max(...completedCounts);
        const isBalanced = (maxCompleted - minCompleted) <= 2;
        
        log(`   ⚖️  Dağılım ${isBalanced ? 'dengeli' : 'dengesiz'} (min: ${minCompleted}, max: ${maxCompleted})`, 
            isBalanced ? 'green' : 'yellow');
        
      }
    } catch (error) {
      // Sessizce devam et
    }
  }, 5000);
  
  setTimeout(() => {
    clearInterval(interval);
    log('✅ Ajan dağılımı monitoring tamamlandı', 'green');
  }, duration);
}

/**
 * Curl komutlarını simüle et (kullanıcının verdiği komutlar)
 */
async function simulateCurlCommands() {
  log('📋 Curl komutları simüle ediliyor...', 'cyan');
  
  try {
    // PREP=$(curl -s http://localhost:5173/spec/scan | jq '{tasks:[.tasks[]|select(.status==null or .status=="prepared")]}')
    log('1️⃣  PREP: Prepared görevler alınıyor...', 'blue');
    const prepResponse = await makeRequest('http://localhost:5173/spec/scan');
    
    if (!prepResponse || !prepResponse.tasks) {
      log('   ⚠️  API response invalid, fallback to local scan', 'yellow');
      const localResult = await localScanPreparedTasks();
      const prepTasks = localResult.tasks || [];
      log(`   📊 ${prepTasks.length} prepared görev bulundu (local)`, 'green');
      
      return {
        prepTasks: prepTasks,
        dedupResult: deduplicateTasksByTitle(prepTasks),
        batchResponse: null
      };
    }
    
    const prepTasks = prepResponse.tasks.filter(task => 
      task.status === null || task.status === 'prepared'
    );
    log(`   📊 ${prepTasks.length} prepared görev bulundu`, 'green');
    
    // DEDUP=$(echo "$PREP" | jq '{tasks:(.tasks|group_by(.title)|map(.[0]))}')
    log('2️⃣  DEDUP: Görevler tekilleştiriliyor...', 'blue');
    const dedupResult = deduplicateTasksByTitle(prepTasks);
    log(`   📊 ${dedupResult.tasks.length} unique görev kaldı`, 'green');
    
    // echo "$DEDUP" | jq '.tasks|length'
    log('3️⃣  COUNT: Unique görev sayısı', 'blue');
    log(`   📊 Toplam unique görev: ${dedupResult.tasks.length}`, 'green');
    
    // curl -s -X POST http://localhost:5173/run-batch
    log('4️⃣  BATCH: Görevler çalıştırılıyor...', 'blue');
    const batchResponse = await runBatch(dedupResult.tasks);
    
    return {
      prepTasks: prepTasks,
      dedupResult: dedupResult,
      batchResponse: batchResponse
    };
    
  } catch (error) {
    log(`❌ Curl simülasyon hatası: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Ana fonksiyon
 */
async function main() {
  log('🎯 Cline Paste D: Aynı Topic\'ten Onlarca Batch\'i Tekilleştirip Çalıştır', 'bright');
  log('=' .repeat(70), 'cyan');
  
  let dashboardUrl = 'http://localhost:5173';
  
  try {
    // 1. Dashboard server kontrolü
    const serverRunning = await checkDashboardServer();
    if (!serverRunning) {
      await startDashboardServer();
      log('⏳ Server başlatıldı, bağlantı bekleniyor...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      log(`✅ Dashboard server zaten çalışıyor (${serverRunning.url})`, 'green');
      dashboardUrl = serverRunning.url;
    }
    
    // 2. Curl komutlarını simüle et
    const results = await simulateCurlCommands();
    
    // 3. Ajan dağılımını izle
    await monitorAgentDistribution(30000);
    
    // 4. Final rapor
    log('=' .repeat(70), 'cyan');
    log('🎉 Deduplication ve Batch çalıştırma tamamlandı!', 'bright');
    log(`📋 Orijinal görev sayısı: ${results.dedupResult.originalCount}`, 'green');
    log(`🗑️  Kaldırılan duplicate: ${results.dedupResult.duplicatesRemoved}`, 'green');
    log(`📊 Çalıştırılan unique görev: ${results.dedupResult.tasks.length}`, 'green');
    
    if (results.batchResponse) {
      log(`⚡ Kullanılan eşzamanlılık: ${results.batchResponse.concurrency}`, 'green');
    } else {
      log(`⚠️  Batch çalıştırma yapılamadı (görev bulunamadı veya API hatası)`, 'yellow');
    }
    
    // 5. Final ajan durumu
    log('🤖 Final Ajan Durumu:', 'magenta');
    try {
      const finalAgents = await makeRequest('http://localhost:5173/agents');
      if (finalAgents && finalAgents.agents) {
        finalAgents.agents.forEach(agent => {
          log(`   ${agent.name}: ${agent.completed} tamamlandı, ${agent.running} çalışıyor`, 'blue');
        });
      }
    } catch (error) {
      log('   ⚠️  Ajan durumu alınamadı', 'yellow');
    }
    
    log('=' .repeat(70), 'cyan');
    log(`💡 Dashboard: ${dashboardUrl}`, 'blue');
    log(`📊 Agents: ${dashboardUrl}/agents`, 'blue');
    log(`🔍 Tasks: ${dashboardUrl}/api/tasks`, 'blue');
    
  } catch (error) {
    log(`❌ Hata: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  main().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  scanPreparedTasks,
  deduplicateTasksByTitle,
  runBatch,
  monitorAgentDistribution,
  simulateCurlCommands,
  main
};

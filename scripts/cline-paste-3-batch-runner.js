#!/usr/bin/env node

/**
 * Cline Paste 3: Hazır Görevleri Eşit Dağılımla Koştur
 * 
 * Amaç: prepared görevleri topla, concurrency=ajan sayısı ile batch çalıştır.
 * 
 * Kullanım:
 *   node scripts/cline-paste-3-batch-runner.js
 *   
 * Bu script:
 * 1. SPEC tarayıp prepared görevleri çıkarır
 * 2. Ajan sayısı kadar eşzamanlılık ile batch çalıştırır
 * 3. Zengin görev listesi ve rapor sunar
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
    // Önce 3001 portunu dene (spec-dashboard-server)
    await makeRequest('http://localhost:3001/api/status');
    return { port: 3001, url: 'http://localhost:3001' };
  } catch (error) {
    try {
      // Sonra 5173 portunu dene (dashboard.cjs)
      await makeRequest('http://localhost:5173/health');
      return { port: 5173, url: 'http://localhost:5173' };
    } catch (error2) {
      return false;
    }
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
    
    // Eğer endpoint yoksa, local scan yap
    if (!response || response.error) {
      return await localScanPreparedTasks();
    }
    
    const preparedTasks = response.tasks.filter(task => 
      task.status === null || task.status === 'prepared'
    );
    
    log(`✅ ${preparedTasks.length} prepared görev bulundu`, 'green');
    return { tasks: preparedTasks };
    
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
            // Mobile görevleri için
            taskId = taskDir;
            title = taskDir.replace('mobile:', '').toUpperCase() + ' Mobile Agent';
          } else {
            // T görevleri için
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
 * Mevcut ajan sayısını al
 */
async function getAgentCount() {
  try {
    const response = await makeRequest('http://localhost:5173/agents');
    
    if (response && response.agents) {
      return response.agents.length;
    }
    
    // Default ajan sayısı
    return 3;
    
  } catch (error) {
    log('⚠️  Ajan sayısı alınamadı, default 3 kullanılıyor', 'yellow');
    return 3;
  }
}

/**
 * Batch çalıştırma
 */
async function runBatch(preparedTasks, concurrency) {
  log(`🚀 ${preparedTasks.length} görev ${concurrency} eşzamanlılık ile başlatılıyor...`, 'cyan');
  
  try {
    const response = await makeRequest('http://localhost:5173/run-batch', {
      method: 'POST',
      body: {
        tasks: preparedTasks,
        concurrency: concurrency
      }
    });
    
    if (response.success) {
      log('✅ Batch çalıştırma başarılı!', 'green');
      log(`📊 ${response.tasksScheduled} görev planlandı`, 'blue');
      log(`⚡ Eşzamanlılık: ${response.concurrency}`, 'blue');
      
      if (response.distribution) {
        log('📋 Görev Dağılımı:', 'magenta');
        Object.entries(response.distribution.finalLoads || {}).forEach(([agent, load]) => {
          log(`   ${agent}: ${load} görev`, 'blue');
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
 * Görev listesi ve rapor al
 */
async function getTasksAndReport() {
  log('📋 Görev listesi ve rapor alınıyor...', 'cyan');
  
  try {
    // Görev sayısını al
    const tasksResponse = await makeRequest('http://localhost:5173/tasks');
    const taskCount = tasksResponse.tasks ? tasksResponse.tasks.length : 0;
    
    log(`📊 Toplam görev sayısı: ${taskCount}`, 'green');
    
    // Rapor al
    const reportResponse = await makeRequest('http://localhost:5173/report');
    
    if (reportResponse.summary) {
      log('📈 Rapor Özeti:', 'magenta');
      log(`   Tamamlanan: ${reportResponse.summary.completed || 0}`, 'green');
      log(`   Devam eden: ${reportResponse.summary.in_progress || 0}`, 'yellow');
      log(`   Hazır: ${reportResponse.summary.prepared || 0}`, 'blue');
      log(`   Toplam: ${reportResponse.summary.total || 0}`, 'cyan');
      
      if (reportResponse.summary.branch) {
        log(`   Branch: ${reportResponse.summary.branch}`, 'blue');
      }
      
      if (reportResponse.summary.commit) {
        log(`   Commit: ${reportResponse.summary.commit.hash} - ${reportResponse.summary.commit.message}`, 'blue');
      }
    }
    
    // İlk 5 görevi göster
    if (reportResponse.tasks && reportResponse.tasks.length > 0) {
      log('🔍 İlk 5 Görev:', 'magenta');
      reportResponse.tasks.slice(0, 5).forEach((task, index) => {
        const statusColor = task.status === 'completed' ? 'green' : 
                           task.status === 'in_progress' ? 'yellow' : 'blue';
        log(`   ${index + 1}. ${task.id}: ${task.title} [${task.status}]`, statusColor);
      });
    }
    
    return {
      taskCount,
      report: reportResponse
    };
    
  } catch (error) {
    log(`⚠️  Rapor alınamadı: ${error.message}`, 'yellow');
    return { taskCount: 0, report: null };
  }
}

/**
 * Progress monitoring
 */
async function monitorProgress(initialTaskCount, duration = 30000) {
  log(`🔄 ${duration/1000} saniye boyunca progress izleniyor...`, 'cyan');
  
  const startTime = Date.now();
  const interval = setInterval(async () => {
    try {
      const statusResponse = await makeRequest('http://localhost:5173/api/status');
      
      if (statusResponse) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        log(`[${elapsed}s] Tamamlanan: ${statusResponse.completed}, Devam eden: ${statusResponse.in_progress}, Hazır: ${statusResponse.prepared}`, 'blue');
      }
    } catch (error) {
      // Sessizce devam et
    }
  }, 5000);
  
  setTimeout(() => {
    clearInterval(interval);
    log('✅ Progress monitoring tamamlandı', 'green');
  }, duration);
}

/**
 * Ana fonksiyon
 */
async function main() {
  log('🎯 Cline Paste 3: Hazır Görevleri Eşit Dağılımla Koştur', 'bright');
  log('=' .repeat(60), 'cyan');
  
  let dashboardUrl = 'http://localhost:3001';
  
  try {
    // 1. Dashboard server kontrolü
    const serverRunning = await checkDashboardServer();
    if (!serverRunning) {
      await startDashboardServer();
      log('⏳ Server başlatıldı, bağlantı bekleniyor...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000));
      dashboardUrl = 'http://localhost:5173';
    } else {
      log(`✅ Dashboard server zaten çalışıyor (${serverRunning.url})`, 'green');
      dashboardUrl = serverRunning.url;
    }
    
    // 2. SPEC tarayıp prepared görevleri çıkar
    const scanResult = await scanPreparedTasks();
    
    if (scanResult.tasks.length === 0) {
      log('⚠️  Prepared görev bulunamadı, işlem sonlandırılıyor', 'yellow');
      return;
    }
    
    // 3. Ajan sayısını al
    const agentCount = await getAgentCount();
    log(`🤖 Mevcut ajan sayısı: ${agentCount}`, 'blue');
    
    // 4. Batch çalıştır
    const batchResult = await runBatch(scanResult.tasks, agentCount);
    
    // 5. İlk rapor al
    const initialReport = await getTasksAndReport();
    
    // 6. Progress monitoring başlat
    await monitorProgress(initialReport.taskCount);
    
    // 7. Final rapor al
    log('📊 Final rapor alınıyor...', 'cyan');
    const finalReport = await getTasksAndReport();
    
    // 8. Özet
    log('=' .repeat(60), 'cyan');
    log('🎉 Batch çalıştırma tamamlandı!', 'bright');
    log(`📋 Başlatılan görev sayısı: ${scanResult.tasks.length}`, 'green');
    log(`⚡ Kullanılan eşzamanlılık: ${agentCount}`, 'green');
    log(`📊 Toplam görev sayısı: ${finalReport.taskCount}`, 'green');
    
    if (finalReport.report && finalReport.report.summary) {
      const summary = finalReport.report.summary;
      log(`✅ Tamamlanan: ${summary.completed || 0}`, 'green');
      log(`🔄 Devam eden: ${summary.in_progress || 0}`, 'yellow');
      log(`📝 Hazır: ${summary.prepared || 0}`, 'blue');
    }
    
    log('=' .repeat(60), 'cyan');
    log(`💡 Dashboard: ${dashboardUrl}`, 'blue');
    log(`📊 Rapor: ${dashboardUrl}/api/report`, 'blue');
    log(`🔍 API: ${dashboardUrl}/api/tasks`, 'blue');
    
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
  runBatch,
  getTasksAndReport,
  main
};

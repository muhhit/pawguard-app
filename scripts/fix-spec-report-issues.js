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

console.log(`${colors.bright}${colors.cyan}🔧 PawGuard Spec Rapor Sorunları Düzeltici${colors.reset}`);
console.log(`${colors.gray}═══════════════════════════════════════════════════════════════${colors.reset}`);

// SPEC.md'den gerçek görev bilgilerini oku
function loadRealSpecTasks() {
  try {
    const specContent = fs.readFileSync('SPEC.md', 'utf8');
    const tasks = new Map();
    
    // Görevleri parse et
    const taskMatches = specContent.matchAll(/### (T\d+): (.+?)\n- Goal: (.+?)\n- Actions: (.+?)\n- Acceptance: (.+?)(?=\n\n|\n###|$)/gs);
    
    for (const match of taskMatches) {
      const [, taskId, title, goal, actions, acceptance] = match;
      tasks.set(taskId, {
        id: taskId,
        title: title.trim(),
        goal: goal.trim(),
        actions: actions.trim(),
        acceptance: acceptance.trim()
      });
    }
    
    console.log(`${colors.green}✅ SPEC.md'den ${tasks.size} gerçek görev yüklendi${colors.reset}`);
    return tasks;
  } catch (error) {
    console.error(`${colors.red}❌ SPEC.md okunamadı: ${error.message}${colors.reset}`);
    return new Map();
  }
}

// Tekrarlanan görevleri tespit et
function findDuplicateTasks() {
  const specTasksDir = 'spec_tasks';
  if (!fs.existsSync(specTasksDir)) {
    console.error(`${colors.red}❌ spec_tasks klasörü bulunamadı${colors.reset}`);
    return { duplicates: new Map(), allTasks: [] };
  }
  
  const taskDirs = fs.readdirSync(specTasksDir)
    .filter(dir => fs.statSync(path.join(specTasksDir, dir)).isDirectory())
    .filter(dir => dir.startsWith('T') && dir.includes(':'));
  
  const taskGroups = new Map();
  
  taskDirs.forEach(taskDir => {
    const taskNum = taskDir.match(/T(\d+)/)?.[1];
    if (taskNum) {
      if (!taskGroups.has(taskNum)) {
        taskGroups.set(taskNum, []);
      }
      taskGroups.get(taskNum).push(taskDir);
    }
  });
  
  const duplicates = new Map();
  taskGroups.forEach((dirs, taskNum) => {
    if (dirs.length > 1) {
      duplicates.set(taskNum, dirs);
    }
  });
  
  return { duplicates, allTasks: taskDirs };
}

// Görev durumunu oku
function getTaskStatus(taskDir) {
  try {
    const statusPath = path.join('spec_tasks', taskDir, 'status.json');
    if (fs.existsSync(statusPath)) {
      const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
      return status;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Ajan adlarını normalize et
function normalizeAgentName(agent, model) {
  // Gerçek kullanılan modellere göre normalize et
  const normalizedAgents = {
    'claude-4.1-opus': 'copilot-pro/claude-3.5-sonnet',
    'claude-4-sonnet': 'copilot-pro/claude-3.5-sonnet',
    'gpt-5-pro': 'copilot-pro/gpt-4o',
    'gemini-2.5-pro': 'copilot-pro/gemini-1.5-pro',
    'gemini-2-pro': 'copilot-pro/gemini-1.5-pro'
  };
  
  const key = model || agent;
  return normalizedAgents[key] || `copilot-pro/${agent || 'unknown'}`;
}

// Tekrarlanan görevleri temizle
function cleanDuplicateTasks(duplicates) {
  console.log(`\n${colors.bright}🧹 Tekrarlanan Görevleri Temizleme${colors.reset}`);
  console.log(`${colors.gray}─────────────────────────────────────────${colors.reset}`);
  
  let cleanedCount = 0;
  
  duplicates.forEach((dirs, taskNum) => {
    console.log(`\n${colors.yellow}T${taskNum} için ${dirs.length} kopya bulundu:${colors.reset}`);
    dirs.forEach(dir => console.log(`  - ${dir}`));
    
    // En iyi kopyayı seç (completed > prepared > diğerleri)
    let bestDir = dirs[0];
    let bestStatus = getTaskStatus(bestDir);
    
    dirs.forEach(dir => {
      const status = getTaskStatus(dir);
      if (status) {
        if (status.state === 'completed' && (!bestStatus || bestStatus.state !== 'completed')) {
          bestDir = dir;
          bestStatus = status;
        } else if (status.state === 'prepared' && (!bestStatus || (bestStatus.state !== 'completed' && bestStatus.state !== 'prepared'))) {
          bestDir = dir;
          bestStatus = status;
        }
      }
    });
    
    console.log(`${colors.green}  ✅ En iyi kopya: ${bestDir} (${bestStatus?.state || 'unknown'})${colors.reset}`);
    
    // Diğerlerini sil
    dirs.forEach(dir => {
      if (dir !== bestDir) {
        try {
          const dirPath = path.join('spec_tasks', dir);
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log(`${colors.red}  🗑️  Silindi: ${dir}${colors.reset}`);
          cleanedCount++;
        } catch (error) {
          console.error(`${colors.red}  ❌ Silinemedi ${dir}: ${error.message}${colors.reset}`);
        }
      }
    });
  });
  
  console.log(`\n${colors.green}✅ ${cleanedCount} tekrarlanan görev temizlendi${colors.reset}`);
  return cleanedCount;
}

// Boş içerikleri gerçek verilerle doldur
function fillEmptyContent(realSpecTasks, allTasks) {
  console.log(`\n${colors.bright}📝 Boş İçerikleri Doldurma${colors.reset}`);
  console.log(`${colors.gray}─────────────────────────────────────${colors.reset}`);
  
  let updatedCount = 0;
  
  allTasks.forEach(taskDir => {
    const taskNum = taskDir.match(/T(\d+)/)?.[1];
    if (taskNum && realSpecTasks.has(`T${taskNum}`)) {
      const realTask = realSpecTasks.get(`T${taskNum}`);
      const handoffPath = path.join('spec_tasks', taskDir, 'agent-handoff.md');
      
      if (fs.existsSync(handoffPath)) {
        try {
          let content = fs.readFileSync(handoffPath, 'utf8');
          
          // Boş veya placeholder içerik kontrolü
          if (content.includes('revolutionary implementation with cutting-edge technology') ||
              content.includes('Acceptance: revolutionary implementation') ||
              !content.includes('- Goal:') ||
              !content.includes('- Actions:')) {
            
            // Status dosyasından agent bilgisini al
            const status = getTaskStatus(taskDir);
            const normalizedAgent = status ? normalizeAgentName(status.agent, status.model) : 'copilot-pro/claude-3.5-sonnet';
            const [provider, model] = normalizedAgent.split('/');
            
            // Yeni içerik oluştur
            const newContent = `Task: ${realTask.id}: ${realTask.title} — SPEC task

Context:
- Provider: ${provider}
- Model: ${model}
- Priority: high
- Difficulty: 3/5
- Dependencies: previous tasks

SPEC Excerpt:

### ${realTask.id}: ${realTask.title}
- Goal: ${realTask.goal}
- Actions: ${realTask.actions}
- Acceptance: ${realTask.acceptance}

Rules:
- Use latest AI models and best practices
- Implement with maximum unicorn potential
- Create comprehensive documentation
- Include extensive testing
- When this task is completed, update status.json to {"state": "completed"}`;
            
            fs.writeFileSync(handoffPath, newContent);
            console.log(`${colors.green}  ✅ Güncellendi: ${taskDir}${colors.reset}`);
            updatedCount++;
          }
        } catch (error) {
          console.error(`${colors.red}  ❌ Güncellenemedi ${taskDir}: ${error.message}${colors.reset}`);
        }
      }
    }
  });
  
  console.log(`\n${colors.green}✅ ${updatedCount} görev içeriği güncellendi${colors.reset}`);
  return updatedCount;
}

// Ajan adlarını normalize et
function normalizeAgentNames(allTasks) {
  console.log(`\n${colors.bright}🤖 Ajan Adlarını Normalize Etme${colors.reset}`);
  console.log(`${colors.gray}─────────────────────────────────────────${colors.reset}`);
  
  let normalizedCount = 0;
  
  allTasks.forEach(taskDir => {
    const statusPath = path.join('spec_tasks', taskDir, 'status.json');
    
    if (fs.existsSync(statusPath)) {
      try {
        const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        
        if (status.agent || status.model) {
          const oldAgent = status.agent;
          const oldModel = status.model;
          const normalized = normalizeAgentName(status.agent, status.model);
          const [provider, model] = normalized.split('/');
          
          // Güncelle
          status.agent = provider;
          status.model = model;
          
          fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
          console.log(`${colors.green}  ✅ ${taskDir}: ${oldAgent}/${oldModel} → ${provider}/${model}${colors.reset}`);
          normalizedCount++;
        }
      } catch (error) {
        console.error(`${colors.red}  ❌ Normalize edilemedi ${taskDir}: ${error.message}${colors.reset}`);
      }
    }
  });
  
  console.log(`\n${colors.green}✅ ${normalizedCount} ajan adı normalize edildi${colors.reset}`);
  return normalizedCount;
}

// Durum tutarsızlıklarını düzelt
function fixStatusInconsistencies(allTasks) {
  console.log(`\n${colors.bright}⚖️ Durum Tutarsızlıklarını Düzeltme${colors.reset}`);
  console.log(`${colors.gray}─────────────────────────────────────────────${colors.reset}`);
  
  const statusCounts = { completed: 0, prepared: 0, in_progress: 0, not_started: 0 };
  let fixedCount = 0;
  
  allTasks.forEach(taskDir => {
    const statusPath = path.join('spec_tasks', taskDir, 'status.json');
    
    if (fs.existsSync(statusPath)) {
      try {
        const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        
        // Durum sayımı
        statusCounts[status.state] = (statusCounts[status.state] || 0) + 1;
        
        // Tutarsızlık kontrolü
        if (status.state === 'completed' && !status.completedAt) {
          status.completedAt = status.startedAt || new Date().toISOString();
          fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
          fixedCount++;
        }
        
        if (status.state === 'prepared' && status.completedAt) {
          // Eğer completedAt varsa ama state prepared ise, completed olarak işaretle
          status.state = 'completed';
          fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
          statusCounts.completed++;
          statusCounts.prepared--;
          fixedCount++;
        }
        
      } catch (error) {
        console.error(`${colors.red}  ❌ Durum düzeltilemedi ${taskDir}: ${error.message}${colors.reset}`);
      }
    }
  });
  
  console.log(`\n${colors.bright}📊 Güncel Durum Özeti:${colors.reset}`);
  console.log(`  ${colors.green}Tamamlanan: ${statusCounts.completed}${colors.reset}`);
  console.log(`  ${colors.yellow}Hazırlanan: ${statusCounts.prepared}${colors.reset}`);
  console.log(`  ${colors.blue}Devam Eden: ${statusCounts.in_progress}${colors.reset}`);
  console.log(`  ${colors.gray}Başlamayan: ${statusCounts.not_started}${colors.reset}`);
  
  console.log(`\n${colors.green}✅ ${fixedCount} durum tutarsızlığı düzeltildi${colors.reset}`);
  return { statusCounts, fixedCount };
}

// Ana fonksiyon
async function main() {
  try {
    // 1. SPEC.md'den gerçek görevleri yükle
    const realSpecTasks = loadRealSpecTasks();
    
    // 2. Tekrarlanan görevleri tespit et
    const { duplicates, allTasks } = findDuplicateTasks();
    
    console.log(`\n${colors.bright}📋 Mevcut Durum:${colors.reset}`);
    console.log(`  Toplam görev klasörü: ${allTasks.length}`);
    console.log(`  Tekrarlanan görev ID'leri: ${duplicates.size}`);
    console.log(`  SPEC.md'deki gerçek görevler: ${realSpecTasks.size}`);
    
    if (duplicates.size > 0) {
      console.log(`\n${colors.yellow}⚠️  Tekrarlanan görevler:${colors.reset}`);
      duplicates.forEach((dirs, taskNum) => {
        console.log(`  T${taskNum}: ${dirs.length} kopya`);
      });
    }
    
    // Kullanıcıdan onay al
    console.log(`\n${colors.bright}${colors.yellow}⚠️  Bu işlemler geri alınamaz! Devam etmek istiyor musunuz? (y/N)${colors.reset}`);
    
    // Otomatik olarak devam et (script olarak çalıştırıldığında)
    const shouldContinue = process.argv.includes('--auto') || process.argv.includes('-y');
    
    if (shouldContinue) {
      console.log(`${colors.green}✅ Otomatik mod aktif, işlemler başlatılıyor...${colors.reset}`);
      
      // 3. Tekrarlanan görevleri temizle
      const cleanedCount = cleanDuplicateTasks(duplicates);
      
      // 4. Güncel görev listesini al
      const { allTasks: updatedTasks } = findDuplicateTasks();
      
      // 5. Boş içerikleri doldur
      const filledCount = fillEmptyContent(realSpecTasks, updatedTasks);
      
      // 6. Ajan adlarını normalize et
      const normalizedCount = normalizeAgentNames(updatedTasks);
      
      // 7. Durum tutarsızlıklarını düzelt
      const { statusCounts, fixedCount } = fixStatusInconsistencies(updatedTasks);
      
      // Özet rapor
      console.log(`\n${colors.bright}${colors.green}🎉 Tüm Sorunlar Düzeltildi!${colors.reset}`);
      console.log(`${colors.gray}═══════════════════════════════════════════════════════════════${colors.reset}`);
      console.log(`${colors.green}✅ ${cleanedCount} tekrarlanan görev temizlendi${colors.reset}`);
      console.log(`${colors.green}✅ ${filledCount} boş içerik dolduruldu${colors.reset}`);
      console.log(`${colors.green}✅ ${normalizedCount} ajan adı normalize edildi${colors.reset}`);
      console.log(`${colors.green}✅ ${fixedCount} durum tutarsızlığı düzeltildi${colors.reset}`);
      console.log(`\n${colors.bright}📊 Final Durum: ${statusCounts.completed} tamamlanan, ${statusCounts.prepared} hazırlanan, ${statusCounts.in_progress} devam eden${colors.reset}`);
      
    } else {
      console.log(`${colors.yellow}⏸️  İşlem iptal edildi${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Hata: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Script olarak çalıştırıldığında
if (require.main === module) {
  main();
}

module.exports = {
  loadRealSpecTasks,
  findDuplicateTasks,
  cleanDuplicateTasks,
  fillEmptyContent,
  normalizeAgentNames,
  fixStatusInconsistencies
};

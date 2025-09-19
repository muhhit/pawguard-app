const fs = require('fs');
const path = require('path');

/**
 * SPEC.md'den front-matter ve acceptance criteria'ları parse et
 */
function parseFrontMatter(specPath = 'SPEC.md') {
  try {
    const specContent = fs.readFileSync(specPath, 'utf8');
    
    // Front-matter parse et (eğer varsa)
    let frontMatter = {};
    const frontMatterMatch = specContent.match(/^---\n([\s\S]*?)\n---/);
    if (frontMatterMatch) {
      const yamlContent = frontMatterMatch[1];
      // Basit YAML parsing (production'da yaml library kullanılmalı)
      yamlContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          frontMatter[key.trim()] = valueParts.join(':').trim();
        }
      });
    }
    
    // Acceptance criteria'ları parse et
    const acceptanceCriteria = new Map();
    const taskMatches = specContent.matchAll(/### (T\d+): (.+?)\n- Goal: (.+?)\n- Actions: (.+?)\n- Acceptance: (.+?)(?=\n\n|\n###|$)/gs);
    
    for (const match of taskMatches) {
      const [, taskId, title, goal, actions, acceptance] = match;
      acceptanceCriteria.set(taskId, {
        id: taskId,
        title: title.trim(),
        goal: goal.trim(),
        actions: actions.trim(),
        acceptance: acceptance.trim(),
        priority: extractPriority(title),
        difficulty: extractDifficulty(goal, actions),
        dependencies: extractDependencies(actions)
      });
    }
    
    return {
      frontMatter,
      acceptanceCriteria,
      totalTasks: acceptanceCriteria.size,
      parsedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('SPEC parsing hatası:', error.message);
    return {
      frontMatter: {},
      acceptanceCriteria: new Map(),
      totalTasks: 0,
      error: error.message,
      parsedAt: new Date().toISOString()
    };
  }
}

/**
 * Görev başlığından öncelik çıkar
 */
function extractPriority(title) {
  const lowPriorityKeywords = ['future', 'advanced', 'optimization', 'enhancement'];
  const highPriorityKeywords = ['security', 'payment', 'auth', 'critical', 'production'];
  
  const titleLower = title.toLowerCase();
  
  if (highPriorityKeywords.some(keyword => titleLower.includes(keyword))) {
    return 'high';
  }
  
  if (lowPriorityKeywords.some(keyword => titleLower.includes(keyword))) {
    return 'low';
  }
  
  return 'medium';
}

/**
 * Goal ve actions'tan zorluk seviyesi çıkar
 */
function extractDifficulty(goal, actions) {
  const complexKeywords = ['integration', 'algorithm', 'machine learning', 'ai', 'security', 'performance'];
  const simpleKeywords = ['ui', 'display', 'show', 'list', 'basic'];
  
  const text = (goal + ' ' + actions).toLowerCase();
  
  const complexCount = complexKeywords.filter(keyword => text.includes(keyword)).length;
  const simpleCount = simpleKeywords.filter(keyword => text.includes(keyword)).length;
  
  if (complexCount > simpleCount) {
    return complexCount >= 3 ? 5 : 4;
  } else if (simpleCount > complexCount) {
    return simpleCount >= 2 ? 1 : 2;
  }
  
  return 3; // default
}

/**
 * Actions'tan bağımlılıkları çıkar
 */
function extractDependencies(actions) {
  const dependencies = [];
  
  // "after T1", "requires T2", "depends on T3" gibi pattern'leri ara
  const depMatches = actions.matchAll(/(?:after|requires?|depends?\s+on)\s+(T\d+)/gi);
  for (const match of depMatches) {
    dependencies.push(match[1]);
  }
  
  // "previous tasks" gibi genel referansları da kontrol et
  if (actions.toLowerCase().includes('previous task')) {
    dependencies.push('previous');
  }
  
  return dependencies;
}

/**
 * Belirli bir görev için acceptance criteria al
 */
function getAcceptanceCriteria(taskId, specPath = 'SPEC.md') {
  const { acceptanceCriteria } = parseFrontMatter(specPath);
  return acceptanceCriteria.get(taskId) || null;
}

/**
 * Tüm görevleri öncelik ve bağımlılık sırasına göre sırala
 */
function getTasksInExecutionOrder(specPath = 'SPEC.md') {
  const { acceptanceCriteria } = parseFrontMatter(specPath);
  const tasks = Array.from(acceptanceCriteria.values());
  
  // Önce ID'ye göre sırala (T1, T2, T3...)
  tasks.sort((a, b) => {
    const aNum = parseInt(a.id.replace('T', ''));
    const bNum = parseInt(b.id.replace('T', ''));
    return aNum - bNum;
  });
  
  // Sonra bağımlılıkları kontrol et ve gerekirse yeniden sırala
  const sorted = [];
  const remaining = [...tasks];
  
  while (remaining.length > 0) {
    const canExecute = remaining.filter(task => {
      // Bağımlılıkları kontrol et
      return task.dependencies.every(dep => {
        if (dep === 'previous') {
          // Önceki tüm görevler tamamlanmış olmalı
          const taskNum = parseInt(task.id.replace('T', ''));
          return sorted.every(completedTask => {
            const completedNum = parseInt(completedTask.id.replace('T', ''));
            return completedNum < taskNum;
          });
        } else {
          // Belirli görev tamamlanmış olmalı
          return sorted.some(completedTask => completedTask.id === dep);
        }
      });
    });
    
    if (canExecute.length === 0) {
      // Döngüsel bağımlılık veya çözülemeyen durum
      // Kalan görevleri ID sırasına göre ekle
      sorted.push(...remaining.sort((a, b) => {
        const aNum = parseInt(a.id.replace('T', ''));
        const bNum = parseInt(b.id.replace('T', ''));
        return aNum - bNum;
      }));
      break;
    }
    
    // Öncelik sırasına göre sırala
    canExecute.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Yüksek öncelik önce
      }
      
      // Aynı öncelikte ise ID sırasına göre
      const aNum = parseInt(a.id.replace('T', ''));
      const bNum = parseInt(b.id.replace('T', ''));
      return aNum - bNum;
    });
    
    // İlk uygun görevi ekle
    const nextTask = canExecute[0];
    sorted.push(nextTask);
    remaining.splice(remaining.indexOf(nextTask), 1);
  }
  
  return sorted;
}

/**
 * SPEC istatistikleri
 */
function getSpecStats(specPath = 'SPEC.md') {
  const { acceptanceCriteria, frontMatter } = parseFrontMatter(specPath);
  const tasks = Array.from(acceptanceCriteria.values());
  
  const stats = {
    totalTasks: tasks.length,
    byPriority: {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    },
    byDifficulty: {
      1: tasks.filter(t => t.difficulty === 1).length,
      2: tasks.filter(t => t.difficulty === 2).length,
      3: tasks.filter(t => t.difficulty === 3).length,
      4: tasks.filter(t => t.difficulty === 4).length,
      5: tasks.filter(t => t.difficulty === 5).length
    },
    withDependencies: tasks.filter(t => t.dependencies.length > 0).length,
    averageDifficulty: tasks.length > 0 ? 
      Math.round(tasks.reduce((sum, t) => sum + t.difficulty, 0) / tasks.length * 10) / 10 : 0,
    frontMatter,
    lastModified: getFileModificationDate(specPath)
  };
  
  return stats;
}

/**
 * Dosya değişiklik tarihini al
 */
function getFileModificationDate(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString();
  } catch (error) {
    return null;
  }
}

module.exports = {
  parseFrontMatter,
  getAcceptanceCriteria,
  getTasksInExecutionOrder,
  getSpecStats,
  extractPriority,
  extractDifficulty,
  extractDependencies
};

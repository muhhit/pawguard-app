const fs = require('fs');
const path = require('path');

/**
 * Agent adlarını normalize et
 */
function normalizeAgentName(agent, model) {
  const agentMappings = {
    'optimus-claude': 'anthropic/claude-4.1-opus',
    'bumblebee-gpt': 'openai/gpt-5-pro', 
    'jazz-gemini': 'google/gemini-2.5-pro',
    'copilot-pro': 'github/copilot-pro:gpt-5-pro'
  };
  
  const modelMappings = {
    // Yeni nesil modeller (2025) - En son sürümler
    'claude-4.1-opus': 'anthropic/claude-4.1-opus',
    'claude-4-sonnet': 'anthropic/claude-4-sonnet', 
    'gpt-5-pro': 'openai/gpt-5-pro',
    'gpt-4o': 'github/copilot-pro:gpt-5-pro', // Copilot Pro üzerinden en yeni model
    'gemini-2.5-pro': 'google/gemini-2.5-pro',
    
    // Eski modeller (fallback)
    'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
    'gpt-4o-mini': 'openai/gpt-4o-mini',
    'gemini-1.5-flash': 'google/gemini-1.5-flash',
    'gemini-2-pro': 'google/gemini-2-pro'
  };
  
  // Önce agent adına bak
  if (agent && agentMappings[agent]) {
    return agentMappings[agent];
  }
  
  // Sonra model adına bak
  if (model && modelMappings[model]) {
    return modelMappings[model];
  }
  
  // Fallback
  if (agent && model) {
    return `${agent}/${model}`;
  }
  
  return 'unknown/unknown';
}

/**
 * SPEC.md'den acceptance criteria'ları yükle
 */
function loadSpecAcceptanceCriteria() {
  try {
    const specContent = fs.readFileSync('SPEC.md', 'utf8');
    const criteria = new Map();
    
    const taskMatches = specContent.matchAll(/### (T\d+): (.+?)\n- Goal: (.+?)\n- Actions: (.+?)\n- Acceptance: (.+?)(?=\n\n|\n###|$)/gs);
    
    for (const match of taskMatches) {
      const [, taskId, title, goal, actions, acceptance] = match;
      criteria.set(taskId, {
        title: title.trim(),
        goal: goal.trim(),
        actions: actions.trim(),
        acceptance: acceptance.trim()
      });
    }
    
    return criteria;
  } catch (error) {
    console.error('SPEC.md okunamadı:', error.message);
    return new Map();
  }
}

/**
 * Artifacts klasöründen consensus.md'yi oku
 */
function loadArtifactConsensus(taskId, artifactsDir = 'artifacts') {
  try {
    const consensusPath = path.join(artifactsDir, taskId, 'consensus.md');
    if (fs.existsSync(consensusPath)) {
      const content = fs.readFileSync(consensusPath, 'utf8');
      
      // Plan, Top Proposals, Critiques bölümlerini çıkar
      const planMatch = content.match(/## Plan\s*\n([\s\S]*?)(?=\n##|$)/);
      const proposalsMatch = content.match(/## Top Proposals\s*\n([\s\S]*?)(?=\n##|$)/);
      const critiquesMatch = content.match(/## Critiques\s*\n([\s\S]*?)(?=\n##|$)/);
      
      let summary = '';
      if (planMatch) {
        summary += planMatch[1].trim().split('\n')[0] + ' ';
      }
      if (proposalsMatch) {
        summary += proposalsMatch[1].trim().split('\n')[0] + ' ';
      }
      if (critiquesMatch) {
        summary += critiquesMatch[1].trim().split('\n')[0];
      }
      
      return summary.trim() || 'N/A';
    }
  } catch (error) {
    console.error(`Artifact consensus okunamadı (${taskId}):`, error.message);
  }
  
  return 'N/A';
}

/**
 * Görev detaylarını doldur
 */
function fillTaskDetails(task, specCriteria, artifactsDir) {
  const taskId = task.id;
  const spec = specCriteria.get(taskId);
  
  // Öncelik sırası: SPEC > artifacts > mevcut > N/A
  const details = {
    goal: task.details?.goal || 'N/A',
    actions: task.details?.actions || 'N/A',
    acceptance: task.details?.acceptance || 'N/A'
  };
  
  if (spec) {
    // SPEC'ten al
    details.goal = spec.goal || details.goal;
    details.actions = spec.actions || details.actions;
    details.acceptance = spec.acceptance || details.acceptance;
  } else if (artifactsDir) {
    // Artifacts'tan al
    const artifactSummary = loadArtifactConsensus(taskId, artifactsDir);
    if (artifactSummary !== 'N/A') {
      details.goal = details.goal === 'N/A' ? artifactSummary : details.goal;
      details.actions = details.actions === 'N/A' ? artifactSummary : details.actions;
      details.acceptance = details.acceptance === 'N/A' ? artifactSummary : details.acceptance;
    }
  }
  
  return details;
}

/**
 * Görevleri ID'ye göre deduplicate et
 */
function deduplicateTasks(tasks) {
  const taskMap = new Map();
  
  tasks.forEach(task => {
    const id = task.id;
    
    if (!taskMap.has(id)) {
      taskMap.set(id, task);
    } else {
      const existing = taskMap.get(id);
      
      // Status önceliği: in_progress > completed > prepared > not_started
      const statusPriority = {
        'in_progress': 4,
        'completed': 3,
        'prepared': 2,
        'not_started': 1
      };
      
      const existingPriority = statusPriority[existing.status] || 0;
      const newPriority = statusPriority[task.status] || 0;
      
      if (newPriority > existingPriority) {
        taskMap.set(id, task);
      }
    }
  });
  
  return Array.from(taskMap.values());
}

/**
 * Ana rapor oluşturma fonksiyonu
 */
function buildReport({ tasks, events = [], artifactsDir = null }) {
  try {
    // SPEC acceptance criteria'ları yükle
    const specCriteria = loadSpecAcceptanceCriteria();
    
    // Görevleri deduplicate et
    const uniqueTasks = deduplicateTasks(tasks);
    
    // Her görev için detayları doldur ve agent'ları normalize et
    const enrichedTasks = uniqueTasks.map(task => {
      const details = fillTaskDetails(task, specCriteria, artifactsDir);
      const normalizedAgent = normalizeAgentName(task.agent, task.model);
      
      return {
        ...task,
        agent: normalizedAgent,
        details: details,
        lastUpdated: task.lastUpdated || new Date().toISOString()
      };
    });
    
    // Summary'yi yeniden hesapla
    const summary = {
      total: enrichedTasks.length,
      completed: enrichedTasks.filter(t => t.status === 'completed').length,
      in_progress: enrichedTasks.filter(t => t.status === 'in_progress').length,
      prepared: enrichedTasks.filter(t => t.status === 'prepared').length,
      not_started: enrichedTasks.filter(t => t.status === 'not_started').length
    };
    
    // Agent istatistikleri
    const agentStats = new Map();
    enrichedTasks.forEach(task => {
      if (task.agent && task.agent !== 'unknown/unknown') {
        if (!agentStats.has(task.agent)) {
          agentStats.set(task.agent, { total: 0, completed: 0 });
        }
        const stats = agentStats.get(task.agent);
        stats.total++;
        if (task.status === 'completed') {
          stats.completed++;
        }
      }
    });
    
    return {
      summary,
      tasks: enrichedTasks,
      agents: Array.from(agentStats.entries()).map(([name, stats]) => ({
        name,
        ...stats,
        completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      })),
      events: events.slice(-50), // Son 50 event
      generatedAt: new Date().toISOString(),
      version: '2.0.0'
    };
    
  } catch (error) {
    console.error('Rapor oluşturma hatası:', error);
    throw error;
  }
}

/**
 * Health check verileri
 */
function getHealthCheck(tasks) {
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  
  // Duplicate ID'leri bul
  const idCounts = new Map();
  tasks.forEach(task => {
    const count = idCounts.get(task.id) || 0;
    idCounts.set(task.id, count + 1);
  });
  const duplicateIds = Array.from(idCounts.entries())
    .filter(([id, count]) => count > 1)
    .map(([id, count]) => ({ id, count }));
  
  // Boş detayları say
  const emptyDetailsCount = tasks.filter(task => 
    !task.details || 
    task.details.goal === 'N/A' || 
    task.details.goal === '' ||
    task.details.acceptance === 'N/A' ||
    task.details.acceptance === ''
  ).length;
  
  // Eski prepared görevleri say
  const stalePreparedCount = tasks.filter(task => {
    if (task.status !== 'prepared') return false;
    if (!task.lastUpdated) return true;
    
    try {
      const lastUpdate = new Date(task.lastUpdated);
      return lastUpdate < twelveHoursAgo;
    } catch {
      return true;
    }
  }).length;
  
  // Eksik artifacts say (eğer artifacts klasörü varsa)
  let artifactsMissingCount = 0;
  if (fs.existsSync('artifacts')) {
    artifactsMissingCount = tasks.filter(task => {
      const artifactPath = path.join('artifacts', task.id);
      return !fs.existsSync(artifactPath);
    }).length;
  }
  
  return {
    duplicateIds,
    emptyDetailsCount,
    stalePreparedCount,
    artifactsMissingCount,
    totalIssues: duplicateIds.length + emptyDetailsCount + stalePreparedCount + artifactsMissingCount,
    checkedAt: new Date().toISOString()
  };
}

module.exports = {
  buildReport,
  getHealthCheck,
  normalizeAgentName,
  loadSpecAcceptanceCriteria,
  deduplicateTasks
};

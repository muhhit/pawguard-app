const running = new Map(); // taskId -> {round, agents: Set}
const history = [];

function record(taskId, agentId, round) {
  const cur = running.get(taskId) || { round, agents: new Set() };
  cur.round = round; 
  cur.agents.add(agentId);
  running.set(taskId, cur);
  history.push({ ts: Date.now(), taskId, agentId, round, type: 'assign' });
}

function finish(taskId, agentId) {
  const cur = running.get(taskId);
  if (cur) cur.agents.delete(agentId);
  history.push({ ts: Date.now(), taskId, agentId, type: 'finish' });
  if (!cur || cur.agents.size === 0) running.delete(taskId);
}

function snapshot() {
  const run = Array.from(running.entries()).map(([taskId, v]) => ({ 
    taskId, 
    round: v.round,
    agents: Array.from(v.agents) 
  }));
  const last = history.slice(-200);
  return { running: run, history: last };
}

module.exports = { record, finish, snapshot };

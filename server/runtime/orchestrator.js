const EventEmitter = require('events');

class Orchestrator extends EventEmitter {
  constructor() {
    super();
    this.agents = [];
    this.eventsMemory = [];
  }

  addAgent(agent) {
    this.agents.push(agent);
  }

  emit(event) {
    this.eventsMemory.push({
      ...event,
      timestamp: Date.now()
    });
    super.emit(event.type, event);
  }

  async processTask(task) {
    const transcript = [];
    let round = 1;

    // Agent selection and scoring function
    function matchScore(profile, task) {
      // Simple scoring based on profile match
      return Math.random(); // Placeholder scoring
    }

    while (round <= 3) {
      const { record } = require('./assignments');
      let ranked = this.agents.map(a => ({ a, score: matchScore(a.profile, task) })).sort((x,y)=>y.score-x.score);
      const selected = ranked.slice(0, Math.min(2, ranked.length));
      
      for (const { a } of selected) {
        this.emit({ type: 'dispatch', round, to: a.profile.id, taskId: task.id });
        record(task.id, a.profile.id, round);
        const msg = await a.act(task, round, transcript);
        transcript.push(msg);
        this.emit({ type: 'message', round, taskId: task.id, message: msg });
      }

      // Evaluation phase
      const evalAgent = this.agents.find(a => a.profile.role === 'evaluator');
      if (evalAgent) {
        this.emit({ type: 'dispatch', round, to: evalAgent.profile.id, taskId: task.id });
        const m2 = await evalAgent.act(task, round, transcript);
        transcript.push(m2);
        this.emit({ type: 'message', round, taskId: task.id, message: m2 });
      }

      round++;
    }

    // Task completion
    const output = { agent: 'final', result: 'completed', transcript };
    this.emit({ type: 'task:complete', taskId: task.id, output });
    try { require('./assignments').finish(task.id, output.agent); } catch {}

    return output;
  }
}

module.exports = Orchestrator;

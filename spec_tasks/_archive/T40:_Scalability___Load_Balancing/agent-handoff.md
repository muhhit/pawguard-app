Task: T40: Scalability & Load Balancing — SPEC task

Context:
- Provider: openai
- Model: gpt-5-pro
- Priority: n/a
- Difficulty: n/a
- Dependencies: n/a

SPEC Excerpt:

### T40: Scalability & Load Balancing
- Auto-scaling infrastructure; load balancing; database sharding; performance optimization.
- Acceptance: handles 10x traffic spikes; optimal resource utilization.

Rules:
- Keep diffs minimal; follow repo style.
- Update docs/tests and .env.example when needed.
- Do not commit secrets.
- Small, verifiable commits.
- When this task is completed, update status.json to {"state": "completed"} to allow the orchestrator to proceed.

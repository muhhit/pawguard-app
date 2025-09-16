Task: T5: Offline Resilience — SPEC task

Context:
- Provider: anthropic
- Model: claude-4-sonnet
- Priority: n/a
- Difficulty: n/a
- Dependencies: n/a

SPEC Excerpt:

### T5: Offline Resilience
- Cache critical reads; queue writes; offline banner and retry inspector.

Rules:
- Keep diffs minimal; follow repo style.
- Update docs/tests and .env.example when needed.
- Do not commit secrets.
- Small, verifiable commits.
- When this task is completed, update status.json to {"state": "completed"} to allow the orchestrator to proceed.

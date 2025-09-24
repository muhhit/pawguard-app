Task: T12: Agent Orchestration & Eval (LangGraph + LiteLLM + promptfoo) — SPEC task

Context:
- Provider: anthropic
- Model: claude-4-sonnet
- Priority: n/a
- Difficulty: n/a
- Dependencies: n/a

SPEC Excerpt:

### T12: Agent Orchestration & Eval (LangGraph + LiteLLM + promptfoo)
- Graph for notification/ingest; provider fallback via LiteLLM; prompt evals for 3–5 core scenarios.
- Acceptance: telemetry shows fallback usage; eval scores tracked per commit.

Rules:
- Keep diffs minimal; follow repo style.
- Update docs/tests and .env.example when needed.
- Do not commit secrets.
- Small, verifiable commits.
- When this task is completed, update status.json to {"state": "completed"} to allow the orchestrator to proceed.

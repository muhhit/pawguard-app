Task: mobile:openai — SPEC task

Context:
- Provider: openai
- Model: gpt-5-pro
- Priority: n/a
- Difficulty: n/a
- Dependencies: n/a

SPEC Excerpt:

### T0: Repo Hygiene & DevEx Baseline
- Goal: Project turnkey in Codespaces and local.
- Actions: ensure `npm run dev` works; add/verify pre-commit; CI lint/type-check; update env examples; pin/scan deps.
- Acceptance: clean lint/type-check; CI green; dev starts without manual patches.

Rules:
- Keep diffs minimal; follow repo style.
- Update docs/tests and .env.example when needed.
- Do not commit secrets.
- Small, verifiable commits.
- When this task is completed, update status.json to {"state": "completed"} to allow the orchestrator to proceed.

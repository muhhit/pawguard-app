Task: T3: RLS Hardening + Privacy RPC — SPEC task

Context:
- Provider: anthropic
- Model: claude-4-sonnet
- Priority: n/a
- Difficulty: n/a
- Dependencies: n/a

SPEC Excerpt:

### T3: RLS Hardening + Privacy RPC
- Audit tables; enable RLS; add policies; expose reads via `get_pets_with_privacy_v2`; app uses RPC only.
- Acceptance: direct SELECT denied; RPC returns fuzzed coords by trust.

Rules:
- Keep diffs minimal; follow repo style.
- Update docs/tests and .env.example when needed.
- Do not commit secrets.
- Small, verifiable commits.
- When this task is completed, update status.json to {"state": "completed"} to allow the orchestrator to proceed.

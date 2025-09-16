Task: T11: External Signals Ingestion (Sources → Supabase) — SPEC task

Context:
- Provider: anthropic
- Model: claude-4-sonnet
- Priority: n/a
- Difficulty: n/a
- Dependencies: n/a

SPEC Excerpt:

### T11: External Signals Ingestion (Sources → Supabase)
- Start with Browse.ai or Playwright worker; extract from 2–3 sources (with permission); upsert to `ingested_listings` with dedup/geocode.
- Acceptance: daily ingest; dedup tracked; opt-out honored.

Rules:
- Keep diffs minimal; follow repo style.
- Update docs/tests and .env.example when needed.
- Do not commit secrets.
- Small, verifiable commits.
- When this task is completed, update status.json to {"state": "completed"} to allow the orchestrator to proceed.

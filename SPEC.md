# Spec: PawGuard Orchestration (Rork → Modern Agents)

Purpose: Replace the Rork/Sonnet4-era skeleton with a modern, multi-agent workflow (Cline/Continue) to ship production features inside Codespaces with minimal human input.

## Conventions
- Provider: `anthropic|openai|google` chosen by npm script; keep diffs minimal; follow repo style.
- Output: concrete diffs + updated docs/tests + `.env.example` changes when adding envs. Never commit secrets.
- Style: prefer RPCs + RLS over blanket SELECT; avoid dead code; keep functions small.

## Discovery (what exists)
- App (Expo RN): add-pet, rescue-channel, pet-details, tabs (map/community/tracking/health/messaging), brandify/parallax/poster/collage, offline-mode, premium subscription, reward claims (Iyzico), circles, matchmaking, conversations, success stories.
- Backend (Express): `/payments/iyzico/*` mock, `/payments/stripe/*` placeholder, `/render/brandify` (Gemini opt-in), `/render/parallax` TODO, poster/collage SVG, in-memory rate-limit, Supabase client optional.
- DB (Supabase): privacy RPCs (`get_pets_with_privacy[_v2]`), notify stub, notification_limits, rescue_* tables. RLS notes indicate hardening pending.
- Orchestration: devcontainer + agents (Cline/Continue), prompt submodule, MCP servers.

## Modernization Goals (Rork → Now)
- Finish placeholders: Iyzico later, notifications, RLS, parallax; robust Brandify.
- Production DevEx: Codespaces agents, secrets, CI, pre-commit, release.
- Observability + performance baselines: analytics, error tracking, image perf, offline resilience.

## Tasks

### T0: Repo Hygiene & DevEx Baseline
- Goal: Project turnkey in Codespaces and local.
- Actions: ensure `npm run dev` works; add/verify pre-commit; CI lint/type-check; update env examples; pin/scan deps.
- Acceptance: clean lint/type-check; CI green; dev starts without manual patches.

### T1: Payments — Iyzico Integration (Backend + App)
- Defer until company setup. Prepare interfaces and docs only.

### T2: Push Dispatch — Nearby Alerts
- Backend: webhook `/notify/nearby`; SQL trigger posts to server; gate via `should_send_notification()`; OneSignal/Expo push.
- App: register push token to `user_push_tokens`; in-app notification center.
- Acceptance: updates trigger single push within limits; background delivery verified.

### T3: RLS Hardening + Privacy RPC
- Audit tables; enable RLS; add policies; expose reads via `get_pets_with_privacy_v2`; app uses RPC only.
- Acceptance: direct SELECT denied; RPC returns fuzzed coords by trust.

### T4: Parallax & Brandify (Media)
- Implement `/render/parallax` (server or client Skia fallback). Brandify handles Gemini failures and optional Supabase Storage upload.

### T5: Offline Resilience
- Cache critical reads; queue writes; offline banner and retry inspector.

### T6: Messaging, Rescue, Reward UX
- Stabilize real-time flows; optimistic UI; error states.

### T7: Observability & Analytics
- Sentry (mobile + server); standardized analytics funnels.

### T8: Image Performance & Poster/Collage
- Enforce sizes; keep endpoints <300ms for small inputs; scrolling 60fps.

### T9: Security & Supply Chain
- Pin deps; basic vulnerability scan; CODEOWNERS for sensitive areas.

### T10: Release & EAS
- EAS config; store bundle IDs; release channels; smoke build.

### T11: External Signals Ingestion (Sources → Supabase)
- Start with Browse.ai or Playwright worker; extract from 2–3 sources (with permission); upsert to `ingested_listings` with dedup/geocode.
- Acceptance: daily ingest; dedup tracked; opt-out honored.

### T12: Agent Orchestration & Eval (LangGraph + LiteLLM + promptfoo)
- Graph for notification/ingest; provider fallback via LiteLLM; prompt evals for 3–5 core scenarios.
- Acceptance: telemetry shows fallback usage; eval scores tracked per commit.

## Provider Prompts (for agents)
- Validate assumptions; ask for missing env names only; propose minimal diffs first; then apply with tests/docs; keep tasks small and verifiable.

## Human Inputs Only
- Provide API keys/secrets (OpenAI/Anthropic/Google/Mapbox/OneSignal/Supabase/Iyzico/Stripe); approve GitHub apps; app store credentials when releasing.


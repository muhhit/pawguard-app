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

### T13: Advanced Pet Recognition & AI Features
- Implement breed identification with confidence scoring; health assessment from photos; behavioral analysis.
- Acceptance: 85%+ accuracy on common breeds; health alerts for visible issues.

### T14: Geofencing & Safe Zones
- Create virtual boundaries; alert when pets enter/exit zones; integration with rescue alerts.
- Acceptance: real-time zone detection; configurable alert preferences.

### T15: Social Features & Community Building
- Pet profiles; social sharing; community events; local pet groups.
- Acceptance: user engagement metrics; community growth tracking.

### T16: Veterinary Integration & Health Tracking
- Vet appointment scheduling; health records; vaccination reminders; emergency contacts.
- Acceptance: seamless vet workflow; automated health notifications.

### T17: Advanced Search & Filtering
- Multi-criteria search; saved searches; smart recommendations; location-based filtering.
- Acceptance: sub-second search response; relevant results ranking.

### T18: Real-time Chat & Video Calls
- In-app messaging; video calls for pet verification; group chats for rescue coordination.
- Acceptance: stable video quality; message delivery guarantees.

### T19: Gamification & Rewards System
- Achievement badges; community points; leaderboards; reward redemption.
- Acceptance: user retention improvement; engagement metrics.

### T20: Multi-language Support & Localization
- Turkish, English, German language support; cultural adaptations; local regulations.
- Acceptance: complete translation coverage; locale-specific features.

### T21: Advanced Analytics & Reporting
- User behavior analytics; success rate tracking; performance dashboards; business intelligence.
- Acceptance: real-time dashboards; actionable insights generation.

### T22: API Gateway & Rate Limiting
- Centralized API management; rate limiting; authentication; monitoring.
- Acceptance: 99.9% uptime; proper rate limiting enforcement.

### T23: Advanced Caching & Performance
- Redis caching; CDN integration; image optimization; lazy loading.
- Acceptance: <200ms API response times; optimized image delivery.

### T24: Backup & Disaster Recovery
- Automated backups; disaster recovery procedures; data integrity checks.
- Acceptance: RTO <1 hour; RPO <15 minutes; verified recovery procedures.

### T25: Advanced Security & Compliance
- GDPR compliance; data encryption; security audits; penetration testing.
- Acceptance: security certification; compliance documentation.

### T26: Machine Learning Pipeline
- Training data collection; model training; A/B testing; performance monitoring.
- Acceptance: automated ML pipeline; model performance tracking.

### T27: Advanced Notifications & Alerts
- Smart notification timing; personalized alerts; multi-channel delivery; notification analytics.
- Acceptance: improved engagement rates; reduced notification fatigue.

### T28: Integration Testing & E2E Tests
- Comprehensive test suite; automated testing; performance testing; load testing.
- Acceptance: 90%+ test coverage; automated CI/CD pipeline.

### T29: Advanced Monitoring & Observability
- Application monitoring; infrastructure monitoring; log aggregation; alerting.
- Acceptance: proactive issue detection; comprehensive observability.

### T30: Content Management & Moderation
- User-generated content moderation; automated content filtering; community guidelines enforcement.
- Acceptance: 95%+ inappropriate content detection; swift moderation response.

### T31: Advanced Location Services
- Indoor positioning; location history; route optimization; location sharing.
- Acceptance: accurate indoor positioning; optimized route suggestions.

### T32: Payment Processing & Billing
- Multiple payment methods; subscription management; invoice generation; payment analytics.
- Acceptance: secure payment processing; automated billing workflows.

### T33: Advanced Pet Matching Algorithm
- AI-powered pet matching; compatibility scoring; preference learning; success tracking.
- Acceptance: improved match success rates; user satisfaction metrics.

### T34: Emergency Response System
- Emergency alert broadcasting; first responder integration; crisis management; emergency contacts.
- Acceptance: <30 second alert delivery; verified emergency workflows.

### T35: Advanced Data Pipeline
- Real-time data processing; data warehousing; ETL processes; data quality monitoring.
- Acceptance: real-time data availability; data quality assurance.

### T36: Mobile App Optimization
- Performance optimization; battery usage optimization; offline capabilities; app store optimization.
- Acceptance: 4.5+ app store rating; optimized performance metrics.

### T37: Advanced User Experience
- Personalization engine; user journey optimization; accessibility features; usability testing.
- Acceptance: improved user satisfaction; accessibility compliance.

### T38: Integration with External Services
- Third-party API integrations; webhook management; service mesh; API versioning.
- Acceptance: reliable external integrations; proper error handling.

### T39: Advanced Reporting & Business Intelligence
- Custom report generation; data visualization; predictive analytics; business metrics.
- Acceptance: actionable business insights; automated reporting.

### T40: Scalability & Load Balancing
- Auto-scaling infrastructure; load balancing; database sharding; performance optimization.
- Acceptance: handles 10x traffic spikes; optimal resource utilization.

### T41: Advanced Security Monitoring
- Security incident response; threat detection; vulnerability management; security automation.
- Acceptance: proactive threat detection; automated security responses.

### T42: Production Readiness & Launch
- Production deployment; monitoring setup; rollback procedures; launch coordination.
- Acceptance: successful production launch; stable system operation.

## Provider Prompts (for agents)
- Validate assumptions; ask for missing env names only; propose minimal diffs first; then apply with tests/docs; keep tasks small and verifiable.

## Human Inputs Only
- Provide API keys/secrets (OpenAI/Anthropic/Google/Mapbox/OneSignal/Supabase/Iyzico/Stripe); approve GitHub apps; app store credentials when releasing.

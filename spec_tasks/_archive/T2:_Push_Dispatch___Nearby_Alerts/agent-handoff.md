Task: T2: Push Dispatch — Nearby Alerts — SPEC task

Context:
- Provider: anthropic
- Model: claude-4-sonnet
- Priority: n/a
- Difficulty: n/a
- Dependencies: n/a

SPEC Excerpt:

### T2: Push Dispatch — Nearby Alerts
- Backend: webhook `/notify/nearby`; SQL trigger posts to server; gate via `should_send_notification()`; OneSignal/Expo push.
- App: register push token to `user_push_tokens`; in-app notification center.
- Acceptance: updates trigger single push within limits; background delivery verified.

Rules:
- Keep diffs minimal; follow repo style.
- Update docs/tests and .env.example when needed.
- Do not commit secrets.
- Small, verifiable commits.
- When this task is completed, update status.json to {"state": "completed"} to allow the orchestrator to proceed.

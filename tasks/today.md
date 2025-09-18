TSK-TODAY-001: API bridge/rapor normalizasyonu görünür olsun

- Accept: curl -s http://localhost:4310/api/report | jq '.summary' sayı döner; agent
etiketleri normalize.

TSK-TODAY-002: TypeScript pass (öncelik app/amber.tsx, app/health-schedule.tsx, app/
microchip.tsx, app/vaccine-tracker.tsx)

- Accept: npm run type-check → 0 errors.

TSK-TODAY-003: Jest sanity + Amber smoke testi

- Accept: npm run test:ci → green.

TSK-TODAY-004: Lint=0

- Accept: npm run lint → 0 problems.

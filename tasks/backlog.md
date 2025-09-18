Backlog (PawGuard)

- TSK-B001: TypeScript zero — app/* tip hatalarını temizle (health-schedule, microchip,
vaccine-tracker, amber)
    - Accept: npm run type-check → 0 errors
- TSK-B002: Jest smoke suite — Amber ve Vaccine için 2 test
    - Accept: npm run test:ci yeşil
- TSK-B003: Expo doctor green & Metro stabil
    - Accept: npx expo doctor uyarısız/az uyarı; QR sorunsuz
- TSK-B004: Error boundaries + toast
    - Accept: Ağ hataları kullanıcıya görünür, log gürültüsü yok
- TSK-B005: Sentry MCP (opsiyonel)
    - Accept: DSN ile temel captureException
- TSK-B006: Analytics minimal şema
    - Accept: app_start, alert_create, microchip_search olayları
- TSK-B007: Performance
    - Accept: Görsel optimizasyon, memoization, Hermes bayrakları
- TSK-B008: Model label normalization guard (CI)
    - Accept: Raporlar normalize (opus‑4.1‑pro / gpt‑5‑pro / gemini‑2.5‑pro / copilot‑pro)

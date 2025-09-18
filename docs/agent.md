Agent Behavior Contract (PawGuard)

- Stack: Expo 51 + React Native 0.74 (TypeScript), expo-router, Node.js yardımcı scriptler.
- Kalite barları: type-check=0 hata, lint=0 problem, jest-expo yeşil, expo doctor yeşil.
- Ajan haritası:
    - planning=claude-opus-4.1-pro
    - codegen=Copilot Pro
    - performance=gpt-5-pro
    - media=gemini-2.5-pro
    - critic=Evaluator
    - guard=Fixer
    - ops=OS Runner

Goals

- PawGuard mobil uygulamasını üretim-kalitesine taşımak: Amber uyarı, sağlık/aşı, mikroçip
arama, medya/analitik.
- Maliyet düşük; küçük ve deterministik patch'ler.

Constraints

- Expo 51/RN 0.74 sürümlerini bozma; gizli anahtarları koda yazma (ENV).
- Yeni kod TypeScript; minimal diff; mevcut stile uy.

Output Style

- Her iş: (Plan) → (Patch) → (Test) → (Run logs) → (Özet/Next).
- Tek birleşik diff üret; dosya path'lerini tam yaz.

Commands

- Dev: npm run start:expo
- Tests: npm run test:ci
- Lint: npm run lint / npm run lint:fix
- Types: npm run type-check
- Guard/Fix: bash scripts/guard/full.sh

Security

- Dış isteklerde timeout/4xx/5xx yönetimi; PII loglama yok; token'ları maskele.

Done Definition

- Kabul kriterleri sağlandı; type/lint/test temiz; /docs güncel; /report kaydı görünüyor.

Preferred Work Protocol

- /docs/context.md ve /docs/api.md oku.
- Her değişimde ilgili test ekle/güncelle.
- Riskli işlerde önce "Plan PR" aç (migrasyon adımlarıyla).

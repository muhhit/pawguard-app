Product Context (PawGuard)

Vision

- Pet safety super app: hızlı Amber uyarıları, güvenilir sağlık merkezi, mikroçip kimlik,
güçlü medya ve growth döngüleri.

Primary Flows

- Amber Alert: oluştur → paylaş → ack/expand.
- Health Hub: aşı programı/hatırlatıcılar → kayıtlar → (ileride) PDF export.
- Microchip Search: çip doğrula, resmi kayıt rehberi, sonraki adımlar.
- Media/Brandify: poster/kolaj üretimi ve paylaşım varlıkları.

Done Criteria

- İlk oturumda <3 dk Amber uyarısı tetiklenebiliyor.
- Expo Go QR açılıyor; orta cihazda ~3 sn'de yükleniyor.
- TypeScript=0, Lint=0, jest-expo smoke yeşil.
- /report'da iş kabul kriterleriyle tamamlandı.

Non-Goals (şimdilik)

- Gerçek ödemeler (mock kabul).
- Telemedicine/EMR billing.

Tech Decisions

- React 18.2, Expo 51, RN 0.74; jest-expo; ESLint + @typescript-eslint.
- ENV: .env → EXPO_PUBLIC_* (client), sunucu scriptleri standart değişkenler.

Metrics

- TTI < 3s; bundle makul; kırmızı ekran yok; unhandled rejection yok.

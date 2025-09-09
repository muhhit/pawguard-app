# Payments Backend (Skeleton)

Basit bir Express sunucusu ile Iyzico/Stripe entegrasyonu için başlangıç iskeleti.

## Kurulum

```
npm i
npm run dev
```

## Env

```
PORT=4000
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
STRIPE_SECRET_KEY=
SUPABASE_SERVICE_ROLE=
SUPABASE_URL=
GOOGLE_GENAI_API_KEY=
```

## Uçlar
- `POST /payments/iyzico/init` → { success, paymentPageUrl | token }
- `POST /payments/iyzico/webhook` → claim status güncelleme
- `POST /payments/stripe/init` → PaymentIntent/Checkout
- `POST /payments/stripe/webhook` → payout/transfer ve claim güncelleme
- `POST /render/brandify` → Gemini 2.5 Flash Image ile stil transfer (GOOGLE_GENAI_API_KEY gerekir)
- `POST /render/parallax` → Hafif parallax (mock)
- `POST /poster/generate` → Poster SVG
- `POST /ugc/collage` → Kolaj SVG

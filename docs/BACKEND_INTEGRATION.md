# Backend Integration (Supabase + Payments)

This app is wired to use Supabase for data and will gracefully fallback to mock data if env vars are missing.

## 1) Environment Variables

Copy `.env.example` to `.env` and fill values (EAS/Expo: EXPO_PUBLIC_*):

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_MAPBOX_TOKEN=
EXPO_PUBLIC_ONESIGNAL_APP_ID=
EXPO_PUBLIC_OPENAI_API_KEY=
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_MIN_TRUST_SCORE=40
EXPO_PUBLIC_ENABLE_VERIFICATION=true
```

## 2) Supabase Schema

Run `sql/schema.sql` in Supabase SQL editor. Enable PostGIS and create functions.
Add RLS policies per your security needs.

## 3) Payments (Iyzico / Stripe)

Implement backend endpoints:

- `POST /payments/iyzico/init`: returns `{ success, paymentPageUrl | token }`
- Webhook receiver to update claim status → `paid` and store `payment_id`
- (UK) Stripe Connect equivalent for marketplace flows

Set `EXPO_PUBLIC_API_BASE_URL` and the app will call your backend from `IyzicoPayment.tsx`.

## 4) Notifications

On permission grant, app saves Expo push token to `user_push_tokens`. Implement your sender using Supabase selection (e.g. `users_within_radius`) and Expo push API.

## 5) Evidence Storage (Supabase Storage)

Create a public bucket named `evidence` in Supabase Storage. The app uploads claim evidence photos there and stores the public URL in `reward_claims.evidence_photo`.


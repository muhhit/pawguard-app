# Ölçek ve Mimarî (0 → 1M kullanıcı)

Uygulama
- Expo/RN yeni mimari + Reanimated + FlashList; ağır görsellerde 60fps hedef.
- Feature flags (constants/feature-rollout.ts) ile kademeli açılış.

Backend
- Supabase Postgres + PostGIS; sıcak tablolarda indeksler (zaman/konum birleşik).
- RPC ile iş kuralları (gizlilik); RLS ile veri erişim kontrolü.
- Storage: evidence/public; CDN önünde sunum.

Genişleme
- İş kuyrukları (n8n/Cloud Functions) → bildirim dalgaları, haftalık UGC derlemesi, anomali tespiti.
- Rate limit (IP/kullanıcı başına); loglama ve izleme (Sentry/Logflare).
- Bölgesel segmentasyon: TR ve UK bağımsız task kuyrukları.

Maliyet
- Mapbox (Google’a göre daha düşük); depolama/CDN ile bant genişliği azaltma.
- Push ve SMS maliyetleri için oran sınırlayıcılar.


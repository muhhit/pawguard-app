# PawGuard MVP (Expo/React Native)

Hızlı başlangıç ve dağıtım için hazırlanmış PawGuard MVP kod tabanı. Rork ile bağlanmaya ve Supabase/ödemeler ile canlıya çıkmaya hazırdır.

## Hızlı Başlangıç

1) `.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun (EAS/Rork için EXPO_PUBLIC_*).

2) Supabase projenizde `sql/schema.sql` içeriğini çalıştırın (PostGIS etkin, fonksiyonlar + indexler dahil). RLS politikalarını ekleyin.

3) Geliştirme:

```
bun install
bunx expo start
```

4) Rork entegrasyonu: Depolama/env ayarlarını Rork paneline ekleyin. Build sonrası `.env` içeriğini EXPO_PUBLIC_* olarak tanımlayın.

## Öne Çıkanlar

- Harita + kümelenme + gizlilik katmanı (privacy-level)
- Kayıp ilan akışı, ödül talep yaşam döngüsü
- Iyzico/Stripe için backend entegrasyon hazneleri (client hazır, server gerektiği gibi)
- Push kayıtları (Expo token → Supabase)
- Güven/Doğrulama UI'ları ve şema

## Notlar

- Üretime çıkmadan önce tüm API anahtarlarını `.env` üzerinden yönetin; repoda saklamayın.
- `docs/BACKEND_INTEGRATION.md` ödeme ve bildirim uçlarını özetler.

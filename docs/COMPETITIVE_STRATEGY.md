# Rekabet ve Farklaştırma Stratejisi

Bu belge PawGuard'ı PawBoost, Finding Rover, Nextdoor, Pawscout gibi rakiplere göre farklılaştırmak için somut ürün ve büyüme önerilerini listeler.

## 1) Ürün Farkları
- Güven-öncelikli gizlilik: Sokak hayvanlarında varsayılan `protected` gizlilik, güven puanı ile kademeli çözülme; sunucu-tarafı gizleme (SQL RPC ile).
- Ödül escrow + kanıt zinciri: Sahte talepleri önlemek için durum yaşam döngüsü, kanıt görseli ve teslim tutanağı iş akışı.
- Kurtarma Komuta Kanalları: Olay başına görev dağıtımı, rota önerileri ve yakın çevre uyarıları (mikro görevlerle gamification).
- WhatsApp köprüsü: TR pazarında WhatsApp tabanlı ilan başlatma ve yayma akışı (ön-funnel).
- Otomatik UGC reelleri: Haftalık başarı kolajları (n8n/worker ile), paylaş-odaklı şablonlar.
- QR kimlik etiketleri: Tarayınca anonim mesaj kanalı; ödül ekranı ve kanıt yükleme bağlantısı.

## 2) Büyüme Mekanikleri
- Çift yönlü referral (premium ay/ kredi/ ID tag ödülleri) + mahalle lider panoları.
- Klinik/market ortak ekranları (QR içerik döngüsü) ile offline→online köprü.
- STK ortaklıkları ve Topluluk Fonu (eşleşen bağışlar).

## 3) Teknik Kenar
- Supabase PostGIS + RPC ile konum performansı ve gizlilik enforcement.
- Expo + Reanimated + FlashList ile düşük cihazlarda akıcı UI; progresif cam efekti fallback.
- Edge/Server uçlarıyla Iyzico/Stripe escrow akışları; webhook tabanlı durum güncelleme.

## 4) Yol Haritası Kısa
- V1 (30g): Harita/ilan/uyarı/ödül talebi + UK Stripe; TR geçici makbuz.
- V2 (3–6a): Doğrulama/KYC, anomali tespiti, komuta kanalları, referral/analitik, Iyzico tam.
- V3 (6–12a): Tele-tıp, IoT/giyilebilir, etkinlik/RSVP, kurumsal sponsor paketleri.


# Animasyon Sistemi Dokümantasyonu

## Genel Bakış

PawGuard uygulaması, cihaz performansına göre uyarlanabilen akıllı animasyon sistemi kullanır. Sistem, düşük performanslı cihazlarda otomatik olarak animasyonları azaltır ve "reduce motion" erişilebilirlik ayarlarını destekler.

## Cihaz Katmanları

### Düşük Katman (Low-tier)
- **Cihazlar**: iPhone 6/7, Android API < 23, RAM < 3GB
- **Animasyonlar**: Sadece micro fade (200ms)
- **CPU Kullanımı**: < %20
- **Bellek Artışı**: Minimal

### Orta Katman (Mid-tier)
- **Cihazlar**: iPhone 8/X/11, Android API 23-28, RAM 3-6GB
- **Animasyonlar**: Fade + scale kombinasyonu (300ms)
- **Frame Drop**: < %3
- **Smooth geçişler**: Desteklenir

### Yüksek Katman (High-tier)
- **Cihazlar**: iPhone 12+, Android API 28+, RAM > 6GB
- **Animasyonlar**: Reanimated spring animasyonları (400ms)
- **Hedef**: 60fps
- **Layout Shift**: Yok

## Animasyon Degrade Stratejisi

### Reduce Motion Aktifse
1. Tüm animasyonlar 200ms'ye düşürülür
2. Scale animasyonları devre dışı bırakılır
3. Sadece fade animasyonu kullanılır

### Düşük Performanslı Cihazlarda
1. Ağır efektler otomatik kapanır
2. Native driver zorunlu kullanılır
3. Animasyon süreleri kısaltılır

### Performans İzleme
- CPU/GPU kullanımı izlenir
- Threshold aşımında otomatik fallback
- Bellek sızıntısı koruması

## Kullanılan Ekranlar

### Health Ekranı (`app/(tabs)/health.tsx`)
- **Pet Kartları**: 
  - Animasyon: Fade + scale giriş animasyonu
  - Gecikme: 100ms artışlarla (index * 100)
  - Fallback: Reduce motion aktifse sadece fade
  
- **Stats Kartları**:
  - Animasyon: Fade + scale kombinasyonu
  - Gecikme: 150ms artışlarla (index * 150)
  - Reanimated: Yüksek cihazlarda spring efekti
  
- **Quick Action Kartları**:
  - Animasyon: FadeInUp (Reanimated)
  - Gecikme: 100ms artışlarla
  - Süre: 300ms
  
- **Activity Chart**:
  - Animasyon: FadeInUp gecikmeli (600ms)
  - Süre: 400ms
  - Tip: Container animasyonu

### Liste Ekranları
- **Animasyon**: Sıralı kart girişi (FadeInDown)
- **Gecikme**: 100ms artışlarla
- **Fallback**: Anında gösterim

## Teknik Detaylar

### Kullanılan Kütüphaneler
1. **React Native Reanimated v3** (birincil)
2. **React Native Animated** (fallback)
3. **Lottie** (opsiyonel, karmaşık animasyonlar)

### Dosya Yapısı
```
lib/mobile/
├── deviceTier.ts      # Cihaz katmanı tespiti
├── featureFlags.ts    # Özellik bayrakları
├── animations.ts      # Animasyon yardımcıları
└── accessibility.ts   # Erişilebilirlik kontrolleri (gelecek)
```

### Hook Kullanımı
```typescript
// Basit animasyon
const { animatedStyle, startAnimation } = useCardAnimation(100);

// Reanimated ile
const { animatedStyle, startAnimation } = useReanimatedCardAnimation(100);
```

## Performans Metrikleri

### Başarı Kriterleri
- **Düşük Cihaz**: CPU < %20, 60fps micro fade
- **Orta Cihaz**: Frame drop < %3, smooth geçişler
- **Yüksek Cihaz**: 60fps spring, zero layout shift

### İzlenen Metrikler
- Frame rate (FPS)
- CPU kullanımı
- Bellek tüketimi
- Animasyon süresi
- Kullanıcı etkileşim gecikmesi

## Gelecek Geliştirmeler

### Planlanan Özellikler
1. Haptic feedback entegrasyonu
2. Shimmer/skeleton animasyonları
3. Gelişmiş spring konfigürasyonları
4. A/B test desteği

### Optimizasyon Alanları
1. Animasyon önbellekleme
2. GPU kullanımı optimizasyonu
3. Batching mekanizması
4. Performans profiling araçları

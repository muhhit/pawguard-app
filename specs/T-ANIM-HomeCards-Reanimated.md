---
title: Home Cards Entrance Animation
priority: 2
tags: ["animations","mobile-react-native","docs"]
dependsOn: []
budgetTokens: 300
acceptanceCriteria: |
    - Low-tier: 60fps micro fade/scale; CPU spike < 20%, mem artışı minimal
    - Mid-tier: smooth; no jank; frame drop < %3
    - High-tier: 60fps with slight spring; zero layout shift
---

# Home Cards Entrance Animation

## Genel Bakış

Bu spec, ana ekran kartlarının giriş animasyonlarını tanımlar. Cihaz performansına göre farklı animasyon seviyeleri sunar ve "reduce motion" erişilebilirlik ayarlarını destekler.

## Teknik Gereksinimler

### Animasyon Kütüphanesi Tercihi
1. **Birincil**: React Native Reanimated v3 (performans için)
2. **İkincil**: Lottie (karmaşık animasyonlar için opsiyonel)
3. **Fallback**: React Native Animated (düşük cihazlar için)

### Cihaz Katmanı Desteği

#### Düşük Katman Cihazlar
- Sadece micro fade animasyonu
- Süre: 200ms
- Native driver kullanımı zorunlu
- CPU kullanımı < %20
- Bellek artışı minimal

#### Orta Katman Cihazlar
- Fade + scale kombinasyonu
- Süre: 300ms
- Frame drop < %3
- Smooth geçişler

#### Yüksek Katman Cihazlar
- Reanimated ile spring animasyonu
- Süre: 400ms
- 60fps hedefi
- Layout shift yok

## Erişilebilirlik

### Reduce Motion Desteği
- OS "reduce motion" ayarı aktifse:
  - Tüm animasyonlar devre dışı VEYA
  - Sadece fade (200ms) kullan
- `AccessibilityInfo.isReduceMotionEnabled()` kontrolü

### Performans Korumaları
- Animasyon sırasında CPU/GPU izleme
- Threshold aşımında otomatik fallback
- Bellek sızıntısı koruması

## Uygulama Detayları

### Dosya Yapısı
```
lib/mobile/
├── deviceTier.ts      # Cihaz katmanı tespiti
├── featureFlags.ts    # Özellik bayrakları
├── animations.ts      # Animasyon yardımcıları
└── accessibility.ts   # Erişilebilirlik kontrolleri
```

### Animasyon Akışı
1. Component mount
2. Cihaz katmanı kontrolü
3. Reduce motion kontrolü
4. Uygun animasyon seçimi
5. Animasyon başlatma
6. Performans izleme

## Test Kriterleri

### Performans Testleri
- [ ] Düşük cihazda CPU < %20
- [ ] Orta cihazda frame drop < %3
- [ ] Yüksek cihazda 60fps
- [ ] Bellek sızıntısı yok

### Erişilebilirlik Testleri
- [ ] Reduce motion desteği
- [ ] Keyboard navigasyon
- [ ] Screen reader uyumluluğu

### Cihaz Testleri
- [ ] iOS düşük katman (iPhone 7)
- [ ] Android düşük katman (API 21)
- [ ] Orta katman cihazlar
- [ ] Yüksek katman cihazlar

## Notlar

- Animasyonlar işlevi güçlendiren mikro etkileşim seviyesinde olmalı
- Kullanıcı deneyimini bozmayacak şekilde sade tutulmalı
- Eski cihazlarda akıcılık en öncelikli
- Token maliyeti düşük tutulmalı (light mode)

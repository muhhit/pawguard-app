# PawGuard COX Kullanım Kılavuzu

## 🎯 Genel Bakış

PawGuard COX sistemi, verdiğiniz orijinal COX komutlarını PawGuard projesine uyarlanmış bir agent yönetim sistemidir. Bu sistem otomatik kalite kontrolleri, agent orkestrasyon ve sürekli geliştirme sağlar.

## 🚀 Hızlı Başlangıç

### 1. Tek Komutla Başlatma
```bash
# Hızlı başlatma (önerilen)
./scripts/cox-quick-start.sh

# Veya tam kurulum
./scripts/pawguard-cox-setup.sh
```

### 2. Ortam Değişkenlerini Ayarlama
```bash
# PawGuard proje kök yolu (isteğe bağlı, varsayılan: mevcut dizin)
export PAWGUARD_ROOT="/path/to/your/pawguard"

# Dashboard URL (isteğe bağlı, varsayılan: http://localhost:4310)
export PAWGUARD_URL="http://localhost:4310"
```

## 📋 Ana Komutlar

### Sistem Yönetimi
```bash
# COX sistemini başlat
./scripts/cox-quick-start.sh

# COX sistemini durdur
./scripts/cox-stop.sh

# Log dosyalarıyla birlikte durdur
./scripts/cox-stop.sh --clean-logs
```

### Kalite Kontrolleri
```bash
# Lint kontrolü
npm run lint

# Lint otomatik düzeltme
npm run lint:fix

# TypeScript tip kontrolü
npm run type-check

# Test çalıştırma
npm run test
```

### Agent Yönetimi
```bash
# Spec dashboard
npm run spec:dashboard

# Yeni görev oluştur
npm run spec:generate

# Agent durumlarını izle
./scripts/watch-agents.sh

# Spec orkestratör
npm run spec:auto
```

## 🔧 Sistem Bileşenleri

### 1. Ana Kurulum Scripti (`pawguard-cox-setup.sh`)
- **İşlev**: Tam sistem kurulumu ve yapılandırması
- **Özellikler**:
  - Bağımlılık kurulumu
  - Kalite kapıları (lint, type-check, test)
  - Agent başlatma
  - Dashboard kurulumu
  - Kalite skoru hesaplama

### 2. Hızlı Başlatma (`cox-quick-start.sh`)
- **İşlev**: Sistemin hızlı başlatılması
- **Kullanım**: Günlük geliştirme için ideal

### 3. Durdurma Scripti (`cox-stop.sh`)
- **İşlev**: Tüm süreçlerin güvenli durdurulması
- **Özellikler**:
  - PID tabanlı süreç yönetimi
  - Port kontrolü
  - Log temizleme seçeneği

## 📊 Kalite Skoru Sistemi

Sistem 0-10 arası kalite skoru hesaplar:

- **Lint Kontrolü**: +2 puan
- **Tip Kontrolü**: +2 puan  
- **Test Kontrolü**: +2 puan
- **Spec Görevleri**: +3 puan (tamamlanma oranına göre)
- **Dosya Yapısı**: +1 puan

**Hedef**: ≥ 8.0 kalite skoru

## 🤖 Agent Sistemi

### Aktif Agent'lar
1. **Autopilot System**: Sürekli görev üretimi
2. **Real Agent Executor**: Görev yürütme
3. **Complete Optimus Prime**: Ana orkestratör
4. **Spec Orchestrator**: Spec görev yönetimi
5. **Critic Agent**: Kod analizi
6. **Ultra Performance Agent**: Performans optimizasyonu

### Agent Durumları
```bash
# Tüm agent durumlarını kontrol et
./scripts/watch-agents.sh

# Belirli agent'ı başlat
node scripts/[agent-name].js
```

## 📱 Dashboard

### Erişim
- **URL**: http://localhost:4310 (varsayılan)
- **Başlatma**: Otomatik (cox-quick-start.sh ile)
- **Manuel**: `node scripts/spec-dashboard-server.js`

### Özellikler
- Gerçek zamanlı agent durumu
- Kalite metrikleri
- Görev ilerlemesi
- Sistem sağlığı

## 🔍 İzleme ve Loglar

### Log Dosyaları
```bash
server.log          # Sunucu logları
autopilot.log       # Autopilot logları  
dashboard.log       # Dashboard logları
[agent-name].log    # Agent-specific logları
```

### PID Dosyaları
```bash
server.pid          # Sunucu PID
autopilot.pid       # Autopilot PID
dashboard.pid       # Dashboard PID
[agent-name].pid    # Agent PID'leri
```

## ⚡ Hızlı Komutlar

### Günlük Kullanım
```bash
# Sistem başlat
./scripts/cox-quick-start.sh

# Durumu kontrol et
npm run spec:dashboard

# Yeni görev ekle
npm run spec:generate

# Sistem durdur
./scripts/cox-stop.sh
```

### Sorun Giderme
```bash
# Tüm süreçleri zorla durdur
pkill -f "node.*scripts"

# Port kontrolü
lsof -i :4310
lsof -i :3000

# Log temizleme
./scripts/cox-stop.sh --clean-logs
```

## 🛠️ Özelleştirme

### Ortam Değişkenleri
```bash
# .env dosyasında veya export ile
PAWGUARD_ROOT="/custom/path"
PAWGUARD_URL="http://localhost:8080"
NODE_OPTIONS="--max-old-space-size=8192"
AUTOPILOT_ENABLED="true"
```

### Agent Konfigürasyonu
```javascript
// scripts/autopilot-system.js içinde
config: {
  enabled: false,
  mode: "safe",        // "safe" | "aggressive"
  periodMs: 600000,    // 10 dakika
  concurrency: 2,
  maxTasks: 6
}
```

## 🚨 Sorun Giderme

### Yaygın Sorunlar

1. **Port Çakışması**
   ```bash
   # Port 4310 kullanımda
   lsof -i :4310
   kill -9 [PID]
   ```

2. **Agent Başlatma Hatası**
   ```bash
   # Node.js süreçlerini kontrol et
   ps aux | grep node
   
   # Gerekirse temizle
   pkill -f "node.*scripts"
   ```

3. **Bağımlılık Sorunları**
   ```bash
   # Temiz kurulum
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Modu
```bash
# Verbose logging
DEBUG=* ./scripts/cox-quick-start.sh

# Belirli agent debug
DEBUG=agent:* node scripts/real-agent-executor.js
```

## 📈 Performans İpuçları

1. **Bellek Optimizasyonu**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

2. **Concurrent Agent Limiti**
   - Maksimum 3-4 agent eşzamanlı çalıştırın
   - Sistem kaynaklarını izleyin

3. **Log Rotasyonu**
   ```bash
   # Büyük log dosyalarını temizle
   ./scripts/cox-stop.sh --clean-logs
   ```

## 🔗 İlgili Belgeler

- [AUTOPILOT_USAGE.md](./AUTOPILOT_USAGE.md) - Autopilot detayları
- [agent.md](./agent.md) - Agent geliştirme
- [api.md](./api.md) - API referansı
- [context.md](./context.md) - Sistem mimarisi

## 📞 Destek

Sorun yaşadığınızda:

1. Log dosyalarını kontrol edin
2. Sistem durumunu kontrol edin: `npm run spec:dashboard`
3. Agent durumlarını kontrol edin: `./scripts/watch-agents.sh`
4. Gerekirse sistemi yeniden başlatın: `./scripts/cox-stop.sh && ./scripts/cox-quick-start.sh`

---

**Not**: Bu sistem orijinal COX komutlarınızı PawGuard projesine uyarlar ve mevcut agent altyapısını kullanır. Tüm komutlar idempotent'tir ve güvenle tekrar çalıştırılabilir.

# PawGuard Autopilot Sistemi - Kullanım Kılavuzu

## 🤖 Genel Bakış

PawGuard Autopilot sistemi, güvenli modda periyodik olarak çalışan otomatik görev oluşturma ve yönetim sistemidir.

## 🚀 Kurulum ve Başlatma

### 1. Server'ı Başlat
```bash
cd server && node src/index.js
```
Server port 4000'de çalışacaktır.

### 2. Autopilot'u Etkinleştir
```bash
# Güvenli mod, varsayılan süre (10 dk), eşzamanlılık = 2, maxTasks=6
curl -s -X POST http://localhost:4000/autopilot \
  -H 'Content-Type: application/json' \
  --data '{"enabled":true,"mode":"safe"}' | jq
```

## 📊 İzleme ve Kontrol

### Ajan Durumunu Kontrol Et
```bash
curl -s http://localhost:4000/agents | jq
```

### Canlı İzleme (5 saniye aralıklarla)
```bash
# Script kullanarak
./scripts/watch-agents.sh

# Veya doğrudan watch komutu ile
watch -n 5 'curl -s http://localhost:4000/agents | jq'
```

## ⚙️ Konfigürasyon Seçenekleri

### Autopilot Parametreleri
- `enabled`: true/false - Autopilot'u etkinleştir/devre dışı bırak
- `mode`: "safe" - Güvenli mod (şu anda tek seçenek)
- `periodMs`: 600000 - Periyot süresi (milisaniye, varsayılan 10 dakika)
- `concurrency`: 2 - Eşzamanlı çalışacak ajan sayısı
- `maxTasks`: 6 - Maksimum görev sayısı

### Örnek Konfigürasyonlar

#### Hızlı Test Modu (2 dakika)
```bash
curl -s -X POST http://localhost:4000/autopilot \
  -H 'Content-Type: application/json' \
  --data '{"enabled":true,"mode":"safe","periodMs":120000}' | jq
```

#### Yüksek Performans Modu
```bash
curl -s -X POST http://localhost:4000/autopilot \
  -H 'Content-Type: application/json' \
  --data '{"enabled":true,"mode":"safe","concurrency":4,"maxTasks":12}' | jq
```

## 📈 Sistem Durumu

### Autopilot Durumu Kontrol
```bash
curl -s http://localhost:4000/agents | jq '.autopilot'
```

### Ajan İstatistikleri
```bash
curl -s http://localhost:4000/agents | jq '{
  total: .total,
  active: .active,
  completed: .completed,
  timestamp: .timestamp
}'
```

## 🛑 Durdurma

### Autopilot'u Devre Dışı Bırak
```bash
curl -s -X POST http://localhost:4000/autopilot \
  -H 'Content-Type: application/json' \
  --data '{"enabled":false}' | jq
```

## 🔍 Görev Türleri

Autopilot aşağıdaki görev türlerini otomatik olarak oluşturur:

1. **Advanced Testing & Automation** (Complexity: 3)
2. **Performance Optimization & Bundle Size** (Complexity: 3)
3. **Security Audit & Vulnerability Scan** (Complexity: 4)
4. **User Experience & Accessibility** (Complexity: 3)
5. **API Documentation & OpenAPI** (Complexity: 2)
6. **Monitoring & Health Checks** (Complexity: 3)

## 📁 Dosya Yapısı

Oluşturulan görevler `spec_tasks/` dizininde saklanır:
```
spec_tasks/
├── T67:_Advanced_Testing___Automation___Batch_1/
│   ├── plan.json
│   ├── agent-handoff.md
│   └── status.json
├── T68:_Performance_Optimization___Bundle_Size___Batch_1/
│   └── ...
└── ...
```

## 🚨 Güvenlik

- Sistem "safe" modda çalışır
- Rate limiting aktif
- Sadece localhost bağlantıları kabul edilir
- Otomatik görev oluşturma sınırlı

## 📞 Destek

Sorun yaşarsanız:
1. Server loglarını kontrol edin
2. `/health` endpoint'ini test edin
3. Autopilot durumunu kontrol edin

```bash
# Health check
curl -s http://localhost:4000/health

# Autopilot status
curl -s http://localhost:4000/agents | jq '.autopilot'

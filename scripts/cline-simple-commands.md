# Cline için Düşük Maliyet + Tam Tarama Komutları

Bu dokümanda Cline'ın kullanabileceği iki temel komut bulunmaktadır. Bu komutlar **maliyet = 0** ile çalışır ve tam tarama sağlar.

## 🚀 Hızlı Başlangıç

```bash
# Script'i çalıştır (interaktif menü)
./scripts/cline-low-cost-commands.sh

# Veya direkt komutlar
./scripts/cline-low-cost-commands.sh guard    # Guard + Fix
./scripts/cline-low-cost-commands.sh batch    # Batch çalıştırma
./scripts/cline-low-cost-commands.sh monitor  # Canlı izleme
./scripts/cline-low-cost-commands.sh full     # Tam sistem kontrolü
```

## 📋 Temel İki Komut (Cline için)

### 1. Guard + Fix Komutu (Maliyet: 0)

```bash
curl -s -X POST http://localhost:5173/guard/run -H 'Content-Type: application/json' --data '{}' | jq
```

**Ne yapar:**
- TypeScript tip kontrolü (tsc --noEmit)
- Jest test kontrolü
- Expo Doctor kontrolü
- TODO/FIXME taraması
- Başarısız kontroller için otomatik Fix görevleri oluşturur

**Çıktı örneği:**
```json
{
  "success": true,
  "summary": { "passed": 2, "failed": 1, "warnings": 5 },
  "fixTasksCreated": 1,
  "fixTasks": [{ "id": "FIX-1234567890-0", "title": "Fix: TSC Issues" }]
}
```

### 2. Batch Çalıştırma (Deduplication + Fairness) (Maliyet: 0)

```bash
# Prepared görevleri al ve tekilleştir
PREP=$(curl -s http://localhost:5173/spec/scan | jq '{tasks:[.tasks[]|select(.status==null or .status=="prepared")]}')
DEDUP=$(echo "$PREP" | jq '{tasks:(.tasks|group_by(.title)|map(.[0]))}')

# Batch çalıştır
curl -s -X POST http://localhost:5173/run-batch -H 'Content-Type: application/json' --data "$DEDUP" | jq
```

**Ne yapar:**
- Prepared görevleri tarar
- Aynı başlıklı görevleri tekilleştirir (deduplication)
- Ajan sayısı kadar concurrency ile fairness algoritması kullanır
- Görevleri ajanlar arasında dengeli dağıtır

**Çıktı örneği:**
```json
{
  "success": true,
  "originalTaskCount": 15,
  "duplicatesRemoved": 3,
  "tasksScheduled": 12,
  "concurrency": 3,
  "message": "12 unique görev 3 eşzamanlı işlem ile başlatıldı (3 duplicate kaldırıldı)"
}
```

## 🔍 Canlı Doğrulama Komutları (Maliyet: 0)

### Ajan Hareketi İzleme
```bash
watch -n 5 'curl -s http://localhost:5173/agents | jq'
```

### Runtime Durumu
```bash
curl -s http://localhost:5173/runtime | jq
```

### Görev Detayı
```bash
curl -s "http://localhost:5173/task?id=T50" | jq
```

### Sağlık Kontrolü
```bash
curl -s http://localhost:5173/health | jq
```

### Özet Rapor
```bash
curl -s http://localhost:5173/report | jq '.summary'
```

## 🧠 LLM Kontrollü Görev Üretme (MALİYETLİ)

**Sadece gerektiğinde kullanın!**

```bash
# Environment ayarları
export OPTIMUS_USE_LLM=1
export GITHUB_TOKEN=your_token_here
export GITHUB_MODEL_ID=gpt-4o-mini

# Görev üretimi
curl -s -X POST http://localhost:5173/spec/generate -H 'Content-Type: application/json' \
  --data '{"prompt":"Mobile perf + error tracking + UX polish","count":5,"run":true}' | jq '.tasks|length'
```

## 🎯 Cline Kullanım Senaryoları

### Senaryo 1: Rutin Kontrol
```bash
# 1. Guard taraması yap
./scripts/cline-low-cost-commands.sh guard

# 2. Varsa prepared görevleri çalıştır
./scripts/cline-low-cost-commands.sh batch

# 3. Durumu izle
./scripts/cline-low-cost-commands.sh monitor
```

### Senaryo 2: Tam Sistem Kontrolü
```bash
# Tek komutla tüm sistemi kontrol et
./scripts/cline-low-cost-commands.sh full
```

### Senaryo 3: Sadece İzleme
```bash
# Sadece mevcut durumu göster
./scripts/cline-low-cost-commands.sh monitor
```

## 📊 Dashboard Erişimi

```bash
# Dashboard'u aç
./scripts/cline-low-cost-commands.sh dashboard

# Veya direkt URL
# http://localhost:5173
```

## ⚡ Hızlı Referans

| Komut | Maliyet | Açıklama |
|-------|---------|----------|
| `guard` | 0 | TypeScript/Jest/Expo kontrolü + Fix görevleri |
| `batch` | 0 | Prepared görevleri dedup + fairness ile çalıştır |
| `monitor` | 0 | Canlı durum izleme |
| `full` | 0 | Guard + Batch + Monitor |
| `generate` | $$$ | LLM ile yeni görev üretimi |

## 🔧 Sistem Gereksinimleri

- Node.js
- curl
- jq
- Server çalışıyor olmalı (http://localhost:5173)

## 🚨 Önemli Notlar

1. **Varsayılan olarak LLM kapalı** - Maliyet = 0
2. **Guard, dedupe, evaluator ve fairness aktif**
3. **Cline sadece bu iki temel komutu kullanmalı**
4. **LLM sadece gerektiğinde ve kontrollü şekilde**
5. **Tüm işlemler canlı doğrulanabilir**

## 📝 Örnek Cline Workflow

```bash
# 1. Sistem durumunu kontrol et
curl -s http://localhost:5173/health | jq

# 2. Guard taraması yap
curl -s -X POST http://localhost:5173/guard/run -H 'Content-Type: application/json' --data '{}' | jq

# 3. Prepared görevleri al ve çalıştır
PREP=$(curl -s http://localhost:5173/spec/scan | jq '{tasks:[.tasks[]|select(.status==null or .status=="prepared")]}')
DEDUP=$(echo "$PREP" | jq '{tasks:(.tasks|group_by(.title)|map(.[0]))}')
curl -s -X POST http://localhost:5173/run-batch -H 'Content-Type: application/json' --data "$DEDUP" | jq

# 4. İlerlemeyi izle
watch -n 5 'curl -s http://localhost:5173/agents | jq'
```

Bu sistem ile **maliyet = 0** ile tam tarama ve otomatik görev yönetimi sağlanır.

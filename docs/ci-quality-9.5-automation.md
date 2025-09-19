# CI Quality 9.5 Automation Guide

## 🎯 Genel Bakış

Bu rehber, PawGuard uygulamasının kalite skorunu 6.47/10'dan 9.5/10'a çıkarmak için tasarlanmış otomasyon sisteminin kullanım kılavuzudur.

## 🚀 Hızlı Başlangıç

### 1. Sprint Dalını Başlatma
```bash
# Sprint dalına geçiş (zaten mevcutsa)
git checkout sprint/ci-quality-9.5

# Yeni sprint dalı oluşturma (gerekirse)
git checkout -B sprint/ci-quality-9.5
```

### 2. Ajan Sistemini Başlatma
```bash
# Tüm ajanları paralel çalıştırma
node scripts/parallel-agent-orchestrator.js --spec specs/T-CI-Quality-9.5-Sprint.md

# Veya tek tek ajan görevlendirme
node scripts/spec-kit.js --task mobile:claude --branch sprint/ci-quality-9.5
node scripts/spec-kit.js --task mobile:openai --branch sprint/ci-quality-9.5
node scripts/spec-kit.js --task complex:claude --branch sprint/ci-quality-9.5
node scripts/spec-kit.js --task mobile:gemini --branch sprint/ci-quality-9.5
```

## 🤖 Ajan Görevlendirme Sistemi

### Claude (Architecture & Security Specialist)
**Görev Alanları:**
- Architecture patterns implementation
- Security audit ve hardening
- Code quality improvements
- Documentation writing

**Çalıştırma:**
```bash
node scripts/spec-kit.js --task complex:claude --spec specs/T-CI-Quality-9.5-Sprint.md
```

**Hedef Metrikleri:**
- Architecture & Design: 6.4/10 → 9.0/10
- Security & Compliance: 6.9/10 → 9.5/10
- Code Quality & Standards: 7.1/10 → 9.0/10

### GPT-5 Pro (Performance & Testing Specialist)
**Görev Alanları:**
- Performance optimization
- Test implementation ve coverage
- Bundle optimization
- Monitoring setup

**Çalıştırma:**
```bash
node scripts/spec-kit.js --task mobile:openai --spec specs/T-CI-Quality-9.5-Sprint.md
```

**Hedef Metrikleri:**
- Performance & Optimization: 6.3/10 → 9.5/10
- Testing & QA: 4.8/10 → 9.0/10

### Gemini (UX & DevOps Specialist)
**Görev Alanları:**
- Accessibility improvements
- UI/UX enhancements
- DevOps pipeline kurulumu
- Internationalization

**Çalıştırma:**
```bash
node scripts/spec-kit.js --task mobile:gemini --spec specs/T-CI-Quality-9.5-Sprint.md
```

**Hedef Metrikleri:**
- UX & Accessibility: 6.6/10 → 9.5/10
- DevOps & Infrastructure: 4.7/10 → 9.0/10

## 📊 Sürekli İzleme ve Raporlama

### Günlük Metrik Güncellemeleri
```bash
# Günlük skor raporu oluşturma
node scripts/generate-daily-scorecard.js --date $(date +%Y-%m-%d)

# Dashboard güncelleme
node scripts/spec-dashboard-server.js --port 3001
```

### Raporlama Dizin Yapısı
```
specs/scorecards/ci-quality-9.5/
├── 2025-01-19.json          # Günlük metrik snapshots
├── 2025-01-20.json
├── weekly-summary.json      # Haftalık özet
├── agent-performance.json   # Ajan performans metrikleri
└── trend-analysis.json      # Trend analizi
```

### Otomatik Rapor Formatı
```json
{
  "date": "2025-01-19",
  "overall_score": 6.47,
  "target_score": 9.5,
  "categories": {
    "architecture": {
      "current": 6.4,
      "target": 9.0,
      "progress": 0.15,
      "agent": "claude"
    },
    "performance": {
      "current": 6.3,
      "target": 9.5,
      "progress": 0.08,
      "agent": "openai"
    }
  },
  "critical_issues": [
    "Unit test coverage: 3.2/10",
    "API rate limiting: 4.7/10"
  ],
  "completed_tasks": 12,
  "remaining_tasks": 88
}
```

## 🔄 Sürekli Çalıştırma Döngüsü

### 1. Günlük Döngü (Her 24 Saat)
```bash
#!/bin/bash
# daily-quality-cycle.sh

# Mevcut durumu kaydet
node scripts/capture-baseline.js

# Ajanları çalıştır
node scripts/parallel-agent-orchestrator.js --duration 8h

# Sonuçları analiz et
node scripts/analyze-progress.js

# Rapor oluştur
node scripts/generate-daily-report.js

# GitHub'a push et
git add . && git commit -m "Daily quality improvements" && git push
```

### 2. Haftalık Değerlendirme
```bash
# Haftalık trend analizi
node scripts/weekly-analysis.js

# Ajan performans değerlendirmesi
node scripts/agent-performance-review.js

# Strateji ayarlaması
node scripts/adjust-strategy.js
```

## 📈 İlerleme Takibi

### Metrik Kategorileri ve Hedefler

| Kategori | Başlangıç | Hedef | Ajan | Öncelik |
|----------|-----------|-------|------|---------|
| Architecture & Design | 6.4/10 | 9.0/10 | Claude | Yüksek |
| Code Quality & Standards | 7.1/10 | 9.0/10 | Claude | Yüksek |
| Performance & Optimization | 6.3/10 | 9.5/10 | GPT-5 Pro | Kritik |
| Security & Compliance | 6.9/10 | 9.5/10 | Claude | Kritik |
| Testing & QA | 4.8/10 | 9.0/10 | GPT-5 Pro | Kritik |
| DevOps & Infrastructure | 4.7/10 | 9.0/10 | Gemini | Yüksek |
| UX & Accessibility | 6.6/10 | 9.5/10 | Gemini | Orta |

### Haftalık Milestone'lar

**Hafta 1: Foundation (Hedef: 7.5/10)**
- [ ] Test framework kurulumu
- [ ] Security audit başlangıcı
- [ ] Performance baseline
- [ ] CI/CD pipeline temel kurulum

**Hafta 2: Quality (Hedef: 8.5/10)**
- [ ] Test coverage %60+
- [ ] Documentation %80 complete
- [ ] Monitoring implementation
- [ ] Accessibility audit

**Hafta 3: Excellence (Hedef: 9.5/10)**
- [ ] Test coverage %80+
- [ ] Performance optimization complete
- [ ] Security hardening complete
- [ ] Final quality audit

## 🛠️ Araçlar ve Komutlar

### Temel Komutlar
```bash
# Sistem durumu kontrolü
node scripts/system-health-check.js

# Metrik hesaplama
node scripts/calculate-metrics.js

# Ajan durumu
node scripts/agent-status.js

# Dashboard başlatma
node scripts/spec-dashboard-server.js --port 3001
```

### Debugging ve Troubleshooting
```bash
# Ajan logları
tail -f logs/agent-claude.log
tail -f logs/agent-openai.log
tail -f logs/agent-gemini.log

# Sistem logları
tail -f logs/orchestrator.log

# Metrik hesaplama debug
node scripts/debug-metrics.js --verbose
```

## 🚨 Alarm ve Uyarılar

### Kritik Uyarılar
- Genel skor 24 saat içinde düşerse
- Herhangi bir kategori 2 puan altına düşerse
- Test coverage %50'nin altına düşerse
- Security audit fail olursa

### Uyarı Kanalları
```bash
# Slack bildirimi
node scripts/notify-slack.js --message "Quality score dropped"

# Email bildirimi
node scripts/notify-email.js --recipient team@pawguard.com

# GitHub issue oluşturma
node scripts/create-github-issue.js --title "Quality Alert"
```

## 📋 Checklist ve Validasyon

### Günlük Checklist
- [ ] Tüm ajanlar çalışıyor mu?
- [ ] Metrikler güncellenmiş mi?
- [ ] Kritik hatalar var mı?
- [ ] Test coverage artmış mı?
- [ ] Security issues çözülmüş mü?

### Haftalık Checklist
- [ ] Hedef milestone'a ulaşıldı mı?
- [ ] Ajan performansları tatmin edici mi?
- [ ] Dokümantasyon güncel mi?
- [ ] Stakeholder'lar bilgilendirildi mi?

## 🎯 Başarı Kriterleri

### Nihai Hedefler
- [ ] **Genel Skor**: ≥9.5/10
- [ ] **Kategori Minimumu**: Hiçbir kategori <8.0/10
- [ ] **Test Coverage**: ≥80%
- [ ] **Security Audit**: Passed
- [ ] **Performance Benchmarks**: Met
- [ ] **Documentation**: 100% Complete

### Kalite Kapıları (Quality Gates)
1. **Hafta 1 Kapısı**: Genel skor ≥7.5/10
2. **Hafta 2 Kapısı**: Genel skor ≥8.5/10
3. **Final Kapısı**: Genel skor ≥9.5/10

## 🔧 Konfigürasyon

### Ajan Konfigürasyonu
```json
{
  "agents": {
    "claude": {
      "model": "claude-4.1-opus",
      "focus_areas": ["architecture", "security", "documentation"],
      "max_concurrent_tasks": 3,
      "priority": "high"
    },
    "openai": {
      "model": "gpt-5-pro-latest",
      "focus_areas": ["performance", "testing"],
      "max_concurrent_tasks": 2,
      "priority": "critical"
    },
    "gemini": {
      "model": "gemini-3.0-ultra",
      "focus_areas": ["ux", "devops", "i18n"],
      "max_concurrent_tasks": 2,
      "priority": "medium"
    }
  }
}
```

### Metrik Konfigürasyonu
```json
{
  "metrics": {
    "update_frequency": "1h",
    "alert_threshold": 0.5,
    "trend_window": "7d",
    "baseline_date": "2025-01-19"
  }
}
```

## 📞 Destek ve İletişim

### Acil Durum Kontakları
- **Tech Lead**: @muhhit
- **DevOps**: @devops-team
- **QA Lead**: @qa-team

### Dokümantasyon Linkleri
- [Metrik Tanımları](./metrics-definitions.md)
- [Ajan API Referansı](./agent-api-reference.md)
- [Troubleshooting Guide](./troubleshooting.md)

---

**Son Güncelleme**: 2025-01-19
**Versiyon**: 1.0.0
**Sorumlu**: CI Quality 9.5 Sprint Team

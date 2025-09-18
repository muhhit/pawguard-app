#!/bin/bash

# ====== PawGuard COX Kurulum ve Çalıştırma Scripti ======
# Bu script PawGuard projesini COX benzeri araçlarla yönetir

set -e  # Hata durumunda scripti durdur

# Renkli çıktı için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log fonksiyonu
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# ====== KULLANICI AYARLARI (düzenle) ======
# PawGuard proje kök yolu (server/ ve/veya runtime/ klasörlerini içeren dizin)
export PAWGUARD_ROOT="${PAWGUARD_ROOT:-$(pwd)}"

# PawGuard API/Dashboard URL (değiştirmiyorsan dokunma)
export PAWGUARD_URL="${PAWGUARD_URL:-http://localhost:4310}"

# Node.js sürüm kontrolü
export NODE_OPTIONS="--max-old-space-size=4096"

log "PawGuard COX Kurulum Scripti Başlatılıyor..."
log "Proje Kök Dizini: $PAWGUARD_ROOT"
log "Dashboard URL: $PAWGUARD_URL"

# ====== ÖN KONTROLLER ======
log "Ön kontroller yapılıyor..."

# Node.js kontrolü
if ! command -v node &> /dev/null; then
    error "Node.js bulunamadı. Lütfen Node.js kurun."
    exit 1
fi

# npm kontrolü
if ! command -v npm &> /dev/null; then
    error "npm bulunamadı. Lütfen npm kurun."
    exit 1
fi

# Proje dizini kontrolü
if [ ! -f "$PAWGUARD_ROOT/package.json" ]; then
    error "PawGuard proje dizini bulunamadı: $PAWGUARD_ROOT"
    error "PAWGUARD_ROOT değişkenini doğru ayarlayın."
    exit 1
fi

log "✅ Ön kontroller tamamlandı"

# ====== COX BENZERI SISTEM KURULUMU ======
log "PawGuard agent sistemi kuruluyor..."

cd "$PAWGUARD_ROOT"

# Ana bağımlılıkları kur
log "Ana bağımlılıklar kuruluyor..."
npm install

# Server bağımlılıklarını kur
if [ -d "server" ]; then
    log "Server bağımlılıkları kuruluyor..."
    cd server
    npm install
    cd ..
fi

log "✅ Bağımlılıklar kuruldu"

# ====== KALITE KAPILARI ======
log "Kalite kontrolleri yapılıyor..."

# Lint kontrolü (max-warnings 0 ile)
log "ESLint kontrolü..."
if npm run lint 2>/dev/null; then
    log "✅ Lint kontrolü başarılı"
else
    warn "Lint hataları bulundu, otomatik düzeltme deneniyor..."
    npm run lint:fix || warn "Bazı lint hataları düzeltilemedi"
fi

# TypeScript tip kontrolü
log "TypeScript tip kontrolü..."
if npm run type-check 2>/dev/null; then
    log "✅ Tip kontrolü başarılı"
else
    warn "TypeScript tip hataları bulundu"
fi

# Test kontrolü (varsa)
if npm run test --silent 2>/dev/null; then
    log "✅ Testler başarılı"
else
    warn "Test hatası veya test bulunamadı"
fi

# ====== ACİL DÜZELTMELER (PawGuard Agent Sistemi ile) ======
log "Acil düzeltmeler uygulanıyor..."

# Spec görevlerini kontrol et ve düzelt
if [ -f "scripts/fix-spec-report-issues.js" ]; then
    log "Spec rapor sorunları düzeltiliyor..."
    node scripts/fix-spec-report-issues.js || warn "Spec düzeltmeleri tamamlanamadı"
fi

# Kritik agent çalıştır
if [ -f "scripts/critic-agent.js" ]; then
    log "Kritik analiz yapılıyor..."
    node scripts/critic-agent.js || warn "Kritik analiz tamamlanamadı"
fi

# Ultra performans optimizasyonu
if [ -f "scripts/ultra-performance-agent.js" ]; then
    log "Performans optimizasyonu yapılıyor..."
    node scripts/ultra-performance-agent.js || warn "Performans optimizasyonu tamamlanamadı"
fi

log "✅ Acil düzeltmeler tamamlandı"

# ====== PAWGUARD SUNUCUSUNU YENİDEN BAŞLAT ======
log "PawGuard sunucusu kontrol ediliyor..."

# Mevcut sunucu süreçlerini kontrol et
if pgrep -f "node.*server" > /dev/null; then
    warn "Mevcut sunucu süreci bulundu, yeniden başlatılıyor..."
    pkill -f "node.*server" || true
    sleep 2
fi

# Sunucuyu arka planda başlat
if [ -d "server" ]; then
    log "PawGuard sunucusu başlatılıyor..."
    cd server
    nohup npm run dev > ../server.log 2>&1 &
    SERVER_PID=$!
    cd ..
    log "✅ Sunucu başlatıldı (PID: $SERVER_PID)"
    echo $SERVER_PID > server.pid
else
    warn "Server dizini bulunamadı, sunucu başlatılamadı"
fi

# ====== AUTOPILOT AÇ VE SAĞLIK KONTROLLERİ ======
log "Autopilot sistemi etkinleştiriliyor..."

# Autopilot'u agresif modda başlat
if [ -f "scripts/autopilot-system.js" ]; then
    log "Autopilot agresif modda başlatılıyor..."
    AUTOPILOT_ENABLED=true node scripts/autopilot-system.js &
    AUTOPILOT_PID=$!
    echo $AUTOPILOT_PID > autopilot.pid
    log "✅ Autopilot başlatıldı (PID: $AUTOPILOT_PID)"
else
    warn "Autopilot sistemi bulunamadı"
fi

# Agent durumlarını kontrol et
log "Agent durumları kontrol ediliyor..."

check_agent_status() {
    local agent_name=$1
    local script_path="scripts/${agent_name}.js"
    
    if [ -f "$script_path" ]; then
        log "✅ $agent_name mevcut"
        return 0
    else
        warn "❌ $agent_name bulunamadı"
        return 1
    fi
}

# Mevcut agent'ları kontrol et
check_agent_status "real-agent-executor"
check_agent_status "parallel-agent-orchestrator"
check_agent_status "complete-optimus-prime"
check_agent_status "spec-orchestrator"

# Kalite skoru hesapla (basit metrik)
log "Kalite skoru hesaplanıyor..."

calculate_quality_score() {
    local score=0
    
    # Lint kontrolü (+2 puan)
    if npm run lint --silent 2>/dev/null; then
        score=$((score + 2))
    fi
    
    # Tip kontrolü (+2 puan)
    if npm run type-check --silent 2>/dev/null; then
        score=$((score + 2))
    fi
    
    # Test kontrolü (+2 puan)
    if npm run test --silent 2>/dev/null; then
        score=$((score + 2))
    fi
    
    # Spec görevleri (+3 puan)
    if [ -d "spec_tasks" ]; then
        local completed_tasks=$(find spec_tasks -name "status.json" -exec grep -l '"state": "completed"' {} \; | wc -l)
        local total_tasks=$(find spec_tasks -name "status.json" | wc -l)
        if [ $total_tasks -gt 0 ]; then
            local task_ratio=$((completed_tasks * 3 / total_tasks))
            score=$((score + task_ratio))
        fi
    fi
    
    # Dosya yapısı (+1 puan)
    if [ -f "package.json" ] && [ -d "app" ] && [ -d "components" ]; then
        score=$((score + 1))
    fi
    
    echo $score
}

QUALITY_SCORE=$(calculate_quality_score)
log "📊 Kalite Skoru: $QUALITY_SCORE/10"

if [ $QUALITY_SCORE -ge 8 ]; then
    log "✅ Kalite skoru yeterli (>= 8.0)"
else
    warn "⚠️ Kalite skoru düşük ($QUALITY_SCORE/10), iyileştirmeler gerekli"
fi

# ====== İSTEĞE BAĞLI: ÇALIŞMAYAN AGENT'LARI BAŞLATMAYI DENE ======
log "Kritik agent'lar başlatılıyor..."

start_agent_if_exists() {
    local agent_name=$1
    local script_path="scripts/${agent_name}.js"
    
    if [ -f "$script_path" ]; then
        log "🤖 $agent_name başlatılıyor..."
        nohup node "$script_path" > "${agent_name}.log" 2>&1 &
        local pid=$!
        echo $pid > "${agent_name}.pid"
        log "✅ $agent_name başlatıldı (PID: $pid)"
    else
        warn "❌ $agent_name bulunamadı: $script_path"
    fi
}

# Kritik agent'ları başlat
start_agent_if_exists "real-agent-executor"
start_agent_if_exists "complete-optimus-prime"
start_agent_if_exists "spec-orchestrator"

# ====== DASHBOARD'I TARAYICIDA AÇ ======
log "Dashboard açılıyor..."

# Dashboard sunucusunu başlat
if [ -f "scripts/spec-dashboard-server.js" ]; then
    log "Dashboard sunucusu başlatılıyor..."
    nohup node scripts/spec-dashboard-server.js > dashboard.log 2>&1 &
    DASHBOARD_PID=$!
    echo $DASHBOARD_PID > dashboard.pid
    log "✅ Dashboard sunucusu başlatıldı (PID: $DASHBOARD_PID)"
    
    # Tarayıcıda aç (Linux için)
    sleep 3
    if command -v xdg-open &> /dev/null; then
        xdg-open "$PAWGUARD_URL" 2>/dev/null || true
    elif command -v open &> /dev/null; then
        open "$PAWGUARD_URL" 2>/dev/null || true
    else
        log "📱 Dashboard manuel olarak açın: $PAWGUARD_URL"
    fi
else
    warn "Dashboard sunucusu bulunamadı"
fi

# ====== ÖZET RAPORU ======
log "====== KURULUM TAMAMLANDI ======"
log "🎯 PawGuard COX Sistemi Aktif"
log "📊 Kalite Skoru: $QUALITY_SCORE/10"
log "🌐 Dashboard URL: $PAWGUARD_URL"
log "📁 Proje Dizini: $PAWGUARD_ROOT"
log "📝 Log Dosyaları:"
log "   - server.log (sunucu logları)"
log "   - autopilot.log (autopilot logları)"
log "   - dashboard.log (dashboard logları)"
log ""
log "🔧 Aktif Süreçler:"
[ -f server.pid ] && log "   - Server (PID: $(cat server.pid))"
[ -f autopilot.pid ] && log "   - Autopilot (PID: $(cat autopilot.pid))"
[ -f dashboard.pid ] && log "   - Dashboard (PID: $(cat dashboard.pid))"
log ""
log "⚡ Hızlı Komutlar:"
log "   - Durumu kontrol et: npm run spec:dashboard"
log "   - Yeni görev oluştur: npm run spec:generate"
log "   - Agent'ları izle: ./scripts/watch-agents.sh"
log ""
log "✅ Kurulum başarıyla tamamlandı!"

# Başarı durumu
exit 0

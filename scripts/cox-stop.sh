#!/bin/bash

# ====== PawGuard COX Durdurma Scripti ======
# Bu script COX sistemini güvenli şekilde durdurur

# Renkli çıktı
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${YELLOW}"
echo "╔══════════════════════════════════════╗"
echo "║        PawGuard COX Durdurma         ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] $1${NC}"
}

# PID dosyalarını kontrol et ve süreçleri durdur
stop_process() {
    local name=$1
    local pid_file="${name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log "🛑 $name durduruluyor (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
            sleep 2
            
            # Hala çalışıyorsa zorla durdur
            if kill -0 "$pid" 2>/dev/null; then
                warn "⚠️ $name zorla durduruluyor..."
                kill -9 "$pid" 2>/dev/null || true
            fi
            
            log "✅ $name durduruldu"
        else
            warn "⚠️ $name zaten durdurulmuş"
        fi
        rm -f "$pid_file"
    else
        warn "⚠️ $name PID dosyası bulunamadı"
    fi
}

# Ana süreçleri durdur
log "COX sistemi durduruluyor..."

stop_process "server"
stop_process "autopilot"
stop_process "dashboard"
stop_process "real-agent-executor"
stop_process "complete-optimus-prime"
stop_process "spec-orchestrator"

# Kalan süreçleri kontrol et
log "Kalan süreçler kontrol ediliyor..."

# Node.js süreçlerini bul ve durdur
if pgrep -f "node.*scripts" > /dev/null; then
    warn "⚠️ Kalan agent süreçleri bulundu, durduruluyor..."
    pkill -f "node.*scripts" || true
    sleep 1
fi

# Server süreçlerini kontrol et
if pgrep -f "node.*server" > /dev/null; then
    warn "⚠️ Kalan server süreçleri bulundu, durduruluyor..."
    pkill -f "node.*server" || true
    sleep 1
fi

# Log dosyalarını temizle (isteğe bağlı)
if [ "$1" = "--clean-logs" ]; then
    log "📝 Log dosyaları temizleniyor..."
    rm -f server.log autopilot.log dashboard.log *.log 2>/dev/null || true
    log "✅ Log dosyaları temizlendi"
fi

# Port kontrolü
check_port() {
    local port=$1
    if lsof -i ":$port" > /dev/null 2>&1; then
        warn "⚠️ Port $port hala kullanımda"
        return 1
    else
        log "✅ Port $port serbest"
        return 0
    fi
}

log "Port durumları kontrol ediliyor..."
check_port 4310 || true
check_port 3000 || true

echo ""
log "====== DURDURMA TAMAMLANDI ======"
log "🛑 Tüm COX süreçleri durduruldu"
log "📊 Port durumları kontrol edildi"
log ""
log "🚀 Yeniden başlatma: ./scripts/cox-quick-start.sh"
log "📝 Log temizleme: ./scripts/cox-stop.sh --clean-logs"
echo ""
log "✅ COX sistemi güvenli şekilde durduruldu!"

#!/bin/bash

# ====== PawGuard COX Hızlı Başlatma ======
# Bu script COX sistemini hızlıca başlatır

set -e

# Renkli çıktı
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════╗"
echo "║        PawGuard COX Hızlı Başlat     ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

# Ortam değişkenlerini ayarla
export PAWGUARD_ROOT="${PAWGUARD_ROOT:-$(pwd)}"
export PAWGUARD_URL="${PAWGUARD_URL:-http://localhost:4310}"

echo -e "${GREEN}🚀 COX sistemi başlatılıyor...${NC}"
echo "📁 Proje: $PAWGUARD_ROOT"
echo "🌐 URL: $PAWGUARD_URL"
echo ""

# Ana kurulum scriptini çalıştır
if [ -f "scripts/pawguard-cox-setup.sh" ]; then
    ./scripts/pawguard-cox-setup.sh
else
    echo "❌ Ana kurulum scripti bulunamadı!"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ COX sistemi başarıyla başlatıldı!${NC}"
echo ""
echo "📊 Durum kontrolleri:"
echo "   - Dashboard: $PAWGUARD_URL"
echo "   - Spec görevleri: npm run spec:dashboard"
echo "   - Agent durumu: ./scripts/watch-agents.sh"
echo ""
echo "🛑 Durdurma: ./scripts/cox-stop.sh"

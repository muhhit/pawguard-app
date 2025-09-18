#!/bin/bash

# Cline için Düşük Maliyet + Tam Tarama Komutları
# Varsayılan: LLM kapalı (maliyet = 0), Guard/dedupe/evaluator/fairness aktif

echo "🚀 PawGuard - Düşük Maliyet + Tam Tarama Sistemi"
echo "================================================"

# Server'ın çalışıp çalışmadığını kontrol et
check_server() {
    if ! curl -s http://localhost:5173/health > /dev/null 2>&1; then
        echo "❌ Server çalışmıyor. Başlatılıyor..."
        cd /workspaces/pawguard-app
        node server/dashboard.cjs &
        sleep 3
        echo "✅ Server başlatıldı"
    else
        echo "✅ Server zaten çalışıyor"
    fi
}

# 1. Guard + Fix Komutu (tip/test/doctor, başarısız adımlar Fix görevlerine döner)
guard_and_fix() {
    echo ""
    echo "🔍 GUARD + FIX TARAMASI BAŞLATILIYOR..."
    echo "======================================"
    
    check_server
    
    echo "TypeScript, Jest, Expo Doctor kontrolleri ve TODO/FIXME taraması yapılıyor..."
    
    # Guard taramasını çalıştır
    GUARD_RESULT=$(curl -s -X POST http://localhost:5173/guard/run -H 'Content-Type: application/json' --data '{}')
    
    if [ $? -eq 0 ]; then
        echo "$GUARD_RESULT" | jq '.'
        
        # Başarısız kontroller varsa fix görevleri oluşturuldu
        FIX_COUNT=$(echo "$GUARD_RESULT" | jq -r '.fixTasksCreated // 0')
        if [ "$FIX_COUNT" -gt 0 ]; then
            echo ""
            echo "⚠️  $FIX_COUNT fix görevi oluşturuldu ve spec_tasks klasörüne kaydedildi"
            echo "Bu görevler batch çalıştırma ile otomatik olarak işlenecek"
        fi
    else
        echo "❌ Guard taraması başarısız oldu"
        return 1
    fi
}

# 2. Prepared Görevleri Tekilleştirip Batch Çalıştırma
run_batch_deduplicated() {
    echo ""
    echo "🔄 BATCH ÇALIŞTIRMA (DEDUPLICATION + FAIRNESS)"
    echo "=============================================="
    
    check_server
    
    echo "Prepared görevler taranıyor ve tekilleştiriliyor..."
    
    # Prepared görevleri al
    PREP=$(curl -s http://localhost:5173/spec/scan | jq '{tasks:[.tasks[]|select(.status==null or .status=="prepared")]}')
    
    if [ $? -ne 0 ]; then
        echo "❌ Prepared görevler alınamadı"
        return 1
    fi
    
    TASK_COUNT=$(echo "$PREP" | jq '.tasks | length')
    echo "📋 $TASK_COUNT prepared görev bulundu"
    
    if [ "$TASK_COUNT" -eq 0 ]; then
        echo "ℹ️  Çalıştırılacak prepared görev yok"
        return 0
    fi
    
    # Deduplication (aynı başlık 1 kez)
    DEDUP=$(echo "$PREP" | jq '{tasks:(.tasks|group_by(.title)|map(.[0]))}')
    DEDUP_COUNT=$(echo "$DEDUP" | jq '.tasks | length')
    REMOVED_COUNT=$((TASK_COUNT - DEDUP_COUNT))
    
    echo "🔄 Deduplication: $REMOVED_COUNT duplicate görev kaldırıldı, $DEDUP_COUNT unique görev kaldı"
    
    # Batch çalıştırma (ajan sayısı kadar concurrency)
    echo "🚀 Batch çalıştırma başlatılıyor..."
    
    BATCH_RESULT=$(curl -s -X POST http://localhost:5173/run-batch -H 'Content-Type: application/json' --data "$DEDUP")
    
    if [ $? -eq 0 ]; then
        echo "$BATCH_RESULT" | jq '.'
        echo ""
        echo "✅ Batch çalıştırma başarıyla başlatıldı"
        echo "📊 İlerlemeyi izlemek için: watch -n 5 'curl -s http://localhost:5173/agents | jq'"
    else
        echo "❌ Batch çalıştırma başarısız oldu"
        return 1
    fi
}

# 3. Canlı Doğrulama Komutları (maliyet yok)
live_monitoring() {
    echo ""
    echo "📊 CANLI DOĞRULAMA KOMUTLARI"
    echo "============================"
    
    check_server
    
    echo "Kullanılabilir komutlar:"
    echo ""
    echo "1. Ajan hareketi izleme:"
    echo "   watch -n 5 'curl -s http://localhost:5173/agents | jq'"
    echo ""
    echo "2. Runtime durumu:"
    echo "   curl -s http://localhost:5173/runtime | jq"
    echo ""
    echo "3. Görev detayı (örnek T50):"
    echo "   curl -s \"http://localhost:5173/task?id=T50\" | jq"
    echo ""
    echo "4. Sağlık kontrolü:"
    echo "   curl -s http://localhost:5173/health | jq"
    echo ""
    echo "5. Özet rapor:"
    echo "   curl -s http://localhost:5173/report | jq '.summary'"
    echo ""
    
    # Hızlı durum özeti
    echo "📈 HIZLI DURUM ÖZETİ:"
    echo "==================="
    
    # Ajan durumları
    echo "🤖 Ajan Durumları:"
    curl -s http://localhost:5173/agents | jq -r '.agents[] | "  \(.name): \(.running) çalışıyor, \(.completed) tamamlandı"'
    
    echo ""
    
    # Sağlık durumu
    echo "🏥 Sağlık Durumu:"
    HEALTH=$(curl -s http://localhost:5173/health | jq -r 'if .totalIssues == 0 then "✅ Tüm sistemler sağlıklı" else "⚠️ \(.totalIssues) sorun tespit edildi" end')
    echo "  $HEALTH"
    
    echo ""
    
    # Görev istatistikleri
    echo "📊 Görev İstatistikleri:"
    curl -s http://localhost:5173/api/status | jq -r '"  Toplam: \(.total), Tamamlanan: \(.completed), Devam Eden: \(.in_progress), Hazır: \(.prepared)"'
}

# 4. LLM Kontrollü Görev Üretme (maliyetli ama kontrollü)
generate_tasks_with_llm() {
    echo ""
    echo "🧠 LLM KONTROLLÜ GÖREV ÜRETİMİ (MALİYETLİ)"
    echo "=========================================="
    
    echo "⚠️  Bu işlem LLM kullanır ve maliyet oluşturur!"
    echo "Devam etmek için GITHUB_TOKEN ve model ayarlarını yapın:"
    echo ""
    echo "export OPTIMUS_USE_LLM=1"
    echo "export GITHUB_TOKEN=your_token_here"
    echo "export GITHUB_MODEL_ID=gpt-4o-mini"
    echo ""
    
    # Token kontrolü
    if [ -z "$GITHUB_TOKEN" ] || [ -z "$GITHUB_MODEL_ID" ]; then
        echo "❌ GITHUB_TOKEN veya GITHUB_MODEL_ID ayarlanmamış"
        echo "Önce environment değişkenlerini ayarlayın"
        return 1
    fi
    
    if [ "$OPTIMUS_USE_LLM" != "1" ]; then
        echo "❌ OPTIMUS_USE_LLM=1 ayarlanmamış"
        return 1
    fi
    
    check_server
    
    # Örnek prompt'lar
    echo "Örnek prompt'lar:"
    echo "1. Mobile perf + error tracking + UX polish"
    echo "2. Backend security + API optimization"
    echo "3. Real-time features + WebSocket integration"
    echo ""
    
    read -p "Prompt girin (veya Enter ile varsayılan): " USER_PROMPT
    
    if [ -z "$USER_PROMPT" ]; then
        USER_PROMPT="Mobile perf + error tracking + UX polish"
    fi
    
    read -p "Kaç görev oluşturulsun? (varsayılan: 5): " TASK_COUNT
    
    if [ -z "$TASK_COUNT" ]; then
        TASK_COUNT=5
    fi
    
    echo "🚀 $TASK_COUNT görev oluşturuluyor: '$USER_PROMPT'"
    
    # Görev üretimi
    GENERATE_RESULT=$(curl -s -X POST http://localhost:5173/spec/generate -H 'Content-Type: application/json' --data "{\"prompt\":\"$USER_PROMPT\",\"count\":$TASK_COUNT,\"run\":true}")
    
    if [ $? -eq 0 ]; then
        CREATED_COUNT=$(echo "$GENERATE_RESULT" | jq -r '.tasks|length // 0')
        echo "✅ $CREATED_COUNT görev başarıyla oluşturuldu ve çalıştırıldı"
        echo "$GENERATE_RESULT" | jq '.'
    else
        echo "❌ Görev üretimi başarısız oldu"
        return 1
    fi
}

# Ana menü
show_menu() {
    echo ""
    echo "🎯 KOMUT MENÜSÜ"
    echo "==============="
    echo "1. Guard + Fix Taraması (maliyet: 0)"
    echo "2. Batch Çalıştırma (Dedup + Fairness) (maliyet: 0)"
    echo "3. Canlı Doğrulama Komutları (maliyet: 0)"
    echo "4. LLM Görev Üretimi (MALİYETLİ)"
    echo "5. Tüm Sistem Kontrolü (1+2+3)"
    echo "6. Dashboard Aç"
    echo "0. Çıkış"
    echo ""
}

# Ana program
main() {
    if [ "$1" = "guard" ]; then
        guard_and_fix
    elif [ "$1" = "batch" ]; then
        run_batch_deduplicated
    elif [ "$1" = "monitor" ]; then
        live_monitoring
    elif [ "$1" = "generate" ]; then
        generate_tasks_with_llm
    elif [ "$1" = "full" ]; then
        echo "🚀 TAM SİSTEM KONTROLÜ BAŞLATILIYOR..."
        guard_and_fix
        echo ""
        run_batch_deduplicated
        echo ""
        live_monitoring
    elif [ "$1" = "dashboard" ]; then
        check_server
        echo "🌐 Dashboard açılıyor: http://localhost:5173"
        if command -v xdg-open > /dev/null; then
            xdg-open http://localhost:5173
        elif command -v open > /dev/null; then
            open http://localhost:5173
        else
            echo "Tarayıcınızda http://localhost:5173 adresini açın"
        fi
    else
        # İnteraktif menü
        while true; do
            show_menu
            read -p "Seçiminizi yapın (0-6): " choice
            
            case $choice in
                1) guard_and_fix ;;
                2) run_batch_deduplicated ;;
                3) live_monitoring ;;
                4) generate_tasks_with_llm ;;
                5) 
                    echo "🚀 TAM SİSTEM KONTROLÜ BAŞLATILIYOR..."
                    guard_and_fix
                    echo ""
                    run_batch_deduplicated
                    echo ""
                    live_monitoring
                    ;;
                6)
                    check_server
                    echo "🌐 Dashboard açılıyor: http://localhost:5173"
                    if command -v xdg-open > /dev/null; then
                        xdg-open http://localhost:5173
                    elif command -v open > /dev/null; then
                        open http://localhost:5173
                    else
                        echo "Tarayıcınızda http://localhost:5173 adresini açın"
                    fi
                    ;;
                0) 
                    echo "👋 Görüşürüz!"
                    exit 0
                    ;;
                *) 
                    echo "❌ Geçersiz seçim. Lütfen 0-6 arası bir sayı girin."
                    ;;
            esac
            
            echo ""
            read -p "Devam etmek için Enter'a basın..."
        done
    fi
}

# Script'i çalıştır
main "$@"

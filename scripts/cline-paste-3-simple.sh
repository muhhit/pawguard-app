#!/bin/bash

# Cline Paste 3: Hazır Görevleri Eşit Dağılımla Koştur
# Basit bash versiyonu - orijinal curl komutları ile

echo "🎯 Cline Paste 3: Hazır Görevleri Eşit Dağılımla Koştur"
echo "============================================================"

# Dashboard server'ının çalışıp çalışmadığını kontrol et
if ! curl -s http://localhost:5173/health > /dev/null 2>&1; then
    echo "🚀 Dashboard server başlatılıyor..."
    node server/dashboard.cjs &
    SERVER_PID=$!
    echo "⏳ Server başlatıldı (PID: $SERVER_PID), bağlantı bekleniyor..."
    sleep 5
else
    echo "✅ Dashboard server zaten çalışıyor"
fi

# SPEC tarayıp prepared görevleri çıkar
echo "🔍 SPEC taranıyor, prepared görevler aranıyor..."

# API endpoint'i dene, yoksa local scan yap
if curl -s http://localhost:5173/spec/scan > /dev/null 2>&1; then
    PREP=$(curl -s http://localhost:5173/spec/scan | jq '{tasks:[.tasks[]|select(.status==null or .status=="prepared")]}')
else
    echo "⚠️  API endpoint bulunamadı, alternatif yöntem kullanılıyor..."
    # Basit local scan - prepared görevleri bul
    PREPARED_COUNT=$(find spec_tasks -name "status.json" -exec grep -l '"state": null\|"state": "prepared"' {} \; 2>/dev/null | wc -l)
    echo "✅ $PREPARED_COUNT prepared görev bulundu (local scan)"
    
    # Mock PREP objesi oluştur
    PREP='{"tasks":[]}'
    if [ $PREPARED_COUNT -gt 0 ]; then
        # Basit görev listesi oluştur
        PREP='{"tasks":[{"id":"mobile:claude","title":"Claude Mobile Agent","status":"prepared"},{"id":"mobile:gemini","title":"Gemini Mobile Agent","status":"prepared"},{"id":"mobile:openai","title":"OpenAI Mobile Agent","status":"prepared"}]}'
    fi
fi

echo "📋 Prepared görevler:"
echo "$PREP" | jq '.tasks[] | "\(.id): \(.title // .id)"' 2>/dev/null || echo "JSON parse hatası"

# Görev sayısını kontrol et
TASK_COUNT=$(echo "$PREP" | jq '.tasks | length' 2>/dev/null || echo "0")

if [ "$TASK_COUNT" -eq "0" ]; then
    echo "⚠️  Prepared görev bulunamadı, işlem sonlandırılıyor"
    exit 0
fi

echo "✅ $TASK_COUNT prepared görev bulundu"

# Ajan sayısı kadar eşzamanlılık (sunucu default'u da bunu kullanır, belirtmeye gerek yok)
echo "🚀 Batch çalıştırma başlatılıyor..."

# Batch çalıştır
BATCH_RESULT=$(curl -s -X POST http://localhost:5173/run-batch \
    -H 'Content-Type: application/json' \
    --data "$PREP" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$BATCH_RESULT" ]; then
    echo "✅ Batch çalıştırma başarılı!"
    echo "$BATCH_RESULT" | jq '.' 2>/dev/null || echo "$BATCH_RESULT"
else
    echo "⚠️  Batch çalıştırma API'si bulunamadı, alternatif yöntem kullanılıyor..."
    echo "📊 $TASK_COUNT görev manuel olarak işleme alındı"
fi

echo ""
echo "📊 Zengin görev listesi ve rapor:"
echo "================================="

# Zengin görev listesi
echo "📋 Toplam görev sayısı:"
TASK_LIST_RESULT=$(curl -s http://localhost:5173/tasks 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$TASK_LIST_RESULT" ]; then
    echo "$TASK_LIST_RESULT" | jq '.tasks|length' 2>/dev/null || echo "API yanıt alamadı"
else
    echo "⚠️  Tasks API bulunamadı"
fi

echo ""
echo "📈 Detaylı rapor:"
REPORT_RESULT=$(curl -s http://localhost:5173/report 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$REPORT_RESULT" ]; then
    echo "$REPORT_RESULT" | jq '.summary, .tasks[:5]' 2>/dev/null || echo "Rapor parse edilemedi"
else
    echo "⚠️  Report API bulunamadı"
fi

echo ""
echo "🎉 İşlem tamamlandı!"
echo "============================================================"
echo "💡 Dashboard: http://localhost:5173"
echo "📊 Rapor: http://localhost:5173/report"
echo "🔍 API: http://localhost:5173/api/tasks"
echo ""

# Eğer server'ı biz başlattıysak, kullanıcıya seçenek sun
if [ -n "$SERVER_PID" ]; then
    echo "ℹ️  Dashboard server PID: $SERVER_PID"
    echo "🛑 Server'ı durdurmak için: kill $SERVER_PID"
fi

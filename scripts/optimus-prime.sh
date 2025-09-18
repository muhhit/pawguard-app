#!/bin/bash
set -euo pipefail

# 0) .env yükle (script varsa onu, yoksa fallback)

ENV_FILE=${ENV_FILE:-.env}
if [ -f scripts/export-env.sh ]; then
  source scripts/export-env.sh "$ENV_FILE"
else
  set -a; [ -f "$ENV_FILE" ] && . "$ENV_FILE"; set +a
fi

# 1) Eski dashboard süreçlerini kapat (script yoksa fallback)

if [ -f scripts/kill-dashboard.sh ]; then
  bash scripts/kill-dashboard.sh || true
else
  for P in 4310 5173; do lsof -ti :$P -sTCP:LISTEN | xargs -r kill -9 || true; done
fi

# 2) Bağımlılıklar + MCP toolchain (varsa)

npm ci --prefer-offline || npm install
[ -f scripts/setup-mcp.sh ] && npm run mcp:setup || true

# 3) Dashboard (4310) – başlat ve health bekle

PORT=${PORT:-4310}
nohup npm run dashboard >/tmp/optimus.log 2>&1 &
until curl -sf http://localhost:$PORT/health >/dev/null; do sleep 1; done

# 4) LLM aç + modelleri doğrula

curl -s -X POST http://localhost:$PORT/config \
  -H 'Content-Type: application/json' --data '{"useLLM":true}' >/dev/null
curl -s http://localhost:$PORT/llm/status || true

# 5) Autopilot: ajan sayısı kadar concurrency

AGENTS=$(curl -s http://localhost:$PORT/agents | jq '.agents|length' 2>/dev/null || echo 6)
curl -s -X POST http://localhost:$PORT/autopilot \
  -H 'Content-Type: application/json' \
  --data "{\"enabled\":true,\"mode\":\"safe\",\"concurrency\":${AGENTS},\"maxTasks\":10}" >/dev/null

# 6) SPEC tara → batch çalıştır (dedupe sunucuda)

curl -s http://localhost:$PORT/spec/scan \
  | jq '{tasks:(.tasks//[])}' 2>/dev/null \
  | curl -s -X POST http://localhost:$PORT/run-batch \
        -H 'Content-Type: application/json' --data-binary @- >/dev/null || true

# 7) Guard + Fix döngüsünü tetikle (Fix görevleri açılır ve çalışır)

[ -f scripts/guard/full.sh ] && bash scripts/guard/full.sh || curl -s -X POST http://localhost:$PORT/guard/run -H 'Content-Type: application/json' --data '{}' >/dev/null

# 8) Expo Go tünel (arkaplanda)

nohup npm run start:expo >/tmp/expo.log 2>&1 &

# 9) Durum çıktıları

echo "Dashboard:  http://localhost:$PORT"
echo "Models:     $(curl -s http://localhost:$PORT/models || true)"
echo "Agents:     $(curl -s http://localhost:$PORT/agents || true)"
echo "Health:     $(curl -s http://localhost:$PORT/health || true)"
echo "ReportSum:  $(curl -s http://localhost:$PORT/report | jq '.summary' 2>/dev/null || curl -s http://localhost:$PORT/report | head -n 30)"
echo "ExpoLogs:   tail -f /tmp/expo.log  # ayrı panelde izleyebilirsin"

# Ajan Haritalaması (net)
echo ""
echo "=== AJAN HARİTALAMASI ==="
echo "- Mimari/Plan: Anthropic Claude Opus 4.1 Pro → optimus-claude"
echo "- Kod/PR/Refactor/Test: GitHub Copilot Pro → forge-copilot"
echo "- Performans/Optimizasyon: OpenAI GPT‑5 Pro → bumblebee-gpt"
echo "- Görsel/Medya/Notifications/Analytics: Google Gemini 2.5 Pro → media-gemini"
echo "- Eleştirmen/QA: arcee-evaluator"
echo "- Guard Auto-Fix: fixer-agent"
echo "- OS/Diagnostics: os-runner"
echo ""

# Kalite sprint komutları (isteğe bağlı, tek blok)
echo "=== KALİTE SPRİNT KOMUTLARI ==="
echo "Tip, lint, test; paket hizalama (Expo 51 / RN 0.74 → React 18.2)"

npm run type-check || true
npm run lint:fix || true
npm run test:ci || true
npx expo install react@18.2.0 react-dom@18.2.0 || true
npx expo install --fix || true
bash scripts/guard/full.sh || true
curl -s http://localhost:${PORT:-4310}/report | jq '.summary' 2>/dev/null || true

echo ""
echo "=== OPTIMUS PRIME BAŞLATMA TAMAMLANDI ==="

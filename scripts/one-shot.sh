#!/usr/bin/env bash
set -euo pipefail

# One-shot bootstrap (no brew/pipx/Keychain; no interactive input)

export OPTIMUS_USE_LLM=${OPTIMUS_USE_LLM:-0}
export OPTIMUS_CLIENT=${OPTIMUS_CLIENT:-cline}
export OPTIMUS_BUDGET_SCOPE=${OPTIMUS_BUDGET_SCOPE:-cline}
export OPTIMUS_LLM_MODE=${OPTIMUS_LLM_MODE:-light}
export OPTIMUS_LLM_MAX_TOKENS=${OPTIMUS_LLM_MAX_TOKENS:-4000}

export DISPLAY_ANTHROPIC_LABEL=${DISPLAY_ANTHROPIC_LABEL:-claude-opus-4.1-pro}
export DISPLAY_OPENAI_LABEL=${DISPLAY_OPENAI_LABEL:-gpt-5-pro}
export DISPLAY_GITHUB_LABEL=${DISPLAY_GITHUB_LABEL:-copilot-pro:gpt-4o-mini}
export DISPLAY_GOOGLE_LABEL=${DISPLAY_GOOGLE_LABEL:-gemini-2.5-pro}

PORT=${PORT:-5173}
echo "[one-shot] Starting Dashboard on :$PORT (LLM=${OPTIMUS_USE_LLM})"
nohup bash "$(dirname "$0")/optimus-dashboard.sh" >/tmp/optimus.log 2>&1 &
sleep 3

# Housekeeping (markdown + label retag); best-effort, no failures

node scripts/guard/fix-markdown.js  >/dev/null 2>&1 || true
node scripts/guard/retag-models.js >/dev/null 2>&1 || true

echo "[one-shot] Guard scan (type/test/doctor) ..."
curl -s -X POST http://localhost:$PORT/guard/run -H 'Content-Type: application/json' --data '{}' >/dev/null || true

echo "[one-shot] Scan SPEC prepared & dedupe by title ..."
if command -v jq >/dev/null 2>&1; then
  PREP=$(curl -s http://localhost:$PORT/spec/scan | jq '{tasks:[.tasks[]|select(.status==null or .status=="prepared")]}' || echo '{"tasks":[]}')
  DEDUP=$(echo "$PREP" | jq '{tasks:(.tasks|group_by(.title)|map(.[0]))}' || echo '{"tasks":[]}')
else
  DEDUP='{"tasks":[]}'
fi
curl -s -X POST http://localhost:$PORT/run-batch -H 'Content-Type: application/json' --data "$DEDUP" >/dev/null || true

echo "[one-shot] Enable Autopilot (safe mode) ..."
curl -s -X POST http://localhost:$PORT/autopilot -H 'Content-Type: application/json' --data '{"enabled":true,"mode":"safe"}' >/dev/null || true

echo "[one-shot] Ready → Dashboard: http://localhost:$PORT"

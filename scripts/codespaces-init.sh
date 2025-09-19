#!/usr/bin/env bash
set -euo pipefail

# Generate .env from Codespaces env if not present
OUT=.env
if [[ -f "$OUT" ]]; then
  echo "[codespaces-init] .env exists; skipping" >&2
  exit 0
fi

echo "[codespaces-init] Writing $OUT from Codespaces env (masked)" >&2
{
  echo "OPTIMUS_USE_LLM=${OPTIMUS_USE_LLM:-0}"
  echo "GITHUB_TOKEN=${GITHUB_TOKEN:-}"
  echo "GITHUB_MODEL_ID=${GITHUB_MODEL_ID:-gpt-4o-mini}"
  echo "OPENAI_API_KEY=${OPENAI_API_KEY:-}"
  echo "OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o-mini}"
  echo "ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}"
  echo "ANTHROPIC_MODEL=${ANTHROPIC_MODEL:-claude-3-5-sonnet-20240620}"
  echo "GOOGLE_API_KEY=${GOOGLE_API_KEY:-}"
  echo "GOOGLE_MODEL=${GOOGLE_MODEL:-gemini-1.5-flash}"
} > "$OUT"
echo "[codespaces-init] Wrote $OUT (gitignored)." >&2


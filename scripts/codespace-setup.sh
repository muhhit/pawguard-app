#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "[codespace] npm install"
npm ci || npm i

echo "[codespace] type-check"
npm run type-check || true

echo "[codespace] lint"
npm run lint || true

echo "[codespace] pre-commit (optional)"
python3 -m pip install --user pre-commit >/dev/null 2>&1 || true
~/.local/bin/pre-commit install >/dev/null 2>&1 || pre-commit install || true

echo "[codespace] SPEC plan (Claude)"
npm run spec:claude || true

echo "T0_OK"


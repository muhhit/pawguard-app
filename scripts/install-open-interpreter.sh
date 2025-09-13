#!/usr/bin/env bash
set -euo pipefail

echo "[open-interpreter] Installing prerequisites (Rust + Python 3.12)"

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew required. Install Homebrew first." >&2
  exit 1
fi

brew install rust python@3.12 || true

PY312_BIN="$(brew --prefix)/opt/python@3.12/bin/python3"
if [ ! -x "$PY312_BIN" ]; then
  echo "Python 3.12 not found at $PY312_BIN" >&2
  exit 1
fi

echo "[open-interpreter] Ensuring pipx path"
pipx ensurepath || true
export PATH="$HOME/.local/bin:$PATH"

echo "[open-interpreter] Installing open-interpreter with Python 3.12"
pipx install open-interpreter --python "$PY312_BIN" || pipx reinstall open-interpreter --python "$PY312_BIN"

echo "[open-interpreter] Version check"
interpreter --version || true

echo "Done. You can now run: interpreter --os"


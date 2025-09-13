#!/usr/bin/env bash
set -euo pipefail

echo "[open-interpreter] Installing prerequisites (Rust + Python 3.12)"

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew required. Install Homebrew first." >&2
  exit 1
fi

brew install rust python@3.12 || true

# Discover Python 3.12 binary path robustly (Homebrew places it under libexec)
PY312_BIN=""
for CAND in "$(brew --prefix)/opt/python@3.12/libexec/bin/python3" \
            "$(brew --prefix)/opt/python@3.12/bin/python3" \
            "/usr/local/opt/python@3.12/libexec/bin/python3" \
            "/usr/local/opt/python@3.12/bin/python3"; do
  if [ -x "$CAND" ]; then PY312_BIN="$CAND"; break; fi
done

if [ -z "$PY312_BIN" ]; then
  echo "[open-interpreter] Could not locate Python 3.12 binary. Check Homebrew install of python@3.12." >&2
  exit 1
fi

echo "[open-interpreter] Ensuring pipx path"
pipx ensurepath || true
export PATH="$HOME/.local/bin:$PATH"

echo "[open-interpreter] Installing open-interpreter with Python 3.12 at: $PY312_BIN"
pipx reinstall open-interpreter --python "$PY312_BIN" || pipx install open-interpreter --python "$PY312_BIN"

echo "[open-interpreter] Version check"
interpreter --version || true

echo "Done. You can now run: interpreter --os"

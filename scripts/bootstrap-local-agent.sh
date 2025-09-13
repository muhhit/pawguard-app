#!/usr/bin/env bash
set -euo pipefail

echo "[local-agent] Preflight: checking tools..."

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew not found. Installing..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

brew install git gh python3 pipx || true

if ! command -v pipx >/dev/null 2>&1; then
  python3 -m pip install --user pipx
  python3 -m pipx ensurepath || true
fi

pipx install open-interpreter || pipx upgrade open-interpreter || true

echo "\n[local-agent] GitHub CLI login (required to push and create Codespaces)"
echo "Run: gh auth login"

cat << NOTE

Next steps (manual once):
1) macOS System Settings → Privacy & Security → Accessibility + Screen Recording → allow your terminal app for Open Interpreter OS mode.
2) Start agent: interpreter --os
3) Paste this task to the agent:
   """
   Task: Prepare and publish the repo, then open Codespaces.
   Steps:
   - Repo: ~/Desktop/pawguard-github-FULL
   - git add . && git commit -m "chore: bootstrap agents + spec kit"
   - If remote not available, create private repo muhhit/pawguard-app (or ask)
   - git push -u origin main
   - gh codespace create -r muhhit/pawguard-app -b main --machine standardLinux --display-name PawGuard
   - Open the created Codespace in browser
   """

NOTE

echo "[local-agent] Done."


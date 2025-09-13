#!/usr/bin/env bash
set -euo pipefail

say() { printf "\033[1;36m[one-shot]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$*"; }

REPO_DIR=${1:-"$(pwd)"}
GITHUB_REPO=${2:-"muhhit/pawguard-app"}

cd "$REPO_DIR"

say "Preflight: brew + paths"
if command -v /usr/local/bin/brew >/dev/null 2>&1; then eval "$(/usr/local/bin/brew shellenv)"; fi
export PATH="$HOME/.local/bin:$PATH"

say "Install packages (gh git python@3.12 pipx rust jq)"
brew install gh git python@3.12 pipx rust jq || true
pipx ensurepath || true

say "Install Open Interpreter (Python 3.12 venv)"
if [ ! -x "$HOME/.venvs/oi/bin/interpreter" ]; then
  PY312="${HOMEBREW_PREFIX:-/usr/local}/opt/python@3.12/libexec/bin/python3"
  [ -x "$PY312" ] || PY312="/usr/local/opt/python@3.12/libexec/bin/python3"
  if [ ! -x "$PY312" ]; then
    echo "Python 3.12 not found at $PY312" >&2; exit 1; fi
  "$PY312" -m venv "$HOME/.venvs/oi"
  "$HOME/.venvs/oi/bin/pip" install -U pip setuptools wheel maturin
  "$HOME/.venvs/oi/bin/pip" install open-interpreter
  "$HOME/.venvs/oi/bin/pip" install pyautogui pyscreeze pygetwindow mouseinfo pillow \
    pyobjc-core pyobjc-framework-Quartz pyobjc-framework-Cocoa "pyobjc-framework-ApplicationServices" \
    'uvicorn[standard]' "fastapi==0.104.1" "starlette==0.37.2" "httpx==0.27.2" screeninfo mss
fi

say "Create 'oi' alias for OS mode"
if ! grep -q 'alias oi=' "$HOME/.zshrc" 2>/dev/null; then
  echo 'alias oi="$HOME/.venvs/oi/bin/interpreter --os --model claude-3-5-sonnet-latest"' >> "$HOME/.zshrc"
fi

say "Store Anthropic key in Keychain (optional)"
if ! security find-generic-password -a "$USER" -s "ANTHROPIC_API_KEY" >/dev/null 2>&1; then
  warn "Paste ANTHROPIC_API_KEY now (or press Enter to skip):"
  read -r KEY || KEY=""
  if [ -n "${KEY}" ]; then security add-generic-password -a "$USER" -s "ANTHROPIC_API_KEY" -w "$KEY" -U; fi
fi

say "GitHub auth"
if ! gh auth status >/dev/null 2>&1; then gh auth login --web --git-protocol https; fi
gh auth refresh -h github.com -s repo -s read:org -s codespace || true

say "Git repo push"
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then git init; fi
git add -A || true
git commit -m "chore: one-shot bootstrap" || true
if ! git remote -v | grep -q "github.com/${GITHUB_REPO}.git"; then
  gh repo create "$GITHUB_REPO" --private --source . --remote origin --push || true
fi
git fetch origin main || true
git pull --rebase origin main || true
git push -u origin main || true

say "Set repo secrets (optional prompts)"
set_secret() {
  local key="$1"; local val=""; local tmp
  if gh secret list -R "$GITHUB_REPO" | grep -q "^$key"; then return 0; fi
  warn "Paste $key now (or press Enter to skip):"; read -r val || val=""
  if [ -z "$val" ]; then return 0; fi
  tmp=$(mktemp); printf "%s" "$val" > "$tmp"; gh secret set "$key" -R "$GITHUB_REPO" -f "$tmp"; rm -f "$tmp"
}
# Pre-fill Anthropic from Keychain if exists
if security find-generic-password -a "$USER" -s "ANTHROPIC_API_KEY" >/dev/null 2>&1; then
  VAL=$(security find-generic-password -a "$USER" -s "ANTHROPIC_API_KEY" -w 2>/dev/null || true)
  if [ -n "$VAL" ]; then tmp=$(mktemp); printf "%s" "$VAL" > "$tmp"; gh secret set ANTHROPIC_API_KEY -R "$GITHUB_REPO" -f "$tmp"; rm -f "$tmp"; fi
fi
set_secret OPENAI_API_KEY
set_secret GOOGLE_API_KEY

say "Create Codespace (standardLinux32gb -> basic fallback)"
if ! gh codespace list --json name,repository 2>/dev/null | grep -q "$GITHUB_REPO"; then
  gh codespace create -R "$GITHUB_REPO" -b main --display-name PawGuard --machine standardLinux32gb || \
  gh codespace create -R "$GITHUB_REPO" -b main --display-name PawGuard --machine basicLinux32gb || true
fi
CS=$(gh codespace list --json name,repository,displayName -q '.[0].name' 2>/dev/null || true)
[ -n "$CS" ] && say "Codespace ready: $CS (open from GitHub UI or: gh codespace code -c $CS)"

say "All set. Inside Codespaces run: npm run spec:claude"
say "Then open Cline and select: Anthropic Sonnet, system prompt vendor/ai-prompts/VSCode Agent/claude-sonnet-4.txt, rules rules/workspace-rules.md"
say "Execute SPEC tasks: T0 -> T3 -> T2 -> T4"


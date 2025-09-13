#!/usr/bin/env bash
set -euo pipefail

REPO_DIR=${1:-"$(pwd)"}
REPO_NAME=${2:-"pawguard-app"}
GITHUB_USER=${3:-"muhhit"}

cd "$REPO_DIR"

echo "[gh-bootstrap] Checking GitHub auth..."
if ! gh auth status >/dev/null 2>&1; then
  echo "You must login first: gh auth login"
  exit 1
fi

if ! git remote -v | grep -q "github.com/${GITHUB_USER}/${REPO_NAME}.git"; then
  echo "[gh-bootstrap] Creating repo ${GITHUB_USER}/${REPO_NAME} (private)..."
  gh repo create "${GITHUB_USER}/${REPO_NAME}" --private --source . --remote origin --push || true
fi

echo "[gh-bootstrap] Pushing main..."
git add .
git commit -m "chore: bootstrap agents + spec kit" || true
git push -u origin main

echo "[gh-bootstrap] Creating Codespace..."
# Prefer larger machine when available; fallback gracefully.
if ! gh codespace create -R "${GITHUB_USER}/${REPO_NAME}" -b main --display-name PawGuard --machine standardLinux32gb; then
  gh codespace create -R "${GITHUB_USER}/${REPO_NAME}" -b main --display-name PawGuard --machine basicLinux32gb || true
fi
echo "Done. Open Codespaces from gh or GitHub UI."

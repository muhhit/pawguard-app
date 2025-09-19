#!/usr/bin/env bash
set -euo pipefail

echo "[expo-clean] Purging caches and lockfiles..."
rm -rf node_modules .expo .expo-shared
rm -rf ~/.expo
rm -rf $TMPDIR/metro-* $TMPDIR/haste-map-* 2>/dev/null || true
if command -v watchman >/dev/null 2>&1; then
  watchman watch-del-all || true
fi
echo "[expo-clean] Running fresh install..."
npm install
echo "[expo-clean] Done. You can now run: npm run dev:expo"


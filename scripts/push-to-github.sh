#!/bin/bash

# GitHub Push Helper Script
# Usage: bash scripts/push-to-github.sh <repo-url>

set -e

REPO_URL="$1"

if [ -z "$REPO_URL" ]; then
    echo "❌ Usage: bash scripts/push-to-github.sh <repo-url>"
    echo "   Example: bash scripts/push-to-github.sh https://github.com/user/repo"
    exit 1
fi

echo "🚀 Starting GitHub push process..."

# Check if git repo exists
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Check if remote exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "🔗 Adding remote origin..."
    git remote add origin "$REPO_URL"
else
    echo "✅ Remote origin already exists"
fi

# Stage all changes
echo "📝 Staging all changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "🤖 OPTIMUS PRIME COMPLETE: Advanced AI orchestration system

✅ Features:
- Multi-agent orchestration (Optimus-Claude, Bumblebee-GPT, Jazz-Gemini)
- Collective Intelligence Matrix
- Realistic task generation (T43-T50)
- Production-ready implementations

🚀 Upgrades:
- Claude-4-sonnet/Opus-4.1
- GPT-5-pro
- Gemini-2.5-pro

🦄 All systems operational!"
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo "🎉 Successfully pushed to GitHub!"
echo "🔗 Repository: $REPO_URL"

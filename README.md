# PawGuard MVP

AI-powered lost pet recovery platform connecting pet owners, community helpers, and emergency responders across Turkey and the UK.

## Quick Start

1) Install dependencies:
```bash
npm install
```

2) Start the dashboard server (agents/guard):
```bash
node server/dashboard.cjs
```

3) Optional: Start Expo dev server for the app:
```bash
npx expo start
```

## Core Features

- **Amber Alert System**: 5-15km emergency broadcast for lost pets
- **Health Hub**: Digital vaccination tracking and AI health scanning
- **Trust Graph**: Community verification and fraud prevention
- **Modern UI/UX**: Glass morphism design with intuitive navigation

## Technical Stack

- **Frontend**: React Native + Expo SDK 52
- **State**: Zustand + React Query  
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Backend**: Node.js + Express + TypeScript
- **AI**: OpenAI Vision API, multi-agent development

## Codespaces (Cline-ready)

- Open the repo in GitHub Codespaces. The devcontainer forwards port 5173 (Dashboard) and 19000 (Expo).
- On start, the container installs deps and starts the dashboard in background.
- If you’ve configured Codespaces secrets (OPENAI_API_KEY, ANTHROPIC_API_KEY, GITHUB_TOKEN, GOOGLE_API_KEY), run:
  ```bash
  bash scripts/codespaces-init.sh
  ```
  to generate a local `.env` (gitignored).
- Cline Paste 3 script:
  ```bash
  bash scripts/cline-paste-3-simple.sh
  ```

## Goals

- 100K+ active users in year 1
- £1M ARR trajectory by month 14
- 1000+ pets reunited in year 1
- <30 minute Amber Alert response time

#!/bin/bash

# Optimus Prime Dashboard Launcher
# Usage: bash scripts/optimus-dashboard.sh

echo "🤖 [OPTIMUS-PRIME] Starting Live Dashboard..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

# Set environment variables for Cline session
export OPTIMUS_USE_LLM=1
export OPTIMUS_CLIENT=cline
export OPTIMUS_BUDGET_SCOPE=cline
export OPTIMUS_LLM_MODE=light
export OPTIMUS_LLM_MAX_TOKENS=4000

# Start the dashboard server
echo "🚀 Starting dashboard on port 5173..."
echo "📊 Dashboard will be available at: http://localhost:5173"
echo "🔧 Use 'Use Models' toggle to enable LLM features"
echo ""
echo "Available endpoints:"
echo "  - GET  /scan           - Scan project for tasks"
echo "  - GET  /spec/scan      - Scan SPEC for tasks"
echo "  - POST /run-batch      - Run batch of tasks"
echo "  - GET  /llm/status     - Check LLM status"
echo "  - POST /config         - Configure LLM settings"
echo "  - GET  /autopilot      - Check autopilot status"
echo "  - POST /autopilot      - Configure autopilot"
echo ""

# Start the dashboard
node server/dashboard.cjs

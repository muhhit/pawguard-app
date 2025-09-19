#!/bin/bash

# Canlı ajan hareketini izle
echo "🤖 PawGuard Autopilot - Canlı Ajan İzleme"
echo "=========================================="
echo "Port: 4000 | Güncelleme: 5 saniye"
echo ""

watch -n 5 'curl -s http://localhost:4000/agents | jq "{
  autopilot: .autopilot,
  summary: {
    total: .total,
    active: .active,
    completed: .completed,
    timestamp: .timestamp
  },
  agents: [.agents[] | {
    id: .id,
    status: .status,
    model: .model,
    complexity: .complexity,
    unicornPotential: .unicornPotential
  }]
}"'

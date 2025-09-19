#!/bin/bash
set -euo pipefail
echo "== Delta v6.1 start =="

# 1) normalizePet yardımcıları
mkdir -p utils
cat > utils/normalizePet.ts <<'EOF'
import type { Pet } from '@/hooks/pet-store';

export function normalizePet(input: any): Pet {
  return {
    id: String(input.id ?? ''),
    owner_id: String(input.owner_id ?? ''),
    name: String(input.name ?? ''),
    type: String(input.type ?? ''),
    breed: input.breed ?? null,
    age: typeof input.age === 'number' ? String(input.age) : (input.age ?? ''),
    last_location: input.last_location
      ? { lat: Number(input.last_location.lat ?? 0), lng: Number(input.last_location.lng ?? 0) }
      : { lat: 0, lng: 0 },
    reward_amount: Number(input.reward_amount ?? 0),
    is_found: !!input.is_found,
    photos: Array.isArray(input.photos) ? input.photos : [],
    medical_records: Array.isArray(input.medical_records) ? input.medical_records : [],
    created_at: String(input.created_at ?? new Date().toISOString()),
  };
}
EOF

echo "== Delta v6.1 normalizePet created =="

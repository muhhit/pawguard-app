API Overview (used by app)

Core Endpoints

- GET  /health → { ok:true }
- POST /amber/init → { alertId } (body: { message, center:{lat,lng}, radiusKm })
- POST /amber/ack → { ok } (header: x-user-id opsiyonel)
- POST /amber/expand → { ok } (body: { alertId, radiusKm })
- POST /vaccine/schedule → { schedule:[{ vaccine, when }] }
- GET  /vaccine/records?petId=... → { records:[...] }
- POST /microchip/search → { success, result:{ chipNumber, matched, providers:
[{name,country,manualCheckUrl}] } }
- POST /render/brandify → { success, url }

Client Config

- EXPO_PUBLIC_API_BASE_URL bu API hostunu göstermeli.

Acceptance

- Tüm isteklerde hata/boş durum ekranları gösterilmeli; 4xx/5xx ayrımı yapılmalı.

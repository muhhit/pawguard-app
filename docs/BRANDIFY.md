# Brandify (Premium Brand Card)

## API
- POST `/render/brandify`
  - Body: `{ petPhotoUrl: string, template?: 'pawguard' | string, outputs?: string[] }`
  - Returns: `{ success: boolean, assets: { front?: string, left15?: string, right15?: string, video?: string } }`
  - Implementation: Gemini 2.5 Flash Image style transfer + parallax compositing; placeholder mevcut.

- POST `/render/parallax`
  - Body: `{ petPhotoUrl: string }`
  - Returns: `{ success: boolean, asset: string }`
  - Implementation: Hafif parallax (server veya on-device); placeholder mevcut.

## Şablon JSON
- `templates/brand/pawguard.json` ve `templates/brand/pawfora.json` içinde örnek şablonlar.
  - PawFora şablonu bu görsel dile uygundur (pin + kalp + pati, düz renkler, #00A7A7 ve #1E1E1E paleti).

## Mobil Ekran
- `app/brandify.tsx`: Premium ekran; standart 2.5D ve Brandify çağrısı.

## Yapılandırma
- `.env`: `EXPO_PUBLIC_API_BASE_URL` backend URL’si.
- Supabase Storage: `brandify/`, `parallax/` bucket’ları tavsiye edilir.

## Kullanım (Mobil)
- Brandify ekranı, varsayılan olarak `pawfora` şablonunu kullanabilir:
  - Sunucu çağrısında body `{ template: 'pawfora' }` gönderin.

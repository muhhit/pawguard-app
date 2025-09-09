# Ödemeler ve Escrow: Şirket Öncesi MVP Yaklaşımı

Şirketleşme tamamlanana kadar PSP (Iyzico/Stripe) ile resmi emanet (escrow) yapılamaz. Politik ve hukuki kısıtlar nedeniyle Apple/Google IAP de kişi-kişiye ödül/gerçek dünya ödemeleri için uygun değildir.

## MVP Stratejisi (0–90 gün)
- Pledge/taahhüt modeli: Ödül tutarı uygulama dışında gönderilir (banka/EFT/ödeme linki). Uygulama, kanıt/dekont yüklenmesini ve iki taraflı onayı takip eder.
- Durumlar: `pending → approved → paid` (kanıt eklendi/karşı taraf teyit). Anlaşmazlıklar manuel çözülür.
- Sorumluluk reddi: Platformun ödeme aracısı olmadığı, yalnızca koordinasyon sağladığı açıkça belirtilir.

## UK Pilot (opsiyonel, 60–120 gün)
- Stripe Connect (Standard/Express) ile “sole trader” bireysel onboarding mümkünse: `owner → platform → finder` ödemesi; webhook ile claim güncelleme.
- Platform tarafında fon tutma/dağıtma düzenlemelerine uyum gerekir. Uygun değilse bu aşama ertelenir.

## TR V2 (şirket sonrası)
- Iyzico Marketplace ile alıcı/satıcı alt-üye onboarding; escrow serbest bırakma/iptal akışları ve webhooks.

## Uygulama İçindeki Değişiklikler
- Manuel ödeme ekranı (eklendi): `ManualPaymentInfo` — adım adım rehber, “Mark as Paid” ile claim kapanışı.
- Ödeme kanıtı alanı: `reward_claims.evidence_photo/evidence_notes` (şemada mevcut). Supabase Storage ile ileride yükleme eklenebilir.
- `IyzicoPayment` server endpoint’ine bağlanır (örnek URI); backend hazır olunca gerçekleşir.

## Neden IAP Değil?
- Apple/Google IAP, fiziksel ürün/servis ve kişi-kişiye ödemeler için uygun değildir; marketplace/escrow akışları ihlaldir. Hesap kapanma riski.


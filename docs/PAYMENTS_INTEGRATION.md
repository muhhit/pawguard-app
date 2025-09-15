# Payments Integration Guide

## Overview
This document outlines the payment integration strategy for PawGuard, focusing on Iyzico as the primary payment provider for the Turkish market.

## Payment Providers

### Iyzico (Primary - Turkey)
- **Status**: Interface prepared, implementation deferred until company setup
- **Use Cases**: Premium subscriptions, reward claims, donations
- **Currency**: Turkish Lira (TRY)
- **Integration**: REST API

### Stripe (Secondary - International)
- **Status**: Interface prepared, implementation deferred
- **Use Cases**: International payments, backup provider
- **Currency**: Multi-currency support
- **Integration**: REST API + Webhooks

## Environment Variables

Required environment variables are documented in `.env.example`:

```bash
# Payment Services
IYZICO_API_KEY=your_iyzico_api_key_here
IYZICO_SECRET_KEY=your_iyzico_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

## API Interfaces

### Iyzico Payment Interface
```typescript
interface IyzicoPaymentRequest {
  amount: number;
  currency: 'TRY';
  description: string;
  userId: string;
  paymentType: 'subscription' | 'reward' | 'donation';
}

interface IyzicoPaymentResponse {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  error?: string;
}
```

### Stripe Payment Interface
```typescript
interface StripePaymentRequest {
  amount: number;
  currency: string;
  description: string;
  userId: string;
  paymentType: 'subscription' | 'reward' | 'donation';
}

interface StripePaymentResponse {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}
```

## Implementation Status

- ✅ Environment variables defined
- ✅ API interfaces documented
- ✅ Mock endpoints available in server
- ⏳ Actual integration pending company setup
- ⏳ Webhook handlers pending
- ⏳ Payment verification pending

## Next Steps

1. Complete company registration and legal setup
2. Obtain Iyzico merchant account
3. Implement actual payment processing
4. Add webhook handlers for payment status updates
5. Implement payment verification and security measures
6. Add comprehensive error handling and logging

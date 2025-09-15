// Payment Types and Interfaces for PawGuard

export type PaymentProvider = 'iyzico' | 'stripe';
export type PaymentType = 'subscription' | 'reward' | 'donation';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type Currency = 'TRY' | 'USD' | 'EUR';

// Base Payment Request Interface
export interface BasePaymentRequest {
  amount: number;
  currency: Currency;
  description: string;
  userId: string;
  paymentType: PaymentType;
  metadata?: Record<string, any>;
}

// Base Payment Response Interface
export interface BasePaymentResponse {
  success: boolean;
  paymentId?: string;
  status: PaymentStatus;
  error?: string;
  timestamp: string;
}

// Iyzico Specific Interfaces
export interface IyzicoPaymentRequest extends BasePaymentRequest {
  currency: 'TRY';
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    identityNumber: string;
    registrationAddress: string;
    city: string;
    country: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    itemType: 'PHYSICAL' | 'VIRTUAL';
    price: number;
  }>;
}

export interface IyzicoPaymentResponse extends BasePaymentResponse {
  paymentId?: string;
  redirectUrl?: string;
  token?: string;
  conversationId?: string;
}

// Stripe Specific Interfaces
export interface StripePaymentRequest extends BasePaymentRequest {
  paymentMethodId?: string;
  customerId?: string;
  setupFutureUsage?: 'on_session' | 'off_session';
}

export interface StripePaymentResponse extends BasePaymentResponse {
  paymentIntentId?: string;
  clientSecret?: string;
  customerId?: string;
  requiresAction?: boolean;
}

// Webhook Interfaces
export interface PaymentWebhookEvent {
  id: string;
  provider: PaymentProvider;
  type: string;
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  userId: string;
  timestamp: string;
  data: Record<string, any>;
}

// Payment History Interface
export interface PaymentRecord {
  id: string;
  userId: string;
  provider: PaymentProvider;
  paymentId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  paymentType: PaymentType;
  description: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// Payment Service Interface
export interface PaymentService {
  processPayment(request: BasePaymentRequest): Promise<BasePaymentResponse>;
  verifyPayment(paymentId: string): Promise<PaymentRecord>;
  refundPayment(paymentId: string, amount?: number): Promise<BasePaymentResponse>;
  getPaymentHistory(userId: string): Promise<PaymentRecord[]>;
}

// Configuration Interfaces
export interface PaymentConfig {
  provider: PaymentProvider;
  apiKey: string;
  secretKey: string;
  environment: 'sandbox' | 'production';
  webhookSecret?: string;
}

export interface IyzicoConfig extends PaymentConfig {
  provider: 'iyzico';
  baseUrl: string;
}

export interface StripeConfig extends PaymentConfig {
  provider: 'stripe';
  publishableKey: string;
}

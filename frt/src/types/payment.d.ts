interface ICreatePaymentIntentRequest {
  orderId?: string;
  currency?: string;
}

interface ICreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  message: string;
}

interface ICreateCheckoutSessionRequest {
  successUrl: string;
  cancelUrl: string;
}

interface ICreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
  message: string;
}

interface IStripeConfigResponse {
  publishableKey: string;
  message: string;
}
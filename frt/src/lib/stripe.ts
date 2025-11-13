import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe instance
 * Loads Stripe.js with your publishable key
 */
export const getStripe = () => {
  if (!stripePromise) {
    // Get publishable key from environment variable
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('Stripe publishable key is not defined');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

/**
 * Format amount for Stripe
 * Converts amount to smallest currency unit (e.g., paise for INR)
 */
export const formatAmountForStripe = (amount: number, currency: string = 'inr'): number => {
  return Math.round(amount * 100);
};

/**
 * Format amount for display
 * Converts from smallest currency unit to main unit
 */
export const formatAmountFromStripe = (amount: number, currency: string = 'inr'): number => {
  return amount / 100;
};

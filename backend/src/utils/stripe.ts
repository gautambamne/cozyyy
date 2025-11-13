import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover', // Use latest API version
    typescript: true,
});

/**
 * Create a Stripe Payment Intent
 * @param amount - Amount in smallest currency unit (e.g., cents for USD, paise for INR)
 * @param currency - Currency code (e.g., 'inr', 'usd')
 * @param metadata - Additional metadata to attach to the payment
 */
export async function createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    metadata: Record<string, string> = {}
) {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to smallest currency unit
            currency: currency.toLowerCase(),
            automatic_payment_methods: {
                enabled: true,
            },
            metadata,
        });

        return paymentIntent;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}

/**
 * Retrieve a Payment Intent
 * @param paymentIntentId - The ID of the payment intent
 */
export async function retrievePaymentIntent(paymentIntentId: string) {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Error retrieving payment intent:', error);
        throw error;
    }
}

/**
 * Confirm a Payment Intent
 * @param paymentIntentId - The ID of the payment intent
 * @param paymentMethodId - The ID of the payment method
 */
export async function confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
) {
    try {
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: paymentMethodId,
        });
        return paymentIntent;
    } catch (error) {
        console.error('Error confirming payment intent:', error);
        throw error;
    }
}

/**
 * Cancel a Payment Intent
 * @param paymentIntentId - The ID of the payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
    try {
        const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Error cancelling payment intent:', error);
        throw error;
    }
}

/**
 * Create a Stripe Checkout Session
 * @param lineItems - Array of line items for the checkout
 * @param successUrl - URL to redirect to on successful payment
 * @param cancelUrl - URL to redirect to on cancelled payment
 * @param metadata - Additional metadata
 */
export async function createCheckoutSession(
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    successUrl: string,
    cancelUrl: string,
    metadata: Record<string, string> = {}
) {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata,
        });

        return session;
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
}

/**
 * Construct Webhook Event
 * @param payload - The raw request body
 * @param signature - The Stripe signature header
 * @param webhookSecret - Your webhook secret
 */
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
) {
    try {
        const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            webhookSecret
        );
        return event;
    } catch (error) {
        console.error('Error constructing webhook event:', error);
        throw error;
    }
}

/**
 * Create a refund
 * @param paymentIntentId - The ID of the payment intent to refund
 * @param amount - Optional amount to refund (in smallest currency unit)
 */
export async function createRefund(
    paymentIntentId: string,
    amount?: number
) {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount,
        });
        return refund;
    } catch (error) {
        console.error('Error creating refund:', error);
        throw error;
    }
}

export default stripe;

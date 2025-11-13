import type { Request, Response } from 'express';
import ApiError from "../advices/ApiError";
import ApiResponse from "../advices/ApiResponse";
import { CartRepository } from "../repositories/cart.repositories";
import asyncHandler from "../utils/asynchandler";
import { createPaymentIntent, retrievePaymentIntent, createCheckoutSession } from "../utils/stripe";
import { z } from 'zod';
import { zodErrorFormatter } from "../utils/error-formater";

// Schema for creating payment intent
const CreatePaymentIntentSchema = z.object({
    orderId: z.string().uuid().optional(),
    currency: z.string().default('inr'),
});

// Schema for checkout session
const CreateCheckoutSessionSchema = z.object({
    successUrl: z.string().url('Invalid success URL'),
    cancelUrl: z.string().url('Invalid cancel URL'),
});

/**
 * Create Payment Intent Controller
 * Creates a Stripe payment intent for the user's cart or existing order
 */
export const CreatePaymentIntentController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");

    const result = CreatePaymentIntentSchema.safeParse(req.body);
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const { orderId, currency } = result.data;
    const userId = req.user.id;

    let amount: number;
    
    if (orderId) {
        // If orderId provided, get amount from existing order
        const { prisma } = await import("../db/database");
        const order = await prisma.order.findFirst({
            where: { id: orderId, userId },
            include: { payment: true }
        });

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        amount = order.total;

        // Create payment intent
        const paymentIntent = await createPaymentIntent(
            amount,
            currency,
            {
                userId,
                orderId,
            }
        );

        // Update payment record with Stripe payment ID
        if (order.payment) {
            await prisma.payment.update({
                where: { id: order.payment.id },
                data: { stripePaymentId: paymentIntent.id }
            });
        }

        res.status(200).json(
            new ApiResponse({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount,
                currency: paymentIntent.currency,
                message: "Payment intent created successfully"
            })
        );
    } else {
        // Get cart summary to calculate total
        const { summary } = await CartRepository.getAllCartItems({
            userId,
            includeInactiveProducts: false
        });

        if (summary.total <= 0) {
            throw new ApiError(400, "Cart is empty or invalid");
        }

        amount = summary.total;

        // Create payment intent
        const paymentIntent = await createPaymentIntent(
            amount,
            currency,
            {
                userId,
            }
        );

        res.status(200).json(
            new ApiResponse({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount,
                currency: paymentIntent.currency,
                message: "Payment intent created successfully"
            })
        );
    }
});

/**
 * Get Payment Intent Controller
 * Retrieves a payment intent by ID
 */
export const GetPaymentIntentController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");

    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
        throw new ApiError(400, "Payment intent ID is required");
    }

    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    // Verify the payment intent belongs to the user
    if (paymentIntent.metadata.userId !== req.user.id) {
        throw new ApiError(403, "Forbidden");
    }

    res.status(200).json(
        new ApiResponse({
            paymentIntent: {
                id: paymentIntent.id,
                amount: paymentIntent.amount / 100, // Convert back to main currency unit
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                clientSecret: paymentIntent.client_secret,
            },
            message: "Payment intent retrieved successfully"
        })
    );
});

/**
 * Create Checkout Session Controller
 * Creates a Stripe Checkout session for the user's cart
 */
export const CreateCheckoutSessionController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");

    const result = CreateCheckoutSessionSchema.safeParse(req.body);
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const { successUrl, cancelUrl } = result.data;
    const userId = req.user.id;

    // Get cart items
    const { items, summary } = await CartRepository.getAllCartItems({
        userId,
        includeInactiveProducts: false
    });

    if (!items.length) {
        throw new ApiError(400, "Cart is empty");
    }

    // Convert cart items to Stripe line items
    const lineItems = items.map(item => ({
        price_data: {
            currency: 'inr',
            product_data: {
                name: item.product.name,
                images: item.product.images.slice(0, 1), // Stripe allows max 8 images
            },
            unit_amount: Math.round(item.product.price * 100), // Convert to paise
        },
        quantity: item.quantity,
    }));

    // Create checkout session
    const session = await createCheckoutSession(
        lineItems,
        successUrl,
        cancelUrl,
        {
            userId,
            cartTotal: summary.total.toString(),
        }
    );

    res.status(200).json(
        new ApiResponse({
            sessionId: session.id,
            url: session.url,
            message: "Checkout session created successfully"
        })
    );
});

/**
 * Webhook Handler Controller
 * Handles Stripe webhook events
 */
export const StripeWebhookController = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
        throw new ApiError(400, "Missing stripe signature");
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new ApiError(500, "Webhook secret not configured");
    }

    try {
        const { constructWebhookEvent } = await import("../utils/stripe");
        const { prisma } = await import("../db/database");
        const { OrderStatus } = await import("../schema/order.schema");
        
        const event = constructWebhookEvent(
            req.body,
            signature as string,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        // Handle different event types
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('Payment succeeded:', paymentIntent.id);
                
                // Update payment and order status
                const payment = await prisma.payment.findFirst({
                    where: { stripePaymentId: paymentIntent.id },
                    include: { order: true }
                });

                if (payment) {
                    await prisma.$transaction([
                        prisma.payment.update({
                            where: { id: payment.id },
                            data: { status: OrderStatus.CONFIRMED }
                        }),
                        prisma.order.update({
                            where: { id: payment.orderId },
                            data: { status: OrderStatus.CONFIRMED }
                        })
                    ]);
                    console.log(`Order ${payment.orderId} confirmed`);
                }
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                
                // Update payment status to cancelled
                const failedPaymentRecord = await prisma.payment.findFirst({
                    where: { stripePaymentId: failedPayment.id }
                });

                if (failedPaymentRecord) {
                    await prisma.$transaction([
                        prisma.payment.update({
                            where: { id: failedPaymentRecord.id },
                            data: { status: OrderStatus.CANCELLED }
                        }),
                        prisma.order.update({
                            where: { id: failedPaymentRecord.orderId },
                            data: { status: OrderStatus.CANCELLED }
                        })
                    ]);
                    console.log(`Order ${failedPaymentRecord.orderId} cancelled due to payment failure`);
                }
                break;

            case 'checkout.session.completed':
                const session = event.data.object;
                console.log('Checkout session completed:', session.id);
                // Handle checkout session completion if using Stripe Checkout
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        throw new ApiError(400, "Webhook signature verification failed");
    }
});

/**
 * Get Stripe Config Controller
 * Returns the Stripe publishable key for frontend
 */
export const GetStripeConfigController = asyncHandler(async (req: Request, res: Response) => {
    if (!process.env.STRIPE_PUBLISHABLE_KEY) {
        throw new ApiError(500, "Stripe publishable key not configured");
    }

    res.status(200).json(
        new ApiResponse({
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            message: "Stripe config retrieved successfully"
        })
    );
});

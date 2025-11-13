import type { Request, Response } from 'express';
import ApiError from "../advices/ApiError";
import ApiResponse from "../advices/ApiResponse";
import { CartRepository } from "../repositories/cart.repositories";
import { OrderRepository } from "../repositories/order.repositories";
import asyncHandler from "../utils/asynchandler";
import { createPaymentIntent, retrievePaymentIntent, createCheckoutSession } from "../utils/stripe";
import { z } from 'zod';
import { zodErrorFormatter } from "../utils/error-formater";

type StripeWebhookRequest = Request & { rawBody?: Buffer };

// Schema for creating payment intent
const CreatePaymentIntentSchema = z.object({
    orderId: z.string().uuid().optional(),
    currency: z.string().default('inr'),
});

// Schema for checkout session
const CreateCheckoutSessionSchema = z.object({
    orderId: z.string().uuid('Invalid order ID'),
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
        console.log(`[Payment] Creating payment intent for order: ${orderId}, user: ${userId}`);
        // If orderId provided, get amount from existing order
        const { prisma } = await import("../db/database");
        const order = await prisma.order.findFirst({
            where: { id: orderId, userId },
            include: { payment: true }
        });

        if (!order) {
            console.error(`[Payment] Order not found: ${orderId} for user: ${userId}`);
            throw new ApiError(404, "Order not found");
        }

        amount = order.total;
        console.log(`[Payment] Order found - Amount: ${amount}, Currency: ${currency}, Status: ${order.status}`);

        // Create payment intent
        const paymentIntent = await createPaymentIntent(
            amount,
            currency,
            {
                userId,
                orderId,
            }
        );

        console.log(`[Payment] Payment intent created: ${paymentIntent.id} for order: ${orderId}`);

        // Update payment record with Stripe payment ID
        if (order.payment) {
            await prisma.payment.update({
                where: { id: order.payment.id },
                data: { stripePaymentId: paymentIntent.id }
            });
            console.log(`[Payment] Updated payment record: ${order.payment.id} with Stripe ID: ${paymentIntent.id}`);
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
        console.log(`[Payment] Creating payment intent from cart for user: ${userId}`);
        // Get cart summary to calculate total
        const { summary } = await CartRepository.getAllCartItems({
            userId,
            includeInactiveProducts: false
        });

        if (summary.total <= 0) {
            console.error(`[Payment] Cart is empty or invalid for user: ${userId}`);
            throw new ApiError(400, "Cart is empty or invalid");
        }

        amount = summary.total;
        console.log(`[Payment] Cart total: ${amount}, Items: ${summary.itemCount}, Currency: ${currency}`);

        // Create payment intent
        const paymentIntent = await createPaymentIntent(
            amount,
            currency,
            {
                userId,
            }
        );

        console.log(`[Payment] Payment intent created from cart: ${paymentIntent.id} for user: ${userId}`);

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

    console.log(`[Payment] Retrieving payment intent: ${paymentIntentId} for user: ${req.user.id}`);
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    // Verify the payment intent belongs to the user
    if (paymentIntent.metadata.userId !== req.user.id) {
        console.error(`[Payment] Unauthorized access attempt - PaymentIntent: ${paymentIntentId}, User: ${req.user.id}`);
        throw new ApiError(403, "Forbidden");
    }

    console.log(`[Payment] Payment intent retrieved - Status: ${paymentIntent.status}, Amount: ${paymentIntent.amount / 100}`);

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

    const { orderId, successUrl, cancelUrl } = result.data;
    const userId = req.user.id;

    console.log(`[Payment] Creating checkout session for order: ${orderId}, user: ${userId}`);
    const order = await OrderRepository.getOrderById(orderId, userId);
    if (!order) {
        console.error(`[Payment] Order not found: ${orderId} for user: ${userId}`);
        throw new ApiError(404, "Order not found");
    }

    if (!order.payment) {
        console.error(`[Payment] Payment record not found for order: ${orderId}`);
        throw new ApiError(400, "Payment record not found for order");
    }

    if (order.status !== 'PENDING') {
        console.error(`[Payment] Order ${orderId} not eligible for payment - Status: ${order.status}`);
        throw new ApiError(400, "Order is not eligible for payment");
    }

    console.log(`[Payment] Order validated - Items: ${order.items.length}, Total: ${order.total}`);

    const currency = (order.payment.currency || 'INR').toLowerCase();

    const lineItems = order.items.map(item => ({
        price_data: {
            currency,
            product_data: {
                name: item.product?.name ?? 'Product',
                images: item.product?.images?.slice(0, 1) ?? [],
            },
            unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
    }));

    if (!lineItems.length) {
        throw new ApiError(400, "Order has no items");
    }

    // Create checkout session
    const session = await createCheckoutSession(
        lineItems,
        successUrl,
        cancelUrl,
        {
            userId,
            orderId,
        },
        {
            userId,
            orderId,
            paymentId: order.payment.id,
        }
    );

    console.log(`[Payment] Checkout session created: ${session.id} for order: ${orderId}, URL: ${session.url}`);

    res.status(200).json(
        new ApiResponse({
            sessionId: session.id,
            url: session.url,
            amount: order.total,
            currency,
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

    console.log('[Webhook] Received webhook request');

    if (!signature) {
        console.error('[Webhook] Missing stripe signature');
        throw new ApiError(400, "Missing stripe signature");
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('[Webhook] Webhook secret not configured');
        throw new ApiError(500, "Webhook secret not configured");
    }

    try {
        const { constructWebhookEvent } = await import("../utils/stripe");
        const { prisma } = await import("../db/database");
        const { OrderStatus } = await import("../schema/order.schema");
        
        // With express.raw(), req.body is already a Buffer
        const rawBody = req.body;
        if (!rawBody) {
            console.error('[Webhook] Webhook payload not available');
            throw new ApiError(400, "Webhook payload not available");
        }

        const event = await constructWebhookEvent(
            rawBody,
            signature as string,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log(`[Webhook] Event type: ${event.type}, Event ID: ${event.id}`);

        // Handle different event types
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log(`[Webhook] Payment intent succeeded: ${paymentIntent.id}, Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency}`);
                
                // Update payment and order status
                let payment = await prisma.payment.findFirst({
                    where: { stripePaymentId: paymentIntent.id },
                    include: { order: true }
                });

                if (!payment && paymentIntent.metadata?.orderId) {
                    payment = await prisma.payment.findFirst({
                        where: { orderId: paymentIntent.metadata.orderId },
                        include: { order: true }
                    });

                    if (payment && payment.stripePaymentId !== paymentIntent.id) {
                        await prisma.payment.update({
                            where: { id: payment.id },
                            data: { stripePaymentId: paymentIntent.id }
                        });
                        payment.stripePaymentId = paymentIntent.id;
                    }
                }

                if (payment) {
                    console.log(`[Webhook] Updating payment ${payment.id} and order ${payment.orderId} to CONFIRMED`);
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
                    console.log(`[Webhook] Order ${payment.orderId} confirmed successfully`);
                } else {
                    console.warn(`[Webhook] Payment record not found for payment intent: ${paymentIntent.id}`);
                }
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log(`[Webhook] Payment intent failed: ${failedPayment.id}, Amount: ${failedPayment.amount / 100} ${failedPayment.currency}`);
                
                // Update payment status to cancelled
                let failedPaymentRecord = await prisma.payment.findFirst({
                    where: { stripePaymentId: failedPayment.id }
                });

                if (!failedPaymentRecord && failedPayment.metadata?.orderId) {
                    failedPaymentRecord = await prisma.payment.findFirst({
                        where: { orderId: failedPayment.metadata.orderId }
                    });

                    if (failedPaymentRecord && failedPaymentRecord.stripePaymentId !== failedPayment.id) {
                        await prisma.payment.update({
                            where: { id: failedPaymentRecord.id },
                            data: { stripePaymentId: failedPayment.id }
                        });
                    }
                }

                if (failedPaymentRecord) {
                    console.log(`[Webhook] Updating payment ${failedPaymentRecord.id} and order ${failedPaymentRecord.orderId} to CANCELLED`);
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
                    console.log(`[Webhook] Order ${failedPaymentRecord.orderId} cancelled due to payment failure`);
                } else {
                    console.warn(`[Webhook] Payment record not found for failed payment intent: ${failedPayment.id}`);
                }
                break;

            case 'checkout.session.completed':
                const session = event.data.object;
                console.log(`[Webhook] Checkout session completed: ${session.id}, Payment status: ${session.payment_status}`);

                if (session.metadata?.orderId) {
                    const paymentIntentId = typeof session.payment_intent === 'string'
                        ? session.payment_intent
                        : session.payment_intent?.id;

                    const order = await prisma.order.findFirst({
                        where: { id: session.metadata.orderId },
                        include: { payment: true }
                    });

                    if (order?.payment) {
                        const updates: any[] = [];

                        if (paymentIntentId && order.payment.stripePaymentId !== paymentIntentId) {
                            updates.push(prisma.payment.update({
                                where: { id: order.payment.id },
                                data: { stripePaymentId: paymentIntentId }
                            }));
                        }

                        if (session.payment_status === 'paid') {
                            if (order.payment.status !== OrderStatus.CONFIRMED) {
                                updates.push(prisma.payment.update({
                                    where: { id: order.payment.id },
                                    data: { status: OrderStatus.CONFIRMED }
                                }));
                            }

                            if (order.status !== OrderStatus.CONFIRMED) {
                                updates.push(prisma.order.update({
                                    where: { id: order.id },
                                    data: { status: OrderStatus.CONFIRMED }
                                }));
                            }
                        }

                        if (updates.length) {
                            console.log(`[Webhook] Applying ${updates.length} updates for order: ${order.id}`);
                            await prisma.$transaction(updates);
                            console.log(`[Webhook] Updates applied successfully for order: ${order.id}`);
                        } else {
                            console.log(`[Webhook] No updates needed for order: ${order.id}`);
                        }
                    } else {
                        console.warn(`[Webhook] Order or payment not found for session: ${session.id}`);
                    }
                } else {
                    console.warn(`[Webhook] No orderId in session metadata: ${session.id}`);
                }
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('[Webhook] Error processing webhook:', {
            message: error?.message,
            type: error?.type,
            stack: error?.stack
        });
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

/**
 * Manual Payment Confirmation Controller
 * Manually confirms payment for an order (for testing/admin purposes)
 */
export const ConfirmPaymentController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");

    const { orderId } = req.body;
    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    console.log(`[Payment] Manual payment confirmation requested for order: ${orderId}`);

    const { prisma } = await import("../db/database");
    const { OrderStatus } = await import("../schema/order.schema");

    const order = await prisma.order.findFirst({
        where: { id: orderId, userId: req.user.id },
        include: { payment: true }
    });

    if (!order) {
        console.error(`[Payment] Order not found: ${orderId}`);
        throw new ApiError(404, "Order not found");
    }

    if (!order.payment) {
        console.error(`[Payment] Payment record not found for order: ${orderId}`);
        throw new ApiError(404, "Payment record not found");
    }

    if (order.status === OrderStatus.CONFIRMED) {
        console.log(`[Payment] Order ${orderId} already confirmed`);
        return res.status(200).json(
            new ApiResponse({
                order,
                message: "Order already confirmed"
            })
        );
    }

    console.log(`[Payment] Confirming payment for order: ${orderId}`);

    await prisma.$transaction([
        prisma.payment.update({
            where: { id: order.payment.id },
            data: { status: OrderStatus.CONFIRMED }
        }),
        prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.CONFIRMED }
        })
    ]);

    console.log(`[Payment] Order ${orderId} confirmed successfully`);

    const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            name: true,
                            images: true
                        }
                    }
                }
            },
            payment: true
        }
    });

    res.status(200).json(
        new ApiResponse({
            order: updatedOrder,
            message: "Payment confirmed successfully"
        })
    );
});

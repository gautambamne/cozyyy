import type { Request, Response } from 'express';
import ApiError from "../advices/ApiError";
import ApiResponse from "../advices/ApiResponse";
import { OrderRepository } from "../repositories/order.repositories";
import { CartRepository } from "../repositories/cart.repositories";
import { AddressRepository } from "../repositories/address.repositories";
import asyncHandler from "../utils/asynchandler";
import { zodErrorFormatter } from "../utils/error-formater";
import { createPaymentIntent } from "../utils/stripe";
import { PaymentMethod } from "../schema/order.schema";
import {
    CreateOrderSchema,
    UpdateOrderSchema,
    GetOrderQuerySchema,
    GetOrderSchema,
    CancelOrderSchema
} from "../schema/order.schema";

/**
 * Create Order Controller
 * Creates a new order from user's cart items
 */
export const CreateOrderController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");

    const result = CreateOrderSchema.safeParse(req.body);
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const { addressId, paymentMethod } = result.data;
    const userId = req.user.id;

    console.log(`[Order] Creating order for user: ${userId}, Address: ${addressId}, Payment method: ${paymentMethod}`);

    // Verify address exists and belongs to user
    const address = await AddressRepository.getAddressById(addressId, userId);
    if (!address) {
        console.error(`[Order] Address not found: ${addressId} for user: ${userId}`);
        throw new ApiError(404, "Delivery address not found");
    }

    console.log(`[Order] Address verified - ${address.city}, ${address.state}`);

    // Check if cart has items
    const { items, summary } = await CartRepository.getAllCartItems({
        userId,
        includeInactiveProducts: false
    });

    if (!items.length) {
        console.error(`[Order] Cart is empty for user: ${userId}`);
        throw new ApiError(400, "Cart is empty");
    }

    console.log(`[Order] Cart validated - Items: ${items.length}, Subtotal: ${summary.subtotal}, Total: ${summary.total}`);

    // Verify product availability and stock
    console.log(`[Order] Validating ${items.length} products for availability and stock`);
    for (const item of items) {
        if (!item.product.isActive) {
            console.error(`[Order] Product inactive: ${item.product.name} (ID: ${item.productId})`);
            throw new ApiError(400, `Product ${item.product.name} is no longer available`);
        }
        if (item.product.stock < item.quantity) {
            console.error(`[Order] Insufficient stock for ${item.product.name} - Required: ${item.quantity}, Available: ${item.product.stock}`);
            throw new ApiError(400, `Only ${item.product.stock} units of ${item.product.name} available`);
        }
    }
    console.log(`[Order] All products validated successfully`);

    // Create order
    console.log(`[Order] Creating order in database for user: ${userId}`);
    
    try {
        const order = await OrderRepository.createOrder({
            userId,
            addressId,
            paymentMethod
        });

        console.log(`[Order] Order created successfully - Order ID: ${order.id}, Status: ${order.status}, Total: ${order.total}`);

        // If payment method is CARD, create Stripe payment intent automatically
        let paymentIntent = null;
        if (paymentMethod === PaymentMethod.CARD && order.payment) {
            try {
                console.log(`[Order] Creating Stripe payment intent for order: ${order.id}, Amount: ${order.total} INR`);
                paymentIntent = await createPaymentIntent(
                    order.total,
                    'inr',
                    {
                        userId,
                        orderId: order.id,
                    }
                );

                // Update payment record with Stripe payment ID
                const { prisma } = await import("../db/database");
                await prisma.payment.update({
                    where: { id: order.payment.id },
                    data: { stripePaymentId: paymentIntent.id }
                });

                console.log(`[Order] Stripe payment intent created successfully: ${paymentIntent.id} for order: ${order.id}`);
            } catch (stripeError: any) {
                console.error(`[Order] Failed to create Stripe payment intent: ${stripeError.message}`);
                // Don't fail the order creation - order is already created
                // Payment intent can be created later via the payment endpoint if needed
            }
        }

        const responseData = new ApiResponse({
            order: {
                ...order,
                payment: order.payment ? {
                    ...order.payment,
                    stripePaymentId: paymentIntent?.id || order.payment.stripePaymentId
                } : null
            },
            ...(paymentIntent && {
                paymentIntent: {
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id,
                    amount: order.total,
                    currency: paymentIntent.currency
                }
            }),
            message: paymentMethod === PaymentMethod.CARD && paymentIntent
                ? "Order placed successfully. Please complete the payment."
                : "Order placed successfully"
        });

        console.log(`[Order] Sending response to frontend - Order ID: ${order.id}`);
        
        res.status(201).json(responseData);
    } catch (error: any) {
        console.error(`[Order] Failed to create order: ${error.message}`);
        throw new ApiError(500, `Failed to create order: ${error.message}`);
    }
});

/**
 * Get Orders Controller
 * Retrieves user's orders with pagination and filters
 */
export const GetOrdersController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");

    const result = GetOrderQuerySchema.safeParse(req.query);
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const { page, limit, status, startDate, endDate } = result.data;
    const userId = req.user.id;

    const { orders, pagination } = await OrderRepository.getAllOrders({
        userId,
        page,
        limit,
        status,
        startDate,
        endDate
    });

    res.status(200).json(
        new ApiResponse({
            orders,
            pagination,
            message: "Orders retrieved successfully"
        })
    );
});

/**
 * Get Order Details Controller
 * Retrieves details of a specific order
 */
export const GetOrderDetailsController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");

    const result = GetOrderSchema.safeParse(req.params);
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const { id } = result.data;
    const userId = req.user.id;

    const order = await OrderRepository.getOrderById(id, userId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    res.status(200).json(
        new ApiResponse({
            order,
            message: "Order details retrieved successfully"
        })
    );
});

/**
 * Update Order Status Controller
 * Updates the status of an order
 * Note: This should be restricted to admin/vendor roles
 */
export const UpdateOrderStatusController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");
    // TODO: Add role check for VENDOR/ADMIN

    const paramResult = GetOrderSchema.safeParse(req.params);
    const bodyResult = UpdateOrderSchema.safeParse(req.body);

    if (!paramResult.success || !bodyResult.success) {
        const error = paramResult.success ? bodyResult.error : paramResult.error;
        throw new ApiError(400, "Validation Error", error ? zodErrorFormatter(error) : undefined);
    }

    const { id } = paramResult.data;
    const { status } = bodyResult.data;

    console.log(`[Order] Updating order status - Order ID: ${id}, New status: ${status}, Updated by: ${req.user.id}`);
    const order = await OrderRepository.updateOrderStatus(id, status);

    console.log(`[Order] Order ${id} status updated successfully from ${order.status} to ${status}`);

    res.status(200).json(
        new ApiResponse({
            order,
            message: "Order status updated successfully"
        })
    );
});

/**
 * Cancel Order Controller
 * Cancels an order and restores product stock
 */
export const CancelOrderController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");

    const paramResult = GetOrderSchema.safeParse(req.params);
    const bodyResult = CancelOrderSchema.safeParse(req.body);

    if (!paramResult.success || !bodyResult.success) {
        throw new ApiError(400, "Validation Error",
            paramResult.success && bodyResult.error ? zodErrorFormatter(bodyResult.error) : undefined
        );
    }

    const { id } = paramResult.data;
    const userId = req.user.id;

    // Verify order exists and belongs to user
    console.log(`[Order] Cancelling order: ${id} for user: ${userId}`);
    const existingOrder = await OrderRepository.getOrderById(id, userId);
    if (!existingOrder) {
        console.error(`[Order] Order not found: ${id} for user: ${userId}`);
        throw new ApiError(404, "Order not found");
    }

    if (!['PENDING', 'CONFIRMED'].includes(existingOrder.status)) {
        console.error(`[Order] Cannot cancel order ${id} - Current status: ${existingOrder.status}`);
        throw new ApiError(400, "Order cannot be cancelled");
    }

    console.log(`[Order] Order ${id} eligible for cancellation - Items: ${existingOrder.items.length}, Total: ${existingOrder.total}`);
    const cancelledOrder = await OrderRepository.cancelOrder(id, userId);

    console.log(`[Order] Order ${id} cancelled successfully - Stock restored for ${existingOrder.items.length} items`);

    res.status(200).json(
        new ApiResponse({
            order: cancelledOrder,
            message: "Order cancelled successfully"
        })
    );
});

/**
 * Get Order Summary Controller
 * Retrieves order statistics for a user
 */
export const GetOrderSummaryController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new ApiError(401, "Unauthorized");

    const userId = req.user.id;
    const summary = await OrderRepository.getOrderSummary(userId);

    res.status(200).json(
        new ApiResponse({
            summary,
            message: "Order summary retrieved successfully"
        })
    );
});

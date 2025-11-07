import type { Request, Response } from 'express';
import ApiError from "../advices/ApiError";
import ApiResponse from "../advices/ApiResponse";
import { OrderRepository } from "../repositories/order.repositories";
import { CartRepository } from "../repositories/cart.repositories";
import { AddressRepository } from "../repositories/address.repositories";
import asyncHandler from "../utils/asynchandler";
import { zodErrorFormatter } from "../utils/error-formater";
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

    // Verify address exists and belongs to user
    const address = await AddressRepository.getAddressById(addressId, userId);
    if (!address) {
        throw new ApiError(404, "Delivery address not found");
    }

    // Check if cart has items
    const { items, summary } = await CartRepository.getAllCartItems({
        userId,
        includeInactiveProducts: false
    });

    if (!items.length) {
        throw new ApiError(400, "Cart is empty");
    }

    // Verify product availability and stock
    for (const item of items) {
        if (!item.product.isActive) {
            throw new ApiError(400, `Product ${item.product.name} is no longer available`);
        }
        if (item.product.stock < item.quantity) {
            throw new ApiError(400, `Only ${item.product.stock} units of ${item.product.name} available`);
        }
    }

    // Create order
    const order = await OrderRepository.createOrder({
        userId,
        addressId,
        paymentMethod
    });

    res.status(201).json(
        new ApiResponse({
            order,
            message: "Order placed successfully"
        })
    );
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

    const order = await OrderRepository.updateOrderStatus(id, status);

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
    const existingOrder = await OrderRepository.getOrderById(id, userId);
    if (!existingOrder) {
        throw new ApiError(404, "Order not found");
    }

    if (!['PENDING', 'CONFIRMED'].includes(existingOrder.status)) {
        throw new ApiError(400, "Order cannot be cancelled");
    }

    const cancelledOrder = await OrderRepository.cancelOrder(id, userId);

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

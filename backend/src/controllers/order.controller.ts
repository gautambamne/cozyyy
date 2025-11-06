import type { Request, Response } from 'express';
import { zodErrorFormatter } from '../utils/error-formater';
import ApiError from '../advices/ApiError';
import ApiResponse from '../advices/ApiResponse';
import { OrderRepository } from '../repositories/order.repositories';
import { ProductRepository } from '../repositories/product.repositories';
import { AddressRepository } from '../repositories/address.repositories';
import { CartRepository } from '../repositories/cart.repositories';
import asyncHandler from '../utils/asynchandler';
import {
    CreateOrderSchema,
    GetOrdersQuerySchema,
    GetOrderSchema,
    UpdateOrderStatusSchema,
    UpdateOrderPaymentStatusSchema,
} from '../schema/order.schema';

/**
 * Create Order Controller
 * Creates a new order from the user's cart
 */
export const CreateOrderController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const result = CreateOrderSchema.safeParse(req.body);
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const { addressId, paymentMethod } = result.data;
    const userId = req.user.id;

    // Get cart items
    const { items, summary } = await CartRepository.getAllCartItems({ userId });
    if (!items.length) {
        throw new ApiError(400, "Cart is empty");
    }

    // Verify address exists and belongs to user
    const address = await AddressRepository.getAddressById(addressId, userId);
    if (!address) {
        throw new ApiError(404, "Delivery address not found");
    }

    // Validate products and prepare order items
    const cartItems = await Promise.all(
        items.map(async (item) => {
            const product = await ProductRepository.getProductById(item.productId);
            if (!product) {
                throw new ApiError(404, `Product not found: ${item.productId}`);
            }
            if (!product.isActive) {
                throw new ApiError(400, `Product ${product.name} is not available`);
            }
            if (product.stock < item.quantity) {
                throw new ApiError(400, `Only ${product.stock} units of ${product.name} available`);
            }

            const price = product.salePrice || product.price;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price
            };
        })
    );

    try {
        // Create order from cart items
        const order = await OrderRepository.createOrder({
            userId,
            addressId,
            paymentMethod: paymentMethod || 'CASH_ON_DELIVERY'
        });

        // Update product stock and clear cart after successful order creation
        await Promise.all([
            ...cartItems.map(item => 
                ProductRepository.updateProductStock(item.productId, -item.quantity)
            ),
            CartRepository.clearCart(userId)
        ]);

        res.status(201).json(
            new ApiResponse({
                order,
                message: "Order created successfully"
            })
        );
    } catch (error) {
        // If order creation fails, don't update stock or clear cart
        throw new ApiError(500, "Failed to create order. Please try again.");
    }
});

/**
 * Get Orders Controller
 * Retrieves orders with pagination and filters
 */
export const GetOrdersController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const result = GetOrdersQuerySchema.safeParse(req.query);
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const { page, limit, status } = result.data;
    const userId = req.user.id;

    const { orders, pagination } = await OrderRepository.getAllOrders({
        userId,
        status,
        page,
        limit
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
 * Retrieves detailed information about a specific order
 */
export const GetOrderDetailsController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated");
    }

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
 * Updates the status of an order (Admin/Vendor only)
 */
export const UpdateOrderStatusController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id || !req.user?.roles?.includes('VENDOR')) {
        throw new ApiError(403, "Unauthorized access");
    }

    const paramResult = GetOrderSchema.safeParse(req.params);
    const bodyResult = UpdateOrderStatusSchema.safeParse(req.body);

    if (!paramResult.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(paramResult.error));
    }
    if (!bodyResult.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(bodyResult.error));
    }

    const { id } = paramResult.data;
    const { status } = bodyResult.data;

    // Verify order exists
    const existingOrder = await OrderRepository.getOrderById(id);
    if (!existingOrder) {
        throw new ApiError(404, "Order not found");
    }

    // Prevent invalid status transitions
    if (!isValidStatusTransition(existingOrder.status, status)) {
        throw new ApiError(400, `Cannot update order status from ${existingOrder.status} to ${status}`);
    }

    const updatedOrder = await OrderRepository.updateOrderStatus(id, status);

    res.status(200).json(
        new ApiResponse({
            order: updatedOrder,
            message: "Order status updated successfully"
        })
    );
});

/**
 * Update Payment Status Controller
 * Updates the payment status of an order (Admin/Vendor only)
 */
export const UpdatePaymentStatusController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id || !req.user?.roles?.includes('VENDOR')) {
        throw new ApiError(403, "Unauthorized access");
    }

    const paramResult = GetOrderSchema.safeParse(req.params);
    const bodyResult = UpdateOrderPaymentStatusSchema.safeParse(req.body);

    if (!paramResult.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(paramResult.error));
    }
    if (!bodyResult.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(bodyResult.error));
    }

    const { id } = paramResult.data;
    const { paymentStatus } = bodyResult.data;

    const order = await OrderRepository.updateOrderPaymentStatus(id, paymentStatus);

    res.status(200).json(
        new ApiResponse({
            order,
            message: "Payment status updated successfully"
        })
    );
});

/**
 * Get Order Statistics Controller
 * Retrieves order statistics (Admin/Vendor only)
 */
export const GetOrderStatsController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id || !req.user?.roles?.includes('VENDOR')) {
        throw new ApiError(403, "Unauthorized access");
    }

    const stats = await OrderRepository.getOrderStats();

    res.status(200).json(
        new ApiResponse({
            stats,
            message: "Order statistics retrieved successfully"
        })
    );
});

/**
 * Get Recent Orders Controller
 * Retrieves user's recent orders
 */
export const GetRecentOrdersController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const userId = req.user.id;
    const orders = await OrderRepository.getRecentOrders(userId);

    res.status(200).json(
        new ApiResponse({
            orders,
            message: "Recent orders retrieved successfully"
        })
    );
});

// Helper function to validate order status transitions
const isValidStatusTransition = (currentStatus: string, newStatus: string): boolean => {
    const transitions: Record<string, string[]> = {
        'PENDING': ['CONFIRMED', 'CANCELLED'],
        'CONFIRMED': ['SHIPPED', 'CANCELLED'],
        'SHIPPED': ['DELIVERED', 'CANCELLED'],
        'DELIVERED': [],
        'CANCELLED': []
    };

    return transitions[currentStatus]?.includes(newStatus) || false;
};

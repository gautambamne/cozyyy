import { z } from 'zod';

export const OrderStatus = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
} as const;

export const PaymentMethod = {
    COD: 'COD',
    CARD: 'CARD',
    ONLINE: 'ONLINE'
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

// Create Order Schema
const CreateOrderSchema = z.object({
    addressId: z.string().uuid('Invalid address ID'),
    paymentMethod: z.enum(['COD', 'CARD', 'ONLINE'])
        .describe('Payment method for the order')
});

// Update Order Schema (for status updates)
const UpdateOrderSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
        .describe('Current status of the order')
});

// Get Order Query Schema
const GetOrderQuerySchema = z.object({
    page: z.string()
        .optional()
        .transform((val) => val ? parseInt(val) : 1)
        .refine((val) => val > 0, 'Page must be greater than 0'),
    limit: z.string()
        .optional()
        .transform((val) => val ? parseInt(val) : 10)
        .refine((val) => val > 0 && val <= 50, 'Limit must be between 1 and 50'),
    status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
        .optional(),
    startDate: z.string()
        .optional()
        .transform((val) => val ? new Date(val) : undefined)
        .refine(
            (date) => !date || !isNaN(date.getTime()),
            'Invalid start date format'
        ),
    endDate: z.string()
        .optional()
        .transform((val) => val ? new Date(val) : undefined)
        .refine(
            (date) => !date || !isNaN(date.getTime()),
            'Invalid end date format'
        )
});

// Get Single Order Schema
const GetOrderSchema = z.object({
    id: z.string().uuid('Invalid order ID')
});

// Cancel Order Schema
const CancelOrderSchema = z.object({
    id: z.string().uuid('Invalid order ID'),
    reason: z.string()
        .min(10, 'Cancellation reason must be at least 10 characters')
        .max(500, 'Cancellation reason cannot exceed 500 characters')
});

// Order Item Response Schema
const OrderItemResponseSchema = z.object({
    id: z.string().uuid(),
    productId: z.string().uuid(),
    product: z.object({
        name: z.string(),
        images: z.array(z.string())
    }).optional()
});

// Payment Response Schema
const PaymentResponseSchema = z.object({
    id: z.string().uuid(),
    amount: z.number(),
    currency: z.string(),
    paymentMethod: z.enum(['COD', 'CARD', 'ONLINE']),
    stripePaymentId: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
});

// Order Response Schema
const OrderResponseSchema = z.object({
    id: z.string().uuid(),
    orderNumber: z.string(),
    addressId: z.string().uuid(),
    total: z.number(),
    status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    createdAt: z.date(),
    updatedAt: z.date(),
    items: z.array(OrderItemResponseSchema),
    payment: PaymentResponseSchema.optional()
});

// Order List Response Schema
const OrderListResponseSchema = z.object({
    orders: z.array(OrderResponseSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number()
    })
});

// Order Summary Schema
const OrderSummarySchema = z.object({
    total: z.number(),
    pending: z.number(),
    confirmed: z.number(),
    shipped: z.number(),
    delivered: z.number(),
    cancelled: z.number(),
    todayOrders: z.number(),
    thisWeekOrders: z.number(),
    thisMonthOrders: z.number()
});

export {
    CreateOrderSchema,
    UpdateOrderSchema,
    GetOrderQuerySchema,
    GetOrderSchema,
    CancelOrderSchema,
    OrderItemResponseSchema,
    PaymentResponseSchema,
    OrderResponseSchema,
    OrderListResponseSchema,
    OrderSummarySchema
};

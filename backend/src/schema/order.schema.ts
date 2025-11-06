import { z } from 'zod';

// Payment Method Enum
const PaymentMethodEnum = z.enum([
    'CASH_ON_DELIVERY',
    'ONLINE_PAYMENT',
    'BANK_TRANSFER'
]);

// Order Status Enum - matching Prisma OrderStatus
const OrderStatusEnum = z.enum([
    'PENDING',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
]);

// Payment Status Values
const PaymentStatusEnum = z.enum([
    'PENDING',
    'PROCESSING',
    'PAID',
    'FAILED',
    'REFUNDED'
]);

// Create Order Schema
const CreateOrderSchema = z.object({
    addressId: z.string()
        .uuid('Invalid address ID format'),
    paymentMethod: z.string()
        .optional()
        .default('CASH_ON_DELIVERY')
        .nullable()
});

// Update Order Status Schema
const UpdateOrderStatusSchema = z.object({
    status: OrderStatusEnum
});

// Update Order Payment Status Schema
const UpdateOrderPaymentStatusSchema = z.object({
    paymentStatus: z.string()
});

// Get Orders Query Schema
const GetOrdersQuerySchema = z.object({
    page: z.string()
        .optional()
        .transform((val) => val ? parseInt(val) : 1)
        .refine((val) => val > 0, 'Page must be greater than 0'),
    limit: z.string()
        .optional()
        .transform((val) => val ? parseInt(val) : 12)
        .refine((val) => val > 0 && val <= 50, 'Limit must be between 1 and 50'),
    status: OrderStatusEnum
        .optional()
});

// Get Single Order Schema
const GetOrderSchema = z.object({
    id: z.string()
        .uuid('Invalid order ID format')
});

// Order Item Response Schema
const OrderItemResponseSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(),
    product: z.object({
        id: z.string().uuid(),
        name: z.string(),
        images: z.array(z.string()),
        jewelrySize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE', 'CUSTOM']).nullable(),
        vendor: z.object({
            id: z.string().uuid(),
            name: z.string(),
            email: z.string().email()
        }).optional()
    })
});

// Address Response Schema for Orders
const OrderAddressResponseSchema = z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    phone: z.string()
});

// Order Response Schema
const OrderResponseSchema = z.object({
    id: z.string().uuid(),
    orderNumber: z.string().uuid(), // Matching Prisma's @default(uuid())
    userId: z.string().uuid(),
    addressId: z.string().uuid(),
    total: z.number().nonnegative(),
    status: OrderStatusEnum,
    paymentMethod: z.string().nullable(), // Matching Prisma's String?
    paymentStatus: z.string(), // Matching Prisma's String
    notes: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    items: z.array(OrderItemResponseSchema),
    address: OrderAddressResponseSchema,
    user: z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email()
    }).optional()
});

// Order List Response Schema
const OrderListResponseSchema = z.object({
    orders: z.array(OrderResponseSchema),
    pagination: z.object({
        page: z.number().positive(),
        limit: z.number().positive(),
        total: z.number().nonnegative(),
        totalPages: z.number().positive()
    })
});

// Order Statistics Schema
const OrderStatsResponseSchema = z.object({
    total: z.number().nonnegative(),
    pending: z.number().nonnegative(),
    confirmed: z.number().nonnegative(),
    shipped: z.number().nonnegative(),
    delivered: z.number().nonnegative(),
    cancelled: z.number().nonnegative(),
    totalRevenue: z.number().nonnegative(),
    averageOrderValue: z.number().nonnegative(),
    paymentStats: z.object({
        pending: z.number().nonnegative(),
        paid: z.number().nonnegative(),
        failed: z.number().nonnegative(),
        refunded: z.number().nonnegative()
    })
});

export {
    PaymentMethodEnum,
    OrderStatusEnum,
    PaymentStatusEnum,
    CreateOrderSchema,
    UpdateOrderStatusSchema,
    UpdateOrderPaymentStatusSchema,
    GetOrdersQuerySchema,
    GetOrderSchema,
    OrderItemResponseSchema,
    OrderAddressResponseSchema,
    OrderResponseSchema,
    OrderListResponseSchema,
    OrderStatsResponseSchema
};

import { z, infer as zodInfer } from 'zod';

// Create Cart Item Schema
const CreateCartItemSchema = z.object({
    productId: z.string()
        .uuid('Invalid product ID format'),
    quantity: z.number()
        .int('Quantity must be an integer')
        .min(1, 'Quantity must be at least 1')
        .max(10, 'Maximum quantity allowed is 10')
});

// Update Cart Item Schema
const UpdateCartItemSchema = z.object({
    productId: z.string()
        .uuid('Invalid product ID format'),
    quantity: z.number()
        .int('Quantity must be an integer')
        .min(1, 'Quantity must be at least 1')
        .max(10, 'Maximum quantity allowed is 10')
});

// Get Cart Query Schema
const GetCartQuerySchema = z.object({
    page: z.string()
        .optional()
        .transform((val) => val ? parseInt(val) : 1)
        .refine((val) => val > 0, 'Page must be greater than 0'),
    limit: z.string()
        .optional()
        .transform((val) => val ? parseInt(val) : 12)
        .refine((val) => val > 0 && val <= 50, 'Limit must be between 1 and 50'),
});

// Get Single Cart Item Schema
const GetCartItemSchema = z.object({
    id: z.string()
        .uuid('Invalid cart item ID format')
});

// Delete Cart Item Schema
const DeleteCartItemSchema = z.object({
    productId: z.string()
        .uuid('Invalid product ID format')
});

// Cart Item Response Schema
const CartItemResponseSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    productId: z.string().uuid(),
    quantity: z.number().int(),
    product: z.object({
        id: z.string().uuid(),
        name: z.string(),
        price: z.number(),
        salePrice: z.number().nullable(),
        images: z.array(z.string()),
        stock: z.number().int(),
        isActive: z.boolean(),
        jewelrySize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE', 'CUSTOM']).nullable()
    })
});

// Cart List Response Schema
const CartListResponseSchema = z.object({
    items: z.array(CartItemResponseSchema),
    summary: z.object({
        subtotal: z.number(),
        discount: z.number(),
        total: z.number(),
        itemCount: z.number()
    }),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number()
    })
});

// Cart Summary Schema
const CartSummarySchema = z.object({
    subtotal: z.number(),
    discount: z.number(),
    total: z.number(),
    itemCount: z.number()
});

type ICreateCartItemSchema = zodInfer<typeof CreateCartItemSchema>;
type IUpdateCartItemSchema = zodInfer<typeof UpdateCartItemSchema>;
type IGetCartQuerySchema = zodInfer<typeof GetCartQuerySchema>;
type IGetCartItemSchema = zodInfer<typeof GetCartItemSchema>;
type IDeleteCartItemSchema = zodInfer<typeof DeleteCartItemSchema>;
type ICartItemResponseSchema = zodInfer<typeof CartItemResponseSchema>;
type ICartListResponseSchema = zodInfer<typeof CartListResponseSchema>;
type ICartSummarySchema = zodInfer<typeof CartSummarySchema>;

export type {
    ICreateCartItemSchema,
    IUpdateCartItemSchema,
    IGetCartQuerySchema,
    IGetCartItemSchema,
    IDeleteCartItemSchema,
    ICartItemResponseSchema,
    ICartListResponseSchema,
    ICartSummarySchema
};

export {
    CreateCartItemSchema,
    UpdateCartItemSchema,
    GetCartQuerySchema,
    GetCartItemSchema,
    DeleteCartItemSchema,
    CartItemResponseSchema,
    CartListResponseSchema,
    CartSummarySchema
};

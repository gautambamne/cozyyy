import { z } from 'zod';

// Create Wishlist Item Schema
const CreateWishlistItemSchema = z.object({
    productId: z.string()
        .uuid('Invalid product ID format'),
});

// Get Wishlist Query Schema
const GetWishlistQuerySchema = z.object({
    page: z.string()
        .optional()
        .transform((val) => val ? parseInt(val) : 1)
        .refine((val) => val > 0, 'Page must be greater than 0'),
    limit: z.string()
        .optional()
        .transform((val) => val ? parseInt(val) : 12)
        .refine((val) => val > 0 && val <= 50, 'Limit must be between 1 and 50'),
    sortBy: z.enum(['addedAt'])
        .optional()
        .default('addedAt'),
    sortOrder: z.enum(['asc', 'desc'])
        .optional()
        .default('desc')
});

// Get Single Wishlist Item Schema
const GetWishlistItemSchema = z.object({
    id: z.string()
        .uuid('Invalid wishlist item ID format')
});

// Delete Wishlist Item Schema
const DeleteWishlistItemSchema = z.object({
    productId: z.string()
        .uuid('Invalid product ID format')
});

// Wishlist Item Response Schema
const WishlistItemResponseSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    productId: z.string().uuid(),
    addedAt: z.date(),
});

// Wishlist List Response Schema
const WishlistListResponseSchema = z.object({
    items: z.array(WishlistItemResponseSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number()
    })
});

export {
    CreateWishlistItemSchema,
    GetWishlistQuerySchema,
    GetWishlistItemSchema,
    DeleteWishlistItemSchema,
    WishlistItemResponseSchema,
    WishlistListResponseSchema
};

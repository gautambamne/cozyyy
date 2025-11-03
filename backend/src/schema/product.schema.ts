import { z } from 'zod';

// Create Product Schema
const CreateProductSchema = z.object({
    name: z.string()
      .min(1, 'Product name is required')
      .max(200, 'Product name too long')
      .trim(),
    jewelrySize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE', 'CUSTOM'])
      .optional(),
    description: z.string()
      .min(1, 'Product description is required')
      .max(2000, 'Product description too long')
      .trim(),
    price: z.number()
      .positive('Price must be greater than 0')
      .max(999999.99, 'Price too high'),
    salePrice: z.number()
      .positive('Sale price must be greater than 0')
      .max(999999.99, 'Sale price too high')
      .optional()
      .nullable(),
    stock: z.number()
      .int('Stock must be a whole number')
      .min(0, 'Stock cannot be negative')
      .default(0),
    images: z.array(z.string().url('Invalid image URL'))
      .min(1, 'At least one image is required')
      .max(10, 'Maximum 10 images allowed'),
    categoryId: z.string()
      .uuid('Invalid category ID format'),
    isActive: z.boolean()
      .default(true)
});

// Update Product Schema
const UpdateProductSchema = z.object({
    name: z.string()
      .min(1, 'Product name is required')
      .max(200, 'Product name too long')
      .trim()
      .optional(),
    jewelrySize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE', 'CUSTOM'])
      .optional(),
    description: z.string()
      .min(1, 'Product description is required')
      .max(2000, 'Product description too long')
      .trim()
      .optional(),
    price: z.number()
      .positive('Price must be greater than 0')
      .max(999999.99, 'Price too high')
      .optional(),
    salePrice: z.number()
      .positive('Sale price must be greater than 0')
      .max(999999.99, 'Sale price too high')
      .optional(),
    stock: z.number()
      .int('Stock must be a whole number')
      .min(0, 'Stock cannot be negative')
      .optional(),
    images: z.array(z.string().url('Invalid image URL'))
      .min(1, 'At least one image is required')
      .max(10, 'Maximum 10 images allowed')
      .optional(),
    categoryId: z.string()
      .uuid('Invalid category ID format')
      .optional(),
    isActive: z.boolean().optional(),
}).refine((data) => {
    // At least one field must be provided for update
    return data.name || data.description || data.jewelrySize !== undefined || data.price !== undefined ||
           data.salePrice !== undefined || data.stock !== undefined || data.images ||
           data.categoryId || data.isActive !== undefined;
}, {
    message: 'At least one field must be provided for update',
});

// Get Products Query Schema
const GetProductsQuerySchema = z.object({
    page: z.string()
      .optional()
      .transform((val) => val ? parseInt(val) : 1)
      .refine((val) => val > 0, 'Page must be greater than 0'),
    limit: z.string()
      .optional()
      .transform((val) => val ? parseInt(val) : 12)
      .refine((val) => val > 0 && val <= 50, 'Limit must be between 1 and 50'),
    search: z.string()
      .optional()
      .transform((val) => val?.trim() || ''),
    categoryId: z.string()
      .uuid('Invalid category ID format')
      .optional(),
    minPrice: z.string()
      .optional()
      .transform((val) => val ? parseFloat(val) : undefined)
      .refine((val) => val === undefined || val >= 0, 'Minimum price cannot be negative'),
    maxPrice: z.string()
      .optional()
      .transform((val) => val ? parseFloat(val) : undefined)
      .refine((val) => val === undefined || val >= 0, 'Maximum price cannot be negative'),
    isActive: z.string()
      .optional()
      .transform((val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      }),
    sortBy: z.enum(['name', 'price', 'createdAt', 'stock', 'jewelrySize'])
      .optional()
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc'])
      .optional()
      .default('desc'),
});

// Get Single Product Schema (for path parameters)
const GetProductSchema = z.object({
    id: z.string()
      .uuid('Invalid product ID format'),
});

// Product Response Schema
const ProductResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    jewelrySize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE', 'CUSTOM']).nullable(),
    description: z.string(),
    price: z.number(),
    salePrice: z.number().nullable(),
    stock: z.number(),
    images: z.array(z.string()),
    categoryId: z.string().uuid(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Products List Response Schema
const ProductsListResponseSchema = z.object({
    products: z.array(ProductResponseSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }),
    filters: z.object({
        search: z.string().optional(),
        categoryId: z.string().uuid().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        isActive: z.boolean().optional(),
    }).optional(),
});

export {
    CreateProductSchema,
    UpdateProductSchema,
    GetProductsQuerySchema,
    GetProductSchema,
    ProductResponseSchema,
    ProductsListResponseSchema,
};

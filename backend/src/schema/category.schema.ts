import { z } from 'zod';

// Create Category Schema
const CreateCategorySchema = z.object({
    name: z.string()
      .min(1, 'Category name is required')
      .max(100, 'Category name too long')
      .trim(),
    slug: z.string()
      .min(1, 'Category slug is required')
      .max(100, 'Category slug too long')
      .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
      .trim(),
    isActive: z.boolean()
});

// Update Category Schema
const UpdateCategorySchema = z.object({
    name: z.string()
      .min(1, 'Category name is required')
      .max(100, 'Category name too long')
      .trim()
      .optional(),
    slug: z.string()
      .min(1, 'Category slug is required')
      .max(100, 'Category slug too long')
      .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
      .trim()
      .optional(),
    isActive: z.boolean()
}).refine((data) => data.name || data.slug || data.isActive !== undefined, {
    message: 'At least one field (name, slug, or isActive) must be provided for update',
});

// Get Categories Query Schema
const GetCategoriesQuerySchema = z.object({
    page: z.string()
      .optional()
      .transform((val) => val ? parseInt(val) : 1)
      .refine((val) => val > 0, 'Page must be greater than 0'),
    limit: z.string()
      .optional()
      .transform((val) => val ? parseInt(val) : 10)
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    search: z.string()
      .optional()
      .transform((val) => val?.trim() || ''),
    isActive: z.string()
      .optional()
      .transform((val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      }),
});

// Get Category Schema (for getting single category by ID)
const GetCategorySchema = z.object({
    id: z.string()
      .uuid('Invalid category ID format'),
});

export {
    CreateCategorySchema,
    UpdateCategorySchema,
    GetCategoriesQuerySchema,
    GetCategorySchema,
};

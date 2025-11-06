import { z, infer as zodInfer } from 'zod';

// Create Address Schema
const CreateAddressSchema = z.object({
    street: z.string()
        .min(3, 'Street address must be at least 3 characters')
        .max(100, 'Street address cannot exceed 100 characters'),
    city: z.string()
        .min(2, 'City name must be at least 2 characters')
        .max(50, 'City name cannot exceed 50 characters'),
    state: z.string()
        .min(2, 'State name must be at least 2 characters')
        .max(50, 'State name cannot exceed 50 characters'),
    postalCode: z.string()
        .min(5, 'Postal code must be at least 5 characters')
        .max(10, 'Postal code cannot exceed 10 characters')
        .regex(/^[0-9A-Z\s-]*$/i, 'Invalid postal code format'),
    country: z.string()
        .min(2, 'Country name must be at least 2 characters')
        .max(50, 'Country name cannot exceed 50 characters'),
    phone: z.string()
        .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format. Must be between 10 and 15 digits'),
    isDefault: z.boolean()
        .default(false)
});

// Update Address Schema
const UpdateAddressSchema = CreateAddressSchema.partial();

// Get Address Query Schema
const GetAddressQuerySchema = z.object({
    page: z.string()
        .optional()
        .transform((val) => val ? parseInt(val) : 1)
        .refine((val) => val > 0, 'Page must be greater than 0'),
    limit: z.string()
        .optional()
        .transform((val) => val ? parseInt(val) : 12)
        .refine((val) => val > 0 && val <= 50, 'Limit must be between 1 and 50'),
    isDefault: z.string()
        .optional()
        .transform((val) => val === 'true')
});

// Get Single Address Schema
const GetAddressSchema = z.object({
    id: z.string()
        .uuid('Invalid address ID format')
});

// Delete Address Schema
const DeleteAddressSchema = z.object({
    id: z.string()
        .uuid('Invalid address ID format')
});

// Set Default Address Schema
const SetDefaultAddressSchema = z.object({
    id: z.string()
        .uuid('Invalid address ID format')
});

// Address Response Schema
const AddressResponseSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    phone: z.string(),
    isDefault: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
});

// Address List Response Schema
const AddressListResponseSchema = z.object({
    addresses: z.array(AddressResponseSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number()
    })
});

// Address Count Schema
const AddressCountSchema = z.object({
    total: z.number(),
    defaultAddress: z.number()
});

// Infer types from schemas
type ICreateAddressSchema = zodInfer<typeof CreateAddressSchema>;
type IUpdateAddressSchema = zodInfer<typeof UpdateAddressSchema>;
type IGetAddressQuerySchema = zodInfer<typeof GetAddressQuerySchema>;
type IGetAddressSchema = zodInfer<typeof GetAddressSchema>;
type IDeleteAddressSchema = zodInfer<typeof DeleteAddressSchema>;
type ISetDefaultAddressSchema = zodInfer<typeof SetDefaultAddressSchema>;
type IAddressResponseSchema = zodInfer<typeof AddressResponseSchema>;
type IAddressListResponseSchema = zodInfer<typeof AddressListResponseSchema>;
type IAddressCountSchema = zodInfer<typeof AddressCountSchema>;

export type {
    ICreateAddressSchema,
    IUpdateAddressSchema,
    IGetAddressQuerySchema,
    IGetAddressSchema,
    IDeleteAddressSchema,
    ISetDefaultAddressSchema,
    IAddressResponseSchema,
    IAddressListResponseSchema,
    IAddressCountSchema
};

export {
    CreateAddressSchema,
    UpdateAddressSchema,
    GetAddressQuerySchema,
    GetAddressSchema,
    DeleteAddressSchema,
    SetDefaultAddressSchema,
    AddressResponseSchema,
    AddressListResponseSchema,
    AddressCountSchema
};

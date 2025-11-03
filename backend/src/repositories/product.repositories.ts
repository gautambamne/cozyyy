import { prisma } from "../db/database"
import type { Prisma, Product } from "../generated"

export const ProductRepository = {
    createProduct: async(data: Omit<Prisma.ProductCreateInput, 'category'> & { categoryId: string }): Promise<Product> => {
        const { categoryId, ...productData } = data;
        
        const product = await prisma.product.create({
            data: {
                ...productData,
                category: {
                    connect: { id: categoryId }
                }
            }
        });
        return product;
    },
    
    getProductById: async(id: string): Promise<Product|null> => {
        const product = await prisma.product.findUnique({
            where: { id }
        });
        return product;
    },

    // Get all products with filtering and pagination
    getAllProducts: async(params: {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: string;
        minPrice?: number;
        maxPrice?: number;
        isActive?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) => {
        const {
            page = 1,
            limit = 12,
            search = "",
            categoryId,
            minPrice,
            maxPrice,
            isActive,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = params;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.ProductWhereInput = {
            AND: [
                // Search in name and description
                search ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } }
                    ]
                } : {},
                // Category filter
                categoryId ? { categoryId } : {},
                // Price range filter
                minPrice ? { price: { gte: minPrice } } : {},
                maxPrice ? { price: { lte: maxPrice } } : {},
                // Status filters
                isActive !== undefined ? { isActive } : {}
            ]
        };

        // Build order by
        // Validate sortBy field
        const validSortFields = ['name', 'price', 'createdAt', 'stock', 'jewelrySize'];
        const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        
        const orderBy: Prisma.ProductOrderByWithRelationInput = {
            [finalSortBy]: sortOrder
        };

        // Get products and total count
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limit
            }),
            prisma.product.count({ where })
        ]);

        return {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    // Update a product
    updateProductById: async(id: string, data: Prisma.ProductUpdateInput): Promise<Product> => {
        // Remove category from the update data if categoryId is provided
        const { category, categoryId, ...updateData } = data as any;

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...updateData,
                ...(categoryId && {
                    category: {
                        connect: { id: categoryId }
                    }
                })
            }
        });
        return product;
    },

    // Delete a product
    deleteProductById: async(id: string): Promise<Product> => {
        const product = await prisma.product.delete({
            where: { id }
        });
        return product;
    },

    // Get products by category ID
    getProductsByCategory: async(categoryId: string): Promise<Product[]> => {
        const products = await prisma.product.findMany({
            where: { categoryId }
        });
        return products;
    },

    // Update product stock
    updateProductStock: async(id: string, quantity: number): Promise<Product> => {
        const product = await prisma.product.update({
            where: { id },
            data: {
                stock: {
                    increment: quantity // use negative number to decrease stock
                }
            }
        });
        return product;
    }
}
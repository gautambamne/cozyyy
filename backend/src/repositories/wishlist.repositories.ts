import { prisma } from "../db/database"
import type { Prisma, WishlistItem } from "../generated"

export const WishlistRepository = {
    // Create a wishlist item with proper input validation
    createWishlistItem: async(data: { userId: string; productId: string }): Promise<WishlistItem> => {
        const wishlistItem = await prisma.wishlistItem.create({
            data: {
                user: {
                    connect: { id: data.userId }
                },
                product: {
                    connect: { id: data.productId }
                }
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        salePrice: true,
                        images: true,
                        jewelrySize: true,
                        isActive: true,
                        stock: true
                    }
                }
            }
        });
        return wishlistItem;
    },

    // Get a single wishlist item
    getWishlistItemById: async(id: string): Promise<WishlistItem|null> => {
        const wishlistItem = await prisma.wishlistItem.findUnique({
            where: { id },
            include: {
                product: true
            }
        });
        return wishlistItem;
    },

    // Check if product exists in user's wishlist
    checkWishlistItem: async(userId: string, productId: string): Promise<WishlistItem|null> => {
        const wishlistItem = await prisma.wishlistItem.findFirst({
            where: {
                userId,
                productId
            }
        });
        return wishlistItem;
    },

    // Get all wishlist items for a user with filtering and pagination
    getAllWishlistItems: async(params: {
        userId: string;
        page?: number;
        limit?: number;
        sortBy?: 'addedAt' | 'productName' | 'productPrice';
        sortOrder?: 'asc' | 'desc';
        includeInactiveProducts?: boolean;
    }) => {
        const {
            userId,
            page = 1,
            limit = 12,
            sortBy = "addedAt",
            sortOrder = "desc",
            includeInactiveProducts = false
        } = params;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build where clause for user's wishlist items
        const where: Prisma.WishlistItemWhereInput = {
            userId,
            // Only include active products by default
            ...(!includeInactiveProducts && {
                product: {
                    isActive: true
                }
            })
        };

        // Build order by based on the sort field
        const orderBy: Prisma.WishlistItemOrderByWithRelationInput = 
            sortBy === 'productName' || sortBy === 'productPrice'
                ? {
                    product: {
                        [sortBy === 'productName' ? 'name' : 'price']: sortOrder
                    }
                  }
                : {
                    addedAt: sortOrder
                  };

        // Get wishlist items and total count
        const [wishlistItems, total] = await Promise.all([
            prisma.wishlistItem.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            salePrice: true,
                            images: true,
                            jewelrySize: true,
                            isActive: true,
                            stock: true
                        }
                    }
                }
            }),
            prisma.wishlistItem.count({ where })
        ]);

        return {
            items: wishlistItems,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    // Delete a wishlist item
    deleteWishlistItem: async(data: { userId: string; productId: string }): Promise<WishlistItem> => {
        const wishlistItem = await prisma.wishlistItem.delete({
            where: {
                userId_productId: {
                    userId: data.userId,
                    productId: data.productId
                }
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return wishlistItem;
    },

    // Clear entire wishlist for a user with validation
    clearWishlist: async(userId: string): Promise<{
        count: number;
    }> => {
        const result = await prisma.wishlistItem.deleteMany({
            where: {
                userId,
                product: {
                    isActive: true
                }
            }
        });

        return {
            count: result.count
        };
    }
}

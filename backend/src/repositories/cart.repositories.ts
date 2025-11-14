import { prisma } from "../db/database"
import type { Prisma, CartItem } from "../generated"

export const CartRepository = {
    // Create a cart item with proper validation and product inclusion
    createCartItem: async(data: { userId: string; productId: string; quantity: number }): Promise<CartItem> => {
        const cartItem = await prisma.cartItem.create({
            data: {
                user: {
                    connect: { id: data.userId }
                },
                product: {
                    connect: { id: data.productId }
                },
                quantity: data.quantity
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
        return cartItem;
    },

    // Get a single cart item by ID with product details
    getCartItemById: async(id: string): Promise<CartItem|null> => {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id },
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
        return cartItem;
    },

    // Check if product exists in user's cart
    checkCartItem: async(userId: string, productId: string): Promise<CartItem|null> => {
        const cartItem = await prisma.cartItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });
        return cartItem;
    },

    // Update cart item quantity
    updateCartItemQuantity: async(data: { userId: string; productId: string; quantity: number }): Promise<CartItem> => {
        const cartItem = await prisma.cartItem.update({
            where: {
                userId_productId: {
                    userId: data.userId,
                    productId: data.productId
                }
            },
            data: {
                quantity: data.quantity
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
        return cartItem;
    },

    // Get all cart items for a user with filtering and pagination
    getAllCartItems: async(params: {
        userId: string;
        page?: number;
        limit?: number;
        includeInactiveProducts?: boolean;
    }) => {
        const {
            userId,
            page = 1,
            limit = 12,
            includeInactiveProducts = false
        } = params;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build where clause for user's cart items
        const where: Prisma.CartItemWhereInput = {
            userId,
            // Only include active products by default
            ...(!includeInactiveProducts && {
                product: {
                    isActive: true
                }
            })
        };

        // Get cart items and total count in parallel
        const [cartItems, total] = await Promise.all([
            prisma.cartItem.findMany({
                where,
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
            prisma.cartItem.count({ where })
        ]);

        // Calculate cart summary
        const summary = cartItems.reduce((acc, item) => {
            const price = item.product.salePrice || item.product.price;
            const itemTotal = price * item.quantity;
            const itemDiscount = item.product.salePrice 
                ? (item.product.price - item.product.salePrice) * item.quantity
                : 0;

            return {
                subtotal: acc.subtotal + (item.product.price * item.quantity),
                discount: acc.discount + itemDiscount,
                total: acc.total + itemTotal,
                itemCount: acc.itemCount + item.quantity
            };
        }, {
            subtotal: 0,
            discount: 0,
            total: 0,
            itemCount: 0
        });

        return {
            items: cartItems,
            summary,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    // Delete a cart item
    deleteCartItem: async(data: { userId: string; productId: string }): Promise<CartItem> => {
        const cartItem = await prisma.cartItem.delete({
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
        return cartItem;
    },

    // Clear entire cart for a user
    clearCart: async(userId: string): Promise<{
        count: number;
    }> => {
        const result = await prisma.cartItem.deleteMany({
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
};

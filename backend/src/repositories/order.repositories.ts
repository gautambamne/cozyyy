import { type Prisma } from '@prisma/client';
import { prisma } from '../db/database';
import { OrderStatus, PaymentMethod } from '../schema/order.schema';

type OrderWithDetails = Prisma.PromiseReturnType<typeof prisma.order.findFirst> & {
    items: Array<{
        id: string;
        productId: string;
        quantity: number;
        price: number;
        product: {
            name: string;
            images: string[];
        };
    }>;
    payment?: {
        id: string;
        amount: number;
        currency: string;
        paymentMethod: PaymentMethod;
        status: OrderStatus;
        stripePaymentId: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
};

export const OrderRepository = {
    // Create a new order from cart items
    createOrder: async(data: {
        userId: string;
        addressId: string;
        paymentMethod: PaymentMethod;
    }): Promise<OrderWithDetails> => {
        // Start a transaction with increased timeout
        return await prisma.$transaction(async (tx) => {
            try {
                // 1. Get user's cart items and verify stock
                const cartItems = await tx.cartItem.findMany({
                    where: {
                        userId: data.userId,
                        product: {
                            isActive: true
                        }
                    },
                    include: {
                        product: true
                    }
                });

                if (!cartItems.length) {
                    throw new Error('Cart is empty');
                }

                // Verify stock availability
                for (const item of cartItems) {
                    if (item.product.stock < item.quantity) {
                        throw new Error(`Insufficient stock for product: ${item.product.name}`);
                    }
                }

                // 2. Calculate total
                const total = cartItems.reduce((sum, item) => {
                    const price = item.product.salePrice || item.product.price;
                    return sum + (price * item.quantity);
                }, 0);

                // 3. Create the order
                const order = await tx.order.create({
                    data: {
                        user: {
                            connect: { id: data.userId }
                        },
                        address: {
                            connect: { id: data.addressId }
                        },
                        total,
                        items: {
                            create: cartItems.map(item => ({
                                product: {
                                    connect: { id: item.productId }
                                },
                                quantity: item.quantity,
                                price: item.product.salePrice || item.product.price
                            }))
                        },
                        payment: {
                            create: {
                                amount: total,
                                paymentMethod: data.paymentMethod,
                                status: OrderStatus.PENDING,
                                currency: 'INR'
                            }
                        }
                    },
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        name: true,
                                        images: true
                                    }
                                }
                            }
                        },
                        payment: true
                    }
                });

                // 4. Clear cart and update product stock in parallel
                await Promise.all([
                    // Clear cart
                    tx.cartItem.deleteMany({
                        where: {
                            userId: data.userId
                        }
                    }),
                    // Update all product stock in parallel
                    ...cartItems.map(item => 
                        tx.product.update({
                            where: { id: item.productId },
                            data: {
                                stock: {
                                    decrement: item.quantity
                                }
                            }
                        })
                    )
                ]);

                return order;
            } catch (error) {
                // Re-throw the error to be handled by the service layer
                throw error;
            }
        }, {
            timeout: 10000, // Increase timeout to 10 seconds
            maxWait: 5000 // Maximum time to wait for transaction to start
        });
    },

    // Get a single order
    getOrderById: async(orderId: string, userId?: string): Promise<OrderWithDetails | null> => {
        const where: Prisma.OrderWhereInput = {
            id: orderId,
            ...(userId && { userId })
        };

        return await prisma.order.findFirst({
            where,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                images: true
                            }
                        }
                    }
                },
                payment: true
            }
        });
    },

    // Get all orders with filtering and pagination
    getAllOrders: async(params: {
        userId: string;
        page?: number;
        limit?: number;
        status?: OrderStatus;
        startDate?: Date;
        endDate?: Date;
    }) => {
        const {
            userId,
            page = 1,
            limit = 10,
            status,
            startDate,
            endDate
        } = params;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.OrderWhereInput = {
            userId,
            ...(status && { status }),
            ...(startDate && {
                createdAt: {
                    gte: startDate,
                    ...(endDate && { lte: endDate })
                }
            })
        };

        // Get orders and total count in parallel
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    images: true
                                }
                            }
                        }
                    },
                    payment: true
                }
            }),
            prisma.order.count({ where })
        ]);

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    // Update order status
    updateOrderStatus: async(orderId: string, status: OrderStatus, userId?: string): Promise<OrderWithDetails> => {
        const where: Prisma.OrderWhereUniqueInput = { id: orderId };

        // If userId provided, verify ownership
        if (userId) {
            const order = await prisma.order.findFirst({
                where: { id: orderId, userId }
            });
            if (!order) throw new Error('Order not found');
        }

        return await prisma.order.update({
            where,
            data: { 
                status,
                payment: {
                    update: {
                        status
                    }
                }
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                images: true
                            }
                        }
                    }
                },
                payment: true
            }
        });
    },

    // Cancel order
    cancelOrder: async(orderId: string, userId?: string): Promise<OrderWithDetails> => {
        return await prisma.$transaction(async (tx) => {
            // Find the order
            const order = await tx.order.findFirst({
                where: {
                    id: orderId,
                    ...(userId && { userId }),
                    status: {
                        in: [OrderStatus.PENDING, OrderStatus.CONFIRMED]
                    }
                },
                include: {
                    items: true
                }
            });

            if (!order) {
                throw new Error('Order not found or cannot be cancelled');
            }

            // Restore product stock
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity
                        }
                    }
                });
            }

            // Update order status
            return await tx.order.update({
                where: { id: orderId },
                data: {
                    status: OrderStatus.CANCELLED,
                    payment: {
                        update: {
                            status: OrderStatus.CANCELLED
                        }
                    }
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    images: true
                                }
                            }
                        }
                    },
                    payment: true
                }
            });
        });
    },

    // Get order summary/statistics
    getOrderSummary: async(userId: string) => {
        const [
            total,
            pending,
            confirmed,
            shipped,
            delivered,
            cancelled,
            todayOrders,
            thisWeekOrders,
            thisMonthOrders
        ] = await Promise.all([
            prisma.order.count({ where: { userId } }),
            prisma.order.count({ where: { userId, status: OrderStatus.PENDING } }),
            prisma.order.count({ where: { userId, status: OrderStatus.CONFIRMED } }),
            prisma.order.count({ where: { userId, status: OrderStatus.SHIPPED } }),
            prisma.order.count({ where: { userId, status: OrderStatus.DELIVERED } }),
            prisma.order.count({ where: { userId, status: OrderStatus.CANCELLED } }),
            prisma.order.count({
                where: {
                    userId,
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            prisma.order.count({
                where: {
                    userId,
                    createdAt: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 7))
                    }
                }
            }),
            prisma.order.count({
                where: {
                    userId,
                    createdAt: {
                        gte: new Date(new Date().setDate(1))
                    }
                }
            })
        ]);

        return {
            total,
            pending,
            confirmed,
            shipped,
            delivered,
            cancelled,
            todayOrders,
            thisWeekOrders,
            thisMonthOrders
        };
    }
};

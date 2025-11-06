import { prisma } from "../db/database"
import type { Prisma, Order } from "../generated/client"
import { OrderStatus } from "../generated/client"

export const OrderRepository = {
    // Create a new order from cart items
    createOrder: async(data: {
        userId: string;
        addressId: string;
        paymentMethod?: string | null;
        notes?: string | null;
    }): Promise<Order> => {
        // Get cart items for the user
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: data.userId },
            include: {
                product: true
            }
        });

        if (!cartItems.length) {
            throw new Error('Cart is empty');
        }

        // Calculate order total
        const total = cartItems.reduce((sum, item) => 
            sum + (item.product.price * item.quantity), 0
        );

        // Create order with items from cart
        return await prisma.order.create({
            data: {
                user: { connect: { id: data.userId } },
                address: { connect: { id: data.addressId } },
                total,
                paymentMethod: data.paymentMethod || 'CASH_ON_DELIVERY',
                notes: data.notes,
                items: {
                    create: cartItems.map(item => ({
                        product: { connect: { id: item.productId } },
                        quantity: item.quantity,
                        price: item.product.price
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                images: true,
                                jewelrySize: true
                            }
                        }
                    }
                },
                address: true
            }
        });
    },

    // Get a single order with all details
    getOrderById: async(orderId: string, userId?: string): Promise<Order | null> => {
        const where: Prisma.OrderWhereInput = {
            id: orderId,
            ...(userId && { userId }) // Only include user's orders if userId is provided
        };

        return await prisma.order.findFirst({
            where,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                images: true,
                                jewelrySize: true
                            }
                        }
                    }
                },
                address: true
            }
        });
    },

    // Get order by order number
    getOrderByOrderNumber: async(orderNumber: string, userId?: string): Promise<Order | null> => {
        const where: Prisma.OrderWhereInput = {
            orderNumber,
            ...(userId && { userId })
        };

        return await prisma.order.findFirst({
            where,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                images: true,
                                jewelrySize: true
                            }
                        }
                    }
                },
                address: true
            }
        });
    },

    // Get all orders with filtering and pagination
    getAllOrders: async(params: {
        userId?: string;
        status?: OrderStatus;
        page?: number;
        limit?: number;
        startDate?: Date;
        endDate?: Date;
    }) => {
        const {
            userId,
            status,
            page = 1,
            limit = 12,
            startDate,
            endDate
        } = params;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.OrderWhereInput = {
            ...(userId && { userId }),
            ...(status && { status }),
            ...(startDate && endDate && {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            })
        };

        // Get orders and total count in parallel
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    images: true,
                                    jewelrySize: true
                                }
                            }
                        }
                    },
                    address: true
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
    updateOrderStatus: async(orderId: string, status: OrderStatus): Promise<Order> => {
        return await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                images: true,
                                jewelrySize: true
                            }
                        }
                    }
                },
                address: true
            }
        });
    },

    // Update order payment status
    updateOrderPaymentStatus: async(orderId: string, paymentStatus: string): Promise<Order> => {
        return await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                images: true,
                                jewelrySize: true
                            }
                        }
                    }
                },
                address: true
            }
        });
    },

    // Get order statistics with enhanced metrics
    getOrderStats: async(userId?: string) => {
        const where: Prisma.OrderWhereInput = userId ? { userId } : {};

        const [
            ordersStats,
            paymentStats,
            revenueStats
        ] = await Promise.all([
            // Order status stats
            prisma.order.groupBy({
                by: ['status'],
                where,
                _count: true
            }),
            // Payment status stats
            prisma.order.groupBy({
                by: ['paymentStatus'],
                where,
                _count: true
            }),
            // Revenue stats
            prisma.order.aggregate({
                where: {
                    ...where,
                    status: {
                        in: ['CONFIRMED', 'SHIPPED', 'DELIVERED']
                    }
                },
                _sum: { total: true },
                _avg: { total: true }
            })
        ]);

        // Process order status counts
        const statusCounts = ordersStats.reduce((acc, stat) => ({
            ...acc,
            [stat.status.toLowerCase()]: stat._count
        }), {
            total: 0,
            pending: 0,
            confirmed: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        });

        // Process payment status counts
        const paymentCounts = paymentStats.reduce((acc, stat) => ({
            ...acc,
            [stat.paymentStatus.toLowerCase()]: stat._count
        }), {
            pending: 0,
            paid: 0,
            failed: 0,
            refunded: 0
        });

        return {
            ...statusCounts,
            totalRevenue: revenueStats._sum.total || 0,
            averageOrderValue: revenueStats._avg.total || 0,
            paymentStats: paymentCounts
        };
    },

    // Check if order exists
    checkOrderExists: async(orderId: string): Promise<boolean> => {
        const count = await prisma.order.count({
            where: { id: orderId }
        });
        return count > 0;
    },

    // Get recent orders
    getRecentOrders: async(userId: string, limit: number = 5): Promise<Order[]> => {
        return await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                images: true
                            }
                        }
                    }
                }
            }
        });
    }
};

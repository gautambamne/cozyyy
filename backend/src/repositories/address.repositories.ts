import { prisma } from "../db/database"
import type { Prisma, Address } from "../generated"

export const AddressRepository = {
    // Create a new address
    createAddress: async(data: {
        userId: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
        isDefault?: boolean;
    }): Promise<Address> => {
        const { userId, isDefault = false, ...addressData } = data;

        // If this is set as default, remove default from other addresses
        if (isDefault) {
            await prisma.address.updateMany({
                where: { 
                    userId,
                    isDefault: true
                },
                data: { 
                    isDefault: false 
                }
            });
        }

        // If this is the first address, make it default
        const addressCount = await prisma.address.count({
            where: { userId }
        });

        return await prisma.address.create({
            data: {
                ...addressData,
                user: {
                    connect: { id: userId }
                },
                isDefault: isDefault || addressCount === 0 // Make default if it's the first address
            }
        });
    },

    // Get a single address
    getAddressById: async(addressId: string, userId?: string): Promise<Address | null> => {
        const where: Prisma.AddressWhereInput = {
            id: addressId,
            ...(userId && { userId }) // Only include user's addresses if userId is provided
        };

        return await prisma.address.findFirst({ where });
    },

    // Get all addresses for a user with filtering and pagination
    getAllAddresses: async(params: {
        userId: string;
        page?: number;
        limit?: number;
        isDefault?: boolean;
    }) => {
        const {
            userId,
            page = 1,
            limit = 12,
            isDefault
        } = params;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.AddressWhereInput = {
            userId,
            ...(isDefault !== undefined && { isDefault })
        };

        // Get addresses and total count in parallel
        const [addresses, total] = await Promise.all([
            prisma.address.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { isDefault: 'desc' }, // Default addresses first
                    { createdAt: 'desc' }  // Then by creation date
                ]
            }),
            prisma.address.count({ where })
        ]);

        return {
            addresses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    // Update address
    updateAddress: async(addressId: string, data: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
        phone?: string;
        isDefault?: boolean;
    }, userId?: string): Promise<Address> => {
        const { isDefault, ...addressData } = data;

        // If setting as default, remove default from other addresses
        if (isDefault) {
            await prisma.address.updateMany({
                where: { 
                    userId,
                    isDefault: true,
                    NOT: {
                        id: addressId
                    }
                },
                data: { 
                    isDefault: false 
                }
            });
        }

        return await prisma.address.update({
            where: { id: addressId },
            data: {
                ...addressData,
                ...(isDefault !== undefined && { isDefault })
            }
        });
    },

    // Set address as default
    setDefaultAddress: async(addressId: string, userId: string): Promise<Address> => {
        // Remove default from all other addresses
        await prisma.address.updateMany({
            where: { 
                userId,
                isDefault: true,
                NOT: {
                    id: addressId
                }
            },
            data: { 
                isDefault: false 
            }
        });

        // Set the specified address as default
        return await prisma.address.update({
            where: { id: addressId },
            data: { isDefault: true }
        });
    },

    // Delete address
    deleteAddress: async(addressId: string, userId?: string): Promise<Address> => {
        const where: Prisma.AddressWhereInput = {
            id: addressId,
            ...(userId && { userId })
        };

        const address = await prisma.address.findFirst({ where });

        if (!address) {
            throw new Error('Address not found');
        }

        // If deleting default address, set another address as default if exists
        if (address.isDefault) {
            const nextAddress = await prisma.address.findFirst({
                where: {
                    userId: address.userId,
                    NOT: {
                        id: addressId
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            if (nextAddress) {
                await prisma.address.update({
                    where: { id: nextAddress.id },
                    data: { isDefault: true }
                });
            }
        }

        return await prisma.address.delete({
            where: { id: addressId }
        });
    },

    // Get address statistics
    getAddressStats: async(userId: string) => {
        const [total, defaultAddress] = await Promise.all([
            prisma.address.count({
                where: { userId }
            }),
            prisma.address.count({
                where: {
                    userId,
                    isDefault: true
                }
            })
        ]);

        return {
            total,
            defaultAddress
        };
    },

    // Get default address
    getDefaultAddress: async(userId: string): Promise<Address | null> => {
        return await prisma.address.findFirst({
            where: {
                userId,
                isDefault: true
            }
        });
    }
};

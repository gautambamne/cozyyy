import type { Request, Response } from 'express';
import { zodErrorFormatter } from '../utils/error-formater';
import ApiError from '../advices/ApiError';
import ApiResponse from '../advices/ApiResponse';
import { AddressRepository } from '../repositories/address.repositories';
import asyncHandler from '../utils/asynchandler';
import {
    CreateAddressSchema,
    UpdateAddressSchema,
    GetAddressQuerySchema,
    GetAddressSchema,
    DeleteAddressSchema,
    SetDefaultAddressSchema
} from '../schema/address.schema';

/**
 * Create Address Controller
 * Handles creating new delivery addresses for users
 */
export const CreateAddressController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const result = CreateAddressSchema.safeParse(req.body);
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const addressData = result.data;
    const userId = req.user.id;

    const address = await AddressRepository.createAddress({
        userId,
        ...addressData
    });

    res.status(201).json(
        new ApiResponse({
            address,
            message: "Address created successfully"
        })
    );
});

/**
 * Get Addresses Controller
 * Retrieves user's addresses with pagination and filters
 */
export const GetAddressesController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const result = GetAddressQuerySchema.safeParse(req.query);
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const { page, limit, isDefault } = result.data;
    const userId = req.user.id;

    const { addresses, pagination } = await AddressRepository.getAllAddresses({
        userId,
        page,
        limit,
        isDefault
    });

    res.status(200).json(
        new ApiResponse({
            addresses,
            pagination,
            message: "Addresses retrieved successfully"
        })
    );
});

/**
 * Get Address Details Controller
 * Retrieves a single address with details
 */
export const GetAddressDetailsController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const result = GetAddressSchema.safeParse(req.params);
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const { id } = result.data;
    const userId = req.user.id;

    const address = await AddressRepository.getAddressById(id, userId);
    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    res.status(200).json(
        new ApiResponse({
            address,
            message: "Address details retrieved successfully"
        })
    );
});

/**
 * Update Address Controller
 * Updates an existing address
 */
export const UpdateAddressController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const paramResult = GetAddressSchema.safeParse(req.params);
    const bodyResult = UpdateAddressSchema.safeParse(req.body);

    if (!paramResult.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(paramResult.error));
    }
    if (!bodyResult.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(bodyResult.error));
    }

    const { id } = paramResult.data;
    const updateData = bodyResult.data;
    const userId = req.user.id;

    // Verify address exists and belongs to user
    const existingAddress = await AddressRepository.getAddressById(id, userId);
    if (!existingAddress) {
        throw new ApiError(404, "Address not found");
    }

    const updatedAddress = await AddressRepository.updateAddress(id, updateData, userId);

    res.status(200).json(
        new ApiResponse({
            address: updatedAddress,
            message: "Address updated successfully"
        })
    );
});

/**
 * Set Default Address Controller
 * Sets an address as the default delivery address
 */
export const SetDefaultAddressController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const result = SetDefaultAddressSchema.safeParse(req.params);
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const { id } = result.data;
    const userId = req.user.id;

    // Verify address exists and belongs to user
    const existingAddress = await AddressRepository.getAddressById(id, userId);
    if (!existingAddress) {
        throw new ApiError(404, "Address not found");
    }

    const updatedAddress = await AddressRepository.setDefaultAddress(id, userId);

    res.status(200).json(
        new ApiResponse({
            address: updatedAddress,
            message: "Address set as default successfully"
        })
    );
});

/**
 * Delete Address Controller
 * Removes an address from the user's saved addresses
 */
export const DeleteAddressController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const result = DeleteAddressSchema.safeParse(req.params);
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const { id } = result.data;
    const userId = req.user.id;

    // Verify address exists and belongs to user
    const existingAddress = await AddressRepository.getAddressById(id, userId);
    if (!existingAddress) {
        throw new ApiError(404, "Address not found");
    }

    await AddressRepository.deleteAddress(id, userId);

    res.status(200).json(
        new ApiResponse({
            message: "Address deleted successfully"
        })
    );
});

/**
 * Get Address Statistics Controller
 * Retrieves address statistics for a user
 */
export const GetAddressStatsController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const userId = req.user.id;
    const stats = await AddressRepository.getAddressStats(userId);

    res.status(200).json(
        new ApiResponse({
            stats,
            message: "Address statistics retrieved successfully"
        })
    );
});

/**
 * Get Default Address Controller
 * Retrieves the user's default delivery address
 */
export const GetDefaultAddressController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const userId = req.user.id;
    const address = await AddressRepository.getDefaultAddress(userId);

    if (!address) {
        throw new ApiError(404, "No default address found");
    }

    res.status(200).json(
        new ApiResponse({
            address,
            message: "Default address retrieved successfully"
        })
    );
});

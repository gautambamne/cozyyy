import { zodErrorFormatter } from '../utils/error-formater';
import ApiError from '../advices/ApiError';
import ApiResponse from '../advices/ApiResponse';
import { WishlistRepository } from '../repositories/wishlist.repositories';
import asyncHandler from '../utils/asynchandler';
import {
    CreateWishlistItemSchema,
    GetWishlistQuerySchema,
    DeleteWishlistItemSchema,
} from '../schema/wishlist.schema';

// Add item to wishlist
export const AddToWishlistController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, 'User not authenticated');
    }

    const result = CreateWishlistItemSchema.safeParse(req.body);
    if (!result.success) {
        throw new ApiError(400, 'Validation Error', zodErrorFormatter(result.error));
    }

    const { productId } = result.data;
    const userId = req.user.id;

    // Check if item already exists in wishlist
    const existingItem = await WishlistRepository.checkWishlistItem(userId, productId);
    if (existingItem) {
        throw new ApiError(409, 'Item already exists in wishlist');
    }

    const wishlistItem = await WishlistRepository.createWishlistItem({
        userId,
        productId,
    });

    res.status(201).json(
        new ApiResponse({
            item: wishlistItem,
            message: 'Item added to wishlist successfully',
        })
    );
});

// Get user's wishlist
export const GetWishlistController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, 'User not authenticated');
    }

    const queryResult = GetWishlistQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
        throw new ApiError(400, 'Validation Error', zodErrorFormatter(queryResult.error));
    }

    const { page, limit, sortBy, sortOrder } = queryResult.data;
    const userId = req.user.id;

    const wishlistResult = await WishlistRepository.getAllWishlistItems({
        userId,
        page,
        limit,
        sortBy: 'addedAt',
        sortOrder,
        includeInactiveProducts: false,
    });

    const { items } = wishlistResult;
    const { total } = wishlistResult.pagination;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
        new ApiResponse({
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
            message: 'Wishlist items retrieved successfully',
        })
    );
});

// Remove item from wishlist
export const RemoveFromWishlistController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, 'User not authenticated');
    }

    const result = DeleteWishlistItemSchema.safeParse(req.body);
    if (!result.success) {
        throw new ApiError(400, 'Validation Error', zodErrorFormatter(result.error));
    }

    const { productId } = result.data;
    const userId = req.user.id;

    // Check if item exists in wishlist
    const existingItem = await WishlistRepository.checkWishlistItem(userId, productId);
    if (!existingItem) {
        throw new ApiError(404, 'Item not found in wishlist');
    }

    await WishlistRepository.deleteWishlistItem({
        userId,
        productId,
    });

    res.status(200).json(
        new ApiResponse({
            message: 'Item removed from wishlist successfully',
        })
    );
});


// Clear entire wishlist
export const ClearWishlistController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, 'User not authenticated');
    }

    const userId = req.user.id;

    const { count } = await WishlistRepository.clearWishlist(userId);

    res.status(200).json(
        new ApiResponse({
            message: 'Wishlist cleared successfully',
        })
    );
});

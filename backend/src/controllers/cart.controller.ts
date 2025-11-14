import type { Request, Response } from 'express';
import ApiError from "../advices/ApiError";
import ApiResponse from "../advices/ApiResponse";
import { CartRepository } from "../repositories/cart.repositories";
import { ProductRepository } from "../repositories/product.repositories";
import {
  CreateCartItemSchema,
  UpdateCartItemSchema,
  GetCartQuerySchema,
  GetCartItemSchema,
  DeleteCartItemSchema
} from "../schema/cart.schema";
import asyncHandler from "../utils/asynchandler";
import { zodErrorFormatter } from "../utils/error-formater";

/**
 * Add to Cart Controller
 * Handles adding new items to the cart or updating quantity if item exists
 */
export const AddToCartController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new ApiError(401, "Unauthorized");
  
  const result = CreateCartItemSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { productId, quantity } = result.data;
  const userId = req.user.id;

  // Check product availability
  const product = await ProductRepository.getProductById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  if (!product.isActive) {
    throw new ApiError(400, "Product is not available");
  }
  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} items available`);
  }

  // Handle existing cart item
  const existingItem = await CartRepository.checkCartItem(userId, productId);
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > product.stock) {
      throw new ApiError(400, `Cannot add ${quantity} more items. Only ${product.stock - existingItem.quantity} more items can be added`);
    }
    if (newQuantity > 10) {
      throw new ApiError(400, "Maximum 10 items allowed per product");
    }

    const updatedItem = await CartRepository.updateCartItemQuantity({
      userId,
      productId,
      quantity: newQuantity
    });

    return res.status(200).json(
      new ApiResponse({
        cartItem: updatedItem,
        message: "Cart item quantity updated successfully"
      })
    );
  }

  // Create new cart item
  const cartItem = await CartRepository.createCartItem({
    userId,
    productId,
    quantity
  });

  res.status(201).json(
    new ApiResponse({
      cartItem,
      message: "Item added to cart successfully"
    })
  );
});

/**
 * Get Cart Controller
 * Retrieves cart items with pagination and validation
 */
export const GetCartController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new ApiError(401, "Unauthorized");

  const result = GetCartQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { page, limit } = result.data;
  const userId = req.user.id;

  const { items, summary, pagination } = await CartRepository.getAllCartItems({
    userId,
    page,
    limit
  });
  
  res.status(200).json(
    new ApiResponse({
      cart: {
        items,
        summary
      },
      pagination,
      message: "Cart retrieved successfully"
    })
  );
});

/**
 * Get Cart Item By ID Controller
 * Retrieves a single cart item by its ID with user validation
 */
export const GetCartItemByIdController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new ApiError(401, "Unauthorized");

  const result = GetCartItemSchema.safeParse(req.params);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { id } = result.data;
  const userId = req.user.id;

  const cartItem = await CartRepository.getCartItemById(id);
  
  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  // Verify the cart item belongs to the authenticated user
  if (cartItem.userId !== userId) {
    throw new ApiError(403, "Forbidden: Cart item does not belong to you");
  }

  res.status(200).json(
    new ApiResponse({
      cartItem,
      message: "Cart item retrieved successfully"
    })
  );
});

/**
 * Update Cart Item Controller
 * Updates quantity of an existing cart item
 */
export const UpdateCartItemController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new ApiError(401, "Unauthorized");

  const result = UpdateCartItemSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { productId, quantity } = result.data;
  const userId = req.user.id;

  // Validate product status
  const product = await ProductRepository.getProductById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  if (!product.isActive) {
    throw new ApiError(400, "Product is not available");
  }
  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} items available`);
  }

  // Validate cart item
  const existingItem = await CartRepository.checkCartItem(userId, productId);
  if (!existingItem) {
    throw new ApiError(404, "Item not found in cart");
  }

  const updatedItem = await CartRepository.updateCartItemQuantity({
    userId,
    productId,
    quantity
  });

  res.status(200).json(
    new ApiResponse({
      cartItem: updatedItem,
      message: "Cart item updated successfully"
    })
  );
});

/**
 * Remove from Cart Controller
 * Removes a specific item from the cart
 */
export const RemoveFromCartController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new ApiError(401, "Unauthorized");

  const result = DeleteCartItemSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { productId } = result.data;
  const userId = req.user.id;

  const existingItem = await CartRepository.checkCartItem(userId, productId);
  if (!existingItem) {
    throw new ApiError(404, "Item not found in cart");
  }

  await CartRepository.deleteCartItem({
    userId,
    productId
  });

  res.status(200).json(
    new ApiResponse({
      message: "Item removed from cart successfully"
    })
  );
});

/**
 * Clear Cart Controller
 * Removes all items from the user's cart
 */
export const ClearCartController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new ApiError(401, "Unauthorized");
  
  const userId = req.user.id;
  const { count } = await CartRepository.clearCart(userId);

  res.status(200).json(
    new ApiResponse({
      message: "Cart cleared successfully"
    })
  );
});


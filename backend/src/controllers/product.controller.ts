import ApiError from "../advices/ApiError";
import ApiResponse from "../advices/ApiResponse";
import { ProductRepository } from "../repositories/product.repositories";
import {
  CreateProductSchema,
  UpdateProductSchema,
  GetProductsQuerySchema,
  GetProductSchema,
} from "../schema/product.schema";
import asyncHandler from "../utils/asynchandler";
import { zodErrorFormatter } from "../utils/error-formater";
import { uploadToCloudinary } from "../utils/cloudinary";

// Create Product Controller
export const CreateProductController = asyncHandler(async (req, res) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }

  // Upload all images to Cloudinary
  const imageUploadPromises = (req.files as Express.Multer.File[]).map(file => 
    uploadToCloudinary(file.buffer)
  );
  
  const imageUrls = await Promise.all(imageUploadPromises);

  // Validate the product data with image URLs
  const result = CreateProductSchema.safeParse({
    ...req.body,
    images: imageUrls,
    price: parseFloat(req.body.price),
    salePrice: req.body.salePrice ? parseFloat(req.body.salePrice) : undefined,
    stock: parseInt(req.body.stock),
    isActive: req.body.isActive === 'true'
  });

  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const productData = result.data;
  const product = await ProductRepository.createProduct(productData);

  res.status(201).json(
    new ApiResponse({
      product,
      message: "Product created successfully",
    })
  );
});

// Get All Products Controller
export const GetAllProductsController = asyncHandler(async (req, res) => {
  const result = GetProductsQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { 
    page, 
    limit, 
    search, 
    categoryId, 
    minPrice, 
    maxPrice, 
    isActive,
    sortBy,
    sortOrder 
  } = result.data;

  const { products, pagination } = await ProductRepository.getAllProducts({
    page,
    limit,
    search,
    categoryId,
    minPrice,
    maxPrice,
    isActive,
    sortBy,
    sortOrder
  });

  res.status(200).json(
    new ApiResponse({
      products,
      pagination,
      message: "Products retrieved successfully",
    })
  );
});

// Get Single Product Controller
export const GetProductController = asyncHandler(async (req, res) => {
  const result = GetProductSchema.safeParse(req.params);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { id } = result.data;

  const product = await ProductRepository.getProductById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json(
    new ApiResponse({
      product,
      message: "Product retrieved successfully",
    })
  );
});

// Update Product Controller
export const UpdateProductController = asyncHandler(async (req, res) => {
  const idResult = GetProductSchema.safeParse(req.params);
  if (!idResult.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(idResult.error));
  }

  const { id } = idResult.data;

  // Check if product exists
  const existingProduct = await ProductRepository.getProductById(id);
  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  // Handle image uploads if files are present
  let imageUrls = undefined;
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const imageUploadPromises = (req.files as Express.Multer.File[]).map(file => 
      uploadToCloudinary(file.buffer)
    );
    imageUrls = await Promise.all(imageUploadPromises);
  }

  // Prepare the update data
  const updateDataRaw = {
    ...req.body,
    ...(imageUrls && { images: imageUrls }),
    ...(req.body.price && { price: parseFloat(req.body.price) }),
    ...(req.body.salePrice && { salePrice: parseFloat(req.body.salePrice) }),
    ...(req.body.stock && { stock: parseInt(req.body.stock) }),
    ...(req.body.isActive !== undefined && { isActive: req.body.isActive === 'true' })
  };

  // Validate update data
  const bodyResult = UpdateProductSchema.safeParse(updateDataRaw);
  if (!bodyResult.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(bodyResult.error));
  }

  const updateData = bodyResult.data;

  const updatedProduct = await ProductRepository.updateProductById(id, updateData);

  res.status(200).json(
    new ApiResponse({
      product: updatedProduct,
      message: "Product updated successfully",
    })
  );
});

// Delete Product Controller
export const DeleteProductController = asyncHandler(async (req, res) => {
  const result = GetProductSchema.safeParse(req.params);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { id } = result.data;

  // Check if product exists
  const existingProduct = await ProductRepository.getProductById(id);
  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  await ProductRepository.deleteProductById(id);

  res.status(200).json(
    new ApiResponse({
      message: "Product deleted successfully",
    })
  );
});

// Get Products by Category Controller
export const GetProductsByCategoryController = asyncHandler(async (req, res) => {
  const result = GetProductSchema.safeParse({ id: req.params.categoryId });
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { id: categoryId } = result.data;
  
  // Use the main products endpoint with category filter for consistent pagination and sorting
  const { products, pagination } = await ProductRepository.getAllProducts({
    categoryId,
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
    sortBy: req.query.sortBy as string || 'createdAt',
    sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    isActive: true // Only show active products by default
  });

  res.status(200).json(
    new ApiResponse({
      products,
      pagination,
      message: "Category products retrieved successfully",
    })
  );
});

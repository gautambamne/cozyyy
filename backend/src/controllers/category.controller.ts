import ApiError from "../advices/ApiError";
import ApiResponse from "../advices/ApiResponse";
import { CategoryRepository } from "../repositories/category.repositories";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  GetCategoriesQuerySchema,
  GetCategorySchema,
} from "../schema/category.schema";
import asyncHandler from "../utils/asynchandler";
import { zodErrorFormatter } from "../utils/error-formater";

// Create Category Controller
export const CreateCategoryController = asyncHandler(async (req, res) => {
  const result = CreateCategorySchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { name, slug, isActive } = result.data;

  // Check if category with same name or slug already exists
  const existingCategoryByName = await CategoryRepository.getCategoryBySlug(slug);
  if (existingCategoryByName) {
    throw new ApiError(409, `Category with slug '${slug}' already exists`);
  }

  const category = await CategoryRepository.createCategory({
    name,
    slug,
    isActive,
  });

  res.status(201).json(
    new ApiResponse({
      category,
      message: "Category created successfully",
    })
  );
});

// Get All Categories Controller
export const GetAllCategoryController = asyncHandler(async (req, res) => {
  const result = GetCategoriesQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { page, limit, search, isActive } = result.data;

  const { categories, total } = await CategoryRepository.getCategories({
    page,
    limit,
    search,
    isActive,
  });

  const totalPages = Math.ceil(total / limit);

  res.status(200).json(
    new ApiResponse({
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      message: "Categories retrieved successfully",
    })
  );
});

// Get Single Category Controller
export const GetCategoryController = asyncHandler(async (req, res) => {
  const result = GetCategorySchema.safeParse(req.params);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { id } = result.data;

  const category = await CategoryRepository.getCategoryById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  res.status(200).json(
    new ApiResponse({
      category,
      message: "Category retrieved successfully",
    })
  );
});

// Update Category Controller
export const UpdateCategoryController = asyncHandler(async (req, res) => {
  const idResult = GetCategorySchema.safeParse(req.params);
  if (!idResult.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(idResult.error));
  }

  const bodyResult = UpdateCategorySchema.safeParse(req.body);
  if (!bodyResult.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(bodyResult.error));
  }

  const { id } = idResult.data;
  const updateData = bodyResult.data;

  // Check if category exists
  const existingCategory = await CategoryRepository.getCategoryById(id);
  if (!existingCategory) {
    throw new ApiError(404, "Category not found");
  }

  // Check if slug is being updated and if it conflicts with another category
  if (updateData.slug && updateData.slug !== existingCategory.slug) {
    const categoryWithSlug = await CategoryRepository.getCategoryBySlug(updateData.slug);
    if (categoryWithSlug) {
      throw new ApiError(409, `Category with slug '${updateData.slug}' already exists`);
    }
  }

  const updatedCategory = await CategoryRepository.updateCategoryById(id, updateData);

  res.status(200).json(
    new ApiResponse({
      category: updatedCategory,
      message: "Category updated successfully",
    })
  );
});

// Delete Category Controller
export const DeleteCategoryController = asyncHandler(async (req, res) => {
  const result = GetCategorySchema.safeParse(req.params);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
  }

  const { id } = result.data;

  // Check if category exists
  const existingCategory = await CategoryRepository.getCategoryById(id);
  if (!existingCategory) {
    throw new ApiError(404, "Category not found");
  }

  const deletedCategory = await CategoryRepository.deleteCategoryById(id);

  res.status(200).json(
    new ApiResponse({
      category: deletedCategory,
      message: "Category deleted successfully",
    })
  );
});

// Get All Active Categories Controller (for dropdowns/menus)
export const GetActiveCategoriesController = asyncHandler(async (req, res) => {
  const categories = await CategoryRepository.getAllActiveCategories();

  res.status(200).json(
    new ApiResponse({
      categories,
      message: "Active categories retrieved successfully",
    })
  );
});

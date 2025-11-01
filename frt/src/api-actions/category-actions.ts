import axiosInstance from "@/lib/axios-insterceptor"
import { ICreateCategorySchema, IUpdateCategorySchema, IGetCategoriesQuerySchema, IGetCategorySchema } from "@/schema/category-schema"
import type { IGetCategoryResposne, IActiveCategory, ICategoryResponse } from "@/types/category.d"

export const CategoryAction = {
    GetCategoriesAction: async (params?: IGetCategoriesQuerySchema): Promise<IGetCategoryResposne> => {
        const queryString = params ? new URLSearchParams(params as any).toString() : '';
        const url = queryString ? `/categories?${queryString}` : '/categories';

        const response = await axiosInstance.get<ApiResponse<IGetCategoryResposne>>(url);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to fetch categories");
        }
        return response.data.data;
    },

    GetActiveCategoriesAction: async (): Promise<IActiveCategory> => {
        const response = await axiosInstance.get<ApiResponse<IActiveCategory>>("/categories/active");
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to fetch active categories");
        }
        return response.data.data;
    },

    GetCategoryAction: async (data: IGetCategorySchema): Promise<ICategoryResponse> => {
        const response = await axiosInstance.get<ApiResponse<ICategoryResponse>>(`/categories/${data.id}`);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to fetch category");
        }
        return response.data.data;
    },

    CreateCategoryAction: async (data: ICreateCategorySchema): Promise<ICategoryResponse> => {
        const response = await axiosInstance.post<ApiResponse<ICategoryResponse>>("/categories", data);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to create category");
        }
        return response.data.data;
    },

    UpdateCategoryAction: async (id: string, data: IUpdateCategorySchema): Promise<ICategoryResponse> => {
        const response = await axiosInstance.put<ApiResponse<ICategoryResponse>>(`/categories/${id}`, data);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to update category");
        }
        return response.data.data;
    },

    DeleteCategoryAction: async (data: IGetCategorySchema): Promise<IUniversalMessage> => {
        const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>(`/categories/${data.id}`);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to delete category");
        }
        return response.data.data;
    },
}

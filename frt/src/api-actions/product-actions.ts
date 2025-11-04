import axiosInstance from "@/lib/axios-insterceptor"
import { 
    ICreateProductSchema, 
    IUpdateProductSchema, 
    IGetProductsQuerySchema, 
    IGetProductSchema,
} from "@/schema/product-schema"

export const ProductAction = {
    GetProductsAction: async (params?: Partial<IGetProductsQuerySchema>): Promise<IGetProductResponse> => {
        const queryParams: Record<string, string> = {};
        
        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();
        if (params?.search) queryParams.search = params.search;
        if (params?.isActive !== undefined) queryParams.isActive = String(params.isActive);
        if (params?.sortBy) queryParams.sortBy = params.sortBy;
        if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;
        if (params?.categoryId) queryParams.categoryId = params.categoryId;

        const queryString = new URLSearchParams(queryParams).toString();
        const url = queryString ? `/products?${queryString}` : '/products';

        try {
            const response = await axiosInstance.get<ApiResponse<IGetProductResponse>>(url);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to fetch products");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to fetch products");
        }
    },

    GetProductByIdAction: async (data: IGetProductSchema): Promise<IGetProductByIdResponse> => {
        const response = await axiosInstance.get<ApiResponse<IGetProductByIdResponse>>(`/products/${data.id}`);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to fetch product");
        }
        return response.data.data;
    },

    GetProductsByCategoryAction: async (categoryId: string, params?: Omit<IGetProductsQuerySchema, 'categoryId'>): Promise<IGetProductResponse> => {
        const queryString = params ? new URLSearchParams(params as any).toString() : '';
        const url = queryString ? 
            `/products/category/${categoryId}?${queryString}` : 
            `/products/category/${categoryId}`;

        const response = await axiosInstance.get<ApiResponse<IGetProductResponse>>(url);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to fetch category products");
        }
        return response.data.data;
    },

    CreateProductAction: async (
        data: Omit<ICreateProductSchema, 'images'>, 
        files: File[]
    ): Promise<IGetProductByIdResponse> => {
        // Create FormData - DON'T validate with Zod since we're not sending the full schema
        const formData = new FormData();
        
        // Append only the fields that exist (excluding images)
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('stock', data.stock.toString());
        formData.append('categoryId', data.categoryId);
        formData.append('isActive', data.isActive.toString());
        formData.append('jewelrySize', data.jewelrySize || 'MEDIUM');
        
        // Only append salePrice if it exists and is not null
        if (data.salePrice !== null && data.salePrice !== undefined) {
            formData.append('salePrice', data.salePrice.toString());
        }

        // Append image files
        files.forEach(file => {
            formData.append('images', file);
        });

        console.log('Sending FormData with fields:');
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        const response = await axiosInstance.post<ApiResponse<IGetProductByIdResponse>>(
            "/products", 
            formData, 
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to create product");
        }
        return response.data.data;
    },

    UpdateProductAction: async (
        id: string, 
        data: Partial<Omit<IUpdateProductSchema, 'images'>>, 
        files?: File[]
    ): Promise<IGetProductByIdResponse> => {
        // Create FormData
        const formData = new FormData();
        
        // Append only the fields that are provided
        if (data.name) formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.price !== undefined) formData.append('price', data.price.toString());
        if (data.stock !== undefined) formData.append('stock', data.stock.toString());
        if (data.categoryId) formData.append('categoryId', data.categoryId);
        if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
        if (data.jewelrySize) formData.append('jewelrySize', data.jewelrySize);
        
        // Only append salePrice if it exists and is not null/undefined
        if (data.salePrice !== null && data.salePrice !== undefined) {
            formData.append('salePrice', data.salePrice.toString());
        }

        // Append image files if provided
        if (files?.length) {
            files.forEach(file => {
                formData.append('images', file);
            });
        }

        console.log('Updating with FormData fields:');
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        const response = await axiosInstance.put<ApiResponse<IGetProductByIdResponse>>(
            `/products/${id}`, 
            formData, 
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to update product");
        }
        return response.data.data;
    },

    DeleteProductAction: async (data: IGetProductSchema): Promise<IUniversalMessage> => {
        const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>(`/products/${data.id}`);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to delete product");
        }
        return response.data.data;
    },
}
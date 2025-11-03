import axiosInstance from "@/lib/axios-insterceptor"
import { 
    ICreateProductSchema, 
    IUpdateProductSchema, 
    IGetProductsQuerySchema, 
    IGetProductSchema,
    CreateProductSchema,
    UpdateProductSchema 
} from "@/schema/product-schema"

export const ProductAction = {
    GetProductsAction: async (params?: IGetProductsQuerySchema): Promise<IGetProductResponse> => {
        const queryString = params ? new URLSearchParams(params as any).toString() : '';
        const url = queryString ? `/products?${queryString}` : '/products';

        const response = await axiosInstance.get<ApiResponse<IGetProductResponse>>(url);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to fetch products");
        }
        return response.data.data;
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

    CreateProductAction: async (data: ICreateProductSchema, files: File[]): Promise<IGetProductByIdResponse> => {
        // Validate the data with Zod schema
        const validatedData = CreateProductSchema.parse(data);
        
        // Create FormData and append validated data
        const formData = new FormData();
        Object.entries(validatedData).forEach(([key, value]) => {
            if (key !== 'images') {  // Skip images as they'll be handled separately
                formData.append(key, String(value));
            }
        });

        // Append image files
        files.forEach(file => {
            formData.append('images', file);
        });

        const response = await axiosInstance.post<ApiResponse<IGetProductByIdResponse>>("/products", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Failed to create product");
        }
        return response.data.data;
    },

    UpdateProductAction: async (id: string, data: Partial<IUpdateProductSchema>, files?: File[]): Promise<IGetProductByIdResponse> => {
        // Validate the update data with Zod schema
        const validatedData = UpdateProductSchema.parse(data);
        
        // Create FormData and append validated data
        const formData = new FormData();
        Object.entries(validatedData).forEach(([key, value]) => {
            if (key !== 'images' && value !== undefined) {  // Skip images and undefined values
                formData.append(key, String(value));
            }
        });

        // Append image files if provided
        if (files?.length) {
            files.forEach(file => {
                formData.append('images', file);
            });
        }

        const response = await axiosInstance.put<ApiResponse<IGetProductByIdResponse>>(`/products/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

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

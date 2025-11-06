import axiosInstance from "@/lib/axios-insterceptor";
import { 
    ICreateCartItemSchema,
    IUpdateCartItemSchema,
    IGetCartQuerySchema,
    IDeleteCartItemSchema
} from "@/schema/cart-schema";

export const CartAction = {
    // Get user's cart with pagination
    GetCartAction: async (params?: Partial<IGetCartQuerySchema>): Promise<IGetCartResponse> => {
        const queryParams: Record<string, string> = {};
        
        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();

        const queryString = new URLSearchParams(queryParams).toString();
        const url = queryString ? `/cart?${queryString}` : '/cart';

        try {
            const response = await axiosInstance.get<ApiResponse<IGetCartResponse>>(url);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to fetch cart items");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to fetch cart items");
        }
    },

    // Add item to cart
    AddToCartAction: async (data: ICreateCartItemSchema): Promise<IAddToCartResponse> => {
        try {
            const response = await axiosInstance.post<ApiResponse<IAddToCartResponse>>("/cart/add", data);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to add item to cart");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to add item to cart");
        }
    },

    // Update cart item quantity
    UpdateCartAction: async (data: IUpdateCartItemSchema): Promise<IAddToCartResponse> => {
        try {
            const response = await axiosInstance.put<ApiResponse<IAddToCartResponse>>("/cart/update", data);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to update cart item");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to update cart item");
        }
    },

    // Remove item from cart
    RemoveFromCartAction: async (data: IDeleteCartItemSchema): Promise<IUniversalMessage> => {
        try {
            const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>("/cart/remove", {
                data: data
            });
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to remove item from cart");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to remove item from cart");
        }
    },

    // Clear entire cart
    ClearCartAction: async (): Promise<IUniversalMessage> => {
        try {
            const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>("/cart/clear");
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to clear cart");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to clear cart");
        }
    }
};

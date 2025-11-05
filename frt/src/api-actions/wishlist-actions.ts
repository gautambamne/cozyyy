import axiosInstance from "@/lib/axios-insterceptor";
import { 
    ICreateWishlistItemSchema, 
    IGetWishlistQuerySchema, 
    IDeleteWishlistItemSchema 
} from "@/schema/wishlist-schema";


export const WishlistAction = {
    // Get user's wishlist with pagination and sorting
    GetWishlistAction: async (params?: Partial<IGetWishlistQuerySchema>): Promise<IGetWishlistResponse> => {
        const queryParams: Record<string, string> = {};
        
        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();
        if (params?.sortBy) queryParams.sortBy = params.sortBy;
        if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

        const queryString = new URLSearchParams(queryParams).toString();
        const url = queryString ? `/wishlist?${queryString}` : '/wishlist';

        try {
            const response = await axiosInstance.get<ApiResponse<IGetWishlistResponse>>(url);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to fetch wishlist items");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to fetch wishlist items");
        }
    },

    // Add item to wishlist
    AddToWishlistAction: async (data: ICreateWishlistItemSchema): Promise<IAddToWishlistResponse> => {
        try {
            const response = await axiosInstance.post<ApiResponse<IAddToWishlistResponse>>("/wishlist/add", data);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to add item to wishlist");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to add item to wishlist");
        }
    },

    // Remove item from wishlist
    RemoveFromWishlistAction: async (data: IDeleteWishlistItemSchema): Promise<IUniversalMessage> => {
        try {
            const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>("/wishlist/remove", {
                data: data
            });
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to remove item from wishlist");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to remove item from wishlist");
        }
    },

    // Clear entire wishlist
    ClearWishlistAction: async (): Promise<IUniversalMessage> => {
        try {
            const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>("/wishlist/clear");
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to clear wishlist");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to clear wishlist");
        }
    }
};

import axiosInstance from "@/lib/axios-insterceptor";
import { 
    ICreateAddressSchema,
    IUpdateAddressSchema,
    IGetAddressQuerySchema,
    IGetAddressSchema,
    IDeleteAddressSchema,
    ISetDefaultAddressSchema
} from "@/schema/address-schema";


export const AddressAction = {
    // Get all addresses with pagination
    GetAddressesAction: async (params?: IGetAddressQuerySchema): Promise<IGetAddressResponse> => {
        const queryParams: Record<string, string> = {};
        
        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();
        if (params?.isDefault !== undefined) queryParams.isDefault = params.isDefault.toString();

        const queryString = new URLSearchParams(queryParams).toString();
        const url = queryString ? `/addresses?${queryString}` : '/addresses';

        try {
            const response = await axiosInstance.get<ApiResponse<IGetAddressResponse>>(url);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to fetch addresses");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to fetch addresses");
        }
    },

    // Get default address
    GetDefaultAddressAction: async (): Promise<ICreateAddressResposne> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ICreateAddressResposne>>("/addresses/default");
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to fetch default address");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to fetch default address");
        }
    },

    // Get address statistics
    GetAddressStatsAction: async (): Promise<IGetStatsResponse> => {
        try {
            const response = await axiosInstance.get<ApiResponse<IGetStatsResponse>>("/addresses/stats");
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to fetch address stats");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to fetch address stats");
        }
    },

    // Get specific address details
    GetAddressDetailsAction: async ({ id }: IGetAddressSchema): Promise<ICreateAddressResposne> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ICreateAddressResposne>>(`/addresses/${id}`);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to fetch address details");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to fetch address details");
        }
    },

    // Create new address
    CreateAddressAction: async (data: ICreateAddressSchema): Promise<ICreateAddressResposne> => {
        try {
            const response = await axiosInstance.post<ApiResponse<ICreateAddressResposne>>("/addresses", data);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to create address");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to create address");
        }
    },

    // Update address
    UpdateAddressAction: async (id: string, data: IUpdateAddressSchema): Promise<ICreateAddressResposne> => {
        try {
            const response = await axiosInstance.patch<ApiResponse<ICreateAddressResposne>>(`/addresses/${id}`, data);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to update address");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to update address");
        }
    },

    // Set address as default
    SetDefaultAddressAction: async ({ id }: ISetDefaultAddressSchema): Promise<ICreateAddressResposne> => {
        try {
            const response = await axiosInstance.patch<ApiResponse<ICreateAddressResposne>>(`/addresses/${id}/set-default`);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to set default address");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to set default address");
        }
    },

    // Delete address
    DeleteAddressAction: async ({ id }: IDeleteAddressSchema): Promise<IUniversalMessage> => {
        try {
            const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>(`/addresses/${id}`);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to delete address");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to delete address");
        }
    }
};

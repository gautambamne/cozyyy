import axiosInstance from "@/lib/axios-insterceptor";
import {
    ICreateOrderSchema,
    IUpdateOrderSchema,
    IGetOrderQuerySchema,
    IGetOrderSchema,
    ICancelOrderSchema,
} from "@/schema/order-sceham";

export const OrderAction = {
    // Get all orders with pagination and filters
    GetOrdersAction: async (params?: IGetOrderQuerySchema): Promise<IGetOrderResponse> => {
        try {
            const queryParams: Record<string, string> = {};
            
            if (params?.page) queryParams.page = params.page.toString();
            if (params?.limit) queryParams.limit = params.limit.toString();
            if (params?.status) queryParams.status = params.status;
            if (params?.startDate) queryParams.startDate = params.startDate.toISOString();
            if (params?.endDate) queryParams.endDate = params.endDate.toISOString();

            const queryString = new URLSearchParams(queryParams).toString();
            const url = queryString ? `/orders?${queryString}` : '/orders';

            const response = await axiosInstance.get<ApiResponse<IGetOrderResponse>>(url);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to fetch orders");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to fetch orders");
        }
    },

    // Get order summary/statistics
    GetOrderSummaryAction: async (): Promise<IGetSummaryResposne> => {
        try {
            const response = await axiosInstance.get<ApiResponse<IGetSummaryResposne>>("/orders/summary");
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to fetch order summary");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to fetch order summary");
        }
    },

    // Get specific order details
    GetOrderDetailsAction: async ({ id }: IGetOrderSchema): Promise<ICreateOrderResponse> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ICreateOrderResponse>>(`/orders/${id}`);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to fetch order details");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to fetch order details");
        }
    },

    // Create new order
    CreateOrderAction: async (data: ICreateOrderSchema): Promise<ICreateOrderResponse> => {
        try {
            const response = await axiosInstance.post<ApiResponse<ICreateOrderResponse>>("/orders", data);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to create order");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to create order");
        }
    },

    // Cancel order
    CancelOrderAction: async (data: ICancelOrderSchema): Promise<ICreateOrderResponse> => {
        try {
            const response = await axiosInstance.post<ApiResponse<ICreateOrderResponse>>(`/orders/${data.id}/cancel`, {
                reason: data.reason
            });
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to cancel order");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to cancel order");
        }
    },

    // Update order status (Vendor only)
    UpdateOrderStatusAction: async (id: string, data: IUpdateOrderSchema): Promise<ICreateOrderResponse> => {
        try {
            const response = await axiosInstance.patch<ApiResponse<ICreateOrderResponse>>(`/orders/${id}/status`, data);
            if (!response.data.data) {
                throw new Error(response.data.apiError?.message || "Failed to update order status");
            }
            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.apiError) {
                throw new Error(error.response.data.apiError.message);
            }
            throw new Error("Failed to update order status");
        }
    },
};

import axiosInstance from "@/lib/axios-insterceptor";

export const PaymentAction = {

  CreatePaymentIntentAction: async (
    data: ICreatePaymentIntentRequest
  ): Promise<ICreatePaymentIntentResponse> => {
    const response = await axiosInstance.post<ApiResponse<ICreatePaymentIntentResponse>>(
      "/payments/create-payment-intent",
      data
    );
    
    if (!response.data.data) {
      throw new Error(response.data.apiError?.message || "Failed to create payment intent");
    }
    
    return response.data.data;
  },


  GetPaymentIntentAction: async (paymentIntentId: string) => {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `/payments/payment-intent/${paymentIntentId}`
    );
    
    if (!response.data.data) {
      throw new Error(response.data.apiError?.message || "Failed to get payment intent");
    }
    
    return response.data.data;
  },


  CreateCheckoutSessionAction: async (
    data: ICreateCheckoutSessionRequest
  ): Promise<ICreateCheckoutSessionResponse> => {
    const response = await axiosInstance.post<ApiResponse<ICreateCheckoutSessionResponse>>(
      "/payments/create-checkout-session",
      data
    );
    
    if (!response.data.data) {
      throw new Error(response.data.apiError?.message || "Failed to create checkout session");
    }
    
    return response.data.data;
  },

 
  GetStripeConfigAction: async (): Promise<IStripeConfigResponse> => {
    const response = await axiosInstance.get<ApiResponse<IStripeConfigResponse>>(
      "/payments/config"
    );
    
    if (!response.data.data) {
      throw new Error(response.data.apiError?.message || "Failed to get Stripe config");
    }
    
    return response.data.data;
  },
};

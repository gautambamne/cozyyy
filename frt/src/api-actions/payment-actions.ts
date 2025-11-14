import axiosInstance from "@/lib/axios-insterceptor";

export const PaymentAction = {
  /**
   * Create Payment Intent (Optional - for future use with Payment Elements)
   * Currently using Checkout Sessions instead
   */
  CreatePaymentIntentAction: async (
    data: ICreatePaymentIntentRequest
  ): Promise<ICreatePaymentIntentResponse> => {
    try {
      const response = await axiosInstance.post<ApiResponse<ICreatePaymentIntentResponse>>(
        "/payments/create-payment-intent",
        data
      );
      
      if (!response.data.data) {
        throw new Error(response.data.apiError?.message || "Failed to create payment intent");
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.apiError) {
        throw new Error(error.response.data.apiError.message);
      }
      throw new Error("Failed to create payment intent");
    }
  },

  /**
   * Get Payment Intent by ID
   */
  GetPaymentIntentAction: async (paymentIntentId: string): Promise<any> => {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(
        `/payments/payment-intent/${paymentIntentId}`
      );
      
      if (!response.data.data) {
        throw new Error(response.data.apiError?.message || "Failed to get payment intent");
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.apiError) {
        throw new Error(error.response.data.apiError.message);
      }
      throw new Error("Failed to get payment intent");
    }
  },

  /**
   * Create Stripe Checkout Session
   * This creates a hosted Stripe checkout page for the order
   * User will be redirected to Stripe's payment page
   */
  CreateCheckoutSessionAction: async (
    data: ICreateCheckoutSessionRequest
  ): Promise<ICreateCheckoutSessionResponse> => {
    try {
      const response = await axiosInstance.post<ApiResponse<ICreateCheckoutSessionResponse>>(
        "/payments/create-checkout-session",
        data
      );
      
      if (!response.data.data) {
        throw new Error(response.data.apiError?.message || "Failed to create checkout session");
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.apiError) {
        throw new Error(error.response.data.apiError.message);
      }
      throw new Error("Failed to create checkout session");
    }
  },

  /**
   * Get Stripe Config (Publishable Key)
   */
  GetStripeConfigAction: async (): Promise<IStripeConfigResponse> => {
    try {
      const response = await axiosInstance.get<ApiResponse<IStripeConfigResponse>>(
        "/payments/config"
      );
      
      if (!response.data.data) {
        throw new Error(response.data.apiError?.message || "Failed to get Stripe config");
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.apiError) {
        throw new Error(error.response.data.apiError.message);
      }
      throw new Error("Failed to get Stripe config");
    }
  },
};

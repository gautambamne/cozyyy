import axiosInstance from "@/lib/axios-insterceptor"
import { ICheckVerificationCodeSchema, IForgotPasswordSchema, ILoginSchema, IRegistrationSchema, IResendVerificationCodeSchema, IResetPasswordSchema, IVerifySchema } from "@/schema/auth-schema"

export const AuthAction = {
    RegisterAction: async (data: IRegistrationSchema): Promise<IResgisterResponse>=>{
        const response = await axiosInstance.post<ApiResponse<IResgisterResponse>>("/auth/register", data)
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Registration failed")
        }
        return response.data.data
    },

    VerifyAction: async (data: IVerifySchema): Promise<IUniversalMessage>=>{
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>("/auth/verify-email", data)
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Verification failed")
        }
        return response.data.data
    },

    LoginAction: async (data: ILoginSchema): Promise<ILoginResponse>=>{
        const response = await axiosInstance.post<ApiResponse<ILoginResponse>>("/auth/login", data)
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Login failed")
        }
        return response.data.data
    },

    RefreshAction: async(): Promise<IRefreshResponse>=>{
        const response = await axiosInstance.post<ApiResponse<IRefreshResponse>>("/auth/refresh-token");
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Token refresh failed")
        }
        return response.data.data;
    },

    ResendVerificationCodeAction: async (data: IResendVerificationCodeSchema): Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>("/auth/resend-verification-code", data);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Resend verification code failed")
        }
        return response.data.data;
    },
    
    ForgotPasswordAction: async (data:IForgotPasswordSchema): Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>("/auth/forgot-password", data);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Forgot password failed")
        }
        return response.data.data;
    },
    
    CheckVerificationCodeAction: async (data:ICheckVerificationCodeSchema): Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>("/auth/check-verification-code", data);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Check verification code failed")
        }
        return response.data.data;
    },
    
    ResetPasswordAction: async (data: IResetPasswordSchema): Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>("/auth/reset-password", data);
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Reset password failed")
        }
        return response.data.data;
    },

    LogoutAction: async (): Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>("/auth/logout");
        if (!response.data.data) {
            throw new Error(response.data.apiError?.message || "Logout failed")
        }
        return response.data.data;
    },

}    

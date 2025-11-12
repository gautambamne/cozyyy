import { BACKEND_URL } from '@/constants/constants';
import axios, { AxiosError, InternalAxiosRequestConfig  ,AxiosResponse, AxiosRequestConfig} from 'axios';
import { getCookie , setCookie} from "cookies-next";
import useAuthStore from '@/store/auth-store';
import { AuthAction } from '@/api-actions/auth-actions';
import "dotenv/config"


const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
    timeout: 10000,
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    async (request: InternalAxiosRequestConfig) => {
        const token = getCookie("auth_token") as string | null;
        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
        }
        if (!request.data || !(request.data instanceof FormData)) {
            request.headers['Content-Type'] = 'application/json';
        }
        return request;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Track refresh token requests to prevent multiple simultaneous refreshes
let refreshTokenPromise: Promise<any> | null = null;

axiosInstance.interceptors.response.use(
    async(response : AxiosResponse) => response,
    async (error: AxiosError<ApiResponse<null>>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Only attempt to refresh token on 401 (Unauthorized)
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url?.includes('/auth/login') && 
            !originalRequest.url?.includes('/auth/register') &&
            !originalRequest.url?.includes('/auth/refresh-token')) {
            
            originalRequest._retry = true;
            
            try {
                // If a refresh is already in progress, wait for it
                if (!refreshTokenPromise) {
                    refreshTokenPromise = axios.post<ApiResponse<ILoginResponse>>(
                        `${BACKEND_URL}/auth/refresh-token`,
                        {},
                        { withCredentials: true }
                    );
                }
                
                const response = await refreshTokenPromise;
                refreshTokenPromise = null; // Reset after use
                
                if (response.data.data?.access_token && response.status === 200) {
                    setCookie('auth_token', response.data.data.access_token, {
                        httpOnly: false,
                    });
                    useAuthStore.getState().setLogin(response.data.data);
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                refreshTokenPromise = null; // Reset on error
                
                // Only logout if refresh token also failed
                try {
                    await AuthAction.LogoutAction();
                } catch (logoutError) {
                    console.error('Logout action failed:', logoutError);
                }
                
                useAuthStore.getState().setLogout();
                return Promise.reject(refreshError);
            }
        }
        
        // Only logout on actual authentication failure, not on other errors
        if (error.response?.status === 401) {
            useAuthStore.getState().setLogout();
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;


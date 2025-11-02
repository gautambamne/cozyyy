
import {create} from "zustand";
import {setCookie , getCookie} from "cookies-next/client"

interface AuthStore {
    isAuthenticated: boolean;
    user : IUser | null;
    setLogin: (data : ILoginResponse) => void;
    setLogout: () => void;
};

const useAuthStore = create<AuthStore>()(
        (set) => {
            const token = getCookie('auth_token') as string | null;
            const savedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.user : null;

            return {
                isAuthenticated: !!token,
                user: savedUser,
                setLogin: (data: ILoginResponse) => {
                    setCookie('auth_token', data.access_token, {
                        httpOnly: false,
                    });

                    set(() => ({
                        isAuthenticated: true,
                        user: data.user,
                    }));
                },
                setLogout: () => {
                    setCookie('auth_token', '', {
                        httpOnly: false,
                    });
                    set(() => ({
                        isAuthenticated: false,
                        user: null,
                    }));
                },
            };
        },
     
    );


export default useAuthStore;
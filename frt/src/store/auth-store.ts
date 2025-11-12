import {create} from "zustand";
import {setCookie , getCookie} from "cookies-next/client"
import { persist } from "zustand/middleware";

interface AuthStore {
    isAuthenticated: boolean;
    user : IUser | null;
    isHydrated: boolean;
    setLogin: (data : ILoginResponse) => void;
    setLogout: () => void;
    setHydrated: () => void;
};

const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            isHydrated: false,

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

            setHydrated: () => {
                set(() => ({
                    isHydrated: true,
                }));
            },
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                // After rehydration, verify token is still valid
                const token = getCookie('auth_token') as string | null;
                if (state && token) {
                    state.isHydrated = true;
                } else if (state) {
                    state.isAuthenticated = false;
                    state.user = null;
                    state.isHydrated = true;
                }
            },
        }
    )
);

export default useAuthStore;
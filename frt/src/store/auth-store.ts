
import {create} from "zustand";
import {setCookie , getCookie} from "cookies-next/client"
// import {persist} from "zustand/middleware";

interface AuthStore {
    isAuthenticated: boolean;
    user : IUser | null;
    setLogin: (data : ILoginResponse) => void;
    setLogout: () => void;
};



const useAuthStore = create<AuthStore>()(
    // persist(
        (set) => {
            const token = getCookie('auth_token') as string | null;

            return {
                isAuthenticated: !!token,
                user: null,
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
        // {
        //     name: 'auth-storage', 
        // }
    // )
);

export default useAuthStore;
import useAuthStore from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function withGuest<T extends Object>(WrappedComponent: React.ComponentType<T>) {
    return function WrappedComponentWithGuest(props: T) {
        const { isAuthenticated } = useAuthStore();
        const router = useRouter();
        const [isInitializing, setIsInitializing] = useState(true);

        useEffect(() => {
            if (isAuthenticated) {
                router.replace('/');
            }
            setIsInitializing(false);
        }, [isAuthenticated, router]);
        

        if (isInitializing) {
            return <div>Loading...</div>;
        }
        return <WrappedComponent {...props} />;
    };
}

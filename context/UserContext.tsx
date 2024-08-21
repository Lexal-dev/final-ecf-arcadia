"use client";
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { decodeToken } from '@/lib/security/decode';
import Loading from '@/components/Loading';

interface User {
    id: string;
    email: string;
    role: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();
    const authorizedRoutes = ["/", "services", "habitats", "contact","login"]

    const checkPath = (userCurrent: User | null) => {
        const token = localStorage.getItem('token');
        console.log(token)
        console.log(userCurrent);

        if (token === null) {
            if(pathname && !authorizedRoutes.includes(pathname))
            {
                router.push('/login');
            }   
        } else if (userCurrent?.role === "EMPLOYEE") {
            if (pathname && (pathname.includes('/admin') || pathname.includes('/veterinarian'))) {
                router.push('/login/auth');
            }
        } else if (userCurrent?.role === "VETERINARIAN") {
            if (pathname && (pathname.includes('/admin') || pathname.includes('/employee'))) {
                router.push('/login/auth');
            }
        } else {
            console.log("admin")
        }
    };

    const checkToken = () => {
        const token = localStorage.getItem('token');
        
        if (token) {
            const decodedToken = decodeToken(token);

            if (decodedToken) {
                const userData: User = {
                    id: decodedToken.userId,
                    email: decodedToken.userEmail,
                    role: decodedToken.userRole
                };
                setUser(userData);
                checkPath(userData);
            } else {
                localStorage.removeItem('token');
                router.push('/login');
            }
        } else {
            setUser(null);
            checkPath(user)
            setLoading(false);
        }
    };

    useEffect(() => {
        if (pathname) {
            checkToken();
            console.log("debut de l'attente");
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    }, [pathname]);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            <Loading loading={loading}>
                {children}
            </Loading>
        </UserContext.Provider>
    );
};

export default UserContext;
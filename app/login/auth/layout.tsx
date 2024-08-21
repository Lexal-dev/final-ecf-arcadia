"use client"
import { UserProvider } from "@/context/UserContext";

export default function AuthLayout({ children }: { children: React.ReactNode }) {

    
    return (
    <>
        <UserProvider>
            {children}
        </UserProvider>
    </>
    );
}
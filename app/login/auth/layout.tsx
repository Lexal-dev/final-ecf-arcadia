import { UserProvider } from "@/context/UserContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arcadia - Authentification",
  description: "Page d'authentification",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
   
        {children}
  
    </UserProvider>
  );
}
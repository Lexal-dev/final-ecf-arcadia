import SpaceNav from "@/components/ui/SpaceNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Arcadia - vétérinaire",
    description: "Espace dédié vétérinaire",
  };
export default function NavigationLayout({ children }: { children: React.ReactNode }) {

    
    return (
            <section className="w-full">
                <SpaceNav/>
                {children}
            </section>
    );
}
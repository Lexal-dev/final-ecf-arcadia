"use client"
import SpaceNav from "@/components/ui/SpaceNav";

export default function NavigationLayout({ children }: { children: React.ReactNode }) {

    
    return (
            <section className="w-full">
                <SpaceNav/>
                {children}
            </section>
    );
}
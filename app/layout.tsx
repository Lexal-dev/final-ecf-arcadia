import type { Metadata } from "next";
import { Merriweather_Sans, Pacifico } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import { cn } from "@/lib/utils";




const merriweatherSans = Merriweather_Sans({ subsets: ["latin"] });
const pacifico = Pacifico({weight:"400", subsets: ["latin"], variable: "--font-caption" })
export const metadata: Metadata = {
  title: "Arcadia",
  description: "Website for a zoo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={cn(merriweatherSans.className, pacifico.variable, "font-sans" )}>
        
        <Header />
          <div className="text-white pt-[250px]">
            {children}
          </div>
      </body>
    </html>
  );
}
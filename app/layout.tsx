import type { Metadata } from "next";
import { Merriweather_Sans, Pacifico } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import { cn } from "@/lib/utils";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from "@/components/ui/Footer";

// Import des polices
const merriweatherSans = Merriweather_Sans({ subsets: ["latin"], variable: "--font-sans" });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], variable: "--font-caption" });

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
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={cn(merriweatherSans.variable, pacifico.variable, "font-sans")}>
        <Header />
        <main className="text-white pt-10">
          <div className="mb-[200px]"></div>
          {children}
        </main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
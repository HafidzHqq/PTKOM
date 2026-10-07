import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import BottomNav from "@/components/bottom-nav";
import Navbar from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "GiziKost - Analisis Nutrisi Makanan",
  description: "Analisis nutrisi makanan kamu dengan AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-gray-50 pb-20 md:pb-0">
        <AuthProvider>
          <Navbar />
          <main className="w-full min-h-screen">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}

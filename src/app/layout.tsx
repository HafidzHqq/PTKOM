import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import BottomNav from "@/components/bottom-nav";
import Sidebar from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "DompetKost - Analisis Nutrisi Makanan",
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
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 w-full min-w-0">
              {children}
            </main>
          </div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}

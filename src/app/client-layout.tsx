"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import BottomNav from "@/components/bottom-nav";
import Sidebar from "@/components/sidebar";

export default function ClientLayout({
  children,
  fontClassName,
}: {
  children: React.ReactNode;
  fontClassName: string;
}) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <body
      className={
        isLanding
          ? `${fontClassName} bg-[#f4f4f4] text-neutral-900 antialiased`
          : `${fontClassName} bg-neutral-50 pb-20 md:pb-0 text-neutral-900 antialiased selection:bg-emerald-200 selection:text-emerald-900`
      }
    >
      <AuthProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 w-full min-w-0">{children}</main>
        </div>
        <BottomNav />
      </AuthProvider>
    </body>
  );
}
"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import BottomNav from "@/components/bottom-nav";
import Navbar from "@/components/navbar";
import TermsAndOnboarding, { openTermsModal } from "@/components/terms-and-onboarding";

export default function ClientLayout({
  children,
  fontClassName,
}: {
  children: React.ReactNode;
  fontClassName: string;
}) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isAuthOrLanding = pathname === "/" || pathname === "/login";

  return (
    <body
      className={
        isLanding
          ? `${fontClassName} bg-[#f4f4f4] text-neutral-900 antialiased`
          : pathname === "/login"
          ? `${fontClassName} bg-slate-50 text-neutral-900 antialiased`
          : `${fontClassName} bg-[#f8f5ee] pb-24 md:pb-0 text-neutral-900 antialiased selection:bg-amber-200 selection:text-amber-900 min-h-screen`
      }
    >
      <AuthProvider>
        <div className="flex flex-col min-h-screen relative">
          {!isAuthOrLanding && <Navbar />}
          <main className="flex-1 w-full min-w-0 relative flex flex-col justify-between">
            {!isAuthOrLanding && (
              <div
                className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
                aria-hidden="true"
              >
                {/* Background Photo Lukas Blazek */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-70 sm:opacity-75"
                  style={{
                    backgroundImage: "url('/images/dashboard-bg.webp'), url('/images/dashboard-bg-opt.jpg')",
                  }}
                />
                {/* Warm culinary ambient overlay ensuring high contrast & readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#fbf9f5]/70 via-[#f9f6ef]/55 to-[#f6f2e8]/75 backdrop-blur-[0.5px]" />
              </div>
            )}
            <div className="relative z-10 flex-1">{children}</div>

            {/* Footer Bar with Catatan & Ketentuan */}
            {!isLanding && (
              <footer className="relative z-10 border-t border-neutral-200/60 bg-white/60 backdrop-blur-xs py-4 px-4 sm:px-8 text-center text-xs text-neutral-500 font-medium mt-12 w-full">
                <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <p>
                    DompetKost — Panduan kuliner hemat &amp; seimbang anak kost, bukan rujukan medis resmi.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={openTermsModal}
                      className="text-orange-700 hover:text-orange-800 underline font-semibold cursor-pointer"
                    >
                      Catatan &amp; Ketentuan
                    </button>
                    <span>&copy; 2026 PTKOM IF ITERA</span>
                  </div>
                </div>
              </footer>
            )}
          </main>
        </div>
        {!isAuthOrLanding && <BottomNav />}
        <TermsAndOnboarding />
      </AuthProvider>
    </body>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on landing page and login page
  if (pathname === "/" || pathname === "/login") return null;

  const isHome = pathname === "/dashboard";
  const isRecipes = pathname === "/recipes" || pathname.startsWith("/recipes");
  const isScan = pathname === "/analyze" || pathname.startsWith("/analyze");
  const isHistory = pathname === "/history" || pathname.startsWith("/history");
  const isProfile = pathname === "/profile" || pathname.startsWith("/profile");

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-neutral-200/80 md:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 8px))" }}
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pt-1.5">
        {/* Beranda */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
            isHome
              ? "text-orange-600 font-bold"
              : "text-neutral-500 hover:text-neutral-900 font-medium"
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${isHome ? "bg-orange-50" : ""}`}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={isHome ? 2.3 : 1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Beranda</span>
        </Link>

        {/* Resep */}
        <Link
          href="/recipes"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
            isRecipes
              ? "text-orange-600 font-bold"
              : "text-neutral-500 hover:text-neutral-900 font-medium"
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${isRecipes ? "bg-orange-50" : ""}`}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={isRecipes ? 2.3 : 1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Resep</span>
        </Link>

        {/* Pindai (Center Raised FAB) */}
        <div className="relative flex flex-col items-center -mt-5 px-1">
          <Link
            href="/analyze"
            aria-label="Pindai Makanan dengan AI"
            className={`flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-transform duration-150 active:scale-90 border-[3px] border-white ${
              isScan
                ? "bg-gradient-to-tr from-neutral-900 to-neutral-800 text-white shadow-neutral-900/30 ring-2 ring-orange-500/50"
                : "bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-orange-600/35 hover:scale-105"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Link>
          <span
            className={`text-[10px] tracking-tight mt-0.5 ${
              isScan ? "font-bold text-neutral-900" : "font-semibold text-neutral-600"
            }`}
          >
            Pindai AI
          </span>
        </div>

        {/* Diari */}
        <Link
          href="/history"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
            isHistory
              ? "text-orange-600 font-bold"
              : "text-neutral-500 hover:text-neutral-900 font-medium"
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${isHistory ? "bg-orange-50" : ""}`}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={isHistory ? 2.3 : 1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Diari</span>
        </Link>

        {/* Profil */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
            isProfile
              ? "text-orange-600 font-bold"
              : "text-neutral-500 hover:text-neutral-900 font-medium"
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${isProfile ? "bg-orange-50" : ""}`}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={isProfile ? 2.3 : 1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Profil</span>
        </Link>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on landing page and login page
  if (pathname === "/" || pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-neutral-200/60 md:hidden shadow-[0_-2px_16px_-6px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-md items-end justify-between px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
        {/* Beranda */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center py-2 px-3 transition-all duration-200 ${
            pathname === "/dashboard" ? "text-black" : "text-neutral-400 hover:text-black"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/dashboard" ? 2.5 : 1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="mt-0.5 text-[10px] font-bold">Beranda</span>
        </Link>

        {/* Rekomendasi */}
        <Link
          href="/recommendations"
          className={`flex flex-col items-center justify-center py-2 px-3 transition-all duration-200 ${
            pathname === "/recommendations" ? "text-black" : "text-neutral-400 hover:text-black"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/recommendations" ? 2.5 : 1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="mt-0.5 text-[10px] font-bold">Saran</span>
        </Link>

        {/* Pindai (Center FAB) */}
        <div className="relative flex flex-col items-center -mt-5 px-1">
          <Link
            href="/analyze"
            className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 border-[3px] border-white ${
              pathname === "/analyze"
                ? "bg-black text-white shadow-black/20"
                : "bg-neutral-900 text-white shadow-neutral-300"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          <span className="mt-0.5 text-[10px] font-bold text-neutral-900">Pindai</span>
        </div>

        {/* Riwayat */}
        <Link
          href="/history"
          className={`flex flex-col items-center justify-center py-2 px-3 transition-all duration-200 ${
            pathname === "/history" ? "text-black" : "text-neutral-400 hover:text-black"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/history" ? 2.5 : 1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="mt-0.5 text-[10px] font-bold">Riwayat</span>
        </Link>

        {/* Profil */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center py-2 px-3 transition-all duration-200 ${
            pathname === "/profile" ? "text-black" : "text-neutral-400 hover:text-black"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/profile" ? 2.5 : 1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="mt-0.5 text-[10px] font-bold">Profil</span>
        </Link>
      </div>
    </nav>
  );
}

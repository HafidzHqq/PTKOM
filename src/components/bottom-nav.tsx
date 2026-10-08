"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on landing page
  if (pathname === "/") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-neutral-100 pb-safe md:hidden shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-md items-center justify-between px-6 py-2 relative">
        {/* Beranda */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${
            pathname === "/dashboard" ? "text-black scale-110" : "text-neutral-400 hover:text-black"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/dashboard" ? 2.5 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="mt-1 text-[10px] font-bold">Beranda</span>
        </Link>

        {/* Rekomendasi */}
        <Link
          href="/recommendations"
          className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${
            pathname === "/recommendations" ? "text-black scale-110" : "text-neutral-400 hover:text-black"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/recommendations" ? 2.5 : 2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="mt-1 text-[10px] font-bold">Saran</span>
        </Link>

        {/* Pindai (Center FAB) */}
        <div className="relative -top-6 flex justify-center">
          <Link
            href="/analyze"
            className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-black text-white shadow-xl shadow-neutral-200 transition-transform hover:scale-105 active:scale-95 border-4 border-white"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>

        {/* Riwayat */}
        <Link
          href="/history"
          className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${
            pathname === "/history" ? "text-black scale-110" : "text-neutral-400 hover:text-black"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/history" ? 2.5 : 2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="mt-1 text-[10px] font-bold">Riwayat</span>
        </Link>

        {/* Profil */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${
            pathname === "/profile" ? "text-black scale-110" : "text-neutral-400 hover:text-black"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/profile" ? 2.5 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="mt-1 text-[10px] font-bold">Profil</span>
        </Link>
      </div>
    </nav>
  );
}

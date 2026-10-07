"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-safe md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-6 py-2 relative">
        {/* Beranda */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            pathname === "/dashboard" ? "text-green-600" : "text-gray-400 hover:text-green-500"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="mt-1 text-[10px] font-medium">Beranda</span>
        </Link>

        {/* Riwayat */}
        <Link
          href="/history"
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            pathname === "/history" ? "text-green-600" : "text-gray-400 hover:text-green-500"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="mt-1 text-[10px] font-medium">Riwayat</span>
        </Link>

        {/* Pindai (Center FAB) */}
        <div className="relative -top-6 flex justify-center">
          <Link
            href="/analyze"
            className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-200 transition-transform hover:scale-105 active:scale-95 border-4 border-white"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="mt-0.5 text-[10px] font-medium">Pindai</span>
          </Link>
        </div>

        {/* Murah */}
        <Link
          href="/recommendations"
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            pathname === "/recommendations" ? "text-green-600" : "text-gray-400 hover:text-green-500"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="mt-1 text-[10px] font-medium">Murah</span>
        </Link>

        {/* Profil */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            pathname === "/profile" ? "text-green-600" : "text-gray-400 hover:text-green-500"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="mt-1 text-[10px] font-medium">Profil</span>
        </Link>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (pathname === "/" || pathname === "/login") return null;

  const navLinks = [
    { 
      name: "Dashboard", 
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: "Scan Makanan", 
      href: "/analyze",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      name: "Daftar Resep", 
      href: "/recipes",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      name: "Diari Kuliner", 
      href: "/history",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: "Profil & Porsi", 
      href: "/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  // Hide sidebar on landing page
  if (pathname === "/") return null;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-gray-100 bg-white z-40 relative overflow-hidden">
      {/* Background Image with Gradient Blur */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-[position:75%_70%] bg-no-repeat opacity-80"
          style={{ backgroundImage: "url('/side.jpeg')" }}
        />
        {/* Gradient overlay to make text readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white/10 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Area */}
        <div className="px-3 py-3 border-b border-white/40 flex items-center justify-center">
          <Link href="/" className="block w-full" aria-label="DompetKost - Beranda">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpeg"
              alt="DompetKost"
              className="w-full h-auto max-h-24 object-contain hover:opacity-95 transition-opacity"
            />
          </Link>
        </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-white/70 text-emerald-700 shadow-sm border border-white/60 backdrop-blur-md scale-[1.02]"
                  : "text-gray-600 hover:bg-white/40 hover:text-emerald-600 hover:backdrop-blur-sm border border-transparent"
              }`}
            >
              <span className={`transition-colors duration-300 ${isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-emerald-500"}`}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Auth Area */}
      <div className="p-4 border-t border-white/40">
        {user ? (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/50 border border-white/60 hover:bg-white/70 backdrop-blur-md shadow-sm transition-all duration-300">
            <Link href="/profile" className="flex items-center gap-3 min-w-0 flex-1">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded border-2 border-white object-cover shrink-0 shadow-sm"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-black text-white text-sm font-bold shrink-0 border border-neutral-200 shadow-sm">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-gray-800 truncate">
                  {user.name || "Pengguna"}
                </span>
                <span className="text-xs font-medium text-gray-500 truncate">
                  {user.email}
                </span>
              </div>
            </Link>
            <Link href="/profile" className="text-gray-400 hover:text-black p-1.5 shrink-0 rounded-lg hover:bg-white/50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-black text-white text-sm font-bold hover:bg-neutral-800 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Masuk / Login
          </Link>
        )}
      </div>
      </div>
    </aside>
  );
}

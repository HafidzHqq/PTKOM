"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/logout-button";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navLinks = [
    { name: "Dashboard", href: "/" },
    { name: "Analisis", href: "/analyze" },
    { name: "Rekomendasi", href: "/recommendations" },
    { name: "Riwayat", href: "/history" },
    { name: "Profil", href: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🥗</span>
          <span className="font-bold text-lg text-green-600 sm:text-xl">
            Dompet Gizi
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-green-600"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-8 w-8 rounded-full border border-gray-200"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <span className="hidden lg:inline text-sm font-medium text-gray-700 truncate max-w-[120px]">
                {user.name || user.email?.split("@")[0]}
              </span>
              <div className="hidden md:block">
                <LogoutButton />
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-green-600 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-green-700 transition"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

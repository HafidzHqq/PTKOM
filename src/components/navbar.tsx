"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/logout-button";
import Logo from "@/components/logo";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Nav sliding pill indicator animation refs & state
  const navContainerRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [hoverIndicator, setHoverIndicator] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Hide navbar on landing page and login page
  if (pathname === "/" || pathname === "/login") return null;

  const navLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
    },
    {
      name: "Daftar Resep",
      href: "/recipes",
    },
    {
      name: "Tanya AI",
      href: "/recipes/ask",
      highlight: true,
    },
    {
      name: "Scan Makanan",
      href: "/analyze",
    },
    {
      name: "Diari Kuliner",
      href: "/history",
    },
  ];

  const activeIndex = useMemo(() => {
    if (pathname === "/recipes/ask" || pathname.startsWith("/recipes/ask")) return 2;
    if (pathname === "/recipes" || pathname.startsWith("/recipes")) return 1;
    if (pathname === "/analyze" || pathname.startsWith("/analyze")) return 3;
    if (pathname === "/history" || pathname.startsWith("/history")) return 4;
    if (pathname === "/dashboard") return 0;
    return -1;
  }, [pathname]);

  const updateActiveIndicator = useCallback((index: number) => {
    const container = navContainerRef.current;
    const tab = tabRefs.current[index];
    if (container && tab) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      setIndicator({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
        opacity: 1,
      });
    } else {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
    }
  }, []);

  useEffect(() => {
    if (activeIndex >= 0) {
      updateActiveIndicator(activeIndex);
    } else {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeIndex, updateActiveIndicator]);

  useEffect(() => {
    const handleResize = () => {
      if (activeIndex >= 0) {
        updateActiveIndicator(activeIndex);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex, updateActiveIndicator]);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md shadow-xs w-full transition-all">
      <div className="w-full flex h-20 items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        
        {/* SISI KIRI: Logo Brand (Dipisah di kiri) */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition hover:opacity-95"
            aria-label="DompetKost - Beranda"
          >
            <Logo size="md" withLink={false} />
          </Link>
        </div>

        {/* TENGAH: Menu Navigasi dengan Animasi Perpindahan Tab yang Halus (Sliding Pill) */}
        <nav
          ref={navContainerRef}
          onMouseLeave={() => setHoverIndicator((prev) => ({ ...prev, opacity: 0 }))}
          className="relative hidden lg:flex items-center p-1.5 rounded-full bg-neutral-100/90 border border-neutral-200/80 shadow-2xs"
        >
          {/* Subtle Hover Ghost Pill Indicator */}
          <div
            aria-hidden="true"
            className="absolute top-1.5 bottom-1.5 rounded-full bg-neutral-200/50 transition-all duration-200 pointer-events-none"
            style={{
              transform: `translateX(${hoverIndicator.left}px)`,
              width: `${hoverIndicator.width}px`,
              opacity: hoverIndicator.opacity,
            }}
          />

          {/* Active Tab Sliding Pill Indicator (Animasi Meluncur Halus) */}
          <div
            aria-hidden="true"
            className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 shadow-md shadow-orange-600/20 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: `${indicator.width}px`,
              opacity: indicator.opacity,
            }}
          />

          {navLinks.map((link, idx) => {
            const isActive = idx === activeIndex;

            return (
              <Link
                key={link.href}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                href={link.href}
                onMouseEnter={() => {
                  if (!isActive && navContainerRef.current && tabRefs.current[idx]) {
                    const containerRect = navContainerRef.current.getBoundingClientRect();
                    const tabRect = tabRefs.current[idx]!.getBoundingClientRect();
                    setHoverIndicator({
                      left: tabRect.left - containerRect.left,
                      width: tabRect.width,
                      opacity: 1,
                    });
                  } else {
                    setHoverIndicator((prev) => ({ ...prev, opacity: 0 }));
                  }
                }}
                onClick={() => {
                  updateActiveIndicator(idx);
                  setHoverIndicator((prev) => ({ ...prev, opacity: 0 }));
                }}
                className={`relative z-10 flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 cursor-pointer select-none whitespace-nowrap ${
                  isActive
                    ? "text-white"
                    : link.highlight
                    ? "text-amber-900 hover:text-amber-950"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                <span>{link.name}</span>
                {link.highlight && !isActive && (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* SISI KANAN: Akun User / Tombol Login (Dipisah di kanan dengan jarak lega) */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Link
                href="/profile"
                title="Lihat Profil & Kebutuhan Gizi"
                className={`flex items-center gap-2.5 rounded-full p-1.5 pr-3.5 transition-all ${
                  pathname === "/profile"
                    ? "bg-orange-50 ring-1 ring-orange-300/80"
                    : "hover:bg-neutral-100/80"
                }`}
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-9 w-9 rounded-full border border-neutral-200 object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-bold text-white shadow-xs">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-neutral-800 truncate max-w-[120px] leading-tight">
                    {user.name || user.email?.split("@")[0]}
                  </span>
                  <span className="text-[10px] font-medium text-neutral-400">Profil & Porsi</span>
                </div>
              </Link>

              <div className="hidden sm:block">
                <LogoutButton variant="compact" />
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-semibold text-sm px-5 py-2.5 shadow-xs transition-all"
            >
              Masuk
            </Link>
          )}

          {/* Mobile Menu Hamburger Toggle (Hanya muncul di layar di bawah lg) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="lg:hidden flex items-center justify-center h-10 w-10 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 transition cursor-pointer shadow-2xs"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Ketika hamburger dibuka di mobile / tablet) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
          {/* User Info Header on Mobile */}
          {user && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/70 border border-orange-200/60 mb-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-10 w-10 rounded-full border border-orange-200 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-bold text-white shadow-xs">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-neutral-900">{user.name || user.email?.split("@")[0]}</p>
                  <p className="text-[11px] font-medium text-orange-700">Lihat Profil & Porsi Gizi →</p>
                </div>
              </Link>
            </div>
          )}

          {/* Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" &&
                  link.href !== "/recipes" &&
                  pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-orange-50 text-orange-700 border border-orange-200/60 font-bold"
                      : link.highlight
                      ? "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.highlight && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Profil link in mobile menu */}
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all ${
                pathname === "/profile"
                  ? "bg-orange-50 text-orange-700 border border-orange-200/60"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profil & Kebutuhan Gizi</span>
            </Link>
          </div>

          {/* Logout on Mobile */}
          {user && (
            <div className="pt-2 border-t border-neutral-100">
              <LogoutButton variant="default" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100" />
            </div>
          )}
        </div>
      )}
    </header>
  );
}

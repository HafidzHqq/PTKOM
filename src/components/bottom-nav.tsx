"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: "🏠" },
    { name: "Analisis", href: "/analyze", icon: "📸" },
    { name: "Rekomendasi", href: "/recommendations", icon: "💡" },
    { name: "Riwayat", href: "/history", icon: "📅" },
    { name: "Profil", href: "/profile", icon: "👤" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-safe md:hidden">
      <div className="mx-auto flex max-w-md justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-lg p-2 transition-colors ${
                isActive
                  ? "text-green-600"
                  : "text-gray-500 hover:text-green-500"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="mt-1 text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

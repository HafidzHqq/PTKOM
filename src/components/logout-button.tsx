"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  variant?: "default" | "compact" | "icon";
  className?: string;
  showIcon?: boolean;
}

export default function LogoutButton({
  variant = "default",
  className = "",
  showIcon = true,
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/login" });
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        title="Keluar dari akun"
        className={`inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-60 cursor-pointer shadow-2xs ${className}`}
      >
        {showIcon && (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        )}
        <span>{loading ? "Keluar..." : "Keluar"}</span>
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        title="Keluar dari akun"
        className={`inline-flex items-center justify-center h-8 w-8 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-60 cursor-pointer ${className}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={`w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors disabled:opacity-60 cursor-pointer ${className}`}
    >
      {loading ? "Keluar..." : "Keluar"}
    </button>
  );
}

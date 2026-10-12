"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors disabled:opacity-60"
    >
      {loading ? "Keluar..." : "Keluar"}
    </button>
  );
}

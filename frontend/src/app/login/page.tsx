"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("error")) {
      setError("Autentikasi gagal. Silakan coba masuk kembali.");
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f2] px-5 py-12 text-gray-900">
      <section className="w-full max-w-md border-t-4 border-green-600 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-700">
          GiziKost
        </p>
        <h1 className="mt-8 text-3xl font-bold tracking-tight">
          Masuk ke akunmu
        </h1>
        <p className="mt-3 text-gray-600">
          Lanjutkan memantau nutrisi dan menganalisis makananmu.
        </p>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-3 border border-gray-300 px-4 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.92c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.4 37.99 46.98 31.8 46.98 24.55Z" />
            <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.54 2.56 10.78l7.97-6.19Z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
          </svg>
          {loading ? "Mengalihkan ke Google..." : "Lanjutkan dengan Google"}
        </button>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            Gagal memulai login: {error}
          </p>
        )}
      </section>
    </main>
  );
}
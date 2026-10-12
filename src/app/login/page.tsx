"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import Logo from "@/components/logo";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorParam = searchParams.get("error");
  const [guestLoading, setGuestLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getErrorMessage = (err: string | null) => {
    if (!err) return null;
    if (err === "OAuthSignin" || err === "OAuthCallback" || err === "OAuthCreateAccount") {
      return "Google OAuth belum dikonfigurasi sepenuhnya untuk domain ini. Kamu bisa gunakan Masuk Cepat (Akun Tamu) di bawah.";
    }
    if (err === "CredentialsSignin") {
      return "Gagal masuk via akun tamu. Silakan coba lagi.";
    }
    if (err === "SessionRequired") {
      return "Silakan masuk terlebih dahulu untuk mengakses halaman tersebut.";
    }
    return `Gagal masuk: ${err}`;
  };

  const displayedError = errorMessage || getErrorMessage(errorParam);

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage(null);
      setGoogleLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err: unknown) {
      console.error("Google sign in error:", err);
      setErrorMessage("Terjadi kendala saat menghubungi Google. Coba Masuk Cepat (Akun Tamu).");
      setGoogleLoading(false);
    }
  };

  const handleGuestLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setErrorMessage(null);
      setGuestLoading(true);
      const res = await signIn("guest-login", {
        name: guestName.trim() || "Teman Kost",
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (res?.error) {
        setErrorMessage("Gagal masuk dengan akun tamu. Silakan coba beberapa saat lagi.");
        setGuestLoading(false);
      } else {
        // Redirect ke dashboard
        window.location.href = res?.url || "/dashboard";
      }
    } catch (err: unknown) {
      console.error("Guest login error:", err);
      setErrorMessage("Terjadi gangguan koneksi. Silakan coba lagi.");
      setGuestLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between bg-[#f8fafc] text-neutral-900 px-4 py-6 sm:py-10 selection:bg-neutral-900 selection:text-white">
      {/* Top Bar with Back Link */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-black transition-colors rounded-lg px-2.5 py-1.5 hover:bg-neutral-200/60"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Kembali ke Beranda</span>
        </Link>
        <span className="text-[11px] font-medium text-neutral-400">v1.0</span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10">
        <div className="bg-white rounded-3xl sm:rounded-[2rem] p-6 sm:p-9 shadow-xl shadow-neutral-200/70 border border-neutral-100">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6 sm:mb-8">
            <Logo size="xl" withLink={false} />
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-3">
              Selamat Datang!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium max-w-xs leading-relaxed">
              Atur gizi harian & hemat pengeluaran makan anak kost tanpa ribet.
            </p>
          </div>

          {/* Error Banner */}
          {displayedError && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
              <svg className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{displayedError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Quick Guest Access Card */}
            <form onSubmit={handleGuestLogin} className="space-y-3 rounded-2xl bg-neutral-50 p-4 border border-neutral-200/70">
              <div className="flex items-center justify-between">
                <label htmlFor="guestName" className="text-xs font-bold text-neutral-700">
                  ⚡ Masuk Cepat (Akun Tamu)
                </label>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Instan
                </span>
              </div>
              <input
                id="guestName"
                type="text"
                placeholder="Nama kamu (opsional, misal: Budi)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                disabled={guestLoading || googleLoading}
              />
              <button
                type="submit"
                disabled={guestLoading || googleLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {guestLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Menyiapkan Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Langsung ke Aplikasi</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-neutral-400 font-medium uppercase tracking-wider text-[11px]">
                  atau masuk dengan
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={guestLoading || googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-neutral-800 shadow-sm transition-all hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {googleLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-neutral-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Menghubungkan ke Google...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
                    <path
                      fill="#FFC107"
                      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                    />
                    <path
                      fill="#FF3D00"
                      d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                    />
                  </svg>
                  <span>Lanjutkan dengan Akun Google</span>
                </>
              )}
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-8 text-center">
            <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
              Data konsumsi dan profil Anda tersimpan aman untuk rekomendasi gizi harian.
            </p>
          </div>
        </div>
      </div>

      {/* Subtle Copyright */}
      <div className="w-full text-center py-2 z-10">
        <p className="text-[11px] text-neutral-400 font-medium">
          &copy; {new Date().getFullYear()} DompetKost • Teman Sehat Anak Kost
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

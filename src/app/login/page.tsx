"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import FooterBackground from "@/app/footer-background";

function LoginContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [guestLoading, setGuestLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getErrorMessage = (err: string | null) => {
    if (!err) return null;
    if (err === "OAuthSignin" || err === "OAuthCallback" || err === "OAuthCreateAccount") {
      return "Google OAuth belum dikonfigurasi untuk domain ini. Gunakan Masuk Cepat (Akun Tamu).";
    }
    if (err === "AccessDenied") {
      return "Akses masuk ditolak atau database sedang offline. Silakan coba Masuk Cepat.";
    }
    if (err === "CredentialsSignin") {
      return "Gagal masuk via akun tamu. Silakan coba lagi.";
    }
    if (err === "SessionRequired") {
      return "Silakan masuk terlebih dahulu untuk mengakses fitur ini.";
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
      setErrorMessage("Koneksi ke Google terhambat. Silakan coba Masuk Cepat (Akun Tamu).");
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
        setErrorMessage("Gagal masuk dengan akun tamu. Silakan coba lagi.");
        setGuestLoading(false);
      } else {
        window.location.href = res?.url || "/dashboard";
      }
    } catch (err: unknown) {
      console.error("Guest login error:", err);
      setErrorMessage("Terjadi gangguan saat memproses login.");
      setGuestLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* SISI KIRI: Background Landing Page (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-950 overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Visual dari Landing Page */}
        <div className="absolute inset-0 z-0">
          <FooterBackground />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/50 z-10" />
        </div>

        {/* Pojok Kiri Atas */}
        <div className="relative z-20">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Beranda</span>
          </Link>
        </div>

        {/* Teks Informasi Bawah Kiri */}
        <div className="relative z-20 max-w-lg space-y-4">
          <h2 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight drop-shadow-md">
            Budget Minimal, <br />
            <span className="text-white">Sehat Maksimal.</span>
          </h2>
          <p className="text-sm xl:text-base text-neutral-200 leading-relaxed font-medium drop-shadow-sm">
            Pantau asupan gizi harian hanya dengan foto makanan. Dapatkan rekomendasi menu bergizi yang ramah di kantong mahasiswa dan anak kost.
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs text-neutral-400 font-semibold">
            <span>✓ Analisis Gizi Cepat</span>
            <span>•</span>
            <span>✓ Rekomendasi Hemat</span>
            <span>•</span>
            <span>✓ AI Asisten Kost</span>
          </div>
        </div>
      </div>

      {/* SISI KANAN: Form Login Interaktif */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 xl:p-20 bg-white">
        {/* Navigasi Kembali */}
        <div className="w-full max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-black transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Kembali</span>
          </Link>
        </div>

        {/* Konten Form */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
              Selamat datang
            </h1>
            <p className="text-sm text-neutral-500 font-normal">
              Silakan masukkan kredensial atau masuk instan untuk melanjutkan.
            </p>
          </div>

          {/* Banner Pesan Error */}
          {displayedError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-start gap-2.5">
              <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{displayedError}</span>
            </div>
          )}

          {/* Form Akun Tamu (Instan & Cepat) */}
          <form onSubmit={handleGuestLogin} className="space-y-4">
            <div>
              <label htmlFor="guestName" className="block text-xs font-semibold text-neutral-700 mb-2">
                Nama Pengguna (Opsional)
              </label>
              <input
                id="guestName"
                type="text"
                placeholder="Misal: Hafidz atau Teman Kost"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                disabled={guestLoading || googleLoading}
                className="w-full rounded-xl bg-neutral-100/80 border border-neutral-200/80 px-4 py-3.5 text-sm font-medium text-neutral-800 placeholder-neutral-400 outline-none transition focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
              />
            </div>

            {/* Tombol Masuk Utama (Persis tombol biru/ungu di referensi gambar) */}
            <button
              type="submit"
              disabled={guestLoading || googleLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#5d5fef] hover:bg-[#4b4ddc] text-white py-3.5 px-4 text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
            >
              {guestLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk</span>
              )}
            </button>
          </form>

          {/* Divider "atau" */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-neutral-400 font-medium lowercase">
                atau
              </span>
            </div>
          </div>

          {/* Tombol Google (Persis seperti di gambar) */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={guestLoading || googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 py-3.5 px-4 text-sm font-bold shadow-sm active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
          >
            {googleLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-neutral-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Menghubungkan Google...</span>
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
                <span>Masuk dengan Google</span>
              </>
            )}
          </button>

          {/* Subtext info */}
          <div className="mt-8 text-center text-xs text-neutral-400">
            <span>Tidak punya akun? </span>
            <button
              type="button"
              onClick={() => handleGuestLogin()}
              className="text-[#5d5fef] font-semibold hover:underline cursor-pointer"
            >
              Masuk langsung sebagai Tamu
            </button>
          </div>
        </div>

        {/* Footer kanan */}
        <div className="w-full max-w-md mx-auto text-center text-xs text-neutral-400">
          &copy; PTKOM IF ITERA 2026
        </div>
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

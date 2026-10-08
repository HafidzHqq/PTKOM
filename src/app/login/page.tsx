"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Logo from "@/components/logo";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-[2.5rem] bg-white p-8 md:p-10 shadow-xl shadow-emerald-100/50 border border-neutral-100">
        {/* Logo & Header */}
        <div className="space-y-3 text-center flex flex-col items-center">
          <Logo size="xl" withLink={false} />
          <p className="text-neutral-500 mt-2 font-medium">
            Analisis nutrisi makanan kamu dengan AI
          </p>
        </div>

        {/* Error Message */}
        {error === "auth_failed" && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 text-center">
            ⚠️ Login gagal. Silakan coba lagi.
          </div>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              Masuk untuk melanjutkan
            </span>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-neutral-100 bg-white px-6 py-4 text-base font-bold text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 hover:border-emerald-200 hover:shadow-md active:scale-[0.98]"
        >
          {/* Google Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-6 w-6"
          >
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
          Masuk dengan Google
        </button>

        {/* Footer */}
        <p className="text-center text-xs font-medium text-neutral-400">
          Dengan masuk, kamu menyetujui{" "}
          <span className="cursor-pointer text-emerald-600 font-bold hover:underline">
            Syarat & Ketentuan
          </span>{" "}
          kami.
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

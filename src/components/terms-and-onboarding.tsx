"use client";

import { useEffect, useState } from "react";

export function openTermsModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-dompetkost-terms"));
  }
}

export function TermsLink({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openTermsModal}
      className={`underline font-semibold cursor-pointer transition-colors ${className}`}
    >
      Catatan &amp; Ketentuan
    </button>
  );
}

export default function TermsAndOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    // Check if user has consented
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("dompetkost_consent");
      if (!consent) {
        setShowOnboarding(true);
      }

      const handleOpenTerms = () => setShowTerms(true);
      window.addEventListener("open-dompetkost-terms", handleOpenTerms);
      return () => {
        window.removeEventListener("open-dompetkost-terms", handleOpenTerms);
      };
    }
  }, []);

  const handleAcceptOnboarding = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dompetkost_consent", "true");
    }
    setShowOnboarding(false);
  };

  return (
    <>
      {/* 1. First-time 1-Screen Onboarding Consent Modal (§7.2) */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-amber-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 shrink-0">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full">
                  Selamat Datang
                </span>
                <h3 className="text-lg sm:text-xl font-black text-neutral-900 mt-1">
                  Hai, Penjelajah Kuliner Kost!
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
              DompetKost hadir sebagai teman setia untuk membantumu berburu santapan nikmat, ramah kantong, dan seimbang setiap hari.
            </p>

            <div className="space-y-2.5 rounded-xl bg-amber-50/70 p-3.5 border border-amber-200/80 text-xs text-neutral-700">
              <div className="flex items-start gap-2">
                <span className="font-bold text-orange-700 shrink-0">1.</span>
                <span>
                  <strong>Edukasi Santai:</strong> Informasi gizi dihitung sebagai panduan umum berbasis data TKPI Kemenkes, bukan diagnosis medis formal.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-orange-700 shrink-0">2.</span>
                <span>
                  <strong>Estimasi Kuliner:</strong> Harga dan rasa mengacu pada rentang rata-rata warteg dan tempat makan lokal.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-orange-700 shrink-0">3.</span>
                <span>
                  <strong>Privasi Terjaga:</strong> Catatan diari kuliner disimpan dengan aman dan privat di perangkatmu.
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleAcceptOnboarding}
                className="w-full rounded-xl bg-orange-700 py-3 px-5 text-sm font-bold text-white shadow-md hover:bg-orange-800 transition-all active:scale-[0.98] min-h-[44px] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Siap, Mulai Kulineran!</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTerms(true);
                }}
                className="w-full text-center text-xs font-semibold text-neutral-500 hover:text-neutral-800 underline transition-colors py-1 cursor-pointer"
              >
                Baca Catatan &amp; Ketentuan Lengkap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Catatan & Ketentuan Full Modal (§7.1 & §7.2) */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900">
                    Catatan &amp; Ketentuan Layanan
                  </h3>
                  <p className="text-[11px] text-neutral-500">Transparansi dan prinsip DompetKost</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="h-8 w-8 rounded-lg bg-neutral-200/70 hover:bg-neutral-300 flex items-center justify-center text-neutral-700 text-sm font-bold transition-colors cursor-pointer"
                aria-label="Tutup modal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="space-y-1">
                <h4 className="font-black text-neutral-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>1. Bukan Saran Medis (Medical Disclaimer)</span>
                </h4>
                <p>
                  DompetKost ditujukan murni sebagai asisten gaya hidup kuliner dan edukasi gizi santai bagi anak kost.
                  Seluruh perkiraan kalori, makronutrien, dan BMR adalah estimasi matematis umum. Aplikasi ini tidak
                  memberikan diagnosis klinis atau resep diet medis. Bila Anda memiliki kondisi kesehatan khusus atau
                  alergi, harap berkonsultasi dengan dokter atau ahli gizi terdaftar.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-black text-neutral-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>2. Sumber Data &amp; Estimasi AI</span>
                </h4>
                <p>
                  Katalog makanan kami mengacu pada <strong>Tabel Komposisi Pangan Indonesia (TKPI) Kemenkes RI</strong>{" "}
                  serta data pangan lokal terverifikasi. Hasil analisis foto menggunakan kecerdasan buatan (AI) yang
                  berfungsi sebagai perkiraan visual dan dapat dikoreksi secara manual oleh pengguna sebelum disimpan.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-black text-neutral-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>3. Rentang Harga Kuliner</span>
                </h4>
                <p>
                  Harga menu warteg, warmindo, dan bahan masakan merupakan estimasi rata-rata di berbagai kota percontohan
                  dan dapat berbeda tergantung lokasi spesifik serta kebijakan masing-masing warung.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-black text-neutral-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-sky-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>4. Privasi &amp; Data Lokal</span>
                </h4>
                <p>
                  Catatan diari kuliner dan preferensi porsi disimpan secara privat di peramban Anda. Foto makanan yang
                  diunggah untuk analisis visual diproses secara aman tanpa penyimpanan permanen foto pribadi.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="rounded-xl bg-neutral-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-black transition-colors min-h-[44px] cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

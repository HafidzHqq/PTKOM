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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 shadow-2xl border border-stone-200 space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center gap-4">
              <span className="p-3.5 rounded-2xl bg-orange-50 border border-orange-100 text-orange-700 shrink-0">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full font-['Inter']">
                  Selamat Datang
                </span>
                <h3 className="text-xl sm:text-2xl font-normal text-stone-900 mt-1.5 font-['Instrument_Serif']">
                  Hai, Penjelajah Kuliner Kost!
                </h3>
              </div>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed font-['Inter']">
              DompetKost hadir sebagai teman setia untuk membantumu berburu santapan nikmat, ramah kantong, dan seimbang setiap hari.
            </p>

            <div className="space-y-3 rounded-2xl bg-orange-50/50 p-4 border border-orange-100/50 text-sm text-stone-700 font-['Inter']">
              <div className="flex items-start gap-3">
                <span className="font-bold text-orange-700 shrink-0 mt-0.5">1.</span>
                <span>
                  <strong className="text-stone-900">Edukasi Santai:</strong> Informasi gizi dihitung sebagai panduan umum berbasis data TKPI Kemenkes, bukan diagnosis medis formal.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-orange-700 shrink-0 mt-0.5">2.</span>
                <span>
                  <strong className="text-stone-900">Estimasi Kuliner:</strong> Harga dan rasa mengacu pada rentang rata-rata warteg dan tempat makan lokal.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-orange-700 shrink-0 mt-0.5">3.</span>
                <span>
                  <strong className="text-stone-900">Privasi Terjaga:</strong> Catatan diari kuliner disimpan dengan aman dan privat di perangkatmu.
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleAcceptOnboarding}
                className="w-full rounded-full bg-orange-700 py-3.5 px-5 text-sm font-bold text-white shadow-lg shadow-orange-700/20 hover:bg-orange-800 transition-all active:scale-[0.98] min-h-[48px] cursor-pointer flex items-center justify-center gap-2 font-['Inter']"
              >
                <span>Siap, Mulai Kulineran!</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTerms(true);
                }}
                className="w-full text-center text-xs font-medium text-stone-500 hover:text-stone-800 underline underline-offset-4 transition-colors py-1 cursor-pointer font-['Inter']"
              >
                Baca Catatan &amp; Ketentuan Lengkap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Catatan & Ketentuan Full Modal (§7.1 & §7.2) */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="w-full max-w-lg max-h-[88vh] sm:max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-orange-100 text-orange-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-lg font-normal text-stone-900 font-['Instrument_Serif']">
                    Catatan &amp; Ketentuan Layanan
                  </h3>
                  <p className="text-[11px] text-stone-500 font-['Inter']">Transparansi dan prinsip DompetKost</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="h-8 w-8 rounded-full bg-stone-200/70 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                aria-label="Tutup modal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-stone-600 leading-relaxed font-['Inter']">
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 flex items-center gap-2">
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
                <h4 className="font-bold text-stone-900 flex items-center gap-2">
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
                <h4 className="font-bold text-stone-900 flex items-center gap-2">
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
                <h4 className="font-bold text-stone-900 flex items-center gap-2">
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
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-end font-['Inter']">
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="rounded-full bg-stone-900 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-stone-800 transition-colors min-h-[42px] cursor-pointer"
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

import Link from 'next/link';
import FooterBackground from './footer-background';
import { TermsLink } from '@/components/terms-and-onboarding';

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden selection:bg-neutral-900 selection:text-white">
      <link rel="preload" href="/footer-scrub.mp4" as="video" type="video/mp4" />
      <link rel="preload" href="/footer-poster.webp" as="image" type="image/webp" />
      <FooterBackground />

      {/* Full-width Navbar */}
      <header className="w-full z-20 sticky top-0">
        <nav className="bg-white/85 backdrop-blur-md px-4 sm:px-8 py-3 sm:py-4 border-b border-white/60 shadow-xs flex items-center justify-between transition-all">
          <Link href="/" className="inline-flex items-center" aria-label="DompetKost Beranda">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpeg"
              alt="DompetKost"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-neutral-600">
            <Link href="/dashboard" className="hover:text-black transition-colors">
              Dashboard
            </Link>
            <Link href="/analyze" className="hover:text-black transition-colors">
              Scan Makanan
            </Link>
            <Link href="/recipes" className="hover:text-black transition-colors">
              Daftar Resep
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-neutral-900 px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-black active:scale-[0.98] shadow-xs"
            >
              <span>Buka Aplikasi</span>
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content Area: Centered */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 z-10 flex-1 flex flex-col justify-end pb-16 sm:pb-24 items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-neutral-900 text-white text-[11px] sm:text-sm font-medium mb-4 shadow-xs">
          <svg className="w-4 h-4 text-neutral-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span>Asisten Kuliner &amp; Gizi Cerdas Anak Kost</span>
        </div>

        <h1 className="text-[1.75rem] leading-[1.2] sm:text-6xl sm:leading-[1.15] lg:text-7xl font-black text-black tracking-tight">
          Makan Enak ala Anak Kost, <br className="hidden sm:block" />
          <span className="text-neutral-700">
            Dompet Aman, Badan Nyaman.
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-sm sm:text-xl text-neutral-600 font-medium max-w-2xl leading-relaxed px-2">
          Temukan dan upload resep hemat anak kost, diverifikasi langsung oleh AI untuk keamanan makanan dan kalkulasi gizi akurat.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-6 sm:pt-8 w-full sm:w-auto px-4 sm:px-0 max-w-sm sm:max-w-none">
          <Link
            href="/recipes"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-black px-8 py-3.5 text-sm sm:text-base font-bold text-white transition-all hover:bg-neutral-800 active:scale-[0.98] shadow-md min-h-[44px]"
          >
            Daftar Resep
          </Link>
          <Link
            href="/analyze"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white/95 px-8 py-3.5 text-sm sm:text-base font-bold text-black transition-all hover:bg-neutral-100 active:scale-[0.98] shadow-xs min-h-[44px]"
          >
            Scan Makanan AI
          </Link>
        </div>
      </div>

      {/* Bottom Subtle Bar */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-600 font-medium bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-full border border-neutral-200/80">
          <p>
            DompetKost adalah panduan kuliner &amp; ringkasan gizi santai anak kost, bukan rujukan medis resmi.
          </p>
          <div className="flex items-center gap-4 text-neutral-500 font-semibold shrink-0">
            <TermsLink className="text-black hover:underline" />
            <span>&copy; 2026 PTKOM IF ITERA</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

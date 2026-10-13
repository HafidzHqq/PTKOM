import Link from 'next/link';
import FooterBackground from './footer-background';
import Logo from '@/components/logo';

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
              Analisis Gizi
            </Link>
            <Link href="/recommendations" className="hover:text-black transition-colors">
              Rekomendasi
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-neutral-900 px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-black active:scale-[0.98]"
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
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-neutral-900 tracking-tight leading-[1.15] drop-shadow-md">
          Budget Minimal, <br />
          <span className="text-black drop-shadow-sm">
            Sehat Maksimal.
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-xl text-neutral-800 font-semibold max-w-2xl leading-relaxed drop-shadow-md px-2">
          Pantau asupan gizi harian hanya dengan foto makanan. Dapatkan rekomendasi menu hemat yang ramah di kantong mahasiswa.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-6 sm:pt-8 w-full sm:w-auto px-4 sm:px-0 max-w-sm sm:max-w-none">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black active:scale-[0.98] shadow-sm"
          >
            Mulai Sekarang
          </Link>
          <Link
            href="/recommendations"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white/90 backdrop-blur-xs px-8 py-3.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50 active:scale-[0.98]"
          >
            Simulasi Budget
          </Link>
        </div>
      </div>

      {/* Bottom Subtle Bar */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
          <p>
            &copy; PTKOM IF ITERA 2026
          </p>
        </div>
      </footer>
    </main>
  );
}

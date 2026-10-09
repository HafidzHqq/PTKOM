import Link from 'next/link';
import FooterBackground from './footer-background';
import Logo from '@/components/logo';

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden selection:bg-neutral-900 selection:text-white">
      <FooterBackground />

      {/* Full-width Navbar */}
      <header className="w-full z-20 sticky top-0">
        <nav className="bg-white/70 backdrop-blur-lg px-6 sm:px-10 py-4 border-b border-white/50 shadow-sm flex items-center justify-between transition-all">
          <Logo size="md" />

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

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              <span>Buka Aplikasi</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content Area: Centered */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10 flex-1 flex flex-col justify-end pb-24 items-center text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-neutral-900 tracking-tight leading-[1.15] drop-shadow-md">
          Budget Minimal, <br />
          <span className="text-black drop-shadow-sm">
            Sehat Maksimal.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-neutral-800 font-semibold max-w-2xl leading-relaxed drop-shadow-md">
          Pantau asupan gizi harian hanya dengan foto makanan. Dapatkan rekomendasi menu hemat yang ramah di kantong mahasiswa.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            Mulai Sekarang
          </Link>
          <Link
            href="/recommendations"
            className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
          >
            Simulasi Budget
          </Link>
        </div>
      </div>

      {/* Bottom Subtle Bar */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
          <p>
            &copy; {new Date().getFullYear()} DompetKost • Dibuat khusus untuk anak kost Indonesia
          </p>
        </div>
      </footer>
    </main>
  );
}
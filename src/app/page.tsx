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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white text-sm font-bold shadow-md shadow-black/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>Buka Aplikasi</span>
              <span className="text-neutral-400">&rarr;</span>
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
            className="inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-black/30 hover:bg-neutral-800 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            Mulai Sekarang 🚀
          </Link>
          <Link
            href="/recommendations"
            className="inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md px-8 py-4 text-sm sm:text-base font-bold text-neutral-800 shadow-sm border border-neutral-200 hover:bg-neutral-50 hover:text-black transition-all hover:-translate-y-1"
          >
            Simulasi Budget 💰
          </Link>
        </div>
      </div>

      {/* Bottom Subtle Bar */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500 font-medium">
          <p>
            &copy; {new Date().getFullYear()} DompetKost • Dibuat khusus untuk anak kost Indonesia
          </p>
          <p className="flex items-center gap-1.5 bg-white/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/60">
            <span>👀</span>
            <span>Arahkan kursor untuk melihat karakter berinteraksi</span>
          </p>
        </div>
      </footer>
    </main>
  );
}
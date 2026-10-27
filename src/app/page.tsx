import Link from 'next/link';
import FooterBackground from './footer-background';
import { TermsLink } from '@/components/terms-and-onboarding';

const faqs = [
  {
    question: 'Apa itu DompetKost?',
    answer:
      'DompetKost adalah asisten kuliner dan gizi untuk anak kost. Kamu bisa mencari resep hemat, memindai makanan dengan AI, dan melihat ringkasan gizinya dalam satu tempat.',
  },
  {
    question: 'Bagaimana cara scan makanan?',
    answer:
      'Buka halaman Scan Makanan, lalu unggah atau ambil foto makananmu. AI akan mengenali bahan dan porsinya, kemudian menghitung estimasi kalori, protein, karbohidrat, dan lemak.',
  },
  {
    question: 'Apakah resepnya benar-benar hemat?',
    answer:
      'Setiap resep dilengkapi estimasi biaya bahan. Kamu juga bisa memfilter resep berdasarkan budget harian supaya masakan tetap ramah kantong.',
  },
  {
    question: 'Apakah akurasi gizinya bisa dijadikan rujukan medis?',
    answer:
      'Belum. Hasil analisis bersifat estimasi santai untuk membantu kesadaran gizi, bukan pengganti konsultasi dengan dokter atau ahli gizi.',
  },
  {
    question: 'Apakah DompetKost gratis?',
    answer:
      'Ya. Semua fitur utama seperti pencarian resep, rekomendasi budget, dan riwayat gizi bisa dipakai tanpa biaya.',
  },
  {
    question: 'Bagaimana data saya disimpan?',
    answer:
      'Akun dan riwayat gizimu hanya bisa diakses setelah login, dan data tidak dibagikan ke pihak lain. Kamu bisa berhenti kapan saja lewat halaman profil.',
  },
];

export default function Home() {
  return (
    <main className="relative w-full selection:bg-neutral-900 selection:text-white">
      {/* Hero with interactive mascot video background */}
      <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden">
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

        {/* Main Content Area: split so the mascot face stays fully visible */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex-1 flex flex-col justify-between pt-3 sm:pt-4 pb-4 sm:pb-6 items-center text-center">
          {/* Top cluster: headline (kept above the mascot's eyes) */}
          <div className="flex flex-col items-center text-center max-w-3xl">
            <h1 className="text-xl sm:text-4xl lg:text-[2.75rem] leading-tight sm:leading-[1.15] font-black text-black tracking-tight">
              Makan Enak ala Anak Kost, <br className="hidden sm:block" />
              <span className="text-neutral-700">
                Dompet Aman, Badan Nyaman.
              </span>
            </h1>
          </div>

          {/* Bottom cluster: CTAs (kept below the mascot's chin) */}
          <div className="flex flex-col items-center text-center max-w-xl">
            <div className="flex flex-row justify-center items-center gap-3 w-full sm:w-auto">
              <Link
                href="/recipes"
                className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2.5 sm:px-8 sm:py-3 text-xs sm:text-sm font-bold text-white transition-all hover:bg-neutral-800 active:scale-[0.98] shadow-md min-h-[40px]"
              >
                Daftar Resep
              </Link>
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white/95 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-black transition-all hover:bg-neutral-100 active:scale-[0.98] shadow-xs min-h-[40px]"
              >
                Scan Makanan AI
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Contact Footer */}
      <footer className="relative z-10 bg-gradient-to-b from-[#f4f4f4] via-[#F8F6F2] to-[#F3F0E9] border-t border-stone-200/80 text-neutral-900">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-12">
          
          {/* Header Section: Title & Quick Contact */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-stone-200/70">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100/90 border border-orange-200 text-orange-800 text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                <span>Pertanyaan Umum &bull; FAQ</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight">
                Pertanyaan yang Sering Ditanya
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-2xl">
                Penjelasan lengkap seputar fitur cerdas, kurasi resep hemat, dan estimasi nutrisi DompetKost.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-600 shrink-0">
              <span className="hidden sm:inline">Punya pertanyaan lain?</span>
              <a
                href="mailto:kontak@dompetkost.id"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200/80 text-stone-900 hover:text-orange-700 hover:border-orange-300 font-semibold shadow-2xs transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>kontak@dompetkost.id</span>
              </a>
            </div>
          </div>

          {/* Grid FAQ: 2 Baris 3 Kolom */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="bg-white/80 hover:bg-white border border-stone-200/80 hover:border-orange-200/90 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-stone-600">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Bar: Brand, Info ITERA, Ketentuan & Copyright */}
          <div className="mt-10 pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex items-center" aria-label="DompetKost Beranda">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.jpeg"
                  alt="DompetKost"
                  className="h-6 w-auto object-contain rounded"
                />
              </Link>
              <span className="font-bold text-stone-800">DompetKost</span>
              <span className="text-stone-300">&bull;</span>
              <span className="text-[11px] text-stone-500">Teknik Informatika &bull; ITERA 2026</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <TermsLink className="text-stone-600 hover:text-orange-700 transition-colors" />
              <span className="text-stone-300">&bull;</span>
              <span>&copy; 2026 PTKOM IF ITERA. All rights reserved.</span>
            </div>
          </div>

        </div>
      </footer>
    </main>
  );
}

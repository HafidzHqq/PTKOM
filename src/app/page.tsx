import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
              Makan Sehat, <span className="text-emerald-600">Sesuai Budget Kost!</span>
            </h1>
            <p className="mt-6 text-lg text-neutral-600 sm:text-xl max-w-2xl mx-auto">
              GiziKost membantu kamu memantau asupan gizi harian hanya dengan memfoto makanan. Dapatkan rekomendasi menu sehat yang ramah di kantong mahasiswa.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/budget"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-sm hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95"
              >
                Mulai Sekarang
              </Link>
              <Link
                href="#fitur"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-bold text-emerald-700 shadow-sm ring-1 ring-inset ring-emerald-200 hover:bg-emerald-50 transition-all"
              >
                Pelajari Fitur
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl"></div>
          <div className="absolute top-48 -left-24 w-72 h-72 rounded-full bg-amber-200/30 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Kenapa Pakai GiziKost?</h2>
            <p className="mt-4 text-lg text-neutral-600">Solusi cerdas untuk anak kost yang peduli kesehatan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-3xl bg-neutral-50 p-8 border border-neutral-100 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl mb-6">
                📸
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Scan Makanan AI</h3>
              <p className="text-neutral-600">
                Cukup foto makananmu, AI kami akan otomatis mengenali jenis makanan dan menghitung kalori serta makronutrisinya.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl bg-neutral-50 p-8 border border-neutral-100 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl mb-6">
                💡
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Rekomendasi Murah</h3>
              <p className="text-neutral-600">
                Kekurangan protein? GiziKost akan merekomendasikan tambahan menu murah seperti tempe atau tahu yang pas dengan budgetmu.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl bg-neutral-50 p-8 border border-neutral-100 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl mb-6">
                📊
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Pantau Progress</h3>
              <p className="text-neutral-600">
                Lihat ringkasan gizi harianmu dan pantau konsistensi makan sehatmu selama 7 hari terakhir dengan mudah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
            Siap Memulai Gaya Hidup Sehat?
          </h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan anak kost lainnya yang sudah membuktikan bahwa makan sehat tidak harus mahal.
          </p>
          <Link
            href="/budget"
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-bold text-emerald-700 shadow-lg hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95"
          >
            Atur Budget Makan
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥦</span>
            <span className="font-bold text-xl text-white">
              GiziKost
            </span>
          </div>
          <p className="text-neutral-400 text-sm">
            &copy; {new Date().getFullYear()} GiziKost. Dibuat untuk anak kost Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}
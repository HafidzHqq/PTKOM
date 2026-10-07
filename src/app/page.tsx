import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white pt-20 pb-24 sm:pt-32 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 text-emerald-700 font-medium text-sm mb-8 border border-emerald-200/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Solusi Gizi Anak Kost
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl md:text-7xl leading-tight">
              Makan Sehat, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Sesuai Budget Kost!</span>
            </h1>
            <p className="mt-8 text-lg text-neutral-600 sm:text-xl max-w-2xl mx-auto leading-relaxed">
              DompetKost membantu kamu memantau asupan gizi harian hanya dengan memfoto makanan. Dapatkan rekomendasi menu sehat yang ramah di kantong mahasiswa.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/budget"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Mulai Sekarang
              </Link>
              <Link
                href="#fitur"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-neutral-700 shadow-sm ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50 hover:text-emerald-700 transition-all"
              >
                Pelajari Fitur
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-emerald-200/20 blur-3xl"></div>
          <div className="absolute top-48 -left-24 w-[400px] h-[400px] rounded-full bg-teal-200/20 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-24 bg-white relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl md:text-5xl tracking-tight">Kenapa Pakai DompetKost?</h2>
            <p className="mt-4 text-lg text-neutral-500 max-w-2xl mx-auto">Solusi cerdas untuk anak kost yang peduli kesehatan tanpa harus menguras dompet.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="group rounded-[2.5rem] bg-white p-8 border border-neutral-100 text-center hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-2">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-4xl mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald-100">
                📸
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Scan Makanan AI</h3>
              <p className="text-neutral-500 leading-relaxed">
                Cukup foto makananmu, AI kami akan otomatis mengenali jenis makanan dan menghitung kalori serta makronutrisinya.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-[2.5rem] bg-white p-8 border border-neutral-100 text-center hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 hover:-translate-y-2">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-4xl mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:bg-amber-100">
                💡
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Rekomendasi Murah</h3>
              <p className="text-neutral-500 leading-relaxed">
                Kekurangan protein? DompetKost akan merekomendasikan tambahan menu murah seperti tempe atau tahu yang pas dengan budgetmu.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-[2.5rem] bg-white p-8 border border-neutral-100 text-center hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-2">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-100">
                📊
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Pantau Progress</h3>
              <p className="text-neutral-500 leading-relaxed">
                Lihat ringkasan gizi harianmu dan pantau konsistensi makan sehatmu selama 7 hari terakhir dengan mudah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl mb-6 tracking-tight">
            Siap Memulai Gaya Hidup Sehat?
          </h2>
          <p className="text-emerald-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan ribuan anak kost lainnya yang sudah membuktikan bahwa makan sehat tidak harus mahal.
          </p>
          <Link
            href="/budget"
            className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-lg font-bold text-emerald-700 shadow-xl hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95"
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
              DompetKost
            </span>
          </div>
          <p className="text-neutral-400 text-sm">
            &copy; {new Date().getFullYear()} DompetKost. Dibuat untuk anak kost Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}
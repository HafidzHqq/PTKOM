"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BudgetResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const savedRequest = localStorage.getItem("budget_request");
        if (!savedRequest) {
          router.push("/budget");
          return;
        }

        const payload = JSON.parse(savedRequest);
        
        const res = await fetch("/api/budget-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Gagal mengambil rekomendasi");
        
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [router]);

  if (loading) {
    return (
      <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800">Meracik Menu...</h2>
        <p className="text-gray-500 text-center mt-2">Mencari kombinasi makanan terbaik untuk budgetmu</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto flex flex-col items-center justify-center py-24">
        <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full text-center border border-neutral-100">
          <div className="text-5xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops, Terjadi Kesalahan</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => router.push("/budget")}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="bg-emerald-600 text-white pt-12 pb-24 px-6 md:px-8 rounded-[2rem] shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <button onClick={() => router.push("/budget")} className="p-2.5 bg-white/20 hover:bg-white/30 transition-colors rounded-full mr-4 backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Rekomendasi Menu</h1>
          </div>
          
          <div className="text-center">
            <p className="text-emerald-100 text-sm md:text-base font-medium mb-2 uppercase tracking-wider">Total Budget Harian</p>
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              Rp {Math.round(data?.dailyBudget || 0).toLocaleString('id-ID')}
            </h2>
            
            <div className="flex justify-center gap-4 md:gap-6 text-sm md:text-base">
              <div className="bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                <span className="block text-emerald-100 text-xs md:text-sm font-medium mb-1">Terpakai</span>
                <span className="font-bold text-lg md:text-xl">Rp {Math.round(data?.totalCost || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                <span className="block text-emerald-100 text-xs md:text-sm font-medium mb-1">Sisa</span>
                <span className="font-bold text-lg md:text-xl">Rp {Math.round(data?.remaining || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="-mt-12 relative z-20">
        {!data?.success && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 shadow-sm">
            <div className="flex items-start">
              <span className="text-3xl mr-4">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-800 text-lg">Budget Terlalu Kecil</h3>
                <p className="text-sm text-amber-700 mt-1 leading-relaxed">{data?.message}</p>
              </div>
            </div>
          </div>
        )}

        <h3 className="font-bold text-gray-800 text-xl mb-4 ml-2">
          {data?.success ? "Rencana Makan Hari Ini" : "Alternatif Termurah"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data?.success ? data.recommendations : data?.cheapest)?.map((item: any, idx: number) => (
            <Link 
              href={`/foods/${item.id}`} 
              key={idx}
              className="block bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-2">
                    {item.meal || (item.type === 'MASAK' ? 'Masak Sendiri' : 'Beli Jadi')}
                  </span>
                  <h4 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h4>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-emerald-600">
                    Rp {Math.round(item.calculatedPrice || 0).toLocaleString('id-ID')}
                  </span>
                  {item.type === 'MASAK' && (
                    <span className="text-[10px] text-gray-400">/ porsi</span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-2xl">
                <div className="flex items-center">
                  <span className="mr-1">🔥</span> {Math.round(item.calories)} kcal
                </div>
                <div className="flex items-center">
                  <span className="mr-1">🥩</span> {Math.round(item.protein)}g pro
                </div>
                {item.type === 'MASAK' && (
                  <div className="flex items-center ml-auto text-amber-600 font-medium">
                    ⏱️ {item.cookTimeMinutes} mnt
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {data?.monthlyPlan && (
          <div className="mt-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Estimasi Bulanan</h3>
            <p className="text-gray-500 text-sm mb-4">{data.monthlyPlan.note}</p>
            <div className="bg-emerald-50 rounded-2xl p-4 text-center">
              <span className="block text-emerald-700 text-sm mb-1">Total Pengeluaran Makan</span>
              <span className="text-2xl font-bold text-emerald-600">
                Rp {Math.round(data.monthlyPlan.estimatedMonthlyCost || 0).toLocaleString('id-ID')}
              </span>
              <span className="text-gray-500 text-sm"> / bulan</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
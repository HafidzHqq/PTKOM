"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ComparePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const res = await fetch(`/api/compare/${params.id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal membandingkan");
        }
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchComparison();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚖️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tidak Bisa Dibandingkan</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => router.back()} className="w-full py-3 rounded bg-emerald-600 text-white font-bold">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const { beli, masak, savings } = data.comparison;

  return (
    <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="bg-emerald-600 text-white pt-12 pb-24 px-6 md:px-8 rounded-lg shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <button onClick={() => router.back()} className="p-2.5 bg-white/20 hover:bg-white/30 transition-colors rounded-full mr-4 backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Beli vs Masak</h1>
          </div>
          
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">{data.foodName}</h2>
            <p className="text-emerald-100 text-sm md:text-base font-medium uppercase tracking-wider">Perbandingan harga per porsi</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="-mt-12 relative z-20 px-4 md:px-8">
        {/* Savings Card */}
        <div className={`rounded-lg p-6 md:p-8 shadow-sm border mb-8 text-center ${
          savings.isCheaperToCook 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <h3 className={`font-extrabold text-xl md:text-2xl mb-2 ${savings.isCheaperToCook ? 'text-emerald-800' : 'text-amber-800'}`}>
            {savings.isCheaperToCook ? 'Lebih Hemat Masak Sendiri!' : 'Lebih Murah Beli Jadi!'}
          </h3>
          <p className={`text-base md:text-lg font-medium mb-4 ${savings.isCheaperToCook ? 'text-emerald-600' : 'text-amber-600'}`}>
            Kamu bisa hemat {Math.abs(Math.round(savings.percentage))}%
          </p>
          <div className={`text-5xl md:text-6xl font-black tracking-tight ${savings.isCheaperToCook ? 'text-emerald-600' : 'text-amber-600'}`}>
            Rp {Math.abs(savings.amount).toLocaleString('id-ID')}
          </div>
          <p className={`text-sm font-medium uppercase tracking-wider mt-3 ${savings.isCheaperToCook ? 'text-emerald-500' : 'text-amber-500'}`}>
            selisih per porsi
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Beli Card */}
          <div className={`bg-white rounded-lg p-6 md:p-8 shadow-sm border ${!savings.isCheaperToCook ? 'ring-2 ring-emerald-500 shadow-md' : 'border-neutral-100'}`}>
            <div className="text-5xl mb-4 text-center">🥡</div>
            <h4 className="font-black text-neutral-900 text-xl text-center mb-2">Beli Jadi</h4>
            <div className="text-3xl font-black text-emerald-600 text-center mb-6">
              Rp {Math.round(beli.pricePerPortion || 0).toLocaleString('id-ID')}
            </div>
            <Link 
              href={`/foods/${beli.id}`}
              className="block w-full py-4 text-center text-sm font-bold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Lihat Detail
            </Link>
          </div>

          {/* Masak Card */}
          <div className={`bg-white rounded-lg p-6 md:p-8 shadow-sm border ${savings.isCheaperToCook ? 'ring-2 ring-emerald-500 shadow-md' : 'border-neutral-100'}`}>
            <div className="text-5xl mb-4 text-center">🍳</div>
            <h4 className="font-black text-neutral-900 text-xl text-center mb-2">Masak Sendiri</h4>
            <div className="text-3xl font-black text-emerald-600 text-center mb-6">
              Rp {Math.round(masak.pricePerPortion || 0).toLocaleString('id-ID')}
            </div>
            <Link 
              href={`/foods/${masak.id}`}
              className="block w-full py-4 text-center text-sm font-bold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Lihat Resep
            </Link>
          </div>
        </div>

        {/* Breakdown Masak */}
        {masak.cookDetails && (
          <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm border border-neutral-100">
            <h3 className="font-black text-neutral-900 text-xl mb-6">Rincian Biaya Masak</h3>
            <div className="space-y-4">
              {masak.cookDetails.breakdown.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center pb-3 border-b border-neutral-100 last:border-0 last:pb-0">
                  <span className="text-sm font-medium text-neutral-600">{item.ingredient}</span>
                  <span className="text-sm font-bold text-neutral-900">Rp {Math.round(item.cost).toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-neutral-100 flex justify-between items-center">
                <span className="text-sm font-bold text-neutral-800">Total Modal ({masak.cookDetails.portions} porsi)</span>
                <span className="text-base font-black text-emerald-600">Rp {Math.round(masak.cookDetails.totalCost).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
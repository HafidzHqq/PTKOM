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
        <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚖️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tidak Bisa Dibandingkan</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => router.back()} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const { beli, masak, savings } = data.comparison;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-emerald-600 text-white pt-12 pb-20 px-4 rounded-b-[2.5rem] shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <button onClick={() => router.back()} className="p-2 bg-white/20 rounded-full mr-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Beli vs Masak</h1>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{data.foodName}</h2>
            <p className="text-emerald-100 text-sm">Perbandingan harga per porsi</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 -mt-10">
        {/* Savings Card */}
        <div className={`rounded-3xl p-6 shadow-sm border mb-6 text-center ${
          savings.isCheaperToCook 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <h3 className={`font-bold text-lg mb-1 ${savings.isCheaperToCook ? 'text-emerald-800' : 'text-amber-800'}`}>
            {savings.isCheaperToCook ? 'Lebih Hemat Masak Sendiri!' : 'Lebih Murah Beli Jadi!'}
          </h3>
          <p className={`text-sm mb-3 ${savings.isCheaperToCook ? 'text-emerald-600' : 'text-amber-600'}`}>
            Kamu bisa hemat {Math.abs(Math.round(savings.percentage))}%
          </p>
          <div className={`text-3xl font-extrabold ${savings.isCheaperToCook ? 'text-emerald-600' : 'text-amber-600'}`}>
            Rp {Math.abs(savings.amount).toLocaleString('id-ID')}
          </div>
          <p className={`text-xs mt-1 ${savings.isCheaperToCook ? 'text-emerald-500' : 'text-amber-500'}`}>
            selisih per porsi
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Beli Card */}
          <div className={`bg-white rounded-3xl p-5 shadow-sm border ${!savings.isCheaperToCook ? 'ring-2 ring-emerald-500' : 'border-gray-100'}`}>
            <div className="text-3xl mb-3 text-center">🥡</div>
            <h4 className="font-bold text-gray-900 text-center mb-1">Beli Jadi</h4>
            <div className="text-xl font-extrabold text-emerald-600 text-center mb-4">
              Rp {beli.pricePerPortion.toLocaleString('id-ID')}
            </div>
            <Link 
              href={`/foods/${beli.id}`}
              className="block w-full py-2 text-center text-sm font-bold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100"
            >
              Lihat Detail
            </Link>
          </div>

          {/* Masak Card */}
          <div className={`bg-white rounded-3xl p-5 shadow-sm border ${savings.isCheaperToCook ? 'ring-2 ring-emerald-500' : 'border-gray-100'}`}>
            <div className="text-3xl mb-3 text-center">🍳</div>
            <h4 className="font-bold text-gray-900 text-center mb-1">Masak Sendiri</h4>
            <div className="text-xl font-extrabold text-emerald-600 text-center mb-4">
              Rp {masak.pricePerPortion.toLocaleString('id-ID')}
            </div>
            <Link 
              href={`/foods/${masak.id}`}
              className="block w-full py-2 text-center text-sm font-bold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100"
            >
              Lihat Resep
            </Link>
          </div>
        </div>

        {/* Breakdown Masak */}
        {masak.cookDetails && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Rincian Biaya Masak</h3>
            <div className="space-y-3">
              {masak.cookDetails.breakdown.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                  <span className="text-sm text-gray-600">{item.ingredient}</span>
                  <span className="text-sm font-bold text-gray-900">Rp {item.cost.toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">Total Modal ({masak.cookDetails.portions} porsi)</span>
                <span className="text-sm font-bold text-emerald-600">Rp {masak.cookDetails.totalCost.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [food, setFood] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await fetch(`/api/foods/${params.id}`);
        if (!res.ok) throw new Error("Makanan tidak ditemukan");
        const data = await res.json();
        setFood(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchFood();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">{error || "Data tidak ditemukan"}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-emerald-600 text-white rounded">
          Kembali
        </button>
      </div>
    );
  }

  const isMasak = food.type === "MASAK";

  return (
    <div className="w-full px-4 py-4 sm:py-8 md:px-8 lg:px-10 xl:px-12 space-y-6 sm:space-y-8 pb-24">
      {/* Header Image Area */}
      <div className="h-56 sm:h-64 bg-emerald-100 relative rounded-2xl overflow-hidden">
        <button 
          onClick={() => router.back()} 
          className="absolute top-4 sm:top-6 left-4 sm:left-6 p-2.5 sm:p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-sm z-10 hover:bg-white transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        {/* Placeholder for image */}
        <div className="w-full h-full flex items-center justify-center text-neutral-400">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="-mt-12 sm:-mt-16 relative z-10 px-0 sm:px-4 md:px-8">
        <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-neutral-100 mb-6">
          <div className="flex justify-between items-start mb-4">
            <span className={`px-3 py-1 sm:px-4 sm:py-1.5 text-xs font-bold rounded ${isMasak ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
              {isMasak ? 'Masak Sendiri' : 'Beli Jadi'}
            </span>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{food.category.replace('_', ' ')}</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 mb-2 sm:mb-3 tracking-tight">{food.name}</h1>
          
          <div className="mb-1">
            <span className="inline-block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Estimasi harga
            </span>
          </div>
          <div className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-600 mb-6 sm:mb-8 tracking-tight">
            ± Rp {Math.round(food.calculatedPrice || food.pricePerPortion || 0).toLocaleString('id-ID')}
            {isMasak && <span className="text-sm sm:text-base text-neutral-400 font-medium ml-2">/ porsi</span>}
          </div>

          {/* Nutrition Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-center">
            <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-100">
              <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Energi</span>
              <span className="block font-black text-neutral-900 text-2xl mt-1">{Math.round(food.calories)}</span>
              <span className="block text-xs font-semibold text-neutral-400 mt-0.5">kkal</span>
            </div>
            <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-100">
              <span className="block text-xs font-bold text-amber-600 uppercase tracking-wider">Protein</span>
              <span className="block font-black text-neutral-900 text-2xl mt-1">{Math.round(food.protein)}g</span>
              <span className="block text-xs font-semibold text-neutral-400 mt-0.5">protein</span>
            </div>
            <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-100">
              <span className="block text-xs font-bold text-sky-600 uppercase tracking-wider">Karbohidrat</span>
              <span className="block font-black text-neutral-900 text-2xl mt-1">{Math.round(food.carbs)}g</span>
              <span className="block text-xs font-semibold text-neutral-400 mt-0.5">karbo</span>
            </div>
            <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-100">
              <span className="block text-xs font-bold text-rose-600 uppercase tracking-wider">Lemak</span>
              <span className="block font-black text-neutral-900 text-2xl mt-1">{Math.round(food.fat)}g</span>
              <span className="block text-xs font-semibold text-neutral-400 mt-0.5">lemak</span>
            </div>
          </div>
        </div>

        {/* Masak Sendiri Details */}
        {isMasak && food.recipeItems && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-neutral-100 mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
              <h3 className="font-black text-neutral-900 text-lg sm:text-xl">Bahan &amp; Estimasi Biaya</h3>
              <span className="inline-block px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-bold rounded w-fit">Untuk {food.portionsYielded} porsi</span>
            </div>
            
            <div className="space-y-4">
              {food.recipeItems.map((item: any, idx: number) => {
                const cost = item.quantity * item.ingredient.pricePerUnit;
                return (
                  <div key={idx} className="flex justify-between items-center pb-3 border-b border-neutral-100 last:border-0 last:pb-0 gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-800 text-sm truncate">{item.ingredient.name}</p>
                      <p className="text-xs font-medium text-neutral-400">{item.quantity} {item.unit} (est. Rp {Math.round(item.ingredient.pricePerUnit).toLocaleString('id-ID')}/{item.ingredient.unit})</p>
                    </div>
                    <div className="font-black text-neutral-900 text-sm sm:text-base shrink-0">
                      ± Rp {Math.round(cost).toLocaleString('id-ID')}
                    </div>
                  </div>
                );
              })}
              
              {/* Gas/Listrik */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-50 gap-2">
                <div>
                  <p className="font-medium text-gray-800 text-sm">Gas/Listrik (Estimasi)</p>
                  <p className="text-xs text-gray-500">Waktu masak: {food.cookTimeMinutes} menit</p>
                </div>
                <div className="font-bold text-gray-900 text-sm sm:text-base shrink-0">
                  Rp 2.000
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
              <span className="font-bold text-gray-600 text-sm">Total Biaya Masak</span>
              <span className="font-bold text-emerald-600 text-lg sm:text-xl">
                Rp {Math.round((food.recipeItems.reduce((acc: number, item: any) => acc + (item.quantity * item.ingredient.pricePerUnit), 0)) + 2000).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        )}

        {/* Beli Jadi Details */}
        {!isMasak && food.places && food.places.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Tersedia di</h3>
            <div className="space-y-3">
              {food.places.map((fp: any, idx: number) => (
                <div key={idx} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 shrink-0 text-emerald-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{fp.place.name}</p>
                    <p className="text-xs text-gray-500">{fp.place.location} • {fp.place.source}</p>
                    <p className="text-xs font-medium text-emerald-600 mt-1">{fp.place.priceRange}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
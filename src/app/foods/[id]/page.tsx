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
        <button onClick={() => router.back()} className="px-6 py-2 bg-emerald-600 text-white rounded-xl">
          Kembali
        </button>
      </div>
    );
  }

  const isMasak = food.type === "MASAK";

  return (
    <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto space-y-8 pb-24">
      {/* Header Image Area */}
      <div className="h-64 bg-emerald-100 relative rounded-[2rem] overflow-hidden">
        <button 
          onClick={() => router.back()} 
          className="absolute top-6 left-6 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-sm z-10 hover:bg-white transition-colors"
        >
          <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        {/* Placeholder for image */}
        <div className="w-full h-full flex items-center justify-center text-6xl">
          {isMasak ? "🍳" : "🥡"}
        </div>
      </div>

      {/* Content */}
      <div className="-mt-16 relative z-10 px-4 md:px-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-start mb-4">
            <span className={`px-4 py-1.5 text-xs font-bold rounded-full ${isMasak ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
              {isMasak ? 'Masak Sendiri' : 'Beli Jadi'}
            </span>
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">{food.category.replace('_', ' ')}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">{food.name}</h1>
          
          <div className="text-4xl md:text-5xl font-black text-emerald-600 mb-8 tracking-tight">
            Rp {Math.round(food.calculatedPrice || food.pricePerPortion || 0).toLocaleString('id-ID')}
            {isMasak && <span className="text-base text-gray-400 font-medium ml-2">/ porsi</span>}
          </div>

          {/* Nutrition Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="block text-2xl mb-2">🔥</span>
              <span className="block font-bold text-gray-900 text-xl">{Math.round(food.calories)}</span>
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Kkal</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="block text-2xl mb-2">🥩</span>
              <span className="block font-bold text-gray-900 text-xl">{Math.round(food.protein)}g</span>
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Protein</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="block text-2xl mb-2">🍚</span>
              <span className="block font-bold text-gray-900 text-xl">{Math.round(food.carbs)}g</span>
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Karbo</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="block text-2xl mb-2">🥑</span>
              <span className="block font-bold text-gray-900 text-xl">{Math.round(food.fat)}g</span>
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Lemak</span>
            </div>
          </div>
        </div>

        {/* Masak Sendiri Details */}
        {isMasak && food.recipeItems && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
              <h3 className="font-extrabold text-gray-900 text-xl">Bahan & Estimasi Biaya</h3>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">Untuk {food.portionsYielded} porsi</span>
            </div>
            
            <div className="space-y-4">
              {food.recipeItems.map((item: any, idx: number) => {
                const cost = item.quantity * item.ingredient.pricePerUnit;
                return (
                  <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-800">{item.ingredient.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} {item.unit} (Rp {Math.round(item.ingredient.pricePerUnit).toLocaleString('id-ID')}/{item.ingredient.unit})</p>
                    </div>
                    <div className="font-bold text-gray-900">
                      Rp {Math.round(cost).toLocaleString('id-ID')}
                    </div>
                  </div>
                );
              })}
              
              {/* Gas/Listrik */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <div>
                  <p className="font-medium text-gray-800">Gas/Listrik (Estimasi)</p>
                  <p className="text-xs text-gray-500">Waktu masak: {food.cookTimeMinutes} menit</p>
                </div>
                <div className="font-bold text-gray-900">
                  Rp 2.000
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-600">Total Biaya Masak</span>
              <span className="font-bold text-emerald-600 text-xl">
                Rp {Math.round((food.recipeItems.reduce((acc: number, item: any) => acc + (item.quantity * item.ingredient.pricePerUnit), 0)) + 2000).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        )}

        {/* Beli Jadi Details */}
        {!isMasak && food.places && food.places.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Tersedia di</h3>
            <div className="space-y-3">
              {food.places.map((fp: any, idx: number) => (
                <div key={idx} className="flex items-start p-3 bg-gray-50 rounded-2xl">
                  <div className="text-2xl mr-3">📍</div>
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
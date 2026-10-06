"use client";

import { useState, useEffect } from "react";
import { RecommendationResult } from "@/lib/ai/recommend";

interface RecommendationData extends RecommendationResult {
  target: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  consumed: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
}

export default function FoodRecommendations({ refreshKey }: { refreshKey?: number }) {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommendations");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memuat rekomendasi");
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [refreshKey]);

  return (
    <section className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            💡 Rekomendasi Makanan Hari Ini
          </h2>
          <p className="text-sm text-gray-500">
            Disesuaikan dengan kekurangan gizi harian Anda
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
        >
          {loading ? "Memuat..." : "🔄 Refresh Rekomendasi"}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          {/* Status Kekurangan Gizi */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              📊 Status Kebutuhan Gizi Hari Ini
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
              <div className="rounded bg-white p-2 border">
                <span className="text-gray-500">Kalori</span>
                <p className="font-bold text-orange-600">
                  {Math.max(0, data.target.calories - data.consumed.calories)} kcal kurang
                </p>
                <span className="text-[10px] text-gray-400">
                  ({data.consumed.calories}/{data.target.calories})
                </span>
              </div>
              <div className="rounded bg-white p-2 border">
                <span className="text-gray-500">Protein</span>
                <p className="font-bold text-blue-600">
                  {Math.max(0, data.target.protein_g - data.consumed.protein_g)}g kurang
                </p>
                <span className="text-[10px] text-gray-400">
                  ({data.consumed.protein_g}/{data.target.protein_g}g)
                </span>
              </div>
              <div className="rounded bg-white p-2 border">
                <span className="text-gray-500">Lemak</span>
                <p className="font-bold text-yellow-600">
                  {Math.max(0, data.target.fat_g - data.consumed.fat_g)}g kurang
                </p>
                <span className="text-[10px] text-gray-400">
                  ({data.consumed.fat_g}/{data.target.fat_g}g)
                </span>
              </div>
              <div className="rounded bg-white p-2 border">
                <span className="text-gray-500">Karbo</span>
                <p className="font-bold text-purple-600">
                  {Math.max(0, data.target.carbs_g - data.consumed.carbs_g)}g kurang
                </p>
                <span className="text-[10px] text-gray-400">
                  ({data.consumed.carbs_g}/{data.target.carbs_g}g)
                </span>
              </div>
              <div className="rounded bg-white p-2 border">
                <span className="text-gray-500">Serat</span>
                <p className="font-bold text-green-600">
                  {Math.max(0, data.target.fiber_g - data.consumed.fiber_g)}g kurang
                </p>
                <span className="text-[10px] text-gray-400">
                  ({data.consumed.fiber_g}/{data.target.fiber_g}g)
                </span>
              </div>
            </div>
          </div>

          {/* List Rekomendasi */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              🍲 Makanan yang Disarankan:
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {data.recommendations.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-lg border border-green-100 bg-green-50/50 p-4"
                >
                  <div>
                    <h4 className="font-bold text-green-900">{item.food_name}</h4>
                    <p className="mt-1 text-xs text-gray-600">{item.reason}</p>
                  </div>
                  <div className="mt-4 border-t border-green-100 pt-2 text-[11px] text-gray-500">
                    <span>🔥 {item.estimated_nutrition.calories} kcal</span> •{" "}
                    <span>🥩 {item.estimated_nutrition.protein_g}g P</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advice */}
          {data.advice && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
              <strong>💡 Saran Ahli Gizi:</strong> {data.advice}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

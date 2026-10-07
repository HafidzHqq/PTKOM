"use client";

import { useState, useEffect } from "react";

interface RecommendationItem {
  food_name: string;
  estimated_price_idr: number;
  estimated_nutrition: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  reason: string;
}

interface RecommendationData {
  target: { calories: number; protein_g: number; fat_g: number; carbs_g: number; fiber_g: number };
  consumed: { calories: number; protein_g: number; fat_g: number; carbs_g: number; fiber_g: number };
  recommendations: RecommendationItem[];
  advice: string;
}

export default function RecommendationsPage() {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommendations", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat rekomendasi");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = data?.recommendations.filter((r) => {
    if (budgetFilter === null) return true;
    return r.estimated_price_idr <= budgetFilter;
  });

  return (
    <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">💡 Rekomendasi Cerdas</h1>
          <p className="text-sm text-gray-500 mt-1">Smart Combo — disesuaikan dengan kekurangan gizi hari ini (standar WHO).</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50 border border-green-100"
        >
          {loading ? "Memuat..." : "🔄 Refresh"}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      )}

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {data && !loading && (
        <>
          {/* Status */}
          <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
            <h3 className="mb-3 text-sm font-bold text-gray-700">📊 Status Kebutuhan Gizi Hari Ini</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: "Kalori", value: Math.max(0, data.target.calories - data.consumed.calories), unit: "kcal", consumed: data.consumed.calories, target: data.target.calories, color: "text-orange-600" },
                { label: "Protein", value: Math.max(0, data.target.protein_g - data.consumed.protein_g), unit: "g", consumed: data.consumed.protein_g, target: data.target.protein_g, color: "text-blue-600" },
                { label: "Lemak", value: Math.max(0, data.target.fat_g - data.consumed.fat_g), unit: "g", consumed: data.consumed.fat_g, target: data.target.fat_g, color: "text-yellow-600" },
                { label: "Karbo", value: Math.max(0, data.target.carbs_g - data.consumed.carbs_g), unit: "g", consumed: data.consumed.carbs_g, target: data.target.carbs_g, color: "text-purple-600" },
                { label: "Serat", value: Math.max(0, data.target.fiber_g - data.consumed.fiber_g), unit: "g", consumed: data.consumed.fiber_g, target: data.target.fiber_g, color: "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border bg-white p-3">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-sm font-bold ${s.color}`}>{s.value} {s.unit} kurang</p>
                  <p className="text-[11px] text-gray-400">({s.consumed}/{s.target})</p>
                  <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (s.consumed / s.target) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Filter budget:</span>
            {[
              { label: "Semua", value: null },
              { label: "≤ Rp 5.000", value: 5000 },
              { label: "≤ Rp 10.000", value: 10000 },
              { label: "≤ Rp 15.000", value: 15000 },
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => setBudgetFilter(f.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${budgetFilter === f.value ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-300"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Recommendations Grid */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">🍲 Makanan yang Disarankan ({filtered?.length || 0})</h3>
            {filtered && filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((item, idx) => (
                  <div key={idx} className="flex flex-col justify-between rounded-xl border border-green-100 bg-green-50/40 p-4 hover:shadow-md transition">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-green-900 text-sm leading-tight">{item.food_name}</h4>
                        <span className="shrink-0 rounded-full bg-green-200 px-2.5 py-1 text-[11px] font-bold text-green-800">
                          Rp {item.estimated_price_idr.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-600 leading-relaxed">{item.reason}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-green-100 pt-3 text-[11px] text-gray-600">
                      <span className="rounded bg-white px-2 py-1 border">🔥 {item.estimated_nutrition.calories} kcal</span>
                      <span className="rounded bg-white px-2 py-1 border">🥩 {item.estimated_nutrition.protein_g}g</span>
                      <span className="rounded bg-white px-2 py-1 border">🌾 {item.estimated_nutrition.fiber_g}g serat</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-8 text-center border border-dashed rounded-xl">Tidak ada rekomendasi untuk filter ini.</p>
            )}
          </div>

          {data.advice && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              <strong>💡 Saran Ahli Gizi:</strong> {data.advice}
            </div>
          )}
        </>
      )}
    </div>
  );
}

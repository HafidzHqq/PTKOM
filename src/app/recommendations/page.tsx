"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  // State for Nutrition Status
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Budget Planner
  const [budget, setBudget] = useState("");
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [mode, setMode] = useState<"beli" | "masak" | "both">("both");
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetResult, setBudgetResult] = useState<any>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  const quickBudgets = period === "daily" 
    ? [20000, 35000, 50000, 75000, 100000]
    : [500000, 1000000, 1500000, 2000000, 3000000];

  const numericBudget = Number(budget) || 0;
  const dailyBudget = period === "monthly" ? numericBudget / 30 : numericBudget;
  const budgetPerMeal = dailyBudget > 0 ? dailyBudget / mealsPerDay : 0;

  const getPurchasingPower = (perMeal: number) => {
    if (perMeal === 0) return { label: "Belum ada data", color: "text-neutral-400", bg: "bg-neutral-100", desc: "Masukkan budget untuk melihat estimasi." };
    if (perMeal < 10000) return { label: "Super Hemat", color: "text-neutral-700", bg: "bg-neutral-200", desc: "Fokus pada masak sendiri (telur, tempe, sayur) atau warteg sederhana." };
    if (perMeal <= 25000) return { label: "Seimbang", color: "text-black", bg: "bg-neutral-200", desc: "Bisa beli nasi rames lengkap atau masak ayam/ikan." };
    return { label: "Premium", color: "text-white", bg: "bg-black", desc: "Bebas pilih menu daging sapi, seafood, atau makan di resto." };
  };

  const power = getPurchasingPower(budgetPerMeal);

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

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetLoading(true);
    setBudgetError(null);
    setBudgetResult(null);

    const payload = {
      budget: numericBudget,
      period,
      meals_per_day: mealsPerDay,
      mode,
      filters: { halal: true }
    };

    try {
      const res = await fetch("/api/budget-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal mengambil rekomendasi budget");
      
      setBudgetResult(result);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById("budget-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setBudgetError(err.message);
    } finally {
      setBudgetLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-black text-white shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight">Rekomendasi & Budget</h1>
            <p className="text-sm md:text-base text-neutral-500 font-medium mt-1">
              Smart Combo — disesuaikan dengan kekurangan gizi dan budgetmu.
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="rounded-lg bg-black px-5 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Memuat..." : "🔄 Refresh"}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        </div>
      )}

      {error && <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-sm font-medium text-black">{error}</div>}

      {data && !loading && (
        <>
          {/* Status */}
          <div className="rounded-lg bg-white p-6 md:p-8 border border-neutral-200 shadow-sm">
            <h3 className="mb-6 text-lg font-black text-black">Status Kebutuhan Gizi Hari Ini</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: "Kalori", value: Math.max(0, data.target.calories - data.consumed.calories), unit: "kcal", consumed: data.consumed.calories, target: data.target.calories },
                { label: "Protein", value: Math.max(0, data.target.protein_g - data.consumed.protein_g), unit: "g", consumed: data.consumed.protein_g, target: data.target.protein_g },
                { label: "Lemak", value: Math.max(0, data.target.fat_g - data.consumed.fat_g), unit: "g", consumed: data.consumed.fat_g, target: data.target.fat_g },
                { label: "Karbo", value: Math.max(0, data.target.carbs_g - data.consumed.carbs_g), unit: "g", consumed: data.consumed.carbs_g, target: data.target.carbs_g },
                { label: "Serat", value: Math.max(0, data.target.fiber_g - data.consumed.fiber_g), unit: "g", consumed: data.consumed.fiber_g, target: data.target.fiber_g },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{s.label}</p>
                  <p className="text-lg font-black mt-1 text-black">{s.value} <span className="text-xs font-medium text-neutral-500">{s.unit} kurang</span></p>
                  <p className="text-[11px] font-bold text-neutral-400 mt-1">({s.consumed}/{s.target})</p>
                  <div className="mt-3 h-2 rounded bg-neutral-200 overflow-hidden">
                    <div className="h-full rounded bg-black" style={{ width: `${Math.min(100, (s.consumed / s.target) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Planner Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 rounded-lg border border-neutral-200 bg-white p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-black text-black mb-6">Smart Budget Planner</h3>
              <form onSubmit={handleBudgetSubmit} className="space-y-8">
                
                <div className="bg-neutral-50 p-1.5 rounded-lg flex border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => { setPeriod("daily"); setBudget(""); }}
                    className={`flex-1 py-3 text-sm font-bold rounded transition-all ${
                      period === "daily" ? "bg-white text-black shadow-sm border border-neutral-200" : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    Budget Harian
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPeriod("monthly"); setBudget(""); }}
                    className={`flex-1 py-3 text-sm font-bold rounded transition-all ${
                      period === "monthly" ? "bg-white text-black shadow-sm border border-neutral-200" : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    Budget Bulanan
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-black">
                    Berapa nominal budgetmu?
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <span className="text-neutral-400 font-bold text-xl">Rp</span>
                    </div>
                    <input
                      type="number"
                      required
                      min="5000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="block w-full pl-14 pr-4 py-4 border-2 border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:ring-0 focus:border-black text-2xl font-black text-black transition-colors placeholder:text-neutral-300"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {quickBudgets.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setBudget(amount.toString())}
                        className="px-4 py-2 rounded border border-neutral-200 bg-white text-sm font-bold text-neutral-600 hover:border-black hover:text-black hover:bg-neutral-50 transition-colors"
                      >
                        {amount >= 1000000 ? `${amount / 1000000} Juta` : `${amount / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-black">
                    Frekuensi Makan Sehari
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: 2, label: "2x Sehari", desc: "Pagi & Malam" },
                      { val: 3, label: "3x Sehari", desc: "Standar" },
                      { val: 4, label: "4x Sehari", desc: "Plus Camilan" },
                    ].map((m) => (
                      <button
                        key={m.val}
                        type="button"
                        onClick={() => setMealsPerDay(m.val)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          mealsPerDay === m.val
                            ? "border-black bg-neutral-50"
                            : "border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        <div className={`text-lg font-black ${mealsPerDay === m.val ? "text-black" : "text-neutral-900"}`}>
                          {m.label}
                        </div>
                        <div className={`text-xs mt-1 font-medium ${mealsPerDay === m.val ? "text-neutral-600" : "text-neutral-500"}`}>
                          {m.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-black">
                    Preferensi Sumber Makanan
                  </label>
                  <div className="space-y-3">
                    {[
                      { id: "both", label: "Campur (Beli & Masak)", desc: "Kombinasi paling hemat & praktis", icon: "🍱", badge: "Rekomendasi" },
                      { id: "beli", label: "Beli Jadi Saja", desc: "Cocok untuk yang sibuk / anak kost tanpa dapur", icon: "🥡" },
                      { id: "masak", label: "Masak Sendiri Saja", desc: "Maksimal gizi & hemat hingga 50%", icon: "🍳" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMode(m.id as any)}
                        className={`w-full flex items-center p-4 rounded-lg border-2 transition-all text-left ${
                          mode === m.id
                            ? "border-black bg-neutral-50"
                            : "border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        <div className="text-3xl mr-4 bg-white w-12 h-12 rounded flex items-center justify-center shadow-sm border border-neutral-100">
                          {m.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${mode === m.id ? "text-black" : "text-neutral-900"}`}>
                              {m.label}
                            </span>
                            {m.badge && (
                              <span className="px-2 py-0.5 rounded-md bg-neutral-200 text-black text-[10px] font-bold uppercase tracking-wider">
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 font-medium ${mode === m.id ? "text-neutral-700" : "text-neutral-500"}`}>
                            {m.desc}
                          </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          mode === m.id ? "border-black bg-black" : "border-neutral-300 bg-white"
                        }`}>
                          {mode === m.id && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={budgetLoading || numericBudget < 5000}
                  className="w-full group relative flex items-center justify-center gap-3 rounded-lg bg-black p-5 font-bold text-white shadow-md transition-all hover:bg-neutral-800 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  <span className="relative z-10 text-lg">
                    {budgetLoading ? "Meracik Menu..." : "Buat Rencana Makan"}
                  </span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="rounded-lg bg-black p-6 md:p-8 shadow-xl text-white relative overflow-hidden">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-6">Estimasi Alokasi</h3>
                
                <div className="space-y-6 relative z-10">
                  <div>
                    <p className="text-neutral-400 text-sm font-medium mb-1">Budget per Porsi (Rata-rata)</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black tracking-tight">
                        Rp {Math.round(budgetPerMeal).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${power.bg} ${power.color}`}>
                        {power.label}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {power.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Simple Recommendations (if no budget result yet) */}
              {!budgetResult && data?.recommendations && data.recommendations.length > 0 && (
                <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-black mb-4">Rekomendasi Cepat (Tanpa Filter)</h3>
                  <div className="space-y-4">
                    {data.recommendations.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-sm text-black">{item.food_name}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{item.estimated_nutrition.calories} kcal • {item.estimated_nutrition.protein_g}g pro</p>
                        </div>
                        <span className="text-sm font-black text-black">Rp {item.estimated_price_idr.toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Budget Results Section */}
          {budgetError && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-sm font-medium text-black text-center">
              ⚠️ {budgetError}
            </div>
          )}

          {budgetResult && (
            <div id="budget-results" className="pt-8 border-t border-neutral-200">
              <div className="bg-black text-white p-6 md:p-8 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold tracking-tight mb-6">Hasil Racikan Menu</h2>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <span className="block text-neutral-400 text-sm font-medium mb-1">Total Terpakai</span>
                    <span className="font-black text-3xl">Rp {Math.round(budgetResult.totalCost || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="block text-neutral-400 text-sm font-medium mb-1">Sisa Budget</span>
                    <span className="font-black text-3xl">Rp {Math.round(budgetResult.remaining || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {!budgetResult.success && (
                <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-5 mb-8 shadow-sm">
                  <h3 className="font-bold text-black text-lg">Budget Terlalu Kecil</h3>
                  <p className="text-sm text-neutral-700 mt-1 leading-relaxed">{budgetResult.message}</p>
                </div>
              )}

              <h3 className="font-black text-black text-2xl mb-6">
                {budgetResult.success ? "Rencana Makan Hari Ini" : "Alternatif Termurah"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(budgetResult.success ? budgetResult.recommendations : budgetResult.cheapest)?.map((item: any, idx: number) => (
                  <Link 
                    href={`/foods/${item.id}`} 
                    key={idx}
                    className="block bg-white rounded-lg p-6 shadow-sm border border-neutral-200 hover:shadow-md hover:border-black transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="inline-block px-3 py-1.5 bg-neutral-100 text-black text-xs font-bold rounded mb-3">
                          {item.meal || (item.type === 'MASAK' ? 'Masak Sendiri' : 'Beli Jadi')}
                        </span>
                        <h4 className="font-black text-black text-lg leading-tight group-hover:underline">{item.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-black text-lg">
                          Rp {Math.round(item.calculatedPrice || 0).toLocaleString('id-ID')}
                        </span>
                        {item.type === 'MASAK' && (
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">/ porsi</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 text-xs font-bold text-neutral-600 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                      <div className="flex items-center">
                        <span className="mr-1.5 text-base">🔥</span> {Math.round(item.calories)} kcal
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1.5 text-base">🥩</span> {Math.round(item.protein)}g pro
                      </div>
                      {item.type === 'MASAK' && (
                        <div className="flex items-center ml-auto text-black bg-neutral-200 px-2 py-1 rounded-lg">
                          ⏱️ {item.cookTimeMinutes} mnt
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {budgetResult.monthlyPlan && (
                <div className="mt-10 bg-white rounded-lg p-8 shadow-sm border border-neutral-200">
                  <h3 className="font-black text-black text-xl mb-2">Estimasi Bulanan</h3>
                  <p className="text-neutral-500 text-sm font-medium mb-6">{budgetResult.monthlyPlan.note}</p>
                  <div className="bg-neutral-50 rounded-lg p-6 text-center border border-neutral-200">
                    <span className="block text-neutral-600 text-sm font-bold mb-2 uppercase tracking-wider">Total Pengeluaran Makan</span>
                    <span className="text-4xl font-black text-black">
                      Rp {Math.round(budgetResult.monthlyPlan.estimatedMonthlyCost || 0).toLocaleString('id-ID')}
                    </span>
                    <span className="text-neutral-500 text-sm font-bold"> / bulan</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {data.advice && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 md:p-8 text-sm md:text-base text-black shadow-sm flex gap-4 items-start">
              <span className="text-3xl">💡</span>
              <div>
                <strong className="block font-black mb-1">Saran Ahli Gizi:</strong>
                <p className="font-medium leading-relaxed opacity-90">{data.advice}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

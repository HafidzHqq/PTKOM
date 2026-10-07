"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BudgetInputPage() {
  const router = useRouter();
  const [budget, setBudget] = useState("");
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [mode, setMode] = useState<"beli" | "masak" | "both">("both");
  const [loading, setLoading] = useState(false);

  // Quick select options
  const quickBudgets = period === "daily" 
    ? [20000, 35000, 50000, 75000, 100000]
    : [500000, 1000000, 1500000, 2000000, 3000000];

  // Live calculations for the preview panel
  const numericBudget = Number(budget) || 0;
  const dailyBudget = period === "monthly" ? numericBudget / 30 : numericBudget;
  const budgetPerMeal = dailyBudget > 0 ? dailyBudget / mealsPerDay : 0;

  const getPurchasingPower = (perMeal: number) => {
    if (perMeal === 0) return { label: "Belum ada data", color: "text-gray-400", bg: "bg-gray-100", desc: "Masukkan budget untuk melihat estimasi." };
    if (perMeal < 10000) return { label: "Super Hemat", color: "text-amber-700", bg: "bg-amber-100", desc: "Fokus pada masak sendiri (telur, tempe, sayur) atau warteg sederhana." };
    if (perMeal <= 25000) return { label: "Seimbang", color: "text-blue-700", bg: "bg-blue-100", desc: "Bisa beli nasi rames lengkap atau masak ayam/ikan." };
    return { label: "Premium", color: "text-emerald-700", bg: "bg-emerald-100", desc: "Bebas pilih menu daging sapi, seafood, atau makan di resto." };
  };

  const power = getPurchasingPower(budgetPerMeal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      budget: numericBudget,
      period,
      meals_per_day: mealsPerDay,
      mode,
      filters: {
        halal: true,
      }
    };

    localStorage.setItem("budget_request", JSON.stringify(payload));
    router.push("/budget/results");
  };

  return (
    <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">Smart Budget Planner</h1>
          <p className="text-sm md:text-base text-neutral-500 font-medium mt-1">
            Rencanakan pengeluaran makanmu dan dapatkan rekomendasi gizi optimal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 rounded-[2rem] border border-neutral-100 bg-white p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Period Selection (Segmented Control) */}
            <div className="bg-gray-50 p-1.5 rounded-2xl flex">
              <button
                type="button"
                onClick={() => { setPeriod("daily"); setBudget(""); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  period === "daily" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Budget Harian
              </button>
              <button
                type="button"
                onClick={() => { setPeriod("monthly"); setBudget(""); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  period === "monthly" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Budget Bulanan
              </button>
            </div>

            {/* Budget Input */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-900">
                Berapa nominal budgetmu?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold text-xl">Rp</span>
                </div>
                <input
                  type="number"
                  required
                  min="5000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="block w-full pl-14 pr-4 py-4 border-2 border-gray-100 rounded-2xl bg-white focus:ring-0 focus:border-emerald-500 text-2xl font-black text-gray-900 transition-colors placeholder:text-gray-300"
                  placeholder="0"
                />
              </div>
              
              {/* Quick Select Chips */}
              <div className="flex flex-wrap gap-2">
                {quickBudgets.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setBudget(amount.toString())}
                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                  >
                    {amount >= 1000000 ? `${amount / 1000000} Juta` : `${amount / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Meals Per Day */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-900">
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
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      mealsPerDay === m.val
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className={`text-lg font-black ${mealsPerDay === m.val ? "text-emerald-700" : "text-gray-900"}`}>
                      {m.label}
                    </div>
                    <div className={`text-xs mt-1 font-medium ${mealsPerDay === m.val ? "text-emerald-600" : "text-gray-500"}`}>
                      {m.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Mode Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-900">
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
                    className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all text-left ${
                      mode === m.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className="text-3xl mr-4 bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                      {m.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${mode === m.id ? "text-emerald-900" : "text-gray-900"}`}>
                          {m.label}
                        </span>
                        {m.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 font-medium ${mode === m.id ? "text-emerald-700" : "text-gray-500"}`}>
                        {m.desc}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      mode === m.id ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
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

          </form>
        </div>

        {/* Right Column: Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Budget Intelligence Card */}
          <div className="rounded-[2rem] bg-neutral-900 p-6 md:p-8 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-emerald-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
            
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

              <div className="bg-neutral-800/50 rounded-2xl p-4 border border-neutral-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${power.bg} ${power.color}`}>
                    {power.label}
                  </span>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {power.desc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                <div>
                  <p className="text-xs text-neutral-500 font-medium mb-1">Target Kalori Harian</p>
                  <p className="font-bold text-emerald-400">~2.100 kcal</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-medium mb-1">Target Protein</p>
                  <p className="font-bold text-emerald-400">~65g</p>
                </div>
              </div>
            </div>
          </div>

          {/* Market Price Ticker */}
          <div className="rounded-[2rem] border border-neutral-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📊</span>
              <h3 className="font-bold text-gray-900">Harga Pasar Saat Ini</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Beras (Medium)</span>
                <span className="font-bold text-gray-900">Rp 15.100 <span className="text-gray-400 text-xs font-normal">/kg</span></span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Telur Ayam</span>
                <span className="font-bold text-gray-900">Rp 28.500 <span className="text-gray-400 text-xs font-normal">/kg</span></span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Daging Ayam</span>
                <span className="font-bold text-gray-900">Rp 33.800 <span className="text-gray-400 text-xs font-normal">/kg</span></span>
              </div>
              <p className="text-[10px] text-gray-400 mt-4 text-center">
                *Berdasarkan data WFP & Bapanas (Bandar Lampung)
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || numericBudget < 5000}
            className="w-full group relative flex items-center justify-center gap-3 rounded-[2rem] bg-emerald-600 p-5 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:active:scale-100 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10 text-lg">
              {loading ? "Meracik Menu..." : "Buat Rencana Makan"}
            </span>
            {!loading && (
              <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
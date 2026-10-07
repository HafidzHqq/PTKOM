"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo";

export default function BudgetInputPage() {
  const router = useRouter();
  const [budget, setBudget] = useState("");
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [mode, setMode] = useState<"beli" | "masak" | "both">("both");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      budget: Number(budget),
      period,
      meals_per_day: mealsPerDay,
      mode,
      filters: {
        halal: true,
      }
    };

    // Simpan ke localStorage untuk diambil di halaman hasil
    localStorage.setItem("budget_request", JSON.stringify(payload));
    
    // Redirect ke halaman hasil
    router.push("/budget/results");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <Logo size="md" />
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Atur Budget Makan</h1>
          <p className="text-gray-500 mt-2">Dapatkan rekomendasi menu sehat yang pas di kantong.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Budget Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Berapa budget makanmu?
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">Rp</span>
              </div>
              <input
                type="number"
                required
                min="5000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border-gray-200 rounded-2xl bg-gray-50 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-semibold"
                placeholder="Contoh: 50000"
              />
            </div>
          </div>

          {/* Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode Budget
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPeriod("daily")}
                className={`py-3 px-4 rounded-xl border font-medium transition-all ${
                  period === "daily"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Harian
              </button>
              <button
                type="button"
                onClick={() => setPeriod("monthly")}
                className={`py-3 px-4 rounded-xl border font-medium transition-all ${
                  period === "monthly"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>

          {/* Meals Per Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Berapa kali makan sehari?
            </label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100">
              <button
                type="button"
                onClick={() => setMealsPerDay(Math.max(1, mealsPerDay - 1))}
                className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 font-bold text-xl"
              >
                -
              </button>
              <span className="text-xl font-bold text-gray-900">{mealsPerDay}x</span>
              <button
                type="button"
                onClick={() => setMealsPerDay(Math.min(5, mealsPerDay + 1))}
                className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 font-bold text-xl"
              >
                +
              </button>
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferensi Makan
            </label>
            <div className="space-y-3">
              {[
                { id: "both", label: "Campur (Beli & Masak)", icon: "🍱" },
                { id: "beli", label: "Beli Jadi Saja", icon: "🥡" },
                { id: "masak", label: "Masak Sendiri Saja", icon: "🍳" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id as any)}
                  className={`w-full flex items-center p-4 rounded-2xl border transition-all ${
                    mode === m.id
                      ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-2xl mr-4">{m.icon}</span>
                  <span className={`font-medium ${mode === m.id ? "text-emerald-800" : "text-gray-700"}`}>
                    {m.label}
                  </span>
                  {mode === m.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !budget}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? "Mencari Rekomendasi..." : "Cari Rekomendasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface HistoryEntry {
  id: string;
  foods: { name: string }[];
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  logged_at: string;
}

interface DailyNutrition {
  dateKey: string;
  label: string;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
}

export default function InsightsPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch("/api/nutrition-history", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat riwayat");
        setEntries(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat riwayat");
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  // Aggregate data by day
  const dailyHistory = entries.reduce<Record<string, DailyNutrition>>((days, entry) => {
    const date = new Date(entry.logged_at);
    const dateKey = date.toISOString().split("T")[0];
    const label = date.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
    
    if (!days[dateKey]) {
      days[dateKey] = { dateKey, label, calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 };
    }
    
    days[dateKey].calories += Number(entry.calories);
    days[dateKey].protein_g += Number(entry.protein_g);
    days[dateKey].fat_g += Number(entry.fat_g);
    days[dateKey].carbs_g += Number(entry.carbs_g);
    days[dateKey].fiber_g += Number(entry.fiber_g);
    
    return days;
  }, {});

  // Sort by date ascending for charts
  const days = Object.values(dailyHistory).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  
  // Calculate averages
  const totalDays = days.length;
  const avgCalories = totalDays > 0 ? Math.round(days.reduce((sum, d) => sum + d.calories, 0) / totalDays) : 0;
  const avgProtein = totalDays > 0 ? Math.round(days.reduce((sum, d) => sum + d.protein_g, 0) / totalDays) : 0;
  const avgFiber = totalDays > 0 ? Math.round(days.reduce((sum, d) => sum + d.fiber_g, 0) / totalDays) : 0;

  // WHO Targets
  const TARGET_CALORIES = 2250;
  const TARGET_PROTEIN = 84;
  const TARGET_FIBER = 25;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📊 Analisis Gizi</h1>
          <p className="text-sm text-gray-500 mt-1">Wawasan dan tren kesehatan Anda selama 7 hari terakhir.</p>
        </div>
        <Link href="/analyze" className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition text-center">
          + Catat Makanan
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : totalDays === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 mb-4">Belum ada data yang cukup untuk dianalisis.</p>
          <Link href="/analyze" className="text-green-600 font-semibold hover:underline">Mulai catat makanan Anda</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Rata-rata Kalori</p>
                <span className="text-xl">🔥</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">{avgCalories}</p>
              <p className={`mt-1 text-xs font-medium ${avgCalories > TARGET_CALORIES ? 'text-red-600' : 'text-green-600'}`}>
                {avgCalories > TARGET_CALORIES ? 'Melebihi target' : 'Sesuai target'} ({TARGET_CALORIES} kcal)
              </p>
            </div>
            
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Rata-rata Protein</p>
                <span className="text-xl">🥩</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">{avgProtein}g</p>
              <p className={`mt-1 text-xs font-medium ${avgProtein < TARGET_PROTEIN ? 'text-orange-600' : 'text-green-600'}`}>
                {avgProtein < TARGET_PROTEIN ? 'Kurang dari target' : 'Sesuai target'} ({TARGET_PROTEIN}g)
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Rata-rata Serat</p>
                <span className="text-xl">🥬</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">{avgFiber}g</p>
              <p className={`mt-1 text-xs font-medium ${avgFiber < TARGET_FIBER ? 'text-orange-600' : 'text-green-600'}`}>
                {avgFiber < TARGET_FIBER ? 'Kurang dari target' : 'Sesuai target'} ({TARGET_FIBER}g)
              </p>
            </div>
          </div>

          {/* Trend Chart (Simplified CSS-based bar chart) */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Tren Kalori 7 Hari Terakhir</h2>
            <div className="flex h-48 items-end gap-2 sm:gap-4">
              {days.map((day) => {
                const heightPct = Math.min(100, (day.calories / (TARGET_CALORIES * 1.5)) * 100);
                const isOver = day.calories > TARGET_CALORIES;
                
                return (
                  <div key={day.dateKey} className="group relative flex flex-1 flex-col items-center justify-end h-full">
                    {/* Tooltip */}
                    <div className="absolute -top-10 hidden rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap z-10">
                      {Math.round(day.calories)} kcal
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 ${isOver ? 'bg-red-400' : 'bg-green-400'} group-hover:opacity-80`}
                      style={{ height: `${Math.max(5, heightPct)}%` }}
                    ></div>
                    
                    {/* Label */}
                    <span className="mt-2 text-[10px] sm:text-xs text-gray-500">{day.label}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Target Line Legend */}
            <div className="mt-6 flex items-center gap-4 text-xs text-gray-500 border-t pt-4">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-green-400"></div>
                <span>Sesuai Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-red-400"></div>
                <span>Melebihi Target</span>
              </div>
            </div>
          </div>

          {/* Health Insights */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Wawasan Kesehatan</h2>
            <div className="space-y-3">
              {avgProtein < TARGET_PROTEIN && (
                <div className="flex gap-3 rounded-xl bg-orange-50 p-4 text-orange-800">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-sm">Asupan Protein Rendah</p>
                    <p className="text-xs mt-1 opacity-90">Rata-rata protein Anda ({avgProtein}g) masih di bawah target WHO ({TARGET_PROTEIN}g). Perbanyak konsumsi telur, tempe, tahu, atau daging tanpa lemak.</p>
                  </div>
                </div>
              )}
              
              {avgFiber < TARGET_FIBER && (
                <div className="flex gap-3 rounded-xl bg-orange-50 p-4 text-orange-800">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-sm">Asupan Serat Kurang</p>
                    <p className="text-xs mt-1 opacity-90">Rata-rata serat Anda ({avgFiber}g) masih di bawah target WHO ({TARGET_FIBER}g). Tambahkan lebih banyak sayuran hijau dan buah-buahan ke dalam menu harian Anda.</p>
                  </div>
                </div>
              )}

              {avgCalories > TARGET_CALORIES && (
                <div className="flex gap-3 rounded-xl bg-red-50 p-4 text-red-800">
                  <span className="text-xl">🚨</span>
                  <div>
                    <p className="font-semibold text-sm">Kalori Berlebih</p>
                    <p className="text-xs mt-1 opacity-90">Rata-rata kalori Anda ({avgCalories} kcal) melebihi batas harian ({TARGET_CALORIES} kcal). Kurangi porsi makan atau hindari camilan manis dan gorengan.</p>
                  </div>
                </div>
              )}

              {avgProtein >= TARGET_PROTEIN && avgFiber >= TARGET_FIBER && avgCalories <= TARGET_CALORIES && (
                <div className="flex gap-3 rounded-xl bg-green-50 p-4 text-green-800">
                  <span className="text-xl">🌟</span>
                  <div>
                    <p className="font-semibold text-sm">Pola Makan Sangat Baik!</p>
                    <p className="text-xs mt-1 opacity-90">Anda berhasil menjaga asupan kalori, protein, dan serat sesuai dengan standar kesehatan. Pertahankan kebiasaan baik ini!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

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
  label: string;
  dateKey: string;
  entries: HistoryEntry[];
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nutrition-history", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat riwayat");
      setEntries(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const dailyHistory = entries.reduce<Record<string, DailyNutrition>>((days, entry) => {
    const date = new Date(entry.logged_at);
    const dateKey = date.toISOString().split("T")[0];
    const label = date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const day =
      days[dateKey] ||
      (days[dateKey] = {
        label,
        dateKey,
        entries: [],
        calories: 0,
        protein_g: 0,
        fat_g: 0,
        carbs_g: 0,
        fiber_g: 0,
      });
    day.entries.push(entry);
    day.calories += Number(entry.calories);
    day.protein_g += Number(entry.protein_g);
    day.fat_g += Number(entry.fat_g);
    day.carbs_g += Number(entry.carbs_g);
    day.fiber_g += Number(entry.fiber_g);
    return days;
  }, {});

  const days = Object.values(dailyHistory).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  const totalWeekCalories = days.slice(0, 7).reduce((s, d) => s + d.calories, 0);
  const avgCalories = days.length > 0 ? Math.round(totalWeekCalories / Math.min(7, days.length)) : 0;

  return (
    <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">📅 Riwayat & Statistik</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau pola makan harian Anda selama 7 hari terakhir.</p>
        </div>
        <button onClick={loadHistory} disabled={loading} className="rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 border border-green-100 disabled:opacity-50">
          {loading ? "Memuat..." : "🔄 Muat Ulang"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Hari Tercatat</p>
          <p className="text-2xl font-bold text-gray-900">{days.length}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Entri</p>
          <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
          <p className="text-xs text-orange-600 font-medium">Rata-rata Kalori/Hari</p>
          <p className="text-2xl font-bold text-orange-700">{avgCalories} <span className="text-xs font-normal">kcal</span></p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <p className="text-xs text-green-600 font-medium">Target WHO</p>
          <p className="text-2xl font-bold text-green-700">2250 <span className="text-xs font-normal">kcal</span></p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      )}
      {error && <p className="text-sm text-red-700 rounded-xl border border-red-200 bg-red-50 p-4">{error}</p>}
      {!loading && !error && days.length === 0 && (
        <p className="text-sm text-gray-500 border border-dashed rounded-xl p-8 text-center">Belum ada catatan. Analisis makanan untuk mulai mengisi riwayat.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {days.map((day) => (
          <article key={day.dateKey} className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
              <h3 className="font-bold capitalize text-gray-900 text-sm sm:text-base">{day.label}</h3>
              <span className="text-sm font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">{Math.round(day.calories)} kcal</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px]">
              <div className="rounded-lg bg-blue-50 p-2"><p className="font-bold text-blue-700">{day.protein_g.toFixed(1)}g</p><p className="text-gray-500">Protein</p></div>
              <div className="rounded-lg bg-yellow-50 p-2"><p className="font-bold text-yellow-700">{day.fat_g.toFixed(1)}g</p><p className="text-gray-500">Lemak</p></div>
              <div className="rounded-lg bg-purple-50 p-2"><p className="font-bold text-purple-700">{day.carbs_g.toFixed(1)}g</p><p className="text-gray-500">Karbo</p></div>
              <div className="rounded-lg bg-green-50 p-2"><p className="font-bold text-green-700">{day.fiber_g.toFixed(1)}g</p><p className="text-gray-500">Serat</p></div>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
              {day.entries.map((entry) => (
                <li key={entry.id} className="flex justify-between gap-4 rounded-lg bg-gray-50 px-3 py-2">
                  <span className="truncate text-xs">
                    {new Date(entry.logged_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} · {entry.foods.map((f) => f.name).join(", ")}
                  </span>
                  <span className="shrink-0 text-xs font-semibold">{Math.round(Number(entry.calories))} kcal</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
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
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">📅 Riwayat & Statistik</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau pola makan harian Anda selama 7 hari terakhir.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/analyze" className="rounded-lg bg-neutral-100 px-5 py-2.5 text-sm font-bold text-black hover:bg-neutral-200 transition-colors">
            📊 Lihat Wawasan
          </Link>
          <button onClick={loadHistory} disabled={loading} className="rounded-lg bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 transition-colors disabled:opacity-50">
            {loading ? "Memuat..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Hari Tercatat</p>
          <p className="text-3xl font-black text-gray-900">{days.length}</p>
        </div>
        <div className="rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Entri</p>
          <p className="text-3xl font-black text-gray-900">{entries.length}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Rata-rata Kalori/Hari</p>
          <p className="text-3xl font-black text-black">{avgCalories} <span className="text-sm font-medium text-neutral-500">kcal</span></p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Target Harian</p>
          <p className="text-3xl font-black text-black">2250 <span className="text-sm font-medium text-neutral-500">kcal</span></p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        </div>
      )}
      {error && <p className="text-sm text-black rounded-lg border border-neutral-200 bg-neutral-50 p-4 font-medium">{error}</p>}
      {!loading && !error && days.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-12 text-center bg-gray-50/50">
          <span className="text-5xl mb-4">🍽️</span>
          <p className="text-base font-bold text-gray-600">Belum ada catatan</p>
          <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">Analisis makanan untuk mulai mengisi riwayat harianmu.</p>
          <Link href="/analyze" className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition-all">
            Scan Makanan Sekarang
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {days.map((day) => (
          <article key={day.dateKey} className="rounded-lg border border-neutral-100 bg-white p-6 md:p-8 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-4">
              <h3 className="font-black capitalize text-gray-900 text-lg">{day.label}</h3>
              <span className="text-sm font-black text-black bg-neutral-100 px-3 py-1.5 rounded-full">{Math.round(day.calories)} kcal</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3 text-center">
              <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200"><p className="font-black text-black text-lg">{day.protein_g.toFixed(1)}g</p><p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Protein</p></div>
              <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200"><p className="font-black text-black text-lg">{day.fat_g.toFixed(1)}g</p><p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Lemak</p></div>
              <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200"><p className="font-black text-black text-lg">{day.carbs_g.toFixed(1)}g</p><p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Karbo</p></div>
              <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200"><p className="font-black text-black text-lg">{day.fiber_g.toFixed(1)}g</p><p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Serat</p></div>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              {day.entries.map((entry) => (
                <li key={entry.id} className="flex justify-between items-center gap-4 rounded-lg bg-gray-50 px-4 py-3 border border-gray-100">
                  <span className="truncate text-sm font-medium text-gray-700">
                    <span className="text-xs font-bold text-gray-400 mr-2">{new Date(entry.logged_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                    {entry.foods.map((f) => f.name).join(", ")}
                  </span>
                  <span className="shrink-0 text-sm font-black text-black">{Math.round(Number(entry.calories))} kcal</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface NutritionHistoryEntry {
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
  entries: NutritionHistoryEntry[];
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
}

export default function NutritionHistory({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [entries, setEntries] = useState<NutritionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/nutrition-history", {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Gagal memuat riwayat gizi");
        }
        if (active) {
          setEntries(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat riwayat gizi",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadHistory();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const dailyHistory = entries.reduce<Record<string, DailyNutrition>>(
    (days, entry) => {
      const date = new Date(entry.logged_at);
      const label = date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const day =
        days[label] ||
        (days[label] = {
          label,
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
    },
    {},
  );

  return (
    <section className="space-y-4 border-y border-neutral-200 py-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-neutral-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Diari Kuliner Harian</span>
          </h2>
          <p className="text-xs text-neutral-500 font-medium">Catatan santapan 7 hari terakhir</p>
        </div>
        <Link
          href="/history"
          className="text-xs sm:text-sm font-bold text-orange-700 hover:text-orange-800 transition-colors flex items-center gap-1 group"
        >
          <span>Lihat Diari & Lencana</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {loading && <p className="text-sm text-neutral-500">Memuat catatan kuliner...</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
      {!loading && !error && Object.keys(dailyHistory).length === 0 && (
        <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/40 p-6 text-center">
          <p className="text-sm font-bold text-amber-950">
            Belum ada santapan tercatat hari ini
          </p>
          <p className="text-xs text-amber-900/70 mt-1">
            Gunakan fitur Scan Makanan atau Daftar Resep untuk mulai mengisi diari kulinermu!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {Object.values(dailyHistory).map((day) => (
          <article
            key={day.label}
            className="rounded-xl border border-neutral-100 bg-white p-4 shadow-xs"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-100 pb-2">
              <h3 className="font-bold capitalize text-neutral-900 text-sm">{day.label}</h3>
              <span className="text-xs font-black text-amber-950 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                {Math.round(day.calories)} kkal
              </span>
            </div>
            <p className="mt-2 text-xs font-medium text-neutral-500">
              Protein <strong className="text-neutral-800">{day.protein_g.toFixed(1)}g</strong> · Lemak{" "}
              <strong className="text-neutral-800">{day.fat_g.toFixed(1)}g</strong> · Karbo{" "}
              <strong className="text-neutral-800">{day.carbs_g.toFixed(1)}g</strong> · Serat{" "}
              <strong className="text-neutral-800">{day.fiber_g.toFixed(1)}g</strong>
            </p>
            <ul className="mt-2.5 space-y-1.5 text-xs text-neutral-600">
              {day.entries.map((entry) => (
                <li key={entry.id} className="flex justify-between items-center gap-4 bg-neutral-50/80 px-2.5 py-1.5 rounded-md">
                  <span className="truncate">
                    <span className="font-mono text-neutral-400 mr-1.5 text-[11px]">
                      {new Date(entry.logged_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {entry.foods.map((food) => food.name).join(", ")}
                  </span>
                  <span className="shrink-0 font-bold text-neutral-800">
                    {Math.round(Number(entry.calories))} kkal
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

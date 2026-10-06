"use client";

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
          setEntries(data);
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
    <section className="space-y-4 border-y border-gray-200 py-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold">Riwayat gizi harian</h2>
        <span className="text-sm text-gray-500">7 hari terakhir</span>
      </div>

      {loading && <p className="text-sm text-gray-500">Memuat riwayat...</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
      {!loading && !error && Object.keys(dailyHistory).length === 0 && (
        <p className="text-sm text-gray-500">
          Belum ada catatan. Analisis makanan untuk mulai mengisi riwayat.
        </p>
      )}

      <div className="space-y-4">
        {Object.values(dailyHistory).map((day) => (
          <article
            key={day.label}
            className="border-b border-gray-100 pb-4 last:border-0"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-medium capitalize">{day.label}</h3>
              <span className="text-sm font-semibold text-green-700">
                {Math.round(day.calories)} kcal
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Protein {day.protein_g.toFixed(1)} g · Lemak{" "}
              {day.fat_g.toFixed(1)} g · Karbo {day.carbs_g.toFixed(1)} g ·
              Serat {day.fiber_g.toFixed(1)} g
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-500">
              {day.entries.map((entry) => (
                <li key={entry.id} className="flex justify-between gap-4">
                  <span className="truncate">
                    {new Date(entry.logged_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {entry.foods.map((food) => food.name).join(", ")}
                  </span>
                  <span className="shrink-0">
                    {Math.round(Number(entry.calories))} kcal
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

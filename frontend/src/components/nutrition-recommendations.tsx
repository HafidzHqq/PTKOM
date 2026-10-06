"use client";

import { useEffect, useState } from "react";

interface RecommendedFood {
  name: string;
  category: string;
  avg_price_idr: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  availability: string;
}

interface RecommendationResult {
  deficiencies: string[];
  recommendations: { food: RecommendedFood; reason: string }[];
  current_nutrition: {
    current_calories: number;
    current_protein_g: number;
    current_fat_g: number;
    current_carbs_g: number;
    current_fiber_g: number;
  };
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function NutritionRecommendations({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadRecommendations = async () => {
      setLoading(true);
      try {
        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            day_start: dayStart.toISOString(),
            day_end: dayEnd.toISOString(),
          }),
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Gagal memuat rekomendasi");
        }
        if (active) {
          setResult(data);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat rekomendasi",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadRecommendations();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <section className="space-y-5 border-b border-gray-200 pb-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold">Saran untuk hari ini</h2>
        <p className="text-sm text-gray-500">
          Berdasarkan total scan hari ini
        </p>
      </div>

      {loading && <p className="text-sm text-gray-500">Menghitung kebutuhan gizi...</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      {result && !loading && (
        <>
          <div
            className={`border-l-4 p-4 ${
              result.deficiencies.some((item) => item.includes("rendah"))
                ? "border-amber-500 bg-amber-50 text-amber-950"
                : "border-green-600 bg-green-50 text-green-950"
            }`}
          >
            <h3 className="font-semibold">Ringkasan kebutuhan</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {result.deficiencies.map((deficiency) => (
                <li key={deficiency}>{deficiency}</li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {result.recommendations.map(({ food, reason }) => (
              <article key={food.name} className="border border-gray-200 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{food.name}</h3>
                  <span className="text-sm font-medium text-green-700">
                    {formatRupiah(food.avg_price_idr)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{reason}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {food.calories} kcal · Protein {food.protein_g} g · Serat {food.fiber_g} g · {food.availability.replaceAll("_", " ")}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
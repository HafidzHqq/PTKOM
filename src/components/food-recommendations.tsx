"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { RecommendationResult } from "@/lib/ai/recommend";
import { CULINARY_CATALOG } from "@/lib/data/culinaryCatalog";

interface RecommendationData extends RecommendationResult {
  target: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  consumed: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
}

export default function FoodRecommendations({
  refreshKey,
}: {
  refreshKey?: number;
}) {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommendations");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memuat rekomendasi");
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [refreshKey]);

  // Find matching item in CULINARY_CATALOG for richer metadata (photo, tags, etc.)
  const getCatalogMatch = (foodName: string) => {
    const cleanName = foodName.toLowerCase();
    return CULINARY_CATALOG.find(
      (c) =>
        cleanName.includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(cleanName)
    );
  };

  const handleLogFood = async (item: RecommendationData["recommendations"][0], idx: number) => {
    setSavingIdx(idx);
    try {
      const match = getCatalogMatch(item.food_name);
      const payload = {
        foods: [
          {
            name: item.food_name,
            portion_grams: match?.portion.grams || 100,
            nutrition: {
              calories: item.estimated_nutrition?.calories || 0,
              protein_g: item.estimated_nutrition?.protein_g || 0,
              fat_g: item.estimated_nutrition?.fat_g || 0,
              carbs_g: item.estimated_nutrition?.carbs_g || 0,
              fiber_g: item.estimated_nutrition?.fiber_g || 0,
            },
          },
        ],
        total_nutrition: {
          calories: item.estimated_nutrition?.calories || 0,
          protein_g: item.estimated_nutrition?.protein_g || 0,
          fat_g: item.estimated_nutrition?.fat_g || 0,
          carbs_g: item.estimated_nutrition?.carbs_g || 0,
          fiber_g: item.estimated_nutrition?.fiber_g || 0,
        },
      };

      const res = await fetch("/api/nutrition-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSavedIndices((prev) => new Set(prev).add(idx));
      }
    } catch (err) {
      console.error("Gagal mencatat makanan ke diari:", err);
    } finally {
      setSavingIdx(null);
    }
  };

  const getTagColorClass = (tag: string) => {
    switch (tag) {
      case "pedas-gurih":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "berkuah-segar":
      case "asam-segar":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "wangi-rempah":
      case "gurih-renyah":
      case "manis-legit":
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 md:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 shrink-0 border border-orange-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
              Inspirasi Menu Hemat Hari Ini
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              Rekomendasi hidangan lezat dan ramah kantong untuk lengkapi energimu.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/recipes"
            className="rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3.5 py-2 text-xs font-semibold text-neutral-700 transition shadow-xs"
          >
            Semua Resep Kost →
          </Link>
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="rounded-xl bg-orange-600 hover:bg-orange-700 px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-50 flex items-center gap-2 shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <span>{loading ? "Meracik..." : "Rekomendasi Baru"}</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-orange-600 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 font-medium">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {data.recommendations.map((item, idx) => {
            const match = getCatalogMatch(item.food_name);
            const flavorTags = (match?.flavorTags || ["gurih-renyah"]).slice(0, 3);
            const isExpanded = expandedCard === idx;
            const isSaved = savedIndices.has(idx);
            const isSaving = savingIdx === idx;

            return (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs hover:border-amber-400 hover:shadow-md transition-all group overflow-hidden"
                  >
                    <div>
                      {/* 1. Foto / Visual Thumbnail */}
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-neutral-100 flex items-center justify-center border border-neutral-100 mb-3">
                        {match?.image ? (
                          <Image
                            src={match.image.src}
                            alt={match.image.alt || item.food_name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-3 select-none">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <span className="text-[11px] font-bold text-amber-900 mt-2 uppercase tracking-wider">
                              {match?.category || "Pilihan Kost"}
                            </span>
                          </div>
                        )}
                        <span className="absolute bottom-2 right-2 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-white">
                          {match?.venue ? match.venue : "Warteg"}
                        </span>
                      </div>

                      {/* 2. Nama Makanan */}
                      <h4 className="font-extrabold text-neutral-900 text-base line-clamp-1">
                        {item.food_name}
                      </h4>

                      {/* 3. Harga (Perkiraan) */}
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-orange-700">
                          Rp {item.estimated_price_idr?.toLocaleString("id-ID") || "-"}
                        </span>
                        <span className="text-[11px] font-medium text-neutral-500">
                          (perkiraan)
                        </span>
                      </div>

                      {/* 4. ≤3 Badge Rasa */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {flavorTags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-tight ${getTagColorClass(
                              tag
                            )}`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <p className="mt-2.5 text-xs text-neutral-600 leading-relaxed font-medium line-clamp-2">
                        {item.reason}
                      </p>

                      {/* 5. 1 Baris Gizi Ringkas */}
                      <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs font-bold">
                        <span className="text-amber-900">
                          {item.estimated_nutrition?.calories ?? 0} kkal
                        </span>
                        <span className="text-neutral-800">
                          {item.estimated_nutrition?.protein_g ?? 0}g protein
                        </span>
                      </div>

                      {/* 2.3a Drawer / Expandable Gizi Lengkap */}
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setExpandedCard(isExpanded ? null : idx)}
                          className="text-[11px] font-bold text-neutral-500 hover:text-orange-700 flex items-center gap-1 transition-colors py-1 focus-visible:outline-none focus-visible:underline cursor-pointer"
                        >
                          <span>{isExpanded ? "Sembunyikan rincian" : "Rincian gizi lengkap"}</span>
                          <span className="text-[9px]">{isExpanded ? "▲" : "▼"}</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-1.5 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] space-y-1 text-neutral-700 animate-in fade-in duration-200">
                            <div className="flex justify-between">
                              <span>Lemak:</span>
                              <span className="font-bold text-neutral-900">
                                {item.estimated_nutrition?.fat_g ?? 0}g
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Karbohidrat:</span>
                              <span className="font-bold text-neutral-900">
                                {item.estimated_nutrition?.carbs_g ?? 0}g
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Serat:</span>
                              <span className="font-bold text-emerald-800">
                                {item.estimated_nutrition?.fiber_g ?? 0}g
                              </span>
                            </div>
                            {match?.portion && (
                              <div className="flex justify-between border-t border-neutral-200 pt-1 text-neutral-600">
                                <span>Porsi standar:</span>
                                <span className="font-semibold text-neutral-800">
                                  {match.portion.label} ({match.portion.grams}g)
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 6. Tombol "Catat ke Diari" (Target sentuh minimal 44x44px) */}
                    <div className="mt-4 pt-3 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => handleLogFood(item, idx)}
                        disabled={isSaving || isSaved}
                        className={`w-full min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-1 cursor-pointer ${
                          isSaved
                            ? "bg-emerald-600 text-white cursor-default"
                            : "bg-orange-600 hover:bg-orange-700 text-white"
                        }`}
                      >
                        {isSaving ? (
                          <span>Mencatat...</span>
                        ) : isSaved ? (
                          <span>Tercatat di Diari</span>
                        ) : (
                          <span>Catat ke Diari</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          {/* Advice / Tips Kuliner Cerdas */}
          {data.advice && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 text-xs sm:text-sm text-neutral-800 flex items-start gap-3">
              <span className="shrink-0 text-orange-600 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              <div>
                <strong className="font-bold text-neutral-900">Biar Makin Seimbang:</strong>
                <p className="mt-0.5 text-neutral-600 leading-relaxed font-medium">
                  {data.advice}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

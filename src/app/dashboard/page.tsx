"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    calories: 1450,
    protein: 35,
    fat: 48,
    carbs: 210,
    fiber: 8,
    target: 2250,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/recommendations");
        if (res.ok) {
          const data = await res.json();
          // Use real data if available and greater than 0, otherwise default to demo/mock from Figma
          if (data.consumed?.calories > 0) {
            setSummary({
              calories: data.consumed.calories,
              protein: data.consumed.protein_g,
              fat: data.consumed.fat_g,
              carbs: data.consumed.carbs_g,
              fiber: data.consumed.fiber_g,
              target: data.target.calories,
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const progress = Math.min(100, (summary.calories / summary.target) * 100);

  const budget = { remaining: 12000, total: 25000 };

  const macros = [
    {
      name: "Protein",
      current: Math.round(summary.protein),
      target: 60,
      status: "Kurang",
      statusColor: "text-amber-700 bg-amber-100",
      barColor: "bg-amber-500",
    },
    {
      name: "Lemak",
      current: Math.round(summary.fat),
      target: 65,
      status: "Kurang",
      statusColor: "text-amber-700 bg-amber-100",
      barColor: "bg-amber-500",
    },
    {
      name: "Karbohidrat",
      current: Math.round(summary.carbs),
      target: 360,
      status: "Kurang",
      statusColor: "text-amber-700 bg-amber-100",
      barColor: "bg-amber-500",
    },
    {
      name: "Serat",
      current: Math.round(summary.fiber),
      target: 32,
      status: "Sangat kurang",
      statusColor: "text-red-700 bg-red-100",
      barColor: "bg-red-500",
    },
  ];

  return (
    <div className="w-full px-4 py-6 md:px-8 max-w-5xl mx-auto space-y-6">
      {/* Greeting & Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Hai, {user?.name?.split(" ")[0] || "Rina"}!
        </h1>
        <p className="text-sm md:text-base text-neutral-500">
          Semangat penuhi gizimu hari ini!
        </p>
      </div>

      {/* Sisa Budget Tag */}
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-4 py-2 text-xs md:text-sm font-bold text-emerald-900">
          Sisa budget hari ini: Rp {budget.remaining.toLocaleString("id-ID")}
          <span className="text-neutral-500 font-normal">/ {budget.total / 1000}k</span>
        </span>
      </div>

      {/* Main Grid: Responsive 2-column on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Progress Gizi Card */}
        <div className="rounded-3xl border border-neutral-100 bg-white p-5 md:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </span>
              <h2 className="font-extrabold text-neutral-900 text-base md:text-lg">
                Progress Gizi Hari Ini
              </h2>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
              Senin, 24 Okt
            </span>
          </div>

          {/* Energi Harian Big Widget */}
          <div className="flex items-center justify-between rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100/50">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase">
                ENERGI HARIAN
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-black text-neutral-900">
                  {Math.round(summary.calories).toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  / {summary.target.toLocaleString("id-ID")} kkal
                </span>
              </div>
            </div>

            {/* Circular Progress Bar */}
            <div className="relative flex h-16 w-16 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-emerald-200/60"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-700"
                  strokeWidth="3.5"
                  strokeDasharray={`${Math.round(progress)}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-extrabold text-neutral-800">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Macronutrients List */}
          <div className="space-y-4 pt-1">
            {macros.map((m) => {
              const pct = Math.min(100, (m.current / m.target) * 100);
              return (
                <div key={m.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="font-semibold text-neutral-700">{m.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">
                        {m.current}
                        <span className="text-neutral-400 font-normal"> / {m.target}g</span>
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.statusColor}`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full ${m.barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Makanan Hari Ini & Konsistensi */}
        <div className="space-y-6">
          {/* Makanan Hari Ini */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-neutral-900 text-base md:text-lg">
                  Makanan Hari Ini
                </h2>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600">
                  2
                </span>
              </div>
              <Link
                href="/history"
                className="text-xs md:text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Riwayat lengkap &gt;
              </Link>
            </div>

            {/* Food Items Cards */}
            <div className="space-y-2.5">
              {/* Item 1 */}
              <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-3.5 md:p-4 shadow-sm">
                <div>
                  <p className="text-[11px] text-neutral-400">Sarapan · 08:15</p>
                  <p className="font-bold text-neutral-900 text-sm md:text-base">
                    Nasi Telur Dadar
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    380 kkal · P: 14g · Serat: 1g
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100/70 px-3 py-1 text-xs font-bold text-amber-900">
                    Rp 8.000
                  </span>
                  <button className="text-neutral-400 hover:text-neutral-600 p-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-3.5 md:p-4 shadow-sm">
                <div>
                  <p className="text-[11px] text-neutral-400">Makan Siang · 12:45</p>
                  <p className="font-bold text-neutral-900 text-sm md:text-base">
                    Ayam Geprek + Es Te...
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    580 kkal · P: 21g · Serat: 2g
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100/70 px-3 py-1 text-xs font-bold text-amber-900">
                    Rp 15.000
                  </span>
                  <button className="text-neutral-400 hover:text-neutral-600 p-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="/analyze"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-50/90 py-3.5 text-xs md:text-sm font-bold text-emerald-800 transition hover:bg-emerald-100/80 active:scale-[0.99]"
              >
                <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Catat Makanan Lainnya (Scan / Manual)
              </Link>
            </div>
          </div>

          {/* Konsistensi 7 Hari */}
          <div className="rounded-3xl border border-neutral-100 bg-white p-4 md:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="font-extrabold text-neutral-900 text-sm md:text-base">
                  Konsistensi 7 Hari
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                5 dari 7 tercapai
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {[
                { day: "Sen", status: "success" },
                { day: "Sel", status: "success" },
                { day: "Rab", status: "missed" },
                { day: "Kam", status: "success" },
                { day: "Jum", status: "success" },
                { day: "Sab", status: "missed" },
                { day: "Min", status: "pending" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center py-2 rounded-xl text-center ${
                    item.status === "pending" ? "bg-emerald-50" : "bg-neutral-50"
                  }`}
                >
                  <span className="text-[10px] font-semibold text-neutral-400 mb-1">
                    {item.day}
                  </span>
                  {item.status === "success" && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {item.status === "missed" && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                      </svg>
                    </div>
                  )}
                  {item.status === "pending" && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white">
                      <span className="text-[10px] leading-none">⏳</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

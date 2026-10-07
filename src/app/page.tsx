"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ calories: 0, protein: 0, target: 2250 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/recommendations");
        if (res.ok) {
          const data = await res.json();
          setSummary({
            calories: data.consumed.calories,
            protein: data.consumed.protein_g,
            target: data.target.calories,
          });
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 p-6 sm:p-8 text-white shadow-lg">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Halo, {user?.name?.split(" ")[0] || "Tamu"}! 👋</h1>
          <p className="mt-2 text-green-50 max-w-md text-sm sm:text-base">
            Selamat datang di GiziKost. Pantau asupan nutrisi harianmu dan dapatkan rekomendasi makanan sehat sesuai budget.
          </p>
        </div>
        <Link
          href="/analyze"
          className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-700 shadow-sm transition hover:bg-green-50 hover:scale-105 active:scale-95 text-center"
        >
          📸 Analisis Makanan
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Ringkasan Hari Ini</h2>
            <Link href="/history" className="text-sm font-semibold text-green-600 hover:text-green-700">
              Lihat Riwayat &rarr;
            </Link>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-700">Kalori Terpenuhi</span>
                  <span className="font-bold text-gray-900">
                    {Math.round(summary.calories)} / {summary.target} kcal
                  </span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${progress > 100 ? "bg-red-500" : "bg-green-500"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {progress === 0 && <p className="mt-3 text-xs text-gray-500">Belum ada makanan yang dicatat hari ini.</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600">Protein</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{Math.round(summary.protein)}g</p>
                </div>
                <div className="rounded-xl bg-orange-50 p-4 border border-orange-100">
                  <p className="text-xs font-semibold text-orange-600">Sisa Kalori</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{Math.max(0, summary.target - summary.calories)} kcal</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Akses Cepat</h2>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <Link
              href="/recommendations"
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-green-200 hover:bg-green-50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl group-hover:bg-green-200 transition-colors">
                💡
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Rekomendasi</h3>
                <p className="text-xs text-gray-500 mt-0.5">Cari menu sehat</p>
              </div>
            </Link>
            <Link
              href="/insights"
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl group-hover:bg-blue-200 transition-colors">
                📊
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Analisis Gizi</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tren kesehatan</p>
              </div>
            </Link>
            <Link
              href="/profile"
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xl group-hover:bg-purple-200 transition-colors">
                🎯
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Target Gizi</h3>
                <p className="text-xs text-gray-500 mt-0.5">Hitung BMR Anda</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

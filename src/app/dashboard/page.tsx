"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface HistoryItem {
  id: number;
  foods: Array<{
    name: string;
    portion_grams: number;
    nutrition: {
      calories: number;
      protein_g: number;
      fat_g: number;
      carbs_g: number;
      fiber_g: number;
    };
  }>;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  logged_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    target: 2250,
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRec, resHist] = await Promise.all([
          fetch("/api/recommendations"),
          fetch("/api/nutrition-history")
        ]);
        if (resRec.ok) {
          const data = await resRec.json();
          if (data.consumed) {
            setSummary({
              calories: data.consumed.calories || 0,
              protein: data.consumed.protein_g || 0,
              fat: data.consumed.fat_g || 0,
              carbs: data.consumed.carbs_g || 0,
              fiber: data.consumed.fiber_g || 0,
              target: data.target?.calories || 2250,
            });
          }
        }
        if (resHist.ok) {
          const data = await resHist.json();
          setHistory(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const progress = Math.min(100, (summary.calories / summary.target) * 100);
  const budget = { remaining: 12000, total: 25000 };

  const macros = [
    { name: "Protein", current: Math.round(summary.protein), target: 60, status: summary.protein >= 60 ? "Tercapai" : "Kurang", statusColor: summary.protein >= 60 ? "text-emerald-700 bg-emerald-100" : "text-amber-700 bg-amber-100", barColor: summary.protein >= 60 ? "bg-emerald-500" : "bg-amber-500" },
    { name: "Lemak", current: Math.round(summary.fat), target: 65, status: summary.fat >= 65 ? "Tercapai" : "Kurang", statusColor: summary.fat >= 65 ? "text-emerald-700 bg-emerald-100" : "text-amber-700 bg-amber-100", barColor: summary.fat >= 65 ? "bg-emerald-500" : "bg-amber-500" },
    { name: "Karbohidrat", current: Math.round(summary.carbs), target: 360, status: summary.carbs >= 360 ? "Tercapai" : "Kurang", statusColor: summary.carbs >= 360 ? "text-emerald-700 bg-emerald-100" : "text-amber-700 bg-amber-100", barColor: summary.carbs >= 360 ? "bg-emerald-500" : "bg-amber-500" },
    { name: "Serat", current: Math.round(summary.fiber), target: 32, status: summary.fiber >= 32 ? "Tercapai" : "Sangat kurang", statusColor: summary.fiber >= 32 ? "text-emerald-700 bg-emerald-100" : "text-red-700 bg-red-100", barColor: summary.fiber >= 32 ? "bg-emerald-500" : "bg-red-500" },
  ];

  const today = new Date().toISOString().split("T")[0];
  const todayHistory = history.filter(item => item.logged_at.startsWith(today));
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  const consistency = last7Days.map(date => {
    const dayItems = history.filter(item => item.logged_at.startsWith(date));
    const dayCalories = dayItems.reduce((sum, item) => sum + item.calories, 0);
    const dayName = new Date(date).toLocaleDateString("id-ID", { weekday: "short" });
    let status = "pending";
    if (date < today) status = dayCalories >= (summary.target * 0.8) ? "success" : "missed";
    else if (date === today) status = dayCalories >= (summary.target * 0.8) ? "success" : "pending";
    return { day: dayName, status };
  });
  const successDays = consistency.filter(c => c.status === "success").length;

  if (loading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Hai, {user?.name?.split(" ")[0] || "Rina"}! 👋
          </h1>
          <p className="text-sm md:text-base text-neutral-500 font-medium">
            Semangat penuhi gizimu hari ini!
          </p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white border border-emerald-100 px-5 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Sisa Budget Hari Ini</p>
            <p className="text-base font-black text-emerald-700">Rp {budget.remaining.toLocaleString("id-ID")}<span className="text-neutral-400 font-medium text-xs ml-1">/ {budget.total / 1000}k</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-7 rounded-[2rem] border border-neutral-100 bg-white p-6 md:p-8 shadow-sm space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </span>
              <h2 className="font-extrabold text-neutral-900 text-lg md:text-xl">Progress Gizi Hari Ini</h2>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-500">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}</span>
          </div>

          <div className="flex items-center justify-between rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 md:p-8 border border-emerald-100/50 relative z-10">
            <div>
              <p className="text-xs font-bold tracking-wider text-emerald-800 uppercase mb-2">ENERGI HARIAN</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-black text-neutral-900 tracking-tight">{Math.round(summary.calories).toLocaleString("id-ID")}</span>
                <span className="text-base text-neutral-500 font-medium">/ {summary.target.toLocaleString("id-ID")} kkal</span>
              </div>
            </div>
            <div className="relative flex h-24 w-24 md:h-32 md:w-32 items-center justify-center drop-shadow-sm">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                <path className="text-emerald-200/60" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-600 transition-all duration-1000 ease-out" strokeWidth="3" strokeDasharray={`${Math.round(progress)}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-lg md:text-xl font-black text-neutral-800">{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="space-y-6 pt-2 relative z-10">
            {macros.map((m) => {
              const pct = Math.min(100, (m.current / m.target) * 100);
              return (
                <div key={m.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-neutral-700">{m.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-neutral-900">{m.current}<span className="text-neutral-400 font-medium"> / {m.target}g</span></span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${m.statusColor}`}>{m.status}</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${m.barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-neutral-900 text-lg">Makanan Hari Ini</h2>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600">{todayHistory.length}</span>
              </div>
              <Link href="/history" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Riwayat lengkap &gt;</Link>
            </div>
            <div className="space-y-3">
              {todayHistory.length > 0 ? (
                todayHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-all group">
                    <div>
                      <p className="text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">{new Date(item.logged_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="font-bold text-neutral-900 text-base line-clamp-1">{item.foods.map(f => f.name).join(", ")}</p>
                      <p className="text-xs font-medium text-neutral-500 mt-1.5">{Math.round(item.calories)} kkal · P: {Math.round(item.protein_g)}g · L: {Math.round(item.fat_g)}g</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button className="text-neutral-300 hover:text-emerald-600 p-1.5 transition-colors rounded-full hover:bg-emerald-50">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <p className="text-sm font-bold text-neutral-600">Belum ada makanan hari ini</p>
                  <p className="text-xs text-neutral-400 mt-1">Yuk catat makanan pertamamu!</p>
                </div>
              )}
              <Link href="/analyze" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-md shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98] mt-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Scan Makanan
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-100 bg-white p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="font-extrabold text-neutral-900 text-base md:text-lg">Konsistensi 7 Hari</h3>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {successDays} dari 7 tercapai
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2 pt-2">
              {consistency.map((item, idx) => (
                <div key={idx} className={`flex flex-col items-center justify-center py-3 rounded-2xl text-center transition-colors ${item.status === "pending" ? "bg-neutral-50 border border-neutral-100" : item.status === "success" ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-100"}`}>
                  <span className={`text-[11px] font-bold mb-2 ${item.status === "success" ? "text-emerald-700" : item.status === "missed" ? "text-amber-700" : "text-neutral-400"}`}>{item.day}</span>
                  {item.status === "success" && (<div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-200"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>)}
                  {item.status === "missed" && (<div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm shadow-amber-200"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg></div>)}
                  {item.status === "pending" && (<div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-neutral-500"><span className="text-[10px] font-bold leading-none">-</span></div>)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

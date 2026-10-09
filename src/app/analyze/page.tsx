"use client";

import { useState, useEffect } from "react";
import { FoodAnalysisResult } from "@/lib/ai";
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

export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState<"analyze" | "insights">("analyze");

  // --- Analyze State ---
  const [preview, setPreview] = useState<string | null>(null);
  const [foodName, setFoodName] = useState("");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [historySaveSuccess, setHistorySaveSuccess] = useState(false);
  const [historySaveError, setHistorySaveError] = useState<string | null>(null);

  // --- Insights State ---
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // --- Analyze Handlers ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setFoodName("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFoodName(e.target.value);
    if (e.target.value) {
      setPreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!preview && !foodName.trim()) return;

    setAnalyzeLoading(true);
    setAnalyzeError(null);
    setResult(null);
    setHistorySaveSuccess(false);
    setHistorySaveError(null);

    try {
      const payload = preview
        ? { imageBase64: preview }
        : { text: foodName.trim() };

      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menganalisis makanan");
      }

      setResult(data);

      // Auto save to nutrition history
      try {
        const saveResponse = await fetch("/api/nutrition-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!saveResponse.ok) {
          const saveData = await saveResponse.json();
          setHistorySaveError(saveData.error || "Gagal menyimpan ke riwayat.");
        } else {
          setHistorySaveSuccess(true);
          // Refresh insights data if saved successfully
          loadHistory();
        }
      } catch {
        setHistorySaveError("Koneksi gagal. Hasil belum masuk riwayat.");
      }
    } catch (err: unknown) {
      setAnalyzeError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  // --- Insights Handlers ---
  const loadHistory = async () => {
    setInsightsLoading(true);
    try {
      const res = await fetch("/api/nutrition-history", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat riwayat");
      setEntries(data);
    } catch (e) {
      setInsightsError(e instanceof Error ? e.message : "Gagal memuat riwayat");
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "insights" && entries.length === 0) {
      loadHistory();
    }
  }, [activeTab]);

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

  // Target Harian
  const TARGET_CALORIES = 2250;
  const TARGET_PROTEIN = 84;
  const TARGET_FIBER = 25;

  return (
    <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-black text-white shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight">
              Analisis & Tren Gizi
            </h1>
            <p className="text-sm md:text-base text-neutral-500 font-medium mt-1">
              Pindai makanan dan evaluasi tren gizi harianmu.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("analyze")}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "analyze"
              ? "border-black text-black"
              : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          Analisis Makanan
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "insights"
              ? "border-black text-black"
              : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          Tren Gizi
        </button>
      </div>

      {/* Tab Content: Analyze */}
      {activeTab === "analyze" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Input */}
          <section className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">
                Ketik Nama Makanan
              </label>
              <input
                type="text"
                placeholder="Contoh: Nasi Padang Rendang, Es Teh Manis..."
                value={foodName}
                onChange={handleTextChange}
                className="block w-full rounded-lg border-2 border-neutral-200 px-4 py-3.5 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors bg-neutral-50 focus:bg-white text-black"
              />
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="mx-4 flex-shrink-0 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                ATAU UPLOAD FOTO
              </span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">
                Pilih Foto Makanan
              </label>
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
                className="block w-full text-sm text-neutral-500 file:mr-4 file:rounded file:border-0 file:bg-neutral-100 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-black hover:file:bg-neutral-200 cursor-pointer transition-colors"
              />
            </div>

            {preview && (
              <div className="relative flex aspect-video max-h-64 items-center justify-center overflow-hidden rounded-lg border-2 border-neutral-200 bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview Makanan"
                  className="max-h-full object-contain"
                />
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={(!preview && !foodName.trim()) || analyzeLoading}
              className={`w-full rounded-lg px-4 py-4 font-bold text-white shadow-sm transition-all ${
                (!preview && !foodName.trim()) || analyzeLoading
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-400"
                  : "bg-black hover:bg-neutral-800 active:scale-[0.98] shadow-md"
              }`}
            >
              {analyzeLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Menganalisis dengan AI...
                </span>
              ) : (
                "🔍 Mulai Analisis"
              )}
            </button>

            {analyzeError && (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-black">
                <strong>Error:</strong> {analyzeError}
              </div>
            )}

            {historySaveSuccess && (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-black font-medium">
                ✅ Analisis berhasil disimpan ke riwayat harian Anda!
              </div>
            )}

            {historySaveError && (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-black font-medium">
                ⚠️ {historySaveError}
              </div>
            )}
          </section>

          {/* Result Container */}
          <div>
            {result ? (
              <section className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 md:p-8 shadow-sm">
                <h2 className="border-b border-neutral-200 pb-4 text-xl font-black text-black">
                  Hasil Analisis Nutrisi
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Kalori</p>
                    <p className="text-xl font-black text-black">
                      {result.total_nutrition.calories}{" "}
                      <span className="text-xs font-medium text-neutral-500">kcal</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Protein</p>
                    <p className="text-xl font-black text-black">
                      {result.total_nutrition.protein_g}{" "}
                      <span className="text-xs font-medium text-neutral-500">g</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Lemak</p>
                    <p className="text-xl font-black text-black">
                      {result.total_nutrition.fat_g}{" "}
                      <span className="text-xs font-medium text-neutral-500">g</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Karbo</p>
                    <p className="text-xl font-black text-black">
                      {result.total_nutrition.carbs_g}{" "}
                      <span className="text-xs font-medium text-neutral-500">g</span>
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-lg bg-neutral-50 p-3 border border-neutral-200">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Serat</p>
                    <p className="text-xl font-black text-black">
                      {result.total_nutrition.fiber_g}{" "}
                      <span className="text-xs font-medium text-neutral-500">g</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-black">
                    Komponen Terdeteksi:
                  </h3>
                  <ul className="space-y-2">
                    {result.foods.map((food, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4"
                      >
                        <div>
                          <p className="font-bold text-black">{food.name}</p>
                          <p className="text-xs font-medium text-neutral-500 mt-0.5">
                            {food.name_en} • ~{food.portion_grams}g
                          </p>
                        </div>
                        <div className="text-right text-sm font-black text-black">
                          {food.nutrition.calories} kcal
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-black">
                    Catatan Kesehatan:
                  </h3>
                  <ul className="space-y-2">
                    {result.health_notes.map((note, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-neutral-600 bg-neutral-50 p-3 rounded border border-neutral-200">
                        <span className="shrink-0">💡</span>
                        <span className="leading-relaxed">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 p-8 text-center bg-neutral-50/50">
                <span className="text-5xl mb-4">🍽️</span>
                <p className="text-base font-bold text-black">
                  Belum ada makanan yang dianalisis
                </p>
                <p className="text-sm text-neutral-500 mt-2 max-w-xs leading-relaxed">
                  Masukkan nama makanan atau unggah foto untuk melihat rincian gizinya di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Insights */}
      {activeTab === "insights" && (
        <div>
          {insightsLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
            </div>
          ) : insightsError ? (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-sm font-medium text-black">{insightsError}</div>
          ) : totalDays === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 p-12 text-center bg-neutral-50/50">
              <svg className="h-12 w-12 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-base font-bold text-black">Belum ada data yang cukup</p>
              <p className="text-sm text-neutral-500 mt-2 max-w-sm leading-relaxed">
                Mulai rekam konsumsi makanan Anda lewat kamera atau teks untuk membuka analisis gizi komprehensif.
              </p>
              <button
                onClick={() => setActiveTab("analyze")}
                className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition-all"
              >
                Scan Makanan Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Rata-rata Kalori</p>
                    <svg className="h-6 w-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="mt-3 text-3xl font-black text-black">{avgCalories} <span className="text-sm font-medium text-neutral-400">kcal/hari</span></p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                      avgCalories > TARGET_CALORIES ? "bg-neutral-200 text-black" : "bg-neutral-100 text-neutral-700"
                    }`}>
                      {avgCalories > TARGET_CALORIES ? "Melebihi target" : "Terkendali"}
                    </span>
                    <span className="text-xs text-neutral-400">Target: {TARGET_CALORIES} kcal</span>
                  </div>
                </div>
                
                <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Rata-rata Protein</p>
                    <svg className="h-6 w-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <p className="mt-3 text-3xl font-black text-black">{avgProtein}g <span className="text-sm font-medium text-neutral-400">/hari</span></p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                      avgProtein < TARGET_PROTEIN ? "bg-neutral-200 text-black" : "bg-neutral-100 text-neutral-700"
                    }`}>
                      {avgProtein < TARGET_PROTEIN ? "Perlu ditingkatkan" : "Optimal"}
                    </span>
                    <span className="text-xs text-neutral-400">Target: {TARGET_PROTEIN}g</span>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Rata-rata Serat</p>
                    <svg className="h-6 w-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <p className="mt-3 text-3xl font-black text-black">{avgFiber}g <span className="text-sm font-medium text-neutral-400">/hari</span></p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                      avgFiber < TARGET_FIBER ? "bg-neutral-200 text-black" : "bg-neutral-100 text-neutral-700"
                    }`}>
                      {avgFiber < TARGET_FIBER ? "Kurang serat" : "Bagus"}
                    </span>
                    <span className="text-xs text-neutral-400">Target: {TARGET_FIBER}g</span>
                  </div>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="rounded-lg border border-neutral-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-lg font-black text-black">Grafik Kalori Mingguan</h2>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">Fluktuasi asupan energi selama 7 hari pencatatan</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-neutral-600">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-neutral-300"></div>
                      <span>Aman</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-black"></div>
                      <span>Lebih</span>
                    </div>
                  </div>
                </div>

                <div className="flex h-56 items-end gap-3 sm:gap-6 pt-4">
                  {days.map((day) => {
                    const heightPct = Math.min(100, (day.calories / (TARGET_CALORIES * 1.4)) * 100);
                    const isOver = day.calories > TARGET_CALORIES;
                    
                    return (
                      <div key={day.dateKey} className="group relative flex flex-1 flex-col items-center justify-end h-full">
                        {/* Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity rounded bg-black px-3 py-1.5 text-xs font-bold text-white shadow-lg pointer-events-none whitespace-nowrap z-20">
                          {Math.round(day.calories)} kcal
                        </div>
                        
                        {/* Bar */}
                        <div 
                          className={`w-full max-w-[48px] rounded-lg transition-all duration-500 ${isOver ? 'bg-black' : 'bg-neutral-300'} group-hover:opacity-90 shadow-sm`}
                          style={{ height: `${Math.max(10, heightPct)}%` }}
                        ></div>
                        
                        {/* Label */}
                        <span className="mt-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">{day.label.split(',')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Health Insights */}
              <div className="rounded-lg border border-neutral-200 bg-white p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-black text-black mb-6">Rekomendasi Ahli Gizi untuk Anda</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {avgProtein < TARGET_PROTEIN && (
                    <div className="flex gap-4 rounded-lg bg-neutral-50 p-5 text-black border border-neutral-200">
                      <svg className="h-8 w-8 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <div>
                        <p className="font-black text-sm">Tingkatkan Asupan Protein</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium text-neutral-600">
                          Rata-rata protein Anda ({avgProtein}g) masih di bawah anjuran. Tambahkan sumber protein lokal murah seperti tempe, telur rebus, atau ikan tongkol.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {avgFiber < TARGET_FIBER && (
                    <div className="flex gap-4 rounded-lg bg-neutral-50 p-5 text-black border border-neutral-200">
                      <svg className="h-8 w-8 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <div>
                        <p className="font-black text-sm">Tambahkan Serat Harian</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium text-neutral-600">
                          Asupan serat Anda ({avgFiber}g) masih kurang dari 25g/hari. Konsumsi sayur bayam, kangkung, atau buah pisang untuk melancarkan pencernaan.
                        </p>
                      </div>
                    </div>
                  )}

                  {avgCalories > TARGET_CALORIES && (
                    <div className="flex gap-4 rounded-lg bg-neutral-50 p-5 text-black border border-neutral-200">
                      <span className="text-3xl">⚠️</span>
                      <div>
                        <p className="font-black text-sm">Kalori Melebihi Kebutuhan</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium text-neutral-600">
                          Rata-rata kalori Anda ({avgCalories} kcal) berlebih. Kurangi minuman berpemanis dan gorengan bertepung tebal di antara waktu makan.
                        </p>
                      </div>
                    </div>
                  )}

                  {avgProtein >= TARGET_PROTEIN && avgFiber >= TARGET_FIBER && avgCalories <= TARGET_CALORIES && (
                    <div className="flex gap-4 rounded-lg bg-neutral-50 p-5 text-black border border-neutral-200">
                      <span className="text-3xl">🎉</span>
                      <div>
                        <p className="font-black text-sm">Nutrisi Anda Seimbang!</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium text-neutral-600">
                          Pola makan Anda memenuhi target kalori, protein, dan serat sesuai standar kesehatan. Terus pertahankan!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

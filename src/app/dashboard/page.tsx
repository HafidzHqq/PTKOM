"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";

interface NutritionTarget {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
}

interface NutritionConsumed {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
}

interface RecommendationItem {
  food_name: string;
  category?: string;
  venue?: string;
  estimated_price_idr: number;
  estimated_nutrition: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  reason: string;
}

interface RecommendationsResponse {
  target: NutritionTarget;
  consumed: NutritionConsumed;
  recommendations: RecommendationItem[];
  advice?: string;
}

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

const QUICK_FOOD_PRESETS = [
  { name: "Nasi Putih Pulen", calories: 195, protein_g: 4, fat_g: 0.5, carbs_g: 43, fiber_g: 0.5 },
  { name: "Telur Dadar Warteg", calories: 155, protein_g: 11, fat_g: 12, carbs_g: 1.5, fiber_g: 0 },
  { name: "Tempe Orek Kering", calories: 140, protein_g: 9, fat_g: 6, carbs_g: 12, fiber_g: 2 },
  { name: "Sayur Sop Bening", calories: 65, protein_g: 2, fat_g: 1, carbs_g: 12, fiber_g: 3.5 },
  { name: "Ayam Goreng Lengkuas", calories: 260, protein_g: 23, fat_g: 16, carbs_g: 2, fiber_g: 0 },
  { name: "Tumis Kangkung Terasi", calories: 85, protein_g: 3, fat_g: 5, carbs_g: 8, fiber_g: 3 },
];

function getFoodImage(name: string, category?: string): string {
  const n = name.toLowerCase();
  if (n.includes("urap")) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";
  if (n.includes("kangkung")) return "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80";
  if (n.includes("bayam") || n.includes("sop")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80";
  if (n.includes("tempe") || n.includes("tahu")) return "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80";
  if (n.includes("telur")) return "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80";
  if (n.includes("ayam")) return "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80";
  if (n.includes("mie") || n.includes("indomie")) return "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80";
  if (n.includes("nasi")) return "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&auto=format&fit=crop&q=80";
  if (n.includes("ikan") || n.includes("tongkol")) return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80";
  if (n.includes("buah") || n.includes("pisang") || n.includes("pepaya")) return "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80";
  if (category?.toLowerCase().includes("sayur")) return "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80";
  if (category?.toLowerCase().includes("lauk")) return "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80";
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";
}

function getFoodTags(name: string, category?: string): string[] {
  const n = name.toLowerCase();
  const tags: string[] = [];
  if (n.includes("urap") || n.includes("sayur") || n.includes("kangkung") || n.includes("bayam")) {
    tags.push("#segar-alami", "#tinggi-serat");
  } else if (n.includes("tempe") || n.includes("tahu") || n.includes("telur") || n.includes("ayam")) {
    tags.push("#kaya-protein", "#gurih-renyah");
  } else if (n.includes("mie") || n.includes("nasi")) {
    tags.push("#sumber-energi", "#kenyang-lama");
  } else {
    tags.push("#seimbang", "#hemat");
  }
  tags.push("#ramah-kantong");
  return tags;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(200000);
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});
  const [loggedCards, setLoggedCards] = useState<Record<number, boolean>>({});
  const [loggingIndex, setLoggingIndex] = useState<number | null>(null);

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick manual add form state
  const [addForm, setAddForm] = useState({
    name: "",
    calories: "",
    protein_g: "",
    fat_g: "",
    carbs_g: "",
    fiber_g: "",
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // BE Data
  const [summary, setSummary] = useState<{
    consumed: NutritionConsumed;
    target: NutritionTarget;
    recommendations: RecommendationItem[];
    advice?: string;
  }>({
    consumed: { calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 },
    target: { calories: 2353, protein_g: 103, fat_g: 72, carbs_g: 324, fiber_g: 32 },
    recommendations: [],
    advice: "Kombinasikan karbohidrat kompleks dengan lauk nabati dan sayuran hijau untuk menjaga keseimbangan gizi harianmu.",
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [resRec, resHist, resProfile] = await Promise.all([
        fetch("/api/recommendations"),
        fetch("/api/nutrition-history"),
        fetch("/api/profile"),
      ]);

      if (resRec.ok) {
        const data: RecommendationsResponse = await resRec.json();
        setSummary({
          consumed: data.consumed || { calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 },
          target: data.target || { calories: 2353, protein_g: 103, fat_g: 72, carbs_g: 324, fiber_g: 32 },
          recommendations: data.recommendations || [],
          advice: data.advice || "Kombinasikan karbohidrat kompleks dengan lauk nabati dan sayuran hijau untuk menjaga keseimbangan gizi harianmu.",
        });
      }

      if (resHist.ok) {
        const data = await resHist.json();
        setHistory(Array.isArray(data) ? data : []);
      }

      if (resProfile.ok) {
        const pData = await resProfile.json();
        if (pData.success && pData.data?.monthly_food_budget) {
          setMonthlyBudget(pData.data.monthly_food_budget);
        }
      }
    } catch (e) {
      console.error("[Dashboard] Error loading data:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived Calculations
  const targetCalories = summary.target.calories > 0 ? summary.target.calories : 2353;
  const consumedCalories = Math.round(summary.consumed.calories);
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  const calPercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

  const dailyBudget = monthlyBudget > 0 ? Math.round(monthlyBudget / 30) : 6667;

  const macros = [
    {
      name: "Protein",
      current: Math.round(summary.consumed.protein_g),
      target: summary.target.protein_g > 0 ? summary.target.protein_g : 103,
    },
    {
      name: "Karbohidrat",
      current: Math.round(summary.consumed.carbs_g),
      target: summary.target.carbs_g > 0 ? summary.target.carbs_g : 324,
    },
    {
      name: "Lemak",
      current: Math.round(summary.consumed.fat_g),
      target: summary.target.fat_g > 0 ? summary.target.fat_g : 72,
    },
    {
      name: "Serat",
      current: Math.round(summary.consumed.fiber_g),
      target: summary.target.fiber_g > 0 ? summary.target.fiber_g : 32,
    },
  ];

  // Today's eaten items
  const todayStr = new Date().toISOString().split("T")[0];
  const todayHistory = history.filter((item) => item.logged_at.startsWith(todayStr));

  // 7 Days consistency
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const consistency = last7Days.map((dateStr) => {
    const dayItems = history.filter((item) => item.logged_at.startsWith(dateStr));
    const dayCalories = dayItems.reduce((sum, item) => sum + (item.calories || 0), 0);
    const dateObj = new Date(dateStr);
    const dayName = dateObj.toLocaleDateString("id-ID", { weekday: "short" });
    const isToday = dateStr === todayStr;
    const isAchieved = dayCalories >= targetCalories * 0.7;
    const hasData = dayItems.length > 0;

    return {
      date: dateStr,
      day: dayName,
      isToday,
      isAchieved,
      hasData,
    };
  });

  const successDays = consistency.filter((c) => c.isAchieved || (c.isToday && c.hasData)).length;

  // Handler: Log Recommendation to Diary
  const handleLogRecommendation = async (rec: RecommendationItem, index: number) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setLoggingIndex(index);
    try {
      const payload = {
        foods: [
          {
            name: rec.food_name,
            portion_grams: 100,
            nutrition: {
              calories: rec.estimated_nutrition.calories,
              protein_g: rec.estimated_nutrition.protein_g,
              fat_g: rec.estimated_nutrition.fat_g,
              carbs_g: rec.estimated_nutrition.carbs_g,
              fiber_g: rec.estimated_nutrition.fiber_g,
            },
          },
        ],
        total_nutrition: {
          calories: rec.estimated_nutrition.calories,
          protein_g: rec.estimated_nutrition.protein_g,
          fat_g: rec.estimated_nutrition.fat_g,
          carbs_g: rec.estimated_nutrition.carbs_g,
          fiber_g: rec.estimated_nutrition.fiber_g,
        },
        calories: rec.estimated_nutrition.calories,
        protein_g: rec.estimated_nutrition.protein_g,
        fat_g: rec.estimated_nutrition.fat_g,
        carbs_g: rec.estimated_nutrition.carbs_g,
        fiber_g: rec.estimated_nutrition.fiber_g,
      };

      const res = await fetch("/api/nutrition-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setLoggedCards((prev) => ({ ...prev, [index]: true }));
        showToast(`"${rec.food_name}" berhasil dicatat ke Diari Kuliner!`);
        await loadDashboardData(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || "Gagal mencatat makanan.");
      }
    } catch (err) {
      console.error("Error logging food:", err);
      showToast("Terjadi kesalahan koneksi saat mencatat.");
    } finally {
      setLoggingIndex(null);
    }
  };

  // Handler: Open Add Modal
  const handleOpenAddModal = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowAddModal(true);
  };

  // Handler: Submit Manual Add Modal
  const handleSubmitManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;

    setSubmittingAdd(true);
    try {
      const cal = parseFloat(addForm.calories) || 0;
      const pro = parseFloat(addForm.protein_g) || 0;
      const fat = parseFloat(addForm.fat_g) || 0;
      const carb = parseFloat(addForm.carbs_g) || 0;
      const fib = parseFloat(addForm.fiber_g) || 0;

      const payload = {
        foods: [
          {
            name: addForm.name.trim(),
            portion_grams: 100,
            nutrition: {
              calories: cal,
              protein_g: pro,
              fat_g: fat,
              carbs_g: carb,
              fiber_g: fib,
            },
          },
        ],
        total_nutrition: {
          calories: cal,
          protein_g: pro,
          fat_g: fat,
          carbs_g: carb,
          fiber_g: fib,
        },
        calories: cal,
        protein_g: pro,
        fat_g: fat,
        carbs_g: carb,
        fiber_g: fib,
      };

      const res = await fetch("/api/nutrition-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddModal(false);
        setAddForm({ name: "", calories: "", protein_g: "", fat_g: "", carbs_g: "", fiber_g: "" });
        showToast(`"${addForm.name.trim()}" berhasil dicatat!`);
        await loadDashboardData(true);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Gagal mencatat makanan.");
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal mencatat makanan.");
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleSelectPreset = (preset: typeof QUICK_FOOD_PRESETS[0]) => {
    setAddForm({
      name: preset.name,
      calories: preset.calories.toString(),
      protein_g: preset.protein_g.toString(),
      fat_g: preset.fat_g.toString(),
      carbs_g: preset.carbs_g.toString(),
      fiber_g: preset.fiber_g.toString(),
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-[#F7F5F1]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#C65320] border-t-transparent" />
        <p className="mt-4 text-xs font-semibold text-[#77736B]">Menyiapkan nutrisi hari ini...</p>
      </div>
    );
  }

  // Format date display matching Figma
  const formattedDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const shortDate = new Date().toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="w-full min-h-screen bg-[#F7F5F1] text-[#292721] font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#292721] text-white px-5 py-3 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container 1440px */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-20 pt-10 sm:pt-14 pb-16 flex flex-col gap-10">
        
        {/* =========================================================================
            HEADER SECTION
           ========================================================================= */}
        <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Left Title & Breadcrumb */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-[18px] h-[2px] bg-[#C65320]" />
              <span className="text-[10px] font-bold tracking-[0.15em] text-[#77736B] uppercase">
                DOMPETKOST / HARI INI
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-[60px] text-[#292721] font-normal tracking-tight leading-none mt-1"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Hai, {user?.name?.split(" ")[0] || "Teman Kost"}!
            </h1>

            <p className="text-xs sm:text-sm text-[#77736B] font-normal">
              {formattedDate} · Pantau gizi seimbang dan menu hemat hari ini.
            </p>
          </div>

          {/* Right Header Actions */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-end">
            {/* Daily Budget Pill */}
            <div className="h-11 px-4 py-2.5 bg-[#F0EEE7] rounded-[10px] flex items-center gap-2 text-xs select-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#292721" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
              <span className="text-[#77736B]">Budget hari ini:</span>
              <span className="font-bold text-[#292721]">
                Rp{dailyBudget.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Catat Makanan Button */}
            <button
              onClick={handleOpenAddModal}
              className="h-11 px-4 py-2.5 bg-[#C65320] hover:bg-[#A84317] text-white rounded-[10px] flex items-center gap-2 text-xs font-bold transition shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Catat Makanan</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TOP GRID: 2 BALANCED CARDS (Nutrisi & Makan Hari Ini)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Card 1: Keseimbangan Nutrisi (7 Cols on LG) */}
          <div className="lg:col-span-7 bg-white rounded-[16px] border border-[#E8E4DC] p-7 flex flex-col justify-between shadow-xs">
            <div className="flex flex-col gap-6">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#292721]">Keseimbangan Nutrisi</h2>
                  <p className="text-xs text-[#77736B] mt-0.5">Estimasi asupan energi dan makronutrien harianmu.</p>
                </div>
                <span className="px-3 py-1 bg-[#FAF9F6] border border-[#E8E4DC] rounded-full text-xs font-semibold text-[#555149]">
                  {shortDate}
                </span>
              </div>

              {/* Calorie Stats Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736B]">
                    KALORI HARI INI
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-bold text-[#292721] tracking-tight">
                      {consumedCalories.toLocaleString("id-ID")}
                    </span>
                    <span className="text-sm font-medium text-[#77736B]">
                      / {targetCalories.toLocaleString("id-ID")} kkal
                    </span>
                  </div>
                  <p className="text-xs text-[#555149] font-normal pt-1">
                    {remainingCalories > 0 ? (
                      <>
                        Tersisa <span className="font-bold text-[#292721]">{remainingCalories.toLocaleString("id-ID")} kkal</span> lagi untuk kebutuhan energimu.
                      </>
                    ) : (
                      <span className="text-emerald-600 font-bold">Target kalori harianmu telah terpenuhi!</span>
                    )}
                  </p>
                </div>

                {/* Circular Gauge 102x102 */}
                <div className="relative w-[102px] h-[102px] shrink-0">
                  <svg className="w-[102px] h-[102px] -rotate-90" viewBox="0 0 102 102">
                    <circle
                      cx="51"
                      cy="51"
                      r="43"
                      fill="none"
                      stroke="#EDEAE3"
                      strokeWidth="8"
                    />
                    <circle
                      cx="51"
                      cy="51"
                      r="43"
                      fill="none"
                      stroke="#C65320"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 43}
                      strokeDashoffset={2 * Math.PI * 43 * (1 - calPercent / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[25px] font-bold text-[#292721] leading-none">
                      {calPercent}%
                    </span>
                    <span className="text-[10px] text-[#77736B] mt-0.5">dari target</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E8E4DC] my-6 pt-5">
              {/* 4 Macros in 2x2 Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                {macros.map((m) => {
                  const pct = Math.min(100, Math.round((m.current / m.target) * 100));
                  return (
                    <div key={m.name} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#555149] text-[13px] font-normal">{m.name}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-[#292721]">{m.current}g</span>
                          <span className="text-[11px] text-[#77736B]">/ {m.target}g</span>
                        </div>
                      </div>
                      <div className="h-[5px] w-full rounded-full bg-[#EDEAE3] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#C65320] opacity-85 transition-all duration-700 ease-out"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Makan Hari Ini (5 Cols on LG) */}
          <div className="lg:col-span-5 bg-white rounded-[16px] border border-[#E8E4DC] p-7 flex flex-col justify-between shadow-xs">
            <div className="flex flex-col gap-4">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#292721]">Makan Hari Ini</h3>
                  <p className="text-xs text-[#77736B] mt-0.5">
                    {todayHistory.length > 0
                      ? `${todayHistory.length} menu telah dicatat`
                      : "Belum ada catatan makanan"}
                  </p>
                </div>
                <Link
                  href="/history"
                  className="text-xs font-semibold text-[#C65320] hover:underline transition"
                >
                  Lihat Semua →
                </Link>
              </div>

              {/* Items List */}
              {todayHistory.length > 0 ? (
                <div className="flex flex-col divide-y divide-[#E8E4DC]/70">
                  {todayHistory.slice(0, 3).map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className="text-[11px] text-[#77736B] font-medium w-10 shrink-0">
                          {new Date(item.logged_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-[13px] font-medium text-[#292721] truncate">
                          {item.foods.map((f) => f.name).join(", ")}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 shrink-0">
                        <span className="text-xs font-medium text-[#555149]">
                          {Math.round(item.calories)} kkal
                        </span>
                        <span className="text-[10px] text-[#77736B]">
                          P: {Math.round(item.protein_g)}g
                        </span>
                      </div>
                    </div>
                  ))}

                  {todayHistory.length > 3 && (
                    <div className="pt-2 text-center">
                      <Link
                        href="/history"
                        className="text-[11px] text-[#77736B] hover:text-[#C65320] font-medium transition"
                      >
                        +{todayHistory.length - 3} menu lainnya di riwayat
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-7 px-4 rounded-[12px] bg-[#FAF9F6] border border-dashed border-[#E8E4DC] flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-[#77736B]">Belum ada makanan dicatat hari ini.</p>
                  <button
                    onClick={handleOpenAddModal}
                    className="mt-1.5 text-xs font-bold text-[#C65320] hover:underline cursor-pointer"
                  >
                    + Catat santapan pertama
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#E8E4DC] my-5 pt-4">
              {/* Konsistensi 7 Hari */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#292721]">Konsistensi 7 Hari</span>
                  <span className="text-[11px] text-[#77736B]">
                    {successDays} dari 7 hari tercapai
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {consistency.map((c, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-medium text-[#77736B]">{c.day}</span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                          c.isAchieved || (c.isToday && c.hasData)
                            ? "bg-[#C65320] text-white font-bold"
                            : "bg-[#FAF9F6] border border-[#E8E4DC] text-[#77736B]"
                        }`}
                      >
                        {c.isAchieved || (c.isToday && c.hasData) ? (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-[#E8E4DC] rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RECOMMENDATIONS SECTION: INSPIRASI MENU HEMAT HARI INI
           ========================================================================= */}
        <div className="w-full flex flex-col gap-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#292721] tracking-tight">
                Inspirasi Menu Hemat Hari Ini
              </h2>
              <p className="text-xs sm:text-[13px] text-[#77736B] mt-1">
                Rekomendasi hidangan lezat dan ramah kantong untuk lengkapi energimu.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/recipes"
                className="h-10 px-4 bg-[#F0EEE7] hover:bg-[#E8E4DC] text-[#292721] rounded-[10px] text-xs font-semibold flex items-center justify-center transition"
              >
                Semua Resep Kost →
              </Link>
              <button
                onClick={() => loadDashboardData(true)}
                disabled={refreshing}
                className="h-10 px-4 bg-white border border-[#E8E4DC] hover:bg-[#FAF9F6] text-[#292721] rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
              >
                <svg
                  className={`w-3.5 h-3.5 text-[#292721] ${refreshing ? "animate-spin" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
                <span>{refreshing ? "Meracik..." : "Rekomendasi Baru"}</span>
              </button>
            </div>
          </div>

          {/* 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {summary.recommendations.map((rec, idx) => {
              const imageUrl = getFoodImage(rec.food_name, rec.category);
              const tags = getFoodTags(rec.food_name, rec.category);
              const isExpanded = !!expandedDetails[idx];
              const isLogged = !!loggedCards[idx];
              const isLogging = loggingIndex === idx;

              return (
                <div
                  key={`${rec.food_name}-${idx}`}
                  className="bg-white rounded-[16px] border border-[#E8E4DC] overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#C65320]/40 transition duration-200"
                >
                  {/* Top Image Banner */}
                  <div className="relative w-full h-[178px] overflow-hidden bg-[#FAF9F6]">
                    <img
                      src={imageUrl}
                      alt={rec.food_name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#E8E4DC]/60 text-[#C65320] text-[9px] font-bold tracking-wider uppercase">
                      {rec.category || "PILIHAN KOST"}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                    <div className="flex flex-col gap-3.5">
                      {/* Name & Venue */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-bold text-[#292721] line-clamp-1">
                          {rec.food_name}
                        </h3>
                        <span className="text-[10px] font-medium text-[#77736B] bg-[#FAF9F6] border border-[#E8E4DC] px-2 py-0.5 rounded capitalize shrink-0">
                          {rec.venue || "Warteg"}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-[#C65320]">
                          Rp{rec.estimated_price_idr.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[11px] text-[#77736B]"> (perkiraan)</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((t, ti) => (
                          <span
                            key={ti}
                            className="bg-[#FAF9F6] border border-[#E8E4DC]/70 px-2 py-0.5 rounded-full text-[10px] text-[#555149]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Description Reason */}
                      <p className="text-xs text-[#555149] leading-relaxed line-clamp-2">
                        {rec.reason}
                      </p>

                      {/* Quick Macro Box */}
                      <div className="bg-[#FAF9F6] border border-[#E8E4DC]/70 rounded-[8px] p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#C65320]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.316.492-.59 1.153-.787 1.9-.395 1.503-.497 3.19-.24 4.542.062.33-.075.666-.346.852-.27.185-.62.2-.9.038a3.987 3.987 0 01-1.396-1.527 8.01 8.01 0 00-.734 3.09c0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5c0-2.822-1.564-5.34-3.87-6.66a8.04 8.04 0 00-.49-.24 7.973 7.973 0 00-4.701-.66z" clipRule="evenodd" />
                          </svg>
                          <span className="font-bold text-[#292721]">
                            {rec.estimated_nutrition.calories} kkal
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-[#292721]">
                            {rec.estimated_nutrition.protein_g}g
                          </span>
                          <span className="text-[#77736B]">protein</span>
                        </div>
                      </div>

                      {/* Expandable Nutrient Details */}
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDetails((prev) => ({ ...prev, [idx]: !prev[idx] }))
                          }
                          className="flex items-center gap-1 text-[11px] text-[#77736B] hover:text-[#292721] cursor-pointer transition select-none"
                        >
                          <span>Rincian gizi lengkap</span>
                          <svg
                            className={`w-3 h-3 transform transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 pt-2.5 border-t border-[#E8E4DC] grid grid-cols-2 gap-2 text-[11px]">
                            <div className="flex justify-between text-[#555149]">
                              <span>Lemak:</span>
                              <span className="font-semibold text-[#292721]">{rec.estimated_nutrition.fat_g}g</span>
                            </div>
                            <div className="flex justify-between text-[#555149]">
                              <span>Karbohidrat:</span>
                              <span className="font-semibold text-[#292721]">{rec.estimated_nutrition.carbs_g}g</span>
                            </div>
                            <div className="flex justify-between text-[#555149]">
                              <span>Serat:</span>
                              <span className="font-semibold text-[#292721]">{rec.estimated_nutrition.fiber_g}g</span>
                            </div>
                            <div className="flex justify-between text-[#555149]">
                              <span>Porsi:</span>
                              <span className="font-semibold text-[#292721]">1 porsi saji</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button: Catat ke Diari */}
                    <button
                      onClick={() => handleLogRecommendation(rec, idx)}
                      disabled={isLogging || isLogged}
                      className={`h-[42px] w-full rounded-[10px] text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs active:scale-[0.98] cursor-pointer ${
                        isLogged
                          ? "bg-emerald-600 text-white cursor-default"
                          : "bg-[#C65320] hover:bg-[#A84317] text-white"
                      } disabled:opacity-75`}
                    >
                      {isLogging ? (
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                      ) : isLogged ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Tercatat di Diari</span>
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Catat ke Diari</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip Banner: Biar Makin Seimbang */}
          <div className="w-full bg-[#F0EEE7] border border-[#E8E4DC]/60 rounded-[10px] p-5 flex items-start gap-4">
            <div className="w-[34px] h-[34px] bg-white rounded-[8px] flex items-center justify-center shrink-0 shadow-xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C65320" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-bold text-[#292721]">Biar Makin Seimbang:</span>
              <p className="text-xs text-[#555149] leading-relaxed">
                {summary.advice}
              </p>
            </div>
          </div>
        </div>

        {/* Subtle Legal Footnote */}
        <p className="text-center text-[11px] text-[#77736B] pt-2 pb-6">
          Estimasi gizi dan rekomendasi menu dihitung otomatis sebagai referensi kuliner hemat dan seimbang anak kost, bukan diagnosis medis resmi.
        </p>
      </div>

      {/* =========================================================================
          LOGIN PROMPT MODAL
         ========================================================================= */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] max-w-sm w-full p-6 text-center border border-[#E8E4DC] shadow-xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F0EEE7] flex items-center justify-center text-[#C65320]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#292721]">Yuk, Masuk Terlebih Dahulu!</h3>
              <p className="text-xs text-[#77736B] mt-1.5 leading-relaxed">
                Masuk dengan akunmu untuk mencatat makanan ke dalam diari kuliner dan menyimpan progres gizi harianmu ke database.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                className="w-full py-2.5 px-4 bg-[#C65320] hover:bg-[#A84317] text-white rounded-[10px] text-xs font-bold transition flex items-center justify-center"
              >
                Masuk Sekarang
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-2.5 px-4 bg-[#F0EEE7] hover:bg-[#E8E4DC] text-[#292721] rounded-[10px] text-xs font-semibold transition"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          QUICK ADD FOOD MODAL
         ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 border border-[#E8E4DC] shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#E8E4DC]">
              <div>
                <h3 className="text-base font-bold text-[#292721]">Catat Makanan Baru</h3>
                <p className="text-xs text-[#77736B]">Simpan santapan ke diari kuliner hari ini.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#77736B] hover:text-[#292721] p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-[#77736B]">Pilihan Cepat Warteg:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_FOOD_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="text-[11px] bg-[#FAF9F6] border border-[#E8E4DC] hover:border-[#C65320] text-[#555149] hover:text-[#C65320] px-2.5 py-1 rounded-full transition cursor-pointer"
                  >
                    +{p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitManualAdd} className="flex flex-col gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-[#555149]">Nama Makanan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Nasi Putih + Telur Dadar"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-[10px] bg-[#FAF9F6] border border-[#E8E4DC] focus:outline-none focus:border-[#C65320]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#555149]">Kalori (kkal)</label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    value={addForm.calories}
                    onChange={(e) => setAddForm({ ...addForm, calories: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-xs rounded-[10px] bg-[#FAF9F6] border border-[#E8E4DC] focus:outline-none focus:border-[#C65320]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#555149]">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={addForm.protein_g}
                    onChange={(e) => setAddForm({ ...addForm, protein_g: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-xs rounded-[10px] bg-[#FAF9F6] border border-[#E8E4DC] focus:outline-none focus:border-[#C65320]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-[#555149]">Lemak (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="5"
                    value={addForm.fat_g}
                    onChange={(e) => setAddForm({ ...addForm, fat_g: e.target.value })}
                    className="mt-1 w-full px-2.5 py-1.5 text-xs rounded-[8px] bg-[#FAF9F6] border border-[#E8E4DC] focus:outline-none focus:border-[#C65320]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#555149]">Karbo (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="25"
                    value={addForm.carbs_g}
                    onChange={(e) => setAddForm({ ...addForm, carbs_g: e.target.value })}
                    className="mt-1 w-full px-2.5 py-1.5 text-xs rounded-[8px] bg-[#FAF9F6] border border-[#E8E4DC] focus:outline-none focus:border-[#C65320]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#555149]">Serat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="2"
                    value={addForm.fiber_g}
                    onChange={(e) => setAddForm({ ...addForm, fiber_g: e.target.value })}
                    className="mt-1 w-full px-2.5 py-1.5 text-xs rounded-[8px] bg-[#FAF9F6] border border-[#E8E4DC] focus:outline-none focus:border-[#C65320]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E4DC]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#77736B] hover:text-[#292721] rounded-[8px] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-4 py-2 bg-[#C65320] hover:bg-[#A84317] text-white text-xs font-bold rounded-[10px] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {submittingAdd ? "Menyimpan..." : "Simpan ke Diari"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

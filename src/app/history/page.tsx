"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { CULINARY_CATALOG } from "@/lib/data/culinaryCatalog";
import { useAuth } from "@/context/AuthContext";

interface HistoryEntry {
  id: string | number;
  foods: { name: string }[];
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  logged_at: string;
}

const POPULAR_SUGGESTIONS = [
  "Nasi Putih",
  "Ayam Goreng",
  "Telur Dadar",
  "Tempe Goreng",
  "Tahu Bacem",
  "Sayur Sop",
  "Sayur Bayam",
  "Tumis Kangkung",
  "Orek Tempe",
  "Rendang Sapi",
];

interface DailyNutrition {
  label: string;
  weekday: string;
  formattedDate: string;
  dateKey: string;
  entries: HistoryEntry[];
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  estimatedCost: number;
}

function estimateFoodCost(name: string): number {
  const lower = name.toLowerCase();
  const match = CULINARY_CATALOG.find(
    (c) => lower.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(lower)
  );
  if (match) {
    return Math.round((match.priceRange.min + match.priceRange.max) / 2);
  }
  if (lower.includes("ayam") || lower.includes("ikan") || lower.includes("daging") || lower.includes("rendang")) return 14000;
  if (lower.includes("telur")) return 6000;
  if (lower.includes("tahu") || lower.includes("tempe") || lower.includes("orek")) return 4000;
  if (
    lower.includes("sayur") ||
    lower.includes("kangkung") ||
    lower.includes("bayam") ||
    lower.includes("sop") ||
    lower.includes("lodeh") ||
    lower.includes("capcay")
  ) {
    return 4000;
  }
  if (lower.includes("nasi")) return 4000;
  return 8000;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetCalories, setTargetCalories] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Add Food Form State
  const [foodFormName, setFoodFormName] = useState("");
  const [foodFormPortion, setFoodFormPortion] = useState("150");
  const [foodFormCalories, setFoodFormCalories] = useState("250");
  const [foodFormProtein, setFoodFormProtein] = useState("12");
  const [foodFormFat, setFoodFormFat] = useState("8");
  const [foodFormCarbs, setFoodFormCarbs] = useState("30");
  const [foodFormFiber, setFoodFormFiber] = useState("2");
  const [foodFormDate, setFoodFormDate] = useState("");
  const [isSubmittingFood, setIsSubmittingFood] = useState(false);

  const getStorageKey = () => `dompetkost_history_cache_${user?.id || user?.email || "anonymous"}`;

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectSuggestion = (name: string) => {
    setFoodFormName(name);
    const match = CULINARY_CATALOG.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() || c.name.toLowerCase().includes(name.toLowerCase())
    );
    if (match && match.nutrition) {
      const baseGrams = match.portion?.grams || 100;
      const portion = Number(foodFormPortion) || baseGrams;
      const factor = portion / baseGrams;
      setFoodFormCalories(String(Math.round((match.nutrition.kcal || 0) * factor)));
      setFoodFormProtein(String(Math.round((match.nutrition.protein || 0) * factor)));
      setFoodFormFat(String(Math.round((match.nutrition.fat || 0) * factor)));
      setFoodFormCarbs(String(Math.round((match.nutrition.carbs || 0) * factor)));
      setFoodFormFiber(String(Math.round((match.nutrition.fiber || 0) * factor)));
    }
  };

  const handleQuickLogFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!foodFormName.trim()) {
      showNotification("Nama makanan tidak boleh kosong!");
      return;
    }
    setIsSubmittingFood(true);
    try {
      const cal = Math.max(0, Number(foodFormCalories) || 0);
      const prot = Math.max(0, Number(foodFormProtein) || 0);
      const fat = Math.max(0, Number(foodFormFat) || 0);
      const carbs = Math.max(0, Number(foodFormCarbs) || 0);
      const fiber = Math.max(0, Number(foodFormFiber) || 0);
      const portion = Math.max(1, Number(foodFormPortion) || 150);

      const payload = {
        foods: [
          {
            name: foodFormName.trim(),
            portion_grams: portion,
            nutrition: {
              calories: cal,
              protein_g: prot,
              fat_g: fat,
              carbs_g: carbs,
              fiber_g: fiber,
            },
          },
        ],
        total_nutrition: {
          calories: cal,
          protein_g: prot,
          fat_g: fat,
          carbs_g: carbs,
          fiber_g: fiber,
        },
        logged_at: foodFormDate ? new Date(foodFormDate).toISOString() : new Date().toISOString(),
      };

      const res = await fetch("/api/nutrition-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setShowLoginModal(true);
          throw new Error("Silakan login terlebih dahulu untuk menyimpan catatan diari.");
        }
        throw new Error(data.error || "Gagal mencatat makanan");
      }

      setEntries((prev) => {
        const next = [data, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem(getStorageKey(), JSON.stringify(next));
        }
        return next;
      });

      setShowAddModal(false);
      setFoodFormName("");
      showNotification(`"${foodFormName.trim()}" berhasil disimpan ke diari kuliner!`);
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Gagal mencatat makanan");
    } finally {
      setIsSubmittingFood(false);
    }
  };

  const handleDeleteEntry = async (id: string | number) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/nutrition-history?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setShowLoginModal(true);
          throw new Error("Silakan login terlebih dahulu untuk menghapus catatan.");
        }
        throw new Error(data.error || "Gagal menghapus catatan");
      }

      setEntries((prev) => {
        const next = prev.filter((item) => String(item.id) !== String(id));
        if (typeof window !== "undefined") {
          localStorage.setItem(getStorageKey(), JSON.stringify(next));
        }
        return next;
      });
      showNotification("1 catatan makanan berhasil dihapus.");
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeletingId(null);
    }
  };

  const loadHistory = async () => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const storageKey = getStorageKey();
      const cached = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEntries(parsed);
          }
        } catch {
          // ignore cache parse failure
        }
      }

      const [resHist, resProfile] = await Promise.all([
        fetch("/api/nutrition-history", { cache: "no-store" }),
        fetch("/api/profile", { cache: "no-store" }),
      ]);

      const data = await resHist.json();
      if (!resHist.ok) {
        if (resHist.status === 401) {
          setEntries([]);
          return;
        }
        throw new Error(data.error || "Gagal memuat riwayat");
      }
      const fetchedEntries = Array.isArray(data) ? data : [];
      setEntries(fetchedEntries);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify(fetchedEntries));
      }
      setError(null);

      if (resProfile.ok) {
        const pData = await resProfile.json();
        if (pData.success && pData.data?.daily_calorie_target) {
          setTargetCalories(pData.data.daily_calorie_target);
        } else {
          setTargetCalories(2250);
        }
      } else {
        setTargetCalories(2250);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadHistory();
    }
  }, [user, authLoading]);

  const dailyHistory = useMemo(() => {
    return entries.reduce<Record<string, DailyNutrition>>((days, entry) => {
      const date = new Date(entry.logged_at);
      const dateKey = date.toISOString().split("T")[0];
      const rawWeekday = date.toLocaleDateString("id-ID", { weekday: "long" });
      const weekday = (rawWeekday.charAt(0).toUpperCase() + rawWeekday.slice(1)) + ",";
      const formattedDate = date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const label = `${weekday} ${formattedDate}`;

      const day =
        days[dateKey] ||
        (days[dateKey] = {
          label,
          weekday,
          formattedDate,
          dateKey,
          entries: [],
          calories: 0,
          protein_g: 0,
          fat_g: 0,
          carbs_g: 0,
          fiber_g: 0,
          estimatedCost: 0,
        });
      day.entries.push(entry);
      day.calories += Number(entry.calories);
      day.protein_g += Number(entry.protein_g);
      day.fat_g += Number(entry.fat_g);
      day.carbs_g += Number(entry.carbs_g);
      day.fiber_g += Number(entry.fiber_g);
      const entryCost = entry.foods.reduce((sum, f) => sum + estimateFoodCost(f.name), 0);
      day.estimatedCost += entryCost;
      return days;
    }, {});
  }, [entries]);

  const days = useMemo(() => {
    return Object.values(dailyHistory).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [dailyHistory]);

  const recent7Days = useMemo(() => days.slice(0, 7), [days]);

  // Weekly Overview Metrics
  const totalWeeklyCalories = useMemo(
    () => recent7Days.reduce((s, d) => s + d.calories, 0),
    [recent7Days]
  );
  const totalWeeklyCost = useMemo(
    () => recent7Days.reduce((s, d) => s + d.estimatedCost, 0),
    [recent7Days]
  );
  const avgDailyCalories = useMemo(
    () => (recent7Days.length > 0 ? Math.round(totalWeeklyCalories / recent7Days.length) : 0),
    [recent7Days, totalWeeklyCalories]
  );
  const avgDailyCost = useMemo(
    () => (recent7Days.length > 0 ? Math.round(totalWeeklyCost / recent7Days.length) : 0),
    [recent7Days, totalWeeklyCost]
  );

  // Favorite Food
  const favoriteFood = useMemo(() => {
    if (entries.length === 0) return "-";
    const counts: Record<string, number> = {};
    for (const e of entries) {
      for (const f of e.foods) {
        const cleanName = f.name.trim();
        counts[cleanName] = (counts[cleanName] || 0) + 1;
      }
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? `${sorted[0][0]} (${sorted[0][1]}x)` : "-";
  }, [entries]);

  // Friendly Nutrition Advice
  const nutritionAdvice = useMemo(() => {
    if (recent7Days.length === 0) {
      return "Mulailah mencatat santapan harianmu! Diari ini akan membantumu melihat kebiasaan kuliner nikmat tanpa rasa tertekan.";
    }

    const avgProtein = recent7Days.reduce((s, d) => s + d.protein_g, 0) / recent7Days.length;
    const avgFiber = recent7Days.reduce((s, d) => s + d.fiber_g, 0) / recent7Days.length;

    const tips: string[] = [];

    if (avgProtein >= 45) {
      tips.push("Asupan proteinmu minggu ini mantap banget! Tubuhmu punya pondasi prima untuk aktivitas padat dan kuliah.");
    } else {
      tips.push("Pilihan makananmu nikmat dan berenergi! Kalau mau tambah kenyang tahan lama, coba tambahkan sepotong tahu, tempe, atau telur dadar hangat.");
    }

    if (avgFiber >= 15) {
      tips.push("Kebiasaan makan sayurmu luar biasa terjaga. Pencernaan nyaman, badan tetap segar seharian!");
    } else {
      tips.push("Biar pencernaan makin nyaman di sela jadwal kuliah yang padat, yuk selipkan semangkuk sayur sop, tumis kangkung, atau buah segar di makan siang besok.");
    }

    return tips.join(" ");
  }, [recent7Days]);

  // Clear History Handler
  const handleClearHistory = async () => {
    if (!user) {
      setShowLoginModal(true);
      setShowDeleteModal(false);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch("/api/nutrition-history", { method: "DELETE" });
      if (!res.ok) {
        if (res.status === 401) {
          setShowLoginModal(true);
          throw new Error("Silakan login terlebih dahulu untuk mengosongkan diari.");
        }
        throw new Error("Gagal menghapus data di server");
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem(getStorageKey());
      }
      setEntries([]);
      setShowDeleteModal(false);
      showNotification("Seluruh catatan diari berhasil dikosongkan.");
    } catch (e) {
      showNotification(e instanceof Error ? e.message : "Gagal mengosongkan riwayat");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      style={{
        background: "#F7F5F1",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      className="w-full min-h-screen text-[#292721]"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <aside
          role="status"
          className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#292721] text-white px-5 py-3 shadow-xl text-sm font-semibold flex items-center gap-2 border border-[#555149] animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* Main Canvas matching Figma 1440 container */}
      <main className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-80px)] pt-6 sm:pt-14 pb-16 px-4 sm:px-8 md:px-12 lg:px-20 flex flex-col gap-8 sm:gap-10">
        {/* Top Header Block */}
        <section className="w-full flex flex-col gap-[18px]">
          {/* Breadcrumb indicator */}
          <div className="flex items-center gap-[9px]">
            <div style={{ width: 18, height: 2, background: "#C65320" }} />
            <span
              style={{
                color: "#C65320",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              DOMPETKOST / CATATAN HARIAN
            </span>
          </div>

          {/* Heading and Action Toolbar */}
          <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-[650px] flex flex-col gap-2.5">
              <h1
                style={{
                  color: "#292721",
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontWeight: 400,
                  lineHeight: "1",
                }}
                className="text-4xl sm:text-5xl lg:text-[60px] tracking-tight"
              >
                Diari Kuliner
              </h1>
              <p
                style={{
                  color: "#77736B",
                  fontSize: 14,
                  lineHeight: "21px",
                }}
              >
                Rekam jejak santapan harian, estimasi pengeluaran, dan keseimbangan energimu.
              </p>
            </div>

            {/* Action Buttons matching Figma spec */}
            <div className="w-full md:w-auto grid grid-cols-[1fr_1fr_auto] sm:flex sm:items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    setShowLoginModal(true);
                  } else {
                    setShowAddModal(true);
                  }
                }}
                style={{
                  height: 44,
                  background: "#C65320",
                  outline: "1px #C65320 solid",
                  outlineOffset: "-1px",
                }}
                className="px-3 sm:px-4 rounded-[10px] text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition hover:bg-[#b0481a] active:scale-95 shadow-xs cursor-pointer whitespace-nowrap"
                title="Catat makanan secara cepat"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3.75v10.5M3.75 9h10.5" />
                </svg>
                <span>Catat Makanan</span>
              </button>

              <Link
                href="/analyze"
                style={{
                  height: 44,
                  outline: "1px #E8E4DC solid",
                  outlineOffset: "-1px",
                }}
                className="px-3 sm:px-3.5 bg-white hover:bg-[#FAF9F6] text-[#555149] rounded-[10px] text-[13px] font-semibold flex items-center justify-center gap-2 transition active:scale-95 shadow-xs whitespace-nowrap"
                title="Pindai makanan via kamera AI"
              >
                <svg className="w-[18px] h-[18px] text-[#C65320] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                <span className="hidden sm:inline">Scan Foto AI</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    setShowLoginModal(true);
                  } else {
                    setShowDeleteModal(true);
                  }
                }}
                disabled={entries.length === 0}
                style={{
                  height: 44,
                  outline: "1px #E8E4DC solid",
                  outlineOffset: "-1px",
                }}
                className="px-3 sm:px-4 bg-white hover:bg-rose-50/60 text-[#A84A42] rounded-[10px] text-[13px] font-semibold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs whitespace-nowrap"
                title="Kosongkan diari kuliner"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 4.5h12M6.5 4.5V3a1 1 0 011-1h3a1 1 0 011 1v1.5m2 0v10.5a1.5 1.5 0 01-1.5 1.5H5a1.5 1.5 0 01-1.5-1.5V4.5h11zM7.5 8v5.5M10.5 8v5.5" />
                </svg>
                <span>Kosongkan</span>
              </button>

              <button
                type="button"
                onClick={loadHistory}
                disabled={loading}
                style={{
                  height: 44,
                  outline: "1px #E8E4DC solid",
                  outlineOffset: "-1px",
                }}
                className="px-3 sm:px-[13px] bg-white hover:bg-[#FAF9F6] text-[#555149] rounded-[10px] flex items-center justify-center transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                title="Muat ulang catatan"
              >
                <svg
                  className={`w-[18px] h-[18px] ${loading ? "animate-spin" : ""}`}
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.5 3v4h4M15.5 15v-4h-4M14.8 7A6.5 6.5 0 003.5 6.2L2.5 7m13 4l-1 0.8A6.5 6.5 0 013.2 11" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Section 1: Sekilas diari kamu */}
        <section aria-label="Sekilas diari kamu" className="w-full flex flex-col gap-4">
          <div className="w-full flex items-center justify-between">
            <h2
              style={{
                color: "#292721",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Sekilas diari kamu
            </h2>
            <div className="flex items-center gap-[7px]">
              <svg className="w-3.5 h-3.5 text-[#77736B]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2.5" width="10" height="9.5" rx="2" />
                <path d="M2 5.5h10M4.5 1.5v2M9.5 1.5v2" />
              </svg>
              <span
                style={{
                  color: "#77736B",
                  fontSize: 12,
                  fontWeight: 400,
                }}
              >
                Ringkasan 7 hari
              </span>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {/* Card 1: TOTAL JAJAN 7 HARI */}
            <div
              style={{
                background: "#FCF0E7",
                outline: "1px #F0D7C6 solid",
                outlineOffset: "-1px",
              }}
              className="h-auto sm:h-[154px] p-5 sm:p-6 rounded-2xl flex flex-col justify-start items-start gap-2 sm:gap-[15px]"
            >
              <div
                style={{
                  color: "#C65320",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
                className="w-full"
              >
                TOTAL JAJAN 7 HARI (ESTIMASI)
              </div>
              <div
                style={{
                  color: "#292721",
                  fontSize: 34,
                  fontWeight: 600,
                  lineHeight: "39.10px",
                }}
                className="w-full tracking-tight truncate"
              >
                Rp{totalWeeklyCost.toLocaleString("id-ID")}
              </div>
              <div
                style={{
                  color: "#77736B",
                  fontSize: 12,
                  fontWeight: 400,
                }}
                className="w-full"
              >
                Estimasi biaya makan
              </div>
            </div>

            {/* Card 2: RATA-RATA / HARI */}
            <div
              style={{
                background: "white",
                outline: "1px #E8E4DC solid",
                outlineOffset: "-1px",
              }}
              className="h-auto sm:h-[154px] p-5 sm:p-6 rounded-2xl flex flex-col justify-start items-start gap-2 sm:gap-[15px]"
            >
              <div
                style={{
                  color: "#77736B",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
                className="w-full"
              >
                RATA-RATA / HARI (ESTIMASI)
              </div>
              <div
                style={{
                  color: "#292721",
                  fontSize: 34,
                  fontWeight: 600,
                  lineHeight: "39.10px",
                }}
                className="w-full tracking-tight truncate"
              >
                Rp{avgDailyCost.toLocaleString("id-ID")}
              </div>
              <div
                style={{
                  color: "#77736B",
                  fontSize: 12,
                  fontWeight: 400,
                }}
                className="w-full"
              >
                Pengeluaran harian
              </div>
            </div>

            {/* Card 3: RATA-RATA ENERGI */}
            <div
              style={{
                background: "white",
                outline: "1px #E8E4DC solid",
                outlineOffset: "-1px",
              }}
              className="h-auto sm:h-[154px] p-5 sm:p-6 rounded-2xl flex flex-col justify-start items-start gap-2 sm:gap-[15px]"
            >
              <div
                style={{
                  color: "#77736B",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
                className="w-full"
              >
                RATA-RATA ENERGI
              </div>
              <div className="w-full flex items-baseline gap-1">
                <span
                  style={{
                    color: "#292721",
                    fontSize: 34,
                    fontWeight: 600,
                    lineHeight: "39.10px",
                  }}
                >
                  {avgDailyCalories}
                </span>
                <span
                  style={{
                    color: "#77736B",
                    fontSize: 13,
                    fontWeight: 400,
                    lineHeight: "14.95px",
                  }}
                >
                  {" "}kkal/hari
                </span>
              </div>
              <div
                style={{
                  color: "#77736B",
                  fontSize: 12,
                  fontWeight: 400,
                }}
                className="w-full"
              >
                Target: {targetCalories > 0 ? targetCalories : 2250} kkal
              </div>
            </div>

            {/* Card 4: MENU TERFAVORIT */}
            <div
              style={{
                background: "white",
                outline: "1px #E8E4DC solid",
                outlineOffset: "-1px",
              }}
              className="h-auto sm:h-[154px] p-5 sm:p-6 rounded-2xl flex flex-col justify-start items-start gap-2 sm:gap-[15px] overflow-hidden"
            >
              <div
                style={{
                  color: "#77736B",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
                className="w-full"
              >
                MENU TERFAVORIT
              </div>
              <div
                title={favoriteFood}
                style={{
                  color: "#292721",
                  fontSize: 23,
                  fontWeight: 600,
                  lineHeight: "26.45px",
                }}
                className="w-full truncate"
              >
                {favoriteFood}
              </div>
              <div
                style={{
                  color: "#77736B",
                  fontSize: 12,
                  fontWeight: 400,
                }}
                className="w-full"
              >
                Paling sering dinikmati
              </div>
            </div>
          </div>

          {/* Catatan Gizi Card */}
          <div
            style={{
              background: "#F0EEE7",
              borderRadius: 10,
              padding: "20px 22px",
            }}
            className="w-full flex items-start gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-white shrink-0 flex items-center justify-center shadow-2xs">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none" stroke="#C65320" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 2.25a5.25 5.25 0 00-3 9.55V13.5a1.5 1.5 0 001.5 1.5h3a1.5 1.5 0 001.5-1.5v-1.7A5.25 5.25 0 009 2.25zM7.5 16.5h3" />
              </svg>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div
                style={{
                  color: "#292721",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Catatan Gizi
              </div>
              <p
                style={{
                  color: "#555149",
                  fontSize: 13,
                  fontWeight: 400,
                  lineHeight: "21.45px",
                }}
              >
                {nutritionAdvice}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Catatan makanan */}
        <section aria-label="Catatan makanan" className="w-full flex flex-col gap-5">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2
                style={{
                  color: "#292721",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                Catatan makanan
              </h2>
              <div
                style={{
                  background: "#EDEAE3",
                  borderRadius: 100,
                  padding: "5px 9px",
                }}
                className="flex items-center justify-center"
              >
                <span
                  style={{
                    color: "#77736B",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {entries.length} catatan
                </span>
              </div>
            </div>

            <div className="flex items-center gap-[7px]">
              <svg className="w-[15px] h-[15px] text-[#77736B]" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 4.5h10M4.5 7.5h6M6.5 10.5h2" />
              </svg>
              <span
                style={{
                  color: "#77736B",
                  fontSize: 12,
                  fontWeight: 400,
                }}
              >
                Terbaru lebih dulu
              </span>
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C65320] border-t-transparent" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && days.length === 0 && (
            <div
              style={{
                outline: "1px #E8E4DC solid",
                outlineOffset: "-1px",
              }}
              className="w-full bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center"
            >
              {!user ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#FCF0E7] text-[#C65320] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3
                    style={{
                      color: "#292721",
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    Masuk untuk Menyimpan Diari Kuliner
                  </h3>
                  <p
                    style={{
                      color: "#77736B",
                      fontSize: 13,
                      fontWeight: 400,
                    }}
                    className="mt-1 max-w-sm leading-relaxed"
                  >
                    Catatan makanan hanya disimpan ke database ketika kamu sudah masuk dengan akunmu.
                  </p>
                  <div className="mt-5 flex items-center gap-3 flex-wrap justify-center">
                    <Link
                      href="/login"
                      style={{
                        background: "#C65320",
                        outline: "1px #C65320 solid",
                        outlineOffset: "-1px",
                      }}
                      className="h-11 px-5 rounded-[10px] text-white text-[13px] font-semibold flex items-center gap-2 transition hover:bg-[#b0481a] active:scale-95 shadow-xs"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Masuk Akun Sekarang</span>
                    </Link>
                    <Link
                      href="/analyze"
                      style={{
                        outline: "1px #E8E4DC solid",
                        outlineOffset: "-1px",
                      }}
                      className="h-11 px-5 rounded-[10px] bg-white text-[#555149] text-[13px] font-semibold flex items-center gap-2 hover:bg-[#FAF9F6] transition active:scale-95 shadow-xs"
                    >
                      <svg className="w-4 h-4 text-[#C65320]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      <span>Coba Scan Foto AI</span>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#FCF0E7] text-[#C65320] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3
                    style={{
                      color: "#292721",
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    Diari Kulinermu Masih Kosong
                  </h3>
                  <p
                    style={{
                      color: "#77736B",
                      fontSize: 13,
                      fontWeight: 400,
                    }}
                    className="mt-1 max-w-sm leading-relaxed"
                  >
                    Yuk catat santapan warteg atau kreasi masak kosanmu hari ini agar terekam rapi!
                  </p>
                  <div className="mt-5 flex items-center gap-3 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      style={{
                        background: "#C65320",
                        outline: "1px #C65320 solid",
                        outlineOffset: "-1px",
                      }}
                      className="h-11 px-5 rounded-[10px] text-white text-[13px] font-semibold flex items-center gap-2 transition hover:bg-[#b0481a] active:scale-95 shadow-xs cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Catat Cepat Manual</span>
                    </button>
                    <Link
                      href="/analyze"
                      style={{
                        outline: "1px #E8E4DC solid",
                        outlineOffset: "-1px",
                      }}
                      className="h-11 px-5 rounded-[10px] bg-white text-[#555149] text-[13px] font-semibold flex items-center gap-2 hover:bg-[#FAF9F6] transition active:scale-95 shadow-xs"
                    >
                      <svg className="w-4 h-4 text-[#C65320]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      <span>Scan Foto AI</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Days Feed matching Figma */}
          {!loading && !error && days.length > 0 && (
            <div className="w-full flex flex-col gap-5">
              {days.map((day) => (
                <article
                  key={day.dateKey}
                  style={{
                    background: "white",
                    outline: "1px #E8E4DC solid",
                    outlineOffset: "-1px",
                  }}
                  className="w-full rounded-2xl flex flex-col md:flex-row items-stretch overflow-hidden shadow-2xs"
                >
                  {/* Left Column: Date & Macros */}
                  <div
                    style={{
                      background: "#FAF9F6",
                    }}
                    className="w-full md:w-[252px] shrink-0 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#E8E4DC] flex flex-col justify-start gap-3 sm:gap-[23px]"
                  >
                    <div className="flex flex-col gap-1 sm:gap-1.5">
                      <div
                        style={{
                          color: "#77736B",
                          fontSize: 12,
                          fontWeight: 400,
                        }}
                      >
                        {day.weekday}
                      </div>
                      <div
                        style={{
                          color: "#292721",
                          fontSize: 21,
                          fontWeight: 600,
                          lineHeight: "25.20px",
                        }}
                      >
                        {day.formattedDate}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 md:grid-cols-2 gap-2 sm:gap-4">
                      <div className="flex flex-col gap-0.5 sm:gap-1">
                        <span
                          style={{
                            color: "#77736B",
                            fontSize: 11,
                            fontWeight: 400,
                          }}
                        >
                          Protein
                        </span>
                        <span
                          style={{
                            color: "#555149",
                            fontSize: 15,
                            fontWeight: 500,
                          }}
                        >
                          {day.protein_g.toFixed(0)}g
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 sm:gap-1">
                        <span
                          style={{
                            color: "#77736B",
                            fontSize: 11,
                            fontWeight: 400,
                          }}
                        >
                          Lemak
                        </span>
                        <span
                          style={{
                            color: "#555149",
                            fontSize: 15,
                            fontWeight: 500,
                          }}
                        >
                          {day.fat_g.toFixed(0)}g
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 sm:gap-1">
                        <span
                          style={{
                            color: "#77736B",
                            fontSize: 11,
                            fontWeight: 400,
                          }}
                        >
                          Karbo
                        </span>
                        <span
                          style={{
                            color: "#555149",
                            fontSize: 15,
                            fontWeight: 500,
                          }}
                        >
                          {day.carbs_g.toFixed(0)}g
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 sm:gap-1">
                        <span
                          style={{
                            color: "#77736B",
                            fontSize: 11,
                            fontWeight: 400,
                          }}
                        >
                          Serat
                        </span>
                        <span
                          style={{
                            color: "#555149",
                            fontSize: 15,
                            fontWeight: 500,
                          }}
                        >
                          {day.fiber_g.toFixed(0)}g
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Daily Entries Table */}
                  <div className="flex-1 pt-5 pb-2 px-4 sm:px-6 flex flex-col gap-4 min-w-0">
                    {/* Day sub-header */}
                    <div className="w-full flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                      <span
                        style={{
                          color: "#77736B",
                          fontSize: 12,
                          fontWeight: 400,
                        }}
                      >
                        {day.entries.length} catatan makanan
                      </span>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span
                          style={{
                            color: "#292721",
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          ± Rp{day.estimatedCost.toLocaleString("id-ID")}
                        </span>
                        <div
                          style={{
                            background: "#FCF0E7",
                            borderRadius: 8,
                            padding: "7px 10px",
                          }}
                          className="flex items-center justify-center"
                        >
                          <span
                            style={{
                              color: "#C65320",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {Math.round(day.calories)} kkal
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="w-full flex flex-col">
                      {/* Column titles */}
                      <div className="hidden sm:flex w-full pb-3 items-center gap-3 lg:gap-5">
                        <div
                          style={{
                            width: 56,
                            color: "#77736B",
                            fontSize: 10,
                            fontWeight: 500,
                          }}
                        >
                          WAKTU
                        </div>
                        <div
                          style={{
                            color: "#77736B",
                            fontSize: 10,
                            fontWeight: 500,
                          }}
                          className="flex-1"
                        >
                          MENU MAKANAN
                        </div>
                        <div
                          style={{
                            width: 90,
                            textAlign: "right",
                            color: "#77736B",
                            fontSize: 10,
                            fontWeight: 500,
                          }}
                        >
                          ENERGI
                        </div>
                        <div
                          style={{
                            width: 114,
                            textAlign: "right",
                            color: "#77736B",
                            fontSize: 10,
                            fontWeight: 500,
                          }}
                        >
                          ESTIMASI BIAYA
                        </div>
                        <div style={{ width: 28 }} />
                      </div>

                      {/* Entries rows */}
                      {day.entries.map((entry) => {
                        const entryCost = entry.foods.reduce((sum, f) => sum + estimateFoodCost(f.name), 0);
                        const d = new Date(entry.logged_at);
                        const timeStr = d.toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }).replace(":", ".");
                        const foodNames = entry.foods.length > 0
                          ? entry.foods.map((f) => f.name).join(", ")
                          : "—";

                        return (
                          <div key={entry.id} className="w-full border-t border-[#E8E4DC]">
                            {/* Mobile Row (< sm) */}
                            <div className="sm:hidden flex flex-col gap-1.5 py-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-baseline gap-2 min-w-0">
                                  <span className="text-xs font-semibold text-[#77736B] shrink-0">{timeStr}</span>
                                  <span className="text-[13px] font-medium text-[#292721] leading-tight break-words">{foodNames}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  disabled={deletingId === entry.id}
                                  title="Hapus catatan ini"
                                  className="p-1 rounded-md text-[#77736B] hover:text-[#A84A42] hover:bg-rose-50 transition cursor-pointer disabled:opacity-40 shrink-0"
                                >
                                  {deletingId === entry.id ? (
                                    <svg className="w-3.5 h-3.5 animate-spin text-[#C65320]" viewBox="0 0 24 24" fill="none">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center justify-between text-xs text-[#555149] pt-1">
                                <span className="font-semibold text-[#C65320] bg-[#FCF0E7] px-2 py-0.5 rounded-md text-[11px]">
                                  {Math.round(Number(entry.calories))} kkal
                                </span>
                                <span className="font-semibold text-[#292721]">
                                  ± Rp{entryCost.toLocaleString("id-ID")}
                                </span>
                              </div>
                            </div>

                            {/* Desktop/Tablet Row (>= sm) */}
                            <div className="hidden sm:flex w-full items-center gap-3 lg:gap-5 min-h-[60px] py-4">
                              <div
                                style={{
                                  width: 56,
                                  color: "#77736B",
                                  fontSize: 12,
                                  fontWeight: 400,
                                }}
                              >
                                {timeStr}
                              </div>
                              <div
                                style={{
                                  color: "#292721",
                                  fontSize: 13,
                                  fontWeight: 500,
                                  lineHeight: "20.80px",
                                }}
                                className="flex-1 break-words pr-2"
                              >
                                {foodNames}
                              </div>
                              <div
                                style={{
                                  width: 90,
                                  textAlign: "right",
                                  color: "#555149",
                                  fontSize: 13,
                                  fontWeight: 400,
                                }}
                              >
                                {Math.round(Number(entry.calories))} kkal
                              </div>
                              <div
                                style={{
                                  width: 114,
                                  textAlign: "right",
                                  color: "#555149",
                                  fontSize: 13,
                                  fontWeight: 400,
                                }}
                              >
                                ± Rp{entryCost.toLocaleString("id-ID")}
                              </div>
                              <div style={{ width: 28 }} className="flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  disabled={deletingId === entry.id}
                                  title="Hapus catatan ini"
                                  className="p-1 rounded-md text-[#77736B] hover:text-[#A84A42] hover:bg-rose-50 transition cursor-pointer disabled:opacity-40"
                                >
                                  {deletingId === entry.id ? (
                                    <svg className="w-3.5 h-3.5 animate-spin text-[#C65320]" viewBox="0 0 24 24" fill="none">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div
            style={{
              outline: "1px #E8E4DC solid",
              outlineOffset: "-1px",
            }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <h3 id="modal-title" className="text-lg font-bold flex items-center gap-2 text-[#A84A42]">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Kosongkan Diari Kuliner?</span>
            </h3>
            <p style={{ color: "#555149", fontSize: 13, lineHeight: "20px" }}>
              Tindakan ini akan menghapus seluruh catatan makanan dan riwayat pengeluaran di akunmu.
              Data yang sudah dihapus tidak dapat dipulihkan kembali.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E4DC]">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                style={{
                  outline: "1px #E8E4DC solid",
                  outlineOffset: "-1px",
                }}
                className="h-10 px-4 rounded-[10px] bg-white text-[#555149] text-[13px] font-semibold hover:bg-[#FAF9F6] transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                disabled={isDeleting}
                style={{
                  background: "#A84A42",
                  outline: "1px #A84A42 solid",
                  outlineOffset: "-1px",
                }}
                className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold hover:bg-[#913d36] transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Menghapus..." : "Ya, Kosongkan Diari"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Food Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-food-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div
            style={{
              outline: "1px #E8E4DC solid",
              outlineOffset: "-1px",
            }}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FCF0E7] text-[#C65320] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 id="add-food-title" className="text-lg font-bold text-[#292721]">
                    Catat Santapan ke Diari
                  </h3>
                  <p className="text-xs text-[#77736B]">
                    Tersimpan langsung ke database akunmu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#77736B] hover:text-[#292721] p-1.5 rounded-lg hover:bg-[#FAF9F6] transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleQuickLogFood} className="space-y-4">
              {/* Food Name & Autocomplete */}
              <div>
                <label className="block text-xs font-semibold text-[#555149] uppercase tracking-wider mb-1.5">
                  Nama Menu / Makanan
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: Nasi Padang Rendang, Telur Dadar..."
                  value={foodFormName}
                  onChange={(e) => setFoodFormName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E8E4DC] focus:outline-none focus:border-[#C65320] text-sm text-[#292721] placeholder-[#77736B]/60 transition"
                />

                {/* Suggestions pill */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[#77736B] font-medium mr-1">Cepat:</span>
                  {["Nasi Putih", "Telur Dadar", "Ayam Goreng", "Tempe Orek", "Sayur Sop", "Kangkung", "Tahu Goreng"].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className="px-2.5 py-1 rounded-full text-[11px] bg-[#FAF9F6] border border-[#E8E4DC] text-[#555149] hover:bg-[#FCF0E7] hover:border-[#C65320] hover:text-[#C65320] transition cursor-pointer"
                    >
                      +{sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion and Calories row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#555149] uppercase tracking-wider mb-1.5">
                    Porsi (gram)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={foodFormPortion}
                    onChange={(e) => setFoodFormPortion(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E8E4DC] focus:outline-none focus:border-[#C65320] text-sm text-[#292721]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#555149] uppercase tracking-wider mb-1.5">
                    Energi (kkal)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={foodFormCalories}
                    onChange={(e) => setFoodFormCalories(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E8E4DC] focus:outline-none focus:border-[#C65320] text-sm text-[#292721]"
                  />
                </div>
              </div>

              {/* Macros grid */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-[#77736B] mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={foodFormProtein}
                    onChange={(e) => setFoodFormProtein(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg border border-[#E8E4DC] focus:outline-none focus:border-[#C65320] text-xs text-[#292721]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#77736B] mb-1">
                    Lemak (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={foodFormFat}
                    onChange={(e) => setFoodFormFat(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg border border-[#E8E4DC] focus:outline-none focus:border-[#C65320] text-xs text-[#292721]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#77736B] mb-1">
                    Karbo (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={foodFormCarbs}
                    onChange={(e) => setFoodFormCarbs(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg border border-[#E8E4DC] focus:outline-none focus:border-[#C65320] text-xs text-[#292721]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#77736B] mb-1">
                    Serat (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={foodFormFiber}
                    onChange={(e) => setFoodFormFiber(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg border border-[#E8E4DC] focus:outline-none focus:border-[#C65320] text-xs text-[#292721]"
                  />
                </div>
              </div>

              {/* Date & Time Picker */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-[#555149] uppercase tracking-wider mb-1.5">
                  Waktu Santap (Opsional, bawaan: Sekarang)
                </label>
                <input
                  type="datetime-local"
                  value={foodFormDate}
                  onChange={(e) => setFoodFormDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E8E4DC] focus:outline-none focus:border-[#C65320] text-xs text-[#292721]"
                />
              </div>

              {/* AI alternative tip */}
              <div className="p-3 bg-[#FCF0E7]/60 rounded-xl border border-[#C65320]/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#C65320] text-base">✨</span>
                  <span className="text-xs text-[#555149]">Punya foto makanannya? Biarkan AI yang hitung gizinya.</span>
                </div>
                <Link
                  href="/analyze"
                  className="text-xs font-semibold text-[#C65320] hover:underline shrink-0"
                >
                  Scan AI &rarr;
                </Link>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E4DC]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmittingFood}
                  style={{
                    outline: "1px #E8E4DC solid",
                    outlineOffset: "-1px",
                  }}
                  className="h-10 px-4 rounded-[10px] bg-white text-[#555149] text-[13px] font-semibold hover:bg-[#FAF9F6] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFood}
                  style={{
                    background: "#C65320",
                    outline: "1px #C65320 solid",
                    outlineOffset: "-1px",
                  }}
                  className="h-10 px-5 rounded-[10px] text-white text-[13px] font-semibold hover:bg-[#b0481a] transition flex items-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {isSubmittingFood ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan ke Diari</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div
            style={{
              outline: "1px #E8E4DC solid",
              outlineOffset: "-1px",
            }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-11 h-11 rounded-full bg-[#FCF0E7] text-[#C65320] flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 id="login-modal-title" className="text-lg font-bold text-[#292721]">
                Perlu Masuk Akun
              </h3>
              <p className="text-xs text-[#77736B] mt-1.5 leading-relaxed">
                Catatan diari kuliner hanya disimpan saat kamu masuk akun. Silakan login terlebih dahulu agar santapan harianmu tersimpan di database dan riwayatmu tetap aman.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E4DC]">
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                style={{
                  outline: "1px #E8E4DC solid",
                  outlineOffset: "-1px",
                }}
                className="h-10 px-4 rounded-[10px] bg-white text-[#555149] text-[13px] font-semibold hover:bg-[#FAF9F6] transition cursor-pointer"
              >
                Batal
              </button>
              <Link
                href="/login"
                style={{
                  background: "#C65320",
                  outline: "1px #C65320 solid",
                  outlineOffset: "-1px",
                }}
                className="h-10 px-5 rounded-[10px] text-white text-[13px] font-semibold hover:bg-[#b0481a] transition flex items-center gap-2 shadow-xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Masuk Sekarang</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


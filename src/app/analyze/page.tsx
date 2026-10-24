"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CULINARY_CATALOG, FoodItem } from "@/lib/data/culinaryCatalog";
import { FoodAnalysisResult } from "@/lib/ai";

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

// 3.2d Kompresi gambar sisi klien: Resize ke maks 1280px & JPEG 80% (target < 500 KB)
async function compressImageFile(fileOrBlob: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(fileOrBlob);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const MAX_DIM = 1280;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context tidak tersedia"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = (err) => reject(err);
    img.src = objectUrl;
  });
}

export default function AnalyzePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"analyze" | "insights">("analyze");

  // --- Analyze State ---
  const [preview, setPreview] = useState<string | null>(null);
  const [foodName, setFoodName] = useState("");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<{ imageBase64?: string; text?: string } | null>(null);

  // 3.2b Alur Koreksi Manual & Pengatur Porsi Interaktif
  const [editedDishName, setEditedDishName] = useState("");
  const [portionMultiplier, setPortionMultiplier] = useState(1.0);
  const [portionPreset, setPortionPreset] = useState<"S" | "M" | "L" | "custom">("M");
  const [customPrice, setCustomPrice] = useState<number | "">("");
  const [isSavingDiary, setIsSavingDiary] = useState(false);
  const [diarySaveSuccess, setDiarySaveSuccess] = useState(false);
  const [diarySaveError, setDiarySaveError] = useState<string | null>(null);

  // Modal Pencarian Menu Manual dari Katalog
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  // --- Camera State ---
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Insights State ---
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [profileTargets, setProfileTargets] = useState({ calories: 0, protein_g: 0, fiber_g: 0 });

  // --- Camera Handlers ---
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraLoading(false);
  };

  const startCamera = async (facing: "environment" | "user" = cameraFacingMode) => {
    setCameraError(null);
    setCameraLoading(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Perangkat atau browser ini tidak mendukung akses kamera langsung.");
      setCameraLoading(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setCameraFacingMode(facing);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // Play might await user gesture
        }
      }
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      const isDenied =
        err instanceof Error &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      setCameraError(
        isDenied
          ? "Izin kamera ditolak. Berikan izin kamera di browser Anda atau gunakan opsi upload file."
          : "Tidak dapat mengakses kamera. Pastikan kamera tidak digunakan oleh aplikasi lain.",
      );
      setIsCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacingMode === "environment" ? "user" : "environment";
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    let width = video.videoWidth || 640;
    let height = video.videoHeight || 480;

    const MAX_DIM = 1280;
    if (width > MAX_DIM || height > MAX_DIM) {
      if (width > height) {
        height = Math.round((height * MAX_DIM) / width);
        width = MAX_DIM;
      } else {
        width = Math.round((width * MAX_DIM) / height);
        height = MAX_DIM;
      }
    }

    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

    setPreview(dataUrl);
    setFoodName("");
    stopCamera();
  };

  // --- Analyze Handlers ---
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // 3.2d Resize ke maks 1280px & kompresi JPEG 80% sebelum dikirim
        const compressedBase64 = await compressImageFile(file);
        setPreview(compressedBase64);
        setFoodName("");
        stopCamera();
      } catch (err) {
        console.error("Gagal kompres gambar:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          setFoodName("");
          stopCamera();
        };
        reader.readAsDataURL(file);
      }
    }
    e.target.value = "";
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFoodName(e.target.value);
    if (e.target.value) {
      setPreview(null);
      stopCamera();
    }
  };

  const clearSelectedPhoto = () => {
    setPreview(null);
    stopCamera();
  };

  // 3.2e Timeout request AI: 20 detik dengan AbortController
  const handleAnalyze = async () => {
    if (!preview && !foodName.trim()) return;

    stopCamera();
    setAnalyzeLoading(true);
    setAnalyzeError(null);
    setResult(null);
    setDiarySaveSuccess(false);
    setDiarySaveError(null);

    const payload = preview
      ? { imageBase64: preview }
      : { text: foodName.trim() };

    setLastPayload(payload);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menganalisis hidangan");
      }

      setResult(data);
      const primaryName = data.foods[0]?.name || foodName.trim() || "Menu Pilihan";
      setEditedDishName(primaryName);
      setPortionMultiplier(1.0);
      setPortionPreset("M");

      const estimatedPrice = data.foods[0]?.price_estimate?.min || 15000;
      setCustomPrice(estimatedPrice);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      console.warn("Analyze error:", err);
      if (err instanceof DOMException && err.name === "AbortError") {
        setAnalyzeError("Waktu review habis (20 detik). Fotonya kurang jelas atau koneksi sedang lambat.");
      } else {
        setAnalyzeError(err instanceof Error ? err.message : "Fotonya kurang jelas, coba foto dari atas dengan cahaya terang.");
      }
    } finally {
      setAnalyzeLoading(false);
    }
  };

  // 3.2a Pilih Alternatif Cepat (1 tap saat confidence < 0.6)
  const applyAlternative = (dishName: string) => {
    const catalogItem = CULINARY_CATALOG.find((c) => c.name.toLowerCase() === dishName.toLowerCase()) ||
      CULINARY_CATALOG.find((c) => c.name.toLowerCase().includes(dishName.toLowerCase()));

    setEditedDishName(dishName);

    if (catalogItem && result) {
      const updatedFoods = [
        {
          name: catalogItem.name,
          name_en: catalogItem.name,
          confidence: 0.95,
          portion_grams: catalogItem.portion.grams,
          portion_estimate: catalogItem.portion.label,
          nutrition: {
            calories: catalogItem.nutrition.kcal,
            protein_g: catalogItem.nutrition.protein,
            fat_g: catalogItem.nutrition.fat,
            carbs_g: catalogItem.nutrition.carbs,
            fiber_g: catalogItem.nutrition.fiber ?? 1,
            protein: catalogItem.nutrition.protein,
            fat: catalogItem.nutrition.fat,
            carbs: catalogItem.nutrition.carbs,
            fiber: catalogItem.nutrition.fiber ?? 1,
          },
          price_estimate: {
            min: catalogItem.priceRange.min,
            max: catalogItem.priceRange.max,
          },
        },
      ];

      setResult({
        ...result,
        foods: updatedFoods,
        total_nutrition: {
          calories: catalogItem.nutrition.kcal,
          protein_g: catalogItem.nutrition.protein,
          fat_g: catalogItem.nutrition.fat,
          carbs_g: catalogItem.nutrition.carbs,
          fiber_g: catalogItem.nutrition.fiber ?? 1,
        },
        flavor_tags: catalogItem.flavorTags,
        culinary_review: `Pilihan lezat ${catalogItem.name}! Gurih nagih dengan bumbu pas yang cocok banget buat selera anak kost.`,
        low_confidence: false,
      });

      setCustomPrice(catalogItem.priceRange.min);
    }
  };

  // Pilih Menu Langsung dari Katalog
  const handleSelectFromCatalog = (item: FoodItem) => {
    setEditedDishName(item.name);
    setPortionMultiplier(1.0);
    setPortionPreset("M");
    setCustomPrice(item.priceRange.min);
    setAnalyzeError(null);

    const syntheticResult: FoodAnalysisResult = {
      culinary_review: `Aroma harum ${item.name} yang menggoda selera! Menu favorit penyelamat anak kost dengan cita rasa khas dan ramah di kantong.`,
      culinary_tips: [
        `Biar makin komplit, pasangkan dengan ${item.pairWith?.join(" atau ") || "lalapan segar"}.`,
        "Minum air putih hangat atau es teh tawar dingin penutup makan yang nikmat.",
      ],
      flavor_tags: item.flavorTags,
      foods: [
        {
          name: item.name,
          name_en: item.name,
          confidence: 1.0,
          portion_grams: item.portion.grams,
          portion_estimate: item.portion.label,
          nutrition: {
            calories: item.nutrition.kcal,
            protein_g: item.nutrition.protein,
            fat_g: item.nutrition.fat,
            carbs_g: item.nutrition.carbs,
            fiber_g: item.nutrition.fiber ?? 1,
            protein: item.nutrition.protein,
            fat: item.nutrition.fat,
            carbs: item.nutrition.carbs,
            fiber: item.nutrition.fiber ?? 1,
          },
          price_estimate: {
            min: item.priceRange.min,
            max: item.priceRange.max,
          },
        },
      ],
      total_nutrition: {
        calories: item.nutrition.kcal,
        protein_g: item.nutrition.protein,
        fat_g: item.nutrition.fat,
        carbs_g: item.nutrition.carbs,
        fiber_g: item.nutrition.fiber ?? 1,
      },
      health_notes: [
        `Porsi standar ${item.name} memberikan energi ~${item.nutrition.kcal} kkal.`,
        `Kandungan protein ~${item.nutrition.protein}g mendukung energi dan konsentrasi harian.`,
      ],
      confidence: 1.0,
      low_confidence: false,
      disclaimer_key: "estimate",
    };

    setResult(syntheticResult);
    setCatalogModalOpen(false);
  };

  // Pengaturan Porsi Cepat (S, M, L)
  const handlePresetPortion = (preset: "S" | "M" | "L") => {
    setPortionPreset(preset);
    if (preset === "S") setPortionMultiplier(0.75);
    if (preset === "M") setPortionMultiplier(1.0);
    if (preset === "L") setPortionMultiplier(1.35);
  };

  // 3.2b Tombol simpan: "Catat ke Diari" (eksplisit & tervalidasi)
  const handleSaveToDiary = async () => {
    if (!result) return;
    if (!user) {
      setDiarySaveError("Silakan masuk akun terlebih dahulu untuk menyimpan catatan ke Diari Kuliner.");
      return;
    }

    setIsSavingDiary(true);
    setDiarySaveError(null);

    const baseCal = result.total_nutrition.calories || 250;
    const baseProt = result.total_nutrition.protein_g || 10;
    const baseFat = result.total_nutrition.fat_g || 8;
    const baseCarb = result.total_nutrition.carbs_g || 35;
    const baseFiber = result.total_nutrition.fiber_g || 1;

    const adjustedNutrition = {
      calories: Math.round(baseCal * portionMultiplier),
      protein_g: Math.round(baseProt * portionMultiplier * 10) / 10,
      fat_g: Math.round(baseFat * portionMultiplier * 10) / 10,
      carbs_g: Math.round(baseCarb * portionMultiplier * 10) / 10,
      fiber_g: Math.round(baseFiber * portionMultiplier * 10) / 10,
    };

    const diaryPayload = {
      foods: [
        {
          name: editedDishName.trim() || result.foods[0]?.name || "Menu Kuliner",
          portion_grams: Math.round((result.foods[0]?.portion_grams || 200) * portionMultiplier),
          nutrition: adjustedNutrition,
        },
      ],
      total_nutrition: adjustedNutrition,
    };

    try {
      const saveResponse = await fetch("/api/nutrition-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diaryPayload),
      });

      if (!saveResponse.ok) {
        const d = await saveResponse.json();
        throw new Error(d.error || "Gagal mencatat ke diari");
      }

      setDiarySaveSuccess(true);
      loadHistory();
    } catch (e: unknown) {
      setDiarySaveError(e instanceof Error ? e.message : "Koneksi terganggu. Gagal mencatat ke diari.");
    } finally {
      setIsSavingDiary(false);
    }
  };

  // --- Insights Handlers ---
  const loadHistory = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setInsightsLoading(false);
      return;
    }

    setInsightsLoading(true);
    try {
      const [resHist, resProfile] = await Promise.all([
        fetch("/api/nutrition-history", { cache: "no-store" }),
        fetch("/api/profile", { cache: "no-store" }),
      ]);
      const data = await resHist.json();
      if (!resHist.ok) throw new Error(data.error || "Gagal memuat riwayat");
      setEntries(Array.isArray(data) ? data : []);
      if (resProfile.ok) {
        const pData = await resProfile.json();
        if (pData.success && pData.data?.daily_calorie_target) {
          setProfileTargets({
            calories: pData.data.daily_calorie_target,
            protein_g: pData.data.daily_protein_target ?? 0,
            fiber_g: pData.data.daily_fiber_target ?? 0,
          });
        }
      }
    } catch (e) {
      setInsightsError(e instanceof Error ? e.message : "Gagal memuat riwayat");
    } finally {
      setInsightsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "insights") {
      stopCamera();
      if (user) {
        loadHistory();
      } else {
        setInsightsLoading(false);
      }
    }
  }, [activeTab, user, loadHistory]);

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

  const days = Object.values(dailyHistory).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  const totalDays = days.length;
  const avgCalories = totalDays > 0 ? Math.round(days.reduce((sum, d) => sum + d.calories, 0) / totalDays) : 0;
  const avgProtein = totalDays > 0 ? Math.round(days.reduce((sum, d) => sum + d.protein_g, 0) / totalDays) : 0;
  const avgFiber = totalDays > 0 ? Math.round(days.reduce((sum, d) => sum + d.fiber_g, 0) / totalDays) : 0;

  const TARGET_CALORIES = profileTargets.calories || 2000;
  const TARGET_PROTEIN = profileTargets.protein_g || 60;
  const TARGET_FIBER = profileTargets.fiber_g || 25;

  // Nilai nutrisi aktif yang terhitung sesuai pengatur porsi
  const activeCalories = result ? Math.round((result.total_nutrition.calories || 250) * portionMultiplier) : 0;
  const activeProtein = result ? Math.round((result.total_nutrition.protein_g || 10) * portionMultiplier * 10) / 10 : 0;
  const activeFat = result ? Math.round((result.total_nutrition.fat_g || 8) * portionMultiplier * 10) / 10 : 0;
  const activeCarbs = result ? Math.round((result.total_nutrition.carbs_g || 35) * portionMultiplier * 10) / 10 : 0;
  const activeFiber = result ? Math.round((result.total_nutrition.fiber_g || 1) * portionMultiplier * 10) / 10 : 0;

  // Filter katalog untuk modal
  const filteredCatalog = CULINARY_CATALOG.filter((item) =>
    item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    item.venue.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="w-full px-4 py-5 sm:py-8 md:px-8 lg:px-10 xl:px-12 space-y-6 sm:space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xs shrink-0">
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-black tracking-tight">
              Scan & Review Kuliner
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-neutral-500 font-medium mt-0.5 sm:mt-1">
              Foto makananmu untuk review kelezatan ala foodie, rekomendasi lauk pelengkap, dan info porsi seimbang.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("analyze")}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-colors border-b-2 whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeTab === "analyze"
              ? "border-amber-600 text-amber-950"
              : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Review Kuliner & Porsi</span>
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-colors border-b-2 whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeTab === "insights"
              ? "border-amber-600 text-amber-950"
              : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Tren & Keseimbangan Porsi</span>
        </button>
      </div>

      {/* Tab Content: Analyze */}
      {activeTab === "analyze" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Form Input */}
          <section className="space-y-5 sm:space-y-6 rounded-[4px] border border-neutral-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs">
            {/* User Auth Status Pill */}
            {user ? (
              <div className="flex items-center justify-between rounded-[4px] bg-neutral-100 px-3.5 py-2.5 text-xs text-neutral-700">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>
                    Masuk sebagai <strong className="font-semibold text-black">{user.name || user.email}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500 font-medium">Diari tersimpan di akun</span>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-[4px] bg-amber-50 border border-amber-200/60 px-3.5 py-2.5 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>
                    <strong>Mode Tamu:</strong> Anda bisa review hidangan, namun login untuk simpan ke Diari Kuliner.
                  </span>
                </div>
                <Link
                  href="/login"
                  className="font-bold underline text-amber-900 hover:text-black shrink-0 ml-2"
                >
                  Masuk Akun
                </Link>
              </div>
            )}

            {/* SCAN DENGAN KAMERA / FOTO */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-black">
                Pindai Makanan (Kamera / Foto)
              </label>

              {/* Viewfinder Kamera Live */}
              {isCameraActive && (
                <div className="relative overflow-hidden rounded-[4px] bg-black border border-neutral-900 aspect-video sm:aspect-[4/3] flex flex-col justify-between shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  <canvas ref={canvasRef} className="hidden" />

                  {/* Framing Overlay */}
                  <div className="pointer-events-none absolute inset-4 sm:inset-8 rounded-[4px] border-2 border-dashed border-white/70 flex flex-col items-center justify-between p-3 z-10">
                    <span className="rounded-[4px] bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                      Arahkan kamera ke piring makanan
                    </span>
                    <div className="h-4 w-4 border-b-2 border-r-2 border-white/80 self-end"></div>
                  </div>

                  {/* Top Bar Controls */}
                  <div className="relative z-20 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/70 to-transparent">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="flex items-center gap-1.5 rounded-[4px] bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Tutup
                    </button>

                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="flex items-center gap-1.5 rounded-[4px] bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                      title="Putar Kamera"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>{cameraFacingMode === "environment" ? "Kamera Belakang" : "Kamera Depan"}</span>
                    </button>
                  </div>

                  {/* Bottom Bar Shutter */}
                  <div className="relative z-20 flex flex-col items-center justify-center p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="group flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/30 backdrop-blur-md shadow-xl hover:scale-105 active:scale-95 transition-all"
                      aria-label="Jepret Foto"
                    >
                      <div className="h-12 w-12 rounded-full bg-white group-hover:bg-neutral-100 transition-colors flex items-center justify-center">
                        <div className="h-5 w-5 rounded-full border-2 border-black"></div>
                      </div>
                    </button>
                    <span className="text-[11px] font-bold text-white drop-shadow">
                      Ketuk tombol untuk foto
                    </span>
                  </div>
                </div>
              )}

              {/* Preview Hasil Foto / File Terpilih */}
              {!isCameraActive && preview && (
                <div className="space-y-3">
                  <div className="relative flex aspect-video max-h-72 items-center justify-center overflow-hidden rounded-[4px] border border-neutral-300 bg-neutral-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview Makanan"
                      className="max-h-full w-full object-contain"
                    />
                    <div className="absolute top-3 left-3 rounded-[4px] bg-black/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Foto siap dianalisis</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startCamera(cameraFacingMode)}
                      className="flex-1 rounded-[4px] border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-bold text-black hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <circle cx="12" cy="13" r="3" strokeWidth={2} />
                      </svg>
                      Foto Ulang (Kamera)
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 rounded-[4px] border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-bold text-black hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Ganti Berkas
                    </button>
                    <button
                      type="button"
                      onClick={clearSelectedPhoto}
                      className="rounded-[4px] border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}

              {/* Tombol Opsi: Buka Kamera / Pilih File */}
              {!isCameraActive && !preview && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => startCamera("environment")}
                    disabled={cameraLoading}
                    className="flex items-center justify-center gap-2.5 rounded-[4px] border border-black bg-black px-4 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-neutral-800 active:scale-[0.99] transition-all"
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <circle cx="12" cy="13" r="3" strokeWidth={2} />
                    </svg>
                    <span>{cameraLoading ? "Membuka Kamera..." : "Buka Kamera Langsung"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2.5 rounded-[4px] border border-neutral-300 bg-white px-4 py-3.5 text-sm font-bold text-neutral-800 hover:border-black hover:bg-neutral-50 active:scale-[0.99] transition-all"
                  >
                    <svg className="w-5 h-5 shrink-0 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Upload Foto / Galeri</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              {cameraError && (
                <div className="rounded-[4px] border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-800 space-y-2">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p>{cameraError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-bold underline text-red-900 hover:text-black block"
                  >
                    Gunakan opsi upload foto dari berkas/galeri &rarr;
                  </button>
                </div>
              )}
            </div>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="mx-4 flex-shrink-0 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                ATAU KETIK / PILIH MENU
              </span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: Nasi Telur Dadar, Ayam Geprek..."
                  value={foodName}
                  onChange={handleTextChange}
                  className="block w-full rounded-[4px] border border-neutral-300 px-4 py-3.5 text-sm focus:border-amber-600 focus:ring-0 focus:outline-none transition-colors bg-neutral-50 focus:bg-white text-black"
                />
                <button
                  type="button"
                  onClick={() => setCatalogModalOpen(true)}
                  className="shrink-0 px-3.5 py-2.5 rounded-[4px] border border-amber-300 bg-amber-50 text-amber-950 font-bold text-xs sm:text-sm hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                  title="Pilih langsung dari 80 katalog makanan"
                >
                  <svg className="w-4 h-4 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="hidden sm:inline">Katalog</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={(!preview && !foodName.trim()) || analyzeLoading}
              className={`w-full rounded-[4px] min-h-[48px] px-4 py-3.5 font-bold text-white shadow-xs transition-all ${
                (!preview && !foodName.trim()) || analyzeLoading
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-400"
                  : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-[0.99] text-white shadow-sm"
              }`}
            >
              {analyzeLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Mencicipi & Mereview Cita Rasa (maks 20s)...
                </span>
              ) : (
                "Review Cita Rasa & Porsi"
              )}
            </button>

            {/* 3.2e Timeout & Graceful Failure UI */}
            {analyzeError && (
              <div className="rounded-[4px] border border-amber-300 bg-amber-50/90 p-4 text-sm text-amber-950 space-y-3">
                <div className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <strong className="font-bold">Perlu Bantuan Review:</strong>
                    <p className="mt-0.5 leading-relaxed text-amber-900">{analyzeError}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (lastPayload) handleAnalyze();
                    }}
                    className="px-3.5 py-2 rounded-[4px] bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Coba Lagi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatalogModalOpen(true)}
                    className="px-3.5 py-2 rounded-[4px] border border-amber-400 bg-white text-amber-950 font-bold text-xs hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Pilih Manual dari Katalog</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Result Container */}
          <div>
            {result ? (
              <section className="space-y-6 rounded-[4px] border border-neutral-200 bg-white p-5 sm:p-7 md:p-8 shadow-xs">
                {/* 3.2a Penanganan ketidakpastian (confidence < 0.6) */}
                {(result.low_confidence || (result.confidence && result.confidence < 0.6)) && (
                  <div className="rounded-[4px] border border-amber-300 bg-amber-50 p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm">
                      <svg className="w-4 h-4 text-amber-800 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Sepertinya ini... (kurang yakin? Ketuk 1 tap pilihan yang benar)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(result.alternatives && result.alternatives.length > 0
                        ? result.alternatives
                        : ["Ayam Goreng Warteg", "Nasi Telur Dadar", "Pecel Lele"]
                      ).map((altName, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyAlternative(altName)}
                          className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all border ${
                            editedDishName.toLowerCase().includes(altName.toLowerCase())
                              ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                              : "bg-white text-neutral-800 border-amber-200 hover:border-amber-400 hover:bg-amber-100/50"
                          }`}
                        >
                          {altName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Culinary Review & Foodie Insight Card */}
                <div className="rounded-[4px] border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-amber-50/60 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
                      <svg className="w-3.5 h-3.5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <span>Catatan Foodie DompetKost</span>
                    </span>
                    {/* Flavor Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {(result.flavor_tags && result.flavor_tags.length > 0
                        ? result.flavor_tags
                        : ["gurih-renyah", "berkuah-segar"]
                      ).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white text-amber-950 border border-amber-200 shadow-2xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {result.culinary_review ? (
                    <p className="text-sm sm:text-base font-semibold text-neutral-900 leading-relaxed italic">
                      &ldquo;{result.culinary_review}&rdquo;
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-neutral-800 leading-relaxed">
                      Pilihan hidangan lokal yang nikmat dan pas buat membangkitkan semangat beraktivitas anak kost!
                    </p>
                  )}

                  {result.culinary_tips && (
                    <div className="pt-2 border-t border-amber-200/60 flex items-start gap-2 text-xs sm:text-sm text-amber-950 font-medium">
                      <svg className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <div className="leading-snug">
                        <strong className="font-bold">Ide Paduan Pas:</strong>{" "}
                        {Array.isArray(result.culinary_tips)
                          ? result.culinary_tips.join(" ")
                          : result.culinary_tips}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3.2b Alur Koreksi Manual: Nama Makanan & Harga Bayar */}
                <div className="space-y-4 rounded-[4px] border border-neutral-200 bg-neutral-50/70 p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Nama Hidangan (Bisa Diedit):
                    </label>
                    <button
                      type="button"
                      onClick={() => setCatalogModalOpen(true)}
                      className="text-xs font-bold text-amber-800 hover:text-black underline"
                    >
                      Pilih dari Katalog &rarr;
                    </button>
                  </div>

                  <input
                    type="text"
                    value={editedDishName}
                    onChange={(e) => setEditedDishName(e.target.value)}
                    placeholder="Nama makanan di piring..."
                    className="w-full rounded-[4px] border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-black focus:border-amber-600 focus:outline-none"
                  />

                  {/* 3.2b Pengatur Porsi Interaktif */}
                  <div className="space-y-2 pt-2 border-t border-neutral-200">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-neutral-700 uppercase tracking-wider">Takaran Porsi:</span>
                      <span className="text-amber-950 font-extrabold">
                        {portionPreset !== "custom" ? `Ukuran ${portionPreset} ` : ""}
                        ({Math.round(portionMultiplier * 100)}%)
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handlePresetPortion("S")}
                        className={`py-2 px-3 rounded-[4px] text-xs font-bold border transition-all ${
                          portionPreset === "S"
                            ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                            : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        S (Kecil - 75%)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetPortion("M")}
                        className={`py-2 px-3 rounded-[4px] text-xs font-bold border transition-all ${
                          portionPreset === "M"
                            ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                            : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        M (Standar - 100%)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetPortion("L")}
                        className={`py-2 px-3 rounded-[4px] text-xs font-bold border transition-all ${
                          portionPreset === "L"
                            ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                            : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        L (Jumbo - 135%)
                      </button>
                    </div>

                    {/* Slider Porsi */}
                    <div className="pt-2">
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={portionMultiplier}
                        onChange={(e) => {
                          setPortionMultiplier(parseFloat(e.target.value));
                          setPortionPreset("custom");
                        }}
                        className="w-full accent-amber-600 cursor-pointer"
                        aria-label="Slider Takaran Porsi"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                        <span>Setengah Porsi (50%)</span>
                        <span>Normal (100%)</span>
                        <span>Dua Kali Lipat (200%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Input Harga Bayar */}
                  <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-neutral-700">
                      Tadi Bayar Berapa? (Rp):
                    </label>
                    <div className="flex items-center gap-1.5 w-full sm:w-48">
                      <span className="text-xs font-bold text-neutral-500">Rp</span>
                      <input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="15000"
                        className="w-full rounded-[4px] border border-neutral-300 bg-white px-3 py-1.5 text-sm font-bold text-black focus:border-amber-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Ringkasan Nutrisi Terhitung Real-Time */}
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2 mb-3">
                    <h2 className="text-base sm:text-lg font-black text-black">
                      Keseimbangan Nutrisi Porsi
                    </h2>
                    <span className="text-xs text-neutral-500 font-semibold">
                      ~{Math.round((result.foods.reduce((sum, f) => sum + (f.portion_grams || 0), 0) || 200) * portionMultiplier)}g
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-center">
                    <div className="rounded-[4px] bg-amber-50/60 p-3 border border-amber-200/80">
                      <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">Energi</p>
                      <p className="text-xl font-black text-black">
                        {activeCalories}{" "}
                        <span className="text-xs font-medium text-neutral-500">kkal</span>
                      </p>
                    </div>
                    <div className="rounded-[4px] bg-neutral-50 p-3 border border-neutral-200">
                      <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Protein</p>
                      <p className="text-xl font-black text-black">
                        {activeProtein}{" "}
                        <span className="text-xs font-medium text-neutral-500">g</span>
                      </p>
                    </div>
                    <div className="rounded-[4px] bg-neutral-50 p-3 border border-neutral-200">
                      <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Lemak</p>
                      <p className="text-xl font-black text-black">
                        {activeFat}{" "}
                        <span className="text-xs font-medium text-neutral-500">g</span>
                      </p>
                    </div>
                    <div className="rounded-[4px] bg-neutral-50 p-3 border border-neutral-200">
                      <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Karbo</p>
                      <p className="text-xl font-black text-black">
                        {activeCarbs}{" "}
                        <span className="text-xs font-medium text-neutral-500">g</span>
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 rounded-[4px] bg-neutral-50 p-3 border border-neutral-200">
                      <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Serat</p>
                      <p className="text-xl font-black text-black">
                        {activeFiber}{" "}
                        <span className="text-xs font-medium text-neutral-500">g</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Komponen & Lauk Terdeteksi */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Komponen Menu di Piring:</span>
                  </h3>
                  <ul className="space-y-1.5">
                    {result.foods.map((food, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between rounded-[4px] border border-neutral-200 bg-neutral-50/70 p-3 text-xs sm:text-sm"
                      >
                        <div>
                          <p className="font-bold text-black">{food.name}</p>
                          <p className="text-xs text-neutral-500">
                            Porsi ~{Math.round((food.portion_grams || 200) * portionMultiplier)}g
                          </p>
                        </div>
                        <div className="text-right font-black text-black">
                          {Math.round((food.nutrition.calories || 250) * portionMultiplier)} kkal
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3.2c Tampilan Disclaimer Tetap */}
                <p className="text-[11px] text-neutral-500 italic text-center">
                  *Perkiraan AI, bisa meleset. Sesuaikan porsi dan harga di atas bila perlu sebelum dicatat.
                </p>

                {/* 3.2b Tombol Aksi Simpan: "Catat ke Diari" (Target sentuh >= 44px, WCAG AA) */}
                <div className="pt-2 space-y-3">
                  <button
                    type="button"
                    onClick={handleSaveToDiary}
                    disabled={isSavingDiary || !editedDishName.trim()}
                    className="w-full min-h-[48px] rounded-[4px] bg-[#c2410c] hover:bg-[#9a3412] active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingDiary ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        <span>Mencatat ke Diari Kuliner...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Catat ke Diari Kuliner</span>
                      </>
                    )}
                  </button>

                  {diarySaveSuccess && (
                    <div className="rounded-[4px] border border-emerald-300 bg-emerald-50 p-3.5 text-xs sm:text-sm text-emerald-950 font-bold flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Berhasil dicatat ke Diari Kuliner hari ini!</span>
                      </div>
                      <Link
                        href="/history"
                        className="underline text-emerald-900 hover:text-black shrink-0"
                      >
                        Lihat Diari &rarr;
                      </Link>
                    </div>
                  )}

                  {diarySaveError && (
                    <div className="rounded-[4px] border border-red-300 bg-red-50 p-3 text-xs sm:text-sm text-red-950 font-bold flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{diarySaveError}</span>
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-[4px] border-2 border-dashed border-amber-200/80 p-8 text-center bg-gradient-to-b from-amber-50/20 to-neutral-50/50">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 mb-3 border border-amber-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-base font-bold text-black">
                  Belum ada hidangan yang di-review
                </p>
                <p className="text-sm text-neutral-500 mt-2 max-w-xs leading-relaxed">
                  Ambil foto piring makanmu atau ketik nama hidangannya untuk melihat review cita rasa ala foodie & takaran porsi seimbang.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Pencarian Cepat Katalog (80 Item TKPI) */}
      {catalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl max-h-[85vh] rounded-2xl bg-white p-5 sm:p-6 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <h3 className="text-base sm:text-lg font-black text-black">
                  Pilih Menu dari Katalog DompetKost
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCatalogModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label="Tutup katalog"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              type="text"
              placeholder="Cari menu: telur, ayam, lele, soto, tempe..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="w-full rounded-[4px] border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm font-semibold text-black focus:border-amber-600 focus:bg-white focus:outline-none"
              autoFocus
            />

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredCatalog.slice(0, 30).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectFromCatalog(item)}
                  className="w-full text-left p-3 rounded-[4px] border border-neutral-200 hover:border-amber-400 hover:bg-amber-50/50 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div>
                    <p className="font-bold text-sm text-black group-hover:text-amber-950">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.venue.toUpperCase()} • Rp {item.priceRange.min.toLocaleString("id-ID")} - {item.priceRange.max.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-black group-hover:text-amber-950">
                      {item.nutrition.kcal} kkal
                    </span>
                    <span className="block text-[10px] text-neutral-500">
                      P: {item.nutrition.protein}g | K: {item.nutrition.carbs}g
                    </span>
                  </div>
                </button>
              ))}

              {filteredCatalog.length === 0 && (
                <div className="py-8 text-center text-sm text-neutral-500">
                  Tidak ditemukan menu &ldquo;{catalogSearch}&rdquo;. Coba kata kunci lain.
                </div>
              )}
            </div>

            <div className="border-t border-neutral-200 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setCatalogModalOpen(false)}
                className="px-4 py-2 rounded-[4px] bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-black"
              >
                Batal
              </button>
            </div>
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
            <div className="rounded-[4px] border border-neutral-200 bg-neutral-50 p-6 text-sm font-medium text-black">{insightsError}</div>
          ) : totalDays === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[4px] border-2 border-dashed border-neutral-200 p-12 text-center bg-neutral-50/50">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-600 mb-3 border border-neutral-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-base font-bold text-black">Belum ada data yang cukup</p>
              <p className="text-sm text-neutral-500 mt-2 max-w-sm leading-relaxed">
                Mulai catat hidangan makananmu di tab Review Kuliner untuk membuka grafik tren porsi dan keseimbangan energi harian.
              </p>
              <button
                onClick={() => setActiveTab("analyze")}
                className="mt-6 rounded-full bg-[#c2410c] px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-[#9a3412] transition-all cursor-pointer"
              >
                Review Makanan Sekarang &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Rata-rata Energi</p>
                    <span className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-black">{avgCalories} <span className="text-sm font-medium text-neutral-400">kkal/hari</span></p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                      avgCalories > TARGET_CALORIES ? "bg-neutral-200 text-black" : "bg-neutral-100 text-neutral-700"
                    }`}>
                      {avgCalories > TARGET_CALORIES ? "Melebihi target" : "Terkendali"}
                    </span>
                    <span className="text-xs text-neutral-400">Target: {TARGET_CALORIES} kkal</span>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Rata-rata Protein</p>
                    <span className="p-2 rounded-lg bg-orange-50 text-orange-700 border border-orange-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </span>
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
                    <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </span>
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
                    <h2 className="text-lg font-black text-black">Grafik Energi Mingguan</h2>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">Fluktuasi asupan energi selama 7 hari pencatatan</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-neutral-600">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-neutral-300"></div>
                      <span>Aman</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-amber-600"></div>
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
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity rounded bg-black px-3 py-1.5 text-xs font-bold text-white shadow-lg pointer-events-none whitespace-nowrap z-20">
                          {Math.round(day.calories)} kkal
                        </div>

                        <div
                          className={`w-full max-w-[48px] rounded-lg transition-all duration-500 ${isOver ? 'bg-amber-600' : 'bg-neutral-300'} group-hover:opacity-90 shadow-sm`}
                          style={{ height: `${Math.max(10, heightPct)}%` }}
                        ></div>

                        <span className="mt-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">{day.label.split(',')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Health Insights */}
              <div className="rounded-lg border border-neutral-200 bg-white p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-black text-black mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Tips Paduan Porsi & Lauk untuk Anda</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {avgProtein < TARGET_PROTEIN && (
                    <div className="flex gap-4 rounded-lg bg-amber-50/50 p-5 text-black border border-amber-200/60">
                      <span className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 self-start border border-amber-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-black text-sm">Variasi Lauk Berprotein Murah Mantap</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium text-neutral-600">
                          Rata-rata protein Anda ({avgProtein}g) bisa ditambah agar stamina harian prima. Tambahkan lauk andalan anak kost seperti tempe orek, telur dadar tebal, atau tongkol balado.
                        </p>
                      </div>
                    </div>
                  )}

                  {avgFiber < TARGET_FIBER && (
                    <div className="flex gap-4 rounded-lg bg-emerald-50/40 p-5 text-black border border-emerald-200/60">
                      <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 self-start border border-emerald-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-black text-sm">Segarkan Piring dengan Sayur & Lalapan</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium text-neutral-600">
                          Piring makanmu masih minim serat ({avgFiber}g). Selipkan tumis kangkung gurih, sayur bayam bening, atau lalapan timun segar untuk pencernaan nyaman.
                        </p>
                      </div>
                    </div>
                  )}

                  {avgCalories > TARGET_CALORIES && (
                    <div className="flex gap-4 rounded-[4px] bg-orange-50/50 p-5 text-black border border-orange-200/60">
                      <span className="p-2.5 rounded-xl bg-orange-100 text-orange-800 shrink-0 self-start border border-orange-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-black text-sm">Atur Porsi & Seimbangkan Camilan</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium text-neutral-600">
                          Asupan kalori harian Anda ({avgCalories} kkal) terhitung cukup padat. Sesuaikan porsi nasi dan kurangi minuman manis atau gorengan tepung ekstra saat nugas.
                        </p>
                      </div>
                    </div>
                  )}

                  {avgProtein >= TARGET_PROTEIN && avgFiber >= TARGET_FIBER && avgCalories <= TARGET_CALORIES && (
                    <div className="flex gap-4 rounded-[4px] bg-emerald-50/60 p-5 text-black border border-emerald-200">
                      <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 self-start border border-emerald-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-black text-sm">Komposisi Piring Anda Juara!</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium text-neutral-600">
                          Pilihan menu dan porsi harianmu pas banget—kenyang mantap, hemat kantong, dan seimbang gizi. Pertahankan menu favoritmu!
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

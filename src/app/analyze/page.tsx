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

  const handleRetakePhoto = () => {
    setPreview(null);
    setFoodName("");
    setAnalyzeError(null);
    setResult(null);
    startCamera(cameraFacingMode);
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

      if (!response.ok || data.is_food === false) {
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
    <div data-layer="Scan & Review Kuliner" className="ScanReviewKuliner w-full max-w-[1440px] mx-auto min-h-[calc(100vh-80px)] px-4 sm:px-10 lg:px-20 pt-6 sm:pt-14 pb-16 bg-stone-100 flex flex-col justify-start items-start gap-6 sm:gap-8">
      {/* Header */}
      <div data-layer="Header" className="Header self-stretch flex flex-col justify-start items-start gap-3">
        <div data-layer="Frame 4" className="Frame4 inline-flex justify-start items-center gap-2">
          <div data-layer="Rectangle 1" className="Rectangle1 w-2 h-2 bg-orange-700" />
          <div data-layer="DOMPETKOST / REVIEW KULINER" className="DompetkostResepHemat justify-start text-stone-500 text-xs font-semibold font-['Inter'] uppercase tracking-wider">
            DOMPETKOST / REVIEW KULINER
          </div>
        </div>
        <div data-layer="Scan & Review Kuliner" className="ScanReviewKuliner KatalogResepRamahDompet justify-start text-stone-800 text-3xl sm:text-4xl lg:text-5xl font-normal font-['Instrument_Serif'] leading-tight">
          Scan & Review Kuliner
        </div>
        <div data-layer="Subtitle" className="self-stretch justify-start text-stone-500 text-sm sm:text-base font-normal font-['Inter']">
          Foto piring makanmu atau ketik nama hidangan untuk review kelezatan ala foodie, rekomendasi lauk pelengkap, dan info porsi seimbang.
        </div>
      </div>

      {/* Tabs */}
      <div data-layer="Tabs" className="Tabs self-stretch border-b border-stone-200 inline-flex justify-start items-center overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("analyze")}
          className={`h-11 px-3 sm:px-5 border-b-2 inline-flex justify-center items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "analyze"
              ? "border-orange-700 text-orange-700 font-semibold"
              : "border-transparent text-stone-500 font-normal hover:text-stone-800"
          } text-sm font-['Inter']`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Review Kuliner & Porsi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("insights")}
          className={`h-11 px-3 sm:px-5 border-b-2 inline-flex justify-center items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "insights"
              ? "border-orange-700 text-orange-700 font-semibold"
              : "border-transparent text-stone-500 font-normal hover:text-stone-800"
          } text-sm font-['Inter']`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Tren & Keseimbangan Porsi
        </button>
      </div>

      {/* User Auth Status Pill */}
      {user ? (
        <div className="self-stretch bg-white border border-stone-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-['Inter'] text-stone-700 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#557464] shrink-0" />
            <span className="truncate">
              Masuk sebagai <strong className="font-semibold text-stone-900">{user.name || user.email}</strong>
            </span>
          </div>
          <span className="text-[11px] text-stone-500 font-['Inter'] shrink-0">Diari tersimpan di akun</span>
        </div>
      ) : (
        <div className="self-stretch bg-amber-50/70 border border-amber-200/80 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs font-['Inter'] text-amber-900">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
            <span>
              <strong>Mode Tamu:</strong> Anda bisa review hidangan, namun login untuk simpan ke Diari Kuliner.
            </span>
          </div>
          <Link
            href="/login"
            className="font-bold underline text-amber-900 hover:text-stone-900 shrink-0 ml-2"
          >
            Masuk Akun
          </Link>
        </div>
      )}

      {/* Tab Content: Analyze */}
      {activeTab === "analyze" && (
        <div data-layer="Content" className="Content self-stretch flex flex-col lg:flex-row justify-start items-start gap-8">
          {/* DishInput Column */}
          <div data-layer="DishInput" className="DishInput w-full lg:w-[620px] p-4 sm:p-6 bg-white outline outline-1 outline-stone-200 flex flex-col justify-start items-start gap-5 sm:gap-6">
            <div data-layer="Pindai Makanan (Kamera / Foto)" className="PindaiMakananKameraFoto justify-start text-stone-800 text-sm font-semibold font-['Inter']">
              Pindai Makanan (Kamera / Foto)
            </div>

            {/* Viewfinder Kamera Live */}
            {isCameraActive && (
              <div className="w-full relative overflow-hidden bg-black outline outline-1 outline-stone-300 aspect-video sm:aspect-[4/3] flex flex-col justify-between">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <canvas ref={canvasRef} className="hidden" />

                {/* Framing Overlay */}
                <div className="pointer-events-none absolute inset-4 sm:inset-8 border-2 border-dashed border-white/70 flex flex-col items-center justify-between p-3 z-10">
                  <span className="bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm font-['Inter']">
                    Arahkan kamera ke piring makanan
                  </span>
                  <div className="h-4 w-4 border-b-2 border-r-2 border-white/80 self-end"></div>
                </div>

                {/* Top Bar Controls */}
                <div className="relative z-20 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/70 to-transparent">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/80 transition-colors font-['Inter']"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Tutup
                  </button>

                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/80 transition-colors font-['Inter']"
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
                    className="group flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/30 backdrop-blur-md shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    aria-label="Jepret Foto"
                  >
                    <div className="h-12 w-12 rounded-full bg-white group-hover:bg-stone-100 transition-colors flex items-center justify-center">
                      <div className="h-5 w-5 rounded-full border-2 border-stone-800"></div>
                    </div>
                  </button>
                  <span className="text-[11px] font-semibold text-white drop-shadow font-['Inter']">
                    Ketuk tombol untuk foto
                  </span>
                </div>
              </div>
            )}

            {/* Preview Hasil Foto / File Terpilih */}
            {!isCameraActive && preview && (
              <div className="w-full space-y-3">
                <div className="relative flex aspect-video max-h-72 items-center justify-center overflow-hidden outline outline-1 outline-stone-200 bg-stone-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview Makanan"
                    className="max-h-full w-full object-contain"
                  />
                  <div className="absolute top-3 left-3 bg-black/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm flex items-center gap-1.5 font-['Inter']">
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
                    className="flex-1 h-9 px-3 outline outline-1 outline-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-800 transition-colors flex items-center justify-center gap-1.5 font-['Inter'] cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <circle cx="12" cy="13" r="3" strokeWidth={2} />
                    </svg>
                    Foto Ulang
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 h-9 px-3 outline outline-1 outline-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-800 transition-colors flex items-center justify-center gap-1.5 font-['Inter'] cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Ganti Berkas
                  </button>
                  <button
                    type="button"
                    onClick={clearSelectedPhoto}
                    className="h-9 px-3 outline outline-1 outline-stone-200 bg-stone-50 hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors font-['Inter'] cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            )}

            {/* Opsi Kosong: Buka Kamera / Pilih File (PhotoInput) */}
            {!isCameraActive && !preview && (
              <div data-layer="PhotoInput" className="PhotoInput self-stretch min-h-[220px] sm:min-h-[260px] p-4 sm:p-6 bg-stone-50 outline outline-1 outline-dashed outline-stone-300 flex flex-col justify-center items-center gap-4">
                <div data-layer="CameraIcon" className="CameraIcon w-14 h-14 bg-stone-200/80 rounded-full flex items-center justify-center text-stone-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" strokeWidth={1.5} />
                  </svg>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-stone-800 text-sm font-semibold font-['Inter']">
                    Arahkan kamera ke piring makanan
                  </div>
                  <div className="text-stone-500 text-xs font-normal font-['Inter']">
                    Bisa jepret langsung dari kamera atau upload file foto makanan
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => startCamera("environment")}
                    disabled={cameraLoading}
                    className="h-11 px-5 bg-stone-800 hover:bg-stone-900 active:scale-[0.99] text-white text-xs font-semibold font-['Inter'] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <circle cx="12" cy="13" r="3" strokeWidth={2} />
                    </svg>
                    <span>{cameraLoading ? "Membuka Kamera..." : "Buka Kamera Langsung"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-11 px-5 bg-white hover:bg-stone-100 active:scale-[0.99] text-stone-800 outline outline-1 outline-stone-300 text-xs font-semibold font-['Inter'] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <svg className="w-4 h-4 shrink-0 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Upload Foto / Galeri</span>
                  </button>
                </div>
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
              <div className="w-full p-4 bg-red-50 outline outline-1 outline-red-200 text-xs text-red-800 space-y-2 font-['Inter']">
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

            {/* Divider */}
            <div className="self-stretch flex items-center py-1">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="mx-4 text-xs font-semibold text-stone-400 uppercase tracking-wider font-['Inter']">
                ATAU KETIK / PILIH MENU
              </span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            {/* Manual text input + Katalog */}
            <div className="self-stretch flex gap-2">
              <input
                type="text"
                placeholder="Contoh: Nasi Telur Dadar, Ayam Geprek..."
                value={foodName}
                onChange={handleTextChange}
                className="flex-1 h-11 px-4 bg-stone-50 outline outline-1 outline-stone-200 focus:outline-orange-700 text-stone-800 text-sm font-['Inter'] transition-colors"
              />
              <button
                type="button"
                onClick={() => setCatalogModalOpen(true)}
                className="h-11 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 outline outline-1 outline-stone-200 text-xs font-semibold font-['Inter'] flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                title="Pilih langsung dari 80 katalog makanan"
              >
                <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Katalog</span>
              </button>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={(!preview && !foodName.trim()) || analyzeLoading}
              className={`self-stretch h-12 px-6 flex items-center justify-center gap-2 text-sm font-semibold font-['Inter'] transition-colors cursor-pointer ${
                (!preview && !foodName.trim()) || analyzeLoading
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-orange-700 hover:bg-[#B34718] active:scale-[0.99] text-white"
              }`}
            >
              {analyzeLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Mencicipi & Mereview Cita Rasa (maks 20s)...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>Review Cita Rasa & Porsi</span>
                </span>
              )}
            </button>

            {/* Timeout & Graceful Failure UI / Non-Food Alert */}
            {analyzeError && (
              <div
                className={`w-full p-4 outline outline-1 text-sm space-y-3 font-['Inter'] rounded-2xl ${
                  analyzeError.toLowerCase().includes("bukan makanan")
                    ? "bg-rose-50 outline-rose-300 text-rose-950"
                    : "bg-amber-50 outline-amber-200 text-amber-950"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {analyzeError.toLowerCase().includes("bukan makanan") ? (
                    <svg className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <div>
                    <strong className="font-bold">
                      {analyzeError.toLowerCase().includes("bukan makanan")
                        ? "Bukan Makanan Terdeteksi:"
                        : "Perlu Bantuan Review:"}
                    </strong>
                    <p className={`mt-0.5 leading-relaxed ${analyzeError.toLowerCase().includes("bukan makanan") ? "text-rose-900" : "text-amber-900"}`}>
                      {analyzeError}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {analyzeError.toLowerCase().includes("bukan makanan") ? (
                    <button
                      type="button"
                      onClick={handleRetakePhoto}
                      className="h-9 px-3.5 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer font-['Inter'] rounded-xl"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Ambil Foto Makanan Lain</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (lastPayload) handleAnalyze();
                      }}
                      className="h-9 px-3.5 bg-orange-700 hover:bg-[#B34718] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer font-['Inter'] rounded-xl"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Coba Lagi</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setCatalogModalOpen(true)}
                    className="h-9 px-3.5 bg-white hover:bg-stone-100 outline outline-1 outline-stone-300 text-stone-800 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer font-['Inter'] rounded-xl"
                  >
                    <svg className="w-3.5 h-3.5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Pilih Manual dari Katalog</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Result Container */}
          <div className="flex-1 w-full lg:w-[684px]">
            {result ? (
              <section data-layer="ReviewActiveState" className="w-full p-4 sm:p-6 bg-white outline outline-1 outline-stone-200 flex flex-col justify-start items-start gap-5 sm:gap-6">
                {/* 3.2a Penanganan ketidakpastian (confidence < 0.6) */}
                {(result.low_confidence || (result.confidence && result.confidence < 0.6)) && (
                  <div className="w-full p-4 bg-amber-50 outline outline-1 outline-amber-200 space-y-2.5 font-['Inter']">
                    <div className="flex items-center gap-2 text-amber-950 font-semibold text-xs sm:text-sm">
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
                          className={`h-8 px-3 text-xs font-semibold transition-all outline outline-1 cursor-pointer font-['Inter'] ${
                            editedDishName.toLowerCase().includes(altName.toLowerCase())
                              ? "bg-orange-700 text-white outline-orange-700"
                              : "bg-white text-stone-800 outline-stone-300 hover:outline-orange-700 hover:bg-stone-50"
                          }`}
                        >
                          {altName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Culinary Review & Foodie Insight Card */}
                <div className="w-full bg-stone-50 outline outline-1 outline-stone-200 p-5 space-y-3 font-['Inter']">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white outline outline-1 outline-stone-200 text-stone-800 text-xs font-semibold">
                      <svg className="w-3.5 h-3.5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="px-2 py-0.5 text-[11px] font-semibold bg-orange-700/10 text-orange-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {result.culinary_review ? (
                    <p className="text-sm sm:text-base font-normal text-stone-800 leading-relaxed italic">
                      &ldquo;{result.culinary_review}&rdquo;
                    </p>
                  ) : (
                    <p className="text-sm font-normal text-stone-700 leading-relaxed">
                      Pilihan hidangan lokal yang nikmat dan pas buat membangkitkan semangat beraktivitas anak kost!
                    </p>
                  )}

                  {result.culinary_tips && (
                    <div className="pt-2 border-t border-stone-200 flex items-start gap-2 text-xs text-stone-600 font-normal">
                      <svg className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <div className="leading-snug">
                        <strong className="font-semibold text-stone-800">Ide Paduan Pas:</strong>{" "}
                        {Array.isArray(result.culinary_tips)
                          ? result.culinary_tips.join(" ")
                          : result.culinary_tips}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3.2b Alur Koreksi Manual: Nama Makanan & Harga Bayar */}
                <div className="w-full space-y-4 bg-stone-50 outline outline-1 outline-stone-200 p-4 font-['Inter']">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                      Nama Hidangan (Bisa Diedit):
                    </label>
                    <button
                      type="button"
                      onClick={() => setCatalogModalOpen(true)}
                      className="text-xs font-semibold text-orange-700 hover:text-stone-900 underline cursor-pointer"
                    >
                      Pilih dari Katalog &rarr;
                    </button>
                  </div>

                  <input
                    type="text"
                    value={editedDishName}
                    onChange={(e) => setEditedDishName(e.target.value)}
                    placeholder="Nama makanan di piring..."
                    className="w-full h-10 px-3 bg-white outline outline-1 outline-stone-200 focus:outline-orange-700 text-sm font-semibold text-stone-800"
                  />

                  {/* 3.2b Pengatur Porsi Interaktif */}
                  <div className="space-y-2 pt-2 border-t border-stone-200">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-stone-600 uppercase tracking-wider">Takaran Porsi:</span>
                      <span className="text-stone-800 font-bold">
                        {portionPreset !== "custom" ? `Ukuran ${portionPreset} ` : ""}
                        ({Math.round(portionMultiplier * 100)}%)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handlePresetPortion("S")}
                        className={`h-10 px-3 text-xs font-semibold outline outline-1 transition-all cursor-pointer ${
                          portionPreset === "S"
                            ? "bg-orange-700 text-white outline-orange-700"
                            : "bg-white text-stone-700 outline-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        S (Kecil - 75%)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetPortion("M")}
                        className={`h-10 px-3 text-xs font-semibold outline outline-1 transition-all cursor-pointer ${
                          portionPreset === "M"
                            ? "bg-orange-700 text-white outline-orange-700"
                            : "bg-white text-stone-700 outline-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        M (Standar - 100%)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetPortion("L")}
                        className={`h-10 px-3 text-xs font-semibold outline outline-1 transition-all cursor-pointer ${
                          portionPreset === "L"
                            ? "bg-orange-700 text-white outline-orange-700"
                            : "bg-white text-stone-700 outline-stone-200 hover:bg-stone-100"
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
                        className="w-full accent-orange-700 cursor-pointer"
                        aria-label="Slider Takaran Porsi"
                      />
                      <div className="flex justify-between text-[10px] text-stone-500 font-medium">
                        <span>Setengah Porsi (50%)</span>
                        <span>Normal (100%)</span>
                        <span>Dua Kali Lipat (200%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Input Harga Bayar */}
                  <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-stone-700">
                      Tadi Bayar Berapa? (Rp):
                    </label>
                    <div className="flex items-center gap-1.5 w-full sm:w-48">
                      <span className="text-xs font-semibold text-stone-500">Rp</span>
                      <input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="15000"
                        className="w-full h-9 px-3 bg-white outline outline-1 outline-stone-200 focus:outline-orange-700 text-sm font-semibold text-stone-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Ringkasan Nutrisi Terhitung Real-Time */}
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <h2 className="text-2xl font-normal font-['Instrument_Serif'] text-stone-800">
                      Keseimbangan Nutrisi Porsi
                    </h2>
                    <span className="text-xs text-stone-500 font-semibold font-['Inter']">
                      ~{Math.round((result.foods.reduce((sum, f) => sum + (f.portion_grams || 0), 0) || 200) * portionMultiplier)}g
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-center font-['Inter']">
                    <div className="bg-stone-50 outline outline-1 outline-stone-200 p-3">
                      <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Energi</p>
                      <p className="text-lg font-bold text-stone-800">
                        {activeCalories}{" "}
                        <span className="text-xs font-normal text-stone-500">kkal</span>
                      </p>
                    </div>
                    <div className="bg-stone-50 outline outline-1 outline-stone-200 p-3">
                      <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Protein</p>
                      <p className="text-lg font-bold text-stone-800">
                        {activeProtein}{" "}
                        <span className="text-xs font-normal text-stone-500">g</span>
                      </p>
                    </div>
                    <div className="bg-stone-50 outline outline-1 outline-stone-200 p-3">
                      <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Lemak</p>
                      <p className="text-lg font-bold text-stone-800">
                        {activeFat}{" "}
                        <span className="text-xs font-normal text-stone-500">g</span>
                      </p>
                    </div>
                    <div className="bg-stone-50 outline outline-1 outline-stone-200 p-3">
                      <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Karbo</p>
                      <p className="text-lg font-bold text-stone-800">
                        {activeCarbs}{" "}
                        <span className="text-xs font-normal text-stone-500">g</span>
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-stone-50 outline outline-1 outline-stone-200 p-3">
                      <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Serat</p>
                      <p className="text-lg font-bold text-stone-800">
                        {activeFiber}{" "}
                        <span className="text-xs font-normal text-stone-500">g</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Komponen & Lauk Terdeteksi */}
                <div className="w-full space-y-2.5 font-['Inter']">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Komponen Menu di Piring:</span>
                  </h3>
                  <ul className="space-y-1.5">
                    {result.foods.map((food, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-3 bg-stone-50 outline outline-1 outline-stone-200 text-xs sm:text-sm"
                      >
                        <div>
                          <p className="font-semibold text-stone-800">{food.name}</p>
                          <p className="text-xs text-stone-500 font-normal">
                            Porsi ~{Math.round((food.portion_grams || 200) * portionMultiplier)}g
                          </p>
                        </div>
                        <div className="text-right font-bold text-stone-800">
                          {Math.round((food.nutrition.calories || 250) * portionMultiplier)} kkal
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3.2c Tampilan Disclaimer Tetap */}
                <p className="text-[11px] text-stone-400 italic text-center w-full font-['Inter']">
                  *Perkiraan AI, bisa meleset. Sesuaikan porsi dan harga di atas bila perlu sebelum dicatat.
                </p>

                {/* 3.2b Tombol Aksi Simpan: "Catat ke Diari" (Target sentuh >= 44px, WCAG AA) */}
                <div className="w-full pt-2 space-y-3 font-['Inter']">
                  <button
                    type="button"
                    onClick={handleSaveToDiary}
                    disabled={isSavingDiary || !editedDishName.trim()}
                    className="self-stretch w-full h-12 bg-orange-700 hover:bg-[#B34718] active:scale-[0.99] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="w-full p-3.5 bg-emerald-50 outline outline-1 outline-emerald-300 text-xs sm:text-sm text-emerald-950 font-semibold flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Berhasil dicatat ke Diari Kuliner hari ini!</span>
                      </div>
                      <Link
                        href="/history"
                        className="underline text-emerald-900 hover:text-stone-900 shrink-0"
                      >
                        Lihat Diari &rarr;
                      </Link>
                    </div>
                  )}

                  {diarySaveError && (
                    <div className="w-full p-3 bg-red-50 outline outline-1 outline-red-300 text-xs sm:text-sm text-red-950 font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{diarySaveError}</span>
                    </div>
                  )}
                </div>
              </section>
            ) : (
              /* ReviewEmptyState dari Figma */
              <div data-layer="ReviewEmptyState" className="ReviewEmptyState w-full p-10 bg-white outline outline-1 outline-stone-200 flex flex-col justify-center items-center gap-6">
                <div data-layer="PlateIllustration" className="PlateIllustration w-44 h-44 relative">
                  <div data-layer="Ellipse 2" className="Ellipse2 w-44 h-44 left-0 top-0 absolute rounded-full bg-stone-100 outline outline-2 outline-stone-300" />
                  <div data-layer="Ellipse 3" className="Ellipse3 w-32 h-32 left-[24px] top-[24px] absolute rounded-full bg-white outline outline-1 outline-dashed outline-stone-300" />
                  <div data-layer="ForkKnife" className="ForkKnife w-12 h-12 left-[64px] top-[64px] absolute flex items-center justify-center text-stone-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>

                <div data-layer="Text" className="Text flex flex-col justify-start items-center gap-2">
                  <div data-layer="Belum Ada Hidangan" className="BelumAdaHidangan justify-start text-stone-800 text-2xl font-normal font-['Instrument_Serif']">
                    Piring Masih Kosong
                  </div>
                  <div data-layer="Sub" className="Sub max-w-sm text-center justify-start text-stone-500 text-sm font-normal font-['Inter']">
                    Ambil foto piring makanmu atau ketik nama makanan untuk melihat review cita rasa ala foodie, estimasi porsi, dan rekomendasi lauk pelengkap.
                  </div>
                </div>

                <div data-layer="AspectBar" className="AspectBar self-stretch p-4 bg-stone-50 outline outline-1 outline-stone-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div data-layer="Aspect1" className="Aspect1 inline-flex justify-start items-center gap-2">
                    <div data-layer="Check" className="Check w-4 h-4 bg-orange-700/10 text-orange-700 rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>
                    <div data-layer="Cita Rasa & Tekstur" className="CitaRasaTekstur justify-start text-stone-700 text-xs font-medium font-['Inter']">Cita Rasa & Tekstur</div>
                  </div>
                  <div data-layer="Aspect2" className="Aspect2 inline-flex justify-start items-center gap-2">
                    <div data-layer="Check" className="Check w-4 h-4 bg-orange-700/10 text-orange-700 rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>
                    <div data-layer="Lauk Pelengkap" className="LaukPelengkap justify-start text-stone-700 text-xs font-medium font-['Inter']">Lauk Pelengkap</div>
                  </div>
                  <div data-layer="Aspect3" className="Aspect3 inline-flex justify-start items-center gap-2">
                    <div data-layer="Check" className="Check w-4 h-4 bg-orange-700/10 text-orange-700 rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>
                    <div data-layer="Porsi Seimbang" className="PorsiSeimbang justify-start text-stone-700 text-xs font-medium font-['Inter']">Porsi Seimbang</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Pencarian Cepat Katalog (80 Item TKPI) */}
      {catalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-['Inter']">
          <div className="relative w-full max-w-xl max-h-[85vh] bg-white outline outline-1 outline-stone-200 p-6 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-orange-700/10 text-orange-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <h3 className="text-2xl font-normal font-['Instrument_Serif'] text-stone-800">
                  Pilih Menu dari Katalog DompetKost
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCatalogModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 p-1.5 hover:bg-stone-100 transition-colors cursor-pointer"
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
              className="w-full h-11 px-4 bg-stone-50 outline outline-1 outline-stone-200 focus:outline-orange-700 text-sm font-semibold text-stone-800"
              autoFocus
            />

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredCatalog.slice(0, 30).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectFromCatalog(item)}
                  className="w-full text-left p-3 bg-stone-50 outline outline-1 outline-stone-200 hover:outline-orange-700 hover:bg-stone-100 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-sm text-stone-800 group-hover:text-orange-700">
                      {item.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {item.venue.toUpperCase()} • Estimasi Rp {item.priceRange.min.toLocaleString("id-ID")} - {item.priceRange.max.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-stone-800 group-hover:text-orange-700">
                      {item.nutrition.kcal} kkal
                    </span>
                    <span className="block text-[10px] text-stone-500">
                      P: {item.nutrition.protein}g | K: {item.nutrition.carbs}g
                    </span>
                  </div>
                </button>
              ))}

              {filteredCatalog.length === 0 && (
                <div className="py-8 text-center text-sm text-stone-500">
                  Tidak ditemukan menu &ldquo;{catalogSearch}&rdquo;. Coba kata kunci lain.
                </div>
              )}
            </div>

            <div className="border-t border-stone-200 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setCatalogModalOpen(false)}
                className="h-9 px-4 bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-800 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Insights */}
      {activeTab === "insights" && (
        <div className="w-full font-['Inter']">
          {insightsLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-800 border-t-transparent"></div>
            </div>
          ) : insightsError ? (
            <div className="w-full p-6 bg-white outline outline-1 outline-stone-200 text-sm font-medium text-stone-800">
              {insightsError}
            </div>
          ) : totalDays === 0 ? (
            <div className="w-full p-12 bg-white outline outline-1 outline-stone-200 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-14 h-14 bg-stone-100 flex items-center justify-center text-stone-600 outline outline-1 outline-stone-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-normal font-['Instrument_Serif'] text-stone-800">
                  Belum ada data yang cukup
                </p>
                <p className="text-sm text-stone-500 mt-2 max-w-sm leading-relaxed font-normal">
                  Mulai catat hidangan makananmu di tab Review Kuliner untuk membuka grafik tren porsi dan keseimbangan energi harian.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("analyze")}
                className="h-11 px-6 bg-orange-700 hover:bg-[#B34718] text-sm font-semibold text-white transition-all cursor-pointer"
              >
                Review Makanan Sekarang &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white outline outline-1 outline-stone-200 p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Rata-rata Energi</p>
                    <span className="p-2 bg-orange-700/10 text-orange-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-stone-800">{avgCalories} <span className="text-sm font-normal text-stone-400">kkal/hari</span></p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold ${
                      avgCalories > TARGET_CALORIES ? "bg-amber-100 text-amber-900" : "bg-emerald-50 text-emerald-800"
                    }`}>
                      {avgCalories > TARGET_CALORIES ? "Melebihi target" : "Terkendali"}
                    </span>
                    <span className="text-xs text-stone-400">Target: {TARGET_CALORIES} kkal</span>
                  </div>
                </div>

                <div className="bg-white outline outline-1 outline-stone-200 p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Rata-rata Protein</p>
                    <span className="p-2 bg-orange-700/10 text-orange-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-stone-800">{avgProtein}g <span className="text-sm font-normal text-stone-400">/hari</span></p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold ${
                      avgProtein < TARGET_PROTEIN ? "bg-amber-100 text-amber-900" : "bg-emerald-50 text-emerald-800"
                    }`}>
                      {avgProtein < TARGET_PROTEIN ? "Perlu ditingkatkan" : "Optimal"}
                    </span>
                    <span className="text-xs text-stone-400">Target: {TARGET_PROTEIN}g</span>
                  </div>
                </div>

                <div className="bg-white outline outline-1 outline-stone-200 p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Rata-rata Serat</p>
                    <span className="p-2 bg-emerald-50 text-emerald-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-stone-800">{avgFiber}g <span className="text-sm font-normal text-stone-400">/hari</span></p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold ${
                      avgFiber < TARGET_FIBER ? "bg-amber-100 text-amber-900" : "bg-emerald-50 text-emerald-800"
                    }`}>
                      {avgFiber < TARGET_FIBER ? "Kurang serat" : "Bagus"}
                    </span>
                    <span className="text-xs text-stone-400">Target: {TARGET_FIBER}g</span>
                  </div>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-white outline outline-1 outline-stone-200 p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-normal font-['Instrument_Serif'] text-stone-800">Grafik Energi Mingguan</h2>
                    <p className="text-xs text-stone-500 font-normal mt-0.5">Fluktuasi asupan energi selama 7 hari pencatatan</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-stone-300"></div>
                      <span>Aman</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-orange-700"></div>
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
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white pointer-events-none whitespace-nowrap z-20">
                          {Math.round(day.calories)} kkal
                        </div>

                        <div
                          className={`w-full max-w-[48px] transition-all duration-500 ${isOver ? 'bg-orange-700' : 'bg-stone-300'} group-hover:opacity-90`}
                          style={{ height: `${Math.max(10, heightPct)}%` }}
                        ></div>

                        <span className="mt-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">{day.label.split(',')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Health Insights */}
              <div className="bg-white outline outline-1 outline-stone-200 p-6 md:p-8">
                <h2 className="text-2xl font-normal font-['Instrument_Serif'] text-stone-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Tips Paduan Porsi & Lauk untuk Anda</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {avgProtein < TARGET_PROTEIN && (
                    <div className="flex gap-4 bg-stone-50 outline outline-1 outline-stone-200 p-5">
                      <span className="p-2.5 bg-orange-700/10 text-orange-700 shrink-0 self-start">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-semibold text-sm text-stone-800">Variasi Lauk Berprotein Murah Mantap</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-normal text-stone-600">
                          Rata-rata protein Anda ({avgProtein}g) bisa ditambah agar stamina harian prima. Tambahkan lauk andalan anak kost seperti tempe orek, telur dadar tebal, atau tongkol balado.
                        </p>
                      </div>
                    </div>
                  )}

                  {avgFiber < TARGET_FIBER && (
                    <div className="flex gap-4 bg-stone-50 outline outline-1 outline-stone-200 p-5">
                      <span className="p-2.5 bg-emerald-50 text-emerald-800 shrink-0 self-start">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-semibold text-sm text-stone-800">Segarkan Piring dengan Sayur & Lalapan</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-normal text-stone-600">
                          Piring makanmu masih minim serat ({avgFiber}g). Selipkan tumis kangkung gurih, sayur bayam bening, atau lalapan timun segar untuk pencernaan nyaman.
                        </p>
                      </div>
                    </div>
                  )}

                  {avgCalories > TARGET_CALORIES && (
                    <div className="flex gap-4 bg-stone-50 outline outline-1 outline-stone-200 p-5">
                      <span className="p-2.5 bg-orange-700/10 text-orange-700 shrink-0 self-start">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-semibold text-sm text-stone-800">Atur Porsi & Seimbangkan Camilan</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-normal text-stone-600">
                          Asupan kalori harian Anda ({avgCalories} kkal) terhitung cukup padat. Sesuaikan porsi nasi dan kurangi minuman manis atau gorengan tepung ekstra saat nugas.
                        </p>
                      </div>
                    </div>
                  )}

                  {avgProtein >= TARGET_PROTEIN && avgFiber >= TARGET_FIBER && avgCalories <= TARGET_CALORIES && (
                    <div className="flex gap-4 bg-stone-50 outline outline-1 outline-stone-200 p-5">
                      <span className="p-2.5 bg-emerald-50 text-emerald-800 shrink-0 self-start">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-semibold text-sm text-stone-800">Komposisi Piring Anda Juara!</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-normal text-stone-600">
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

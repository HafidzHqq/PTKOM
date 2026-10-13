"use client";

import { useState, useEffect, useRef } from "react";
import { FoodAnalysisResult } from "@/lib/ai";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"analyze" | "insights">("analyze");

  // --- Analyze State ---
  const [preview, setPreview] = useState<string | null>(null);
  const [foodName, setFoodName] = useState("");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [historySaveSuccess, setHistorySaveSuccess] = useState(false);
  const [historySaveError, setHistorySaveError] = useState<string | null>(null);

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

    // Stop existing stream first
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
        // Fallback jika facingMode khusus tidak didukung
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

  // Re-attach video stream when video element renders
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive]);

  // Clean up camera stream on unmount
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
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    setPreview(dataUrl);
    setFoodName("");
    stopCamera();
  };

  // --- Analyze Handlers ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setFoodName("");
        stopCamera();
      };
      reader.readAsDataURL(file);
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

  const handleAnalyze = async () => {
    if (!preview && !foodName.trim()) return;

    stopCamera();
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

      // Simpan ke riwayat gizi HANYA jika pengguna sudah login
      if (user) {
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
      }
    } catch (err: unknown) {
      setAnalyzeError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  // --- Insights Handlers ---
  const loadHistory = async () => {
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
  };

  useEffect(() => {
    if (activeTab === "insights") {
      stopCamera();
      if (user) {
        loadHistory();
      } else {
        setInsightsLoading(false);
      }
    }
  }, [activeTab, user]);

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

  // Target Harian (from profile, fallback 0)
  const TARGET_CALORIES = profileTargets.calories;
  const TARGET_PROTEIN = profileTargets.protein_g;
  const TARGET_FIBER = profileTargets.fiber_g;

  return (
    <div className="w-full px-4 py-5 sm:py-8 md:px-8 max-w-[1440px] mx-auto space-y-6 sm:space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-black text-white shadow-xs shrink-0">
            <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-black tracking-tight">
              Analisis & Tren Gizi
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-neutral-500 font-medium mt-0.5 sm:mt-1">
              Pindai makanan dan evaluasi tren gizi harianmu.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("analyze")}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-colors border-b-2 whitespace-nowrap shrink-0 ${
            activeTab === "analyze"
              ? "border-black text-black"
              : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          Analisis Makanan
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-colors border-b-2 whitespace-nowrap shrink-0 ${
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
                <span className="text-[11px] text-neutral-500 font-medium">Riwayat otomatis tersimpan</span>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-[4px] bg-amber-50 border border-amber-200/60 px-3.5 py-2.5 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>
                    <strong>Mode Tamu:</strong> Hasil analisis ditampilkan, tetapi riwayat <u>tidak disimpan</u>.
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

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Error Kamera */}
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
                ATAU KETIK NAMA MAKANAN
              </span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Contoh: Nasi Padang Rendang, Es Teh Manis..."
                value={foodName}
                onChange={handleTextChange}
                className="block w-full rounded-[4px] border border-neutral-300 px-4 py-3.5 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors bg-neutral-50 focus:bg-white text-black"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={(!preview && !foodName.trim()) || analyzeLoading}
              className={`w-full rounded-[4px] px-4 py-3.5 font-bold text-white shadow-xs transition-all ${
                (!preview && !foodName.trim()) || analyzeLoading
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-400"
                  : "bg-black hover:bg-neutral-800 active:scale-[0.99]"
              }`}
            >
              {analyzeLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Menganalisis dengan AI...
                </span>
              ) : (
                "Mulai Analisis Gizi"
              )}
            </button>

            {analyzeError && (
              <div className="rounded-[4px] border border-neutral-200 bg-neutral-50 p-4 text-sm text-black">
                <strong>Error:</strong> {analyzeError}
              </div>
            )}

            {historySaveSuccess && (
              <div className="rounded-[4px] border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Analisis berhasil disimpan ke riwayat harian Anda!</span>
              </div>
            )}

            {!user && result && (
              <div className="rounded-[4px] border border-neutral-200 bg-neutral-50 p-4 text-xs sm:text-sm text-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    <strong>Mode Tamu:</strong> Hasil analisis gizi ditampilkan di samping, tetapi <u>tidak disimpan ke riwayat</u> karena Anda belum login.
                  </span>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center shrink-0 rounded-[4px] bg-black px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
                >
                  Masuk Akun &rarr;
                </Link>
              </div>
            )}

            {historySaveError && (
              <div className="rounded-[4px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{historySaveError}</span>
              </div>
            )}
          </section>

          {/* Result Container */}
          <div>
            {result ? (
              <section className="space-y-6 rounded-[4px] border border-neutral-200 bg-white p-6 md:p-8 shadow-xs">
                <h2 className="border-b border-neutral-200 pb-3 sm:pb-4 text-lg sm:text-xl font-black text-black">
                  Hasil Analisis Nutrisi
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-center">
                  <div className="rounded-[4px] bg-neutral-50 p-3 border border-neutral-200">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Kalori</p>
                    <p className="text-xl font-black text-black">
                      {result.total_nutrition.calories}{" "}
                      <span className="text-xs font-medium text-neutral-500">kcal</span>
                    </p>
                  </div>
                  <div className="rounded-[4px] bg-neutral-50 p-3 border border-neutral-200">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Protein</p>
                    <p className="text-xl font-black text-black">
                      {result.total_nutrition.protein_g}{" "}
                      <span className="text-xs font-medium text-neutral-500">g</span>
                    </p>
                  </div>
                  <div className="rounded-[4px] bg-neutral-50 p-3 border border-neutral-200">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Lemak</p>
                    <p className="text-xl font-black text-black">
                      {result.total_nutrition.fat_g}{" "}
                      <span className="text-xs font-medium text-neutral-500">g</span>
                    </p>
                  </div>
                  <div className="rounded-[4px] bg-neutral-50 p-3 border border-neutral-200">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Karbo</p>
                    <p className="text-xl font-black text-black">
                      {result.total_nutrition.carbs_g}{" "}
                      <span className="text-xs font-medium text-neutral-500">g</span>
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-[4px] bg-neutral-50 p-3 border border-neutral-200">
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
                        className="flex items-center justify-between rounded-[4px] border border-neutral-200 bg-neutral-50 p-4"
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
                      <li key={idx} className="flex gap-3 text-sm text-neutral-700 bg-neutral-50 p-3 rounded-[4px] border border-neutral-200">
                        <svg className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="leading-relaxed">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-[4px] border-2 border-dashed border-neutral-200 p-8 text-center bg-neutral-50/50">
                <svg className="w-12 h-12 text-neutral-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-base font-bold text-black">
                  Belum ada makanan yang dianalisis
                </p>
                <p className="text-sm text-neutral-500 mt-2 max-w-xs leading-relaxed">
                  Masukkan nama makanan atau ambil/unggah foto untuk melihat rincian gizinya di sini.
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
            <div className="rounded-[4px] border border-neutral-200 bg-neutral-50 p-6 text-sm font-medium text-black">{insightsError}</div>
          ) : totalDays === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[4px] border-2 border-dashed border-neutral-200 p-12 text-center bg-neutral-50/50">
              <svg className="h-12 w-12 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-base font-bold text-black">Belum ada data yang cukup</p>
              <p className="text-sm text-neutral-500 mt-2 max-w-sm leading-relaxed">
                Mulai rekam konsumsi makanan Anda lewat kamera atau teks untuk membuka analisis gizi komprehensif.
              </p>
              <button
                onClick={() => setActiveTab("analyze")}
                className="mt-6 rounded-[4px] bg-black px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-neutral-800 transition-all"
              >
                Scan Makanan Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-xs">
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
                    <div className="flex gap-4 rounded-[4px] bg-neutral-50 p-5 text-black border border-neutral-200">
                      <svg className="h-7 w-7 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-black text-sm">Kalori Melebihi Kebutuhan</p>
                        <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium text-neutral-600">
                          Rata-rata kalori Anda ({avgCalories} kcal) berlebih. Kurangi minuman berpemanis dan gorengan bertepung tebal di antara waktu makan.
                        </p>
                      </div>
                    </div>
                  )}

                  {avgProtein >= TARGET_PROTEIN && avgFiber >= TARGET_FIBER && avgCalories <= TARGET_CALORIES && (
                    <div className="flex gap-4 rounded-[4px] bg-neutral-50 p-5 text-black border border-neutral-200">
                      <svg className="h-7 w-7 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
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

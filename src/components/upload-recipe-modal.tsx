"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

interface UploadRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AiAnalysisResult {
  is_food: boolean;
  rejection_reason: string | null;
  nutrition: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  estimated_cost: number;
  cook_time_minutes: number;
  ai_feedback?: string | null;
  aiFeedback?: string | null;
  health_tags?: string[];
  [key: string]: unknown;
}

const CATEGORIES = [
  "Lauk Hemat",
  "Rice Cooker",
  "Sayur & Sup",
  "Sarapan",
  "Camilan",
];

export default function UploadRecipeModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadRecipeModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Lauk Hemat");
  const [portions, setPortions] = useState(1);
  const [cookTime, setCookTime] = useState<number>(20);
  const [cost, setCost] = useState<number>(15000);
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // AI Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      // Reset AI verification if image changes
      setAiResult(null);
      setRejectionError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyWithAi = async () => {
    if (!title.trim() || !ingredients.trim()) {
      setErrorMsg("Mohon isi judul dan bahan-bahan resep terlebih dahulu.");
      return;
    }

    setErrorMsg(null);
    setRejectionError(null);
    setIsVerifying(true);

    try {
      const res = await fetch("/api/recipes/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          ingredients,
          steps,
          portions,
          imageBase64: imagePreview || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setRejectionError(
          data.message || "AI mendeteksi input ini bukan makanan yang layak atau aman dikonsumsi."
        );
        setAiResult(null);
      } else {
        setAiResult(data.data);
        setRejectionError(null);
        // Pre-fill estimates if recommended
        if (data.data.estimated_cost) setCost(data.data.estimated_cost);
        if (data.data.cook_time_minutes) setCookTime(data.data.cook_time_minutes);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menghubungi layanan AI. Coba beberapa saat lagi.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !ingredients.trim() || !steps.trim()) {
      setErrorMsg("Harap lengkapi judul, bahan, dan langkah memasak.");
      return;
    }

    if (!aiResult) {
      setErrorMsg("Harap verifikasi resep dengan AI terlebih dahulu sebelum menyimpan.");
      return;
    }

    if (!aiResult.is_food) {
      setErrorMsg("Resep tidak dapat disimpan karena terdeteksi bukan makanan.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        title,
        description,
        category,
        portions,
        cookTimeMinutes: cookTime,
        estimatedCost: cost,
        imageUrl: imagePreview,
        ingredients,
        steps,
        calories: aiResult.nutrition.calories,
        proteinG: aiResult.nutrition.protein_g,
        fatG: aiResult.nutrition.fat_g,
        carbsG: aiResult.nutrition.carbs_g,
        fiberG: aiResult.nutrition.fiber_g,
        aiFeedback: aiResult.ai_feedback || "Resep telah diverifikasi oleh AI DompetKost.",
        isAiVerified: true,
      };

      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal menyimpan resep");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menyimpan resep ke database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-8 shadow-2xl my-4 sm:my-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-4 mb-5 sm:mb-6">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-neutral-900">Upload Resep Baru</h2>
              <p className="text-[11px] sm:text-xs text-neutral-500 leading-snug">
                Resep akan diverifikasi oleh AI untuk memastikan kelayakan makanan & menghitung gizi otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-xs sm:text-sm text-red-700 border border-red-200 flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Judul & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Judul Resep <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setAiResult(null);
                }}
                placeholder="Contoh: Nasi Goreng Kimchi Telur Dadar"
                required
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deskripsi Singkat */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Deskripsi Singkat (Opsional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan sedikit tentang resep ini, cita rasa atau kenapa kamu suka..."
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {/* Porsi, Waktu, & Biaya */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Porsi
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={portions}
                onChange={(e) => setPortions(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Waktu (Menit)
              </label>
              <input
                type="number"
                min={1}
                value={cookTime}
                onChange={(e) => setCookTime(parseInt(e.target.value) || 15)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Biaya (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Foto Makanan */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Foto Makanan (Opsional tetapi disarankan untuk dicek AI)
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative h-24 w-24 rounded-xl overflow-hidden border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      setAiResult(null);
                    }}
                    className="absolute top-1 right-1 rounded-full bg-red-600 text-white p-1 shadow hover:bg-red-700"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-24 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 hover:border-orange-500 transition text-neutral-500 hover:text-orange-600 bg-neutral-50/50"
                >
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-semibold">Pilih / Ambil Foto Masakan</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Bahan-bahan */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Bahan-Bahan <span className="text-red-500">*</span>
              <span className="text-neutral-400 font-normal lowercase ml-1">(tulis satu bahan per baris)</span>
            </label>
            <textarea
              rows={4}
              value={ingredients}
              onChange={(e) => {
                setIngredients(e.target.value);
                setAiResult(null);
              }}
              placeholder={"- 2 butir telur ayam\n- 1 piring nasi dingin\n- 2 siung bawang putih\n- 1 sdm kecap manis"}
              required
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {/* Langkah Memasak */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Langkah Memasak <span className="text-red-500">*</span>
              <span className="text-neutral-400 font-normal lowercase ml-1">(tulis satu langkah per baris)</span>
            </label>
            <textarea
              rows={4}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder={"1. Panaskan minyak di wajan.\n2. Tumis bawang hingga harum.\n3. Masukkan telur, orak-arik hingga matang.\n4. Masukkan nasi dan bumbu, aduk rata."}
              required
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {/* AI Check & Rejection / Success Box */}
          <div className="pt-2">
            {!aiResult && !rejectionError && (
              <button
                type="button"
                onClick={handleVerifyWithAi}
                disabled={isVerifying || !title.trim() || !ingredients.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white shadow hover:bg-neutral-800 disabled:opacity-50 transition active:scale-[0.99]"
              >
                {isVerifying ? (
                  <>
                    <svg className="w-5 h-5 animate-spin text-orange-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>AI sedang memeriksa makanan & menghitung gizi...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Cek Kelayakan & Hitung Gizi AI</span>
                  </>
                )}
              </button>
            )}

            {/* Jika Ditolak AI (Bukan Makanan) */}
            {rejectionError && (
              <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-red-900">Ditolak oleh AI: Bukan Makanan!</h4>
                    <p className="text-xs text-red-700 leading-relaxed">{rejectionError}</p>
                    <p className="text-[11px] text-red-600 pt-1">
                      Pastikan resep yang dimasukkan berupa makanan atau bahan masakan yang aman dan dapat dikonsumsi manusia.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectionError(null);
                        setAiResult(null);
                      }}
                      className="mt-2 text-xs font-bold text-red-800 underline hover:text-red-950"
                    >
                      Perbaiki Resep & Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Jika Diterima AI (Beneran Makanan) */}
            {aiResult && aiResult.is_food && (
              <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-start sm:items-center gap-2 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-900 leading-snug">
                      Terverifikasi Makanan Nyata &amp; Layak Konsumsi
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyWithAi}
                    className="text-xs text-emerald-700 underline hover:text-emerald-900"
                  >
                    Cek Ulang
                  </button>
                </div>

                {/* Macro Nutrition Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1 text-center">
                  <div className="rounded-xl bg-white p-2 border border-emerald-100 shadow-xs">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Kalori</p>
                    <p className="text-sm sm:text-base font-extrabold text-neutral-900">{aiResult.nutrition.calories}</p>
                    <p className="text-[9px] text-neutral-400">kkal</p>
                  </div>
                  <div className="rounded-xl bg-white p-2 border border-emerald-100 shadow-xs">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Protein</p>
                    <p className="text-sm sm:text-base font-extrabold text-blue-600">{aiResult.nutrition.protein_g}g</p>
                    <p className="text-[9px] text-neutral-400">protein</p>
                  </div>
                  <div className="rounded-xl bg-white p-2 border border-emerald-100 shadow-xs">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Lemak</p>
                    <p className="text-sm sm:text-base font-extrabold text-amber-600">{aiResult.nutrition.fat_g}g</p>
                    <p className="text-[9px] text-neutral-400">lemak</p>
                  </div>
                  <div className="rounded-xl bg-white p-2 border border-emerald-100 shadow-xs">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Karbo</p>
                    <p className="text-sm sm:text-base font-extrabold text-orange-600">{aiResult.nutrition.carbs_g}g</p>
                    <p className="text-[9px] text-neutral-400">karbo</p>
                  </div>
                  <div className="rounded-xl bg-white p-2 border border-emerald-100 shadow-xs">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Serat</p>
                    <p className="text-sm sm:text-base font-extrabold text-emerald-600">{aiResult.nutrition.fiber_g}g</p>
                    <p className="text-[9px] text-neutral-400">serat</p>
                  </div>
                </div>

                {/* AI Review */}
                {Boolean(aiResult.ai_feedback) && (
                  <div className="rounded-xl bg-white/80 p-3 text-xs text-neutral-700 italic border border-emerald-200">
                    &ldquo;{aiResult.ai_feedback}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !aiResult || !aiResult.is_food}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-orange-700 disabled:opacity-40 transition active:scale-[0.98]"
            >
              {isSubmitting ? "Menyimpan ke Menu..." : "Simpan & Publikasikan Resep"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

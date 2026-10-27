"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RecipeData } from "@/components/recipe-detail-modal";

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction states
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const id = params?.id;
        if (!id) return;
        const res = await fetch(`/api/recipes/${id}`);
        const json = await res.json();
        if (!res.ok || !json.success || !json.data) {
          setError(json.message || "Resep tidak ditemukan.");
        } else {
          setRecipe(json.data);
          if (json.currentUserId) {
            setCurrentUserId(json.currentUserId);
          }
        }
      } catch (err) {
        console.error("Gagal memuat resep:", err);
        setError("Gagal memuat resep karena masalah koneksi.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-stone-600">
        <div className="w-12 h-12 border-3 border-orange-200 border-t-orange-700 rounded-full animate-spin mb-4" />
        <p className="text-sm font-['Inter'] font-medium">Memuat rincian resep kost...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-700 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-['Instrument_Serif'] text-stone-800 mb-2">
          {error || "Resep Tidak Ditemukan"}
        </h2>
        <p className="text-xs text-stone-500 font-['Inter'] max-w-md mb-6 leading-relaxed">
          Resep yang kamu cari mungkin telah dihapus atau tautan tidak valid.
        </p>
        <Link
          href="/recipes"
          className="h-10 px-6 bg-orange-700 hover:bg-[#B34718] text-white rounded-[10px] text-xs font-semibold font-['Inter'] inline-flex items-center gap-2 transition"
        >
          ← Kembali ke Semua Resep
        </Link>
      </div>
    );
  }

  let ingredientList: string[] = [];
  try {
    ingredientList = JSON.parse(recipe.ingredients);
  } catch {
    ingredientList = recipe.ingredients.split("\n").filter(Boolean);
  }

  let stepList: string[] = [];
  try {
    stepList = JSON.parse(recipe.steps);
  } catch {
    stepList = recipe.steps.split("\n").filter(Boolean);
  }

  const isOwner = Boolean(currentUserId && recipe.userId === currentUserId);

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyIngredients = () => {
    const text = `Daftar Belanja Resep "${recipe.title}":\n` + ingredientList.map((i) => `- ${i}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Daftar bahan berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleSave = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);
    const prevSaved = Boolean(recipe.isSaved);
    const nextSaved = !prevSaved;

    // Optimistic UI
    setRecipe((prev) =>
      prev
        ? {
            ...prev,
            isSaved: nextSaved,
            saveCount: Math.max(0, (prev.saveCount || 0) + (nextSaved ? 1 : -1)),
          }
        : null
    );

    try {
      const res = await fetch(`/api/recipes/${recipe.id}/save`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback
        setRecipe((prev) =>
          prev
            ? {
                ...prev,
                isSaved: prevSaved,
                saveCount: Math.max(0, (prev.saveCount || 0) + (prevSaved ? 1 : -1)),
              }
            : null
        );
        showToast(data.message || "Gagal menyimpan resep.");
      } else {
        showToast(nextSaved ? "Resep berhasil disimpan!" : "Resep dihapus dari simpanan.");
      }
    } catch {
      showToast("Koneksi bermasalah saat menyimpan resep.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogToDiary = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLogging(true);
    try {
      const res = await fetch("/api/nutrition-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foods: [
            {
              name: recipe.title,
              portion_grams: 250,
              nutrition: {
                calories: recipe.calories,
                protein_g: recipe.proteinG,
                fat_g: recipe.fatG,
                carbs_g: recipe.carbsG,
                fiber_g: recipe.fiberG,
              },
            },
          ],
          total_nutrition: {
            calories: recipe.calories,
            protein_g: recipe.proteinG,
            fat_g: recipe.fatG,
            carbs_g: recipe.carbsG,
            fiber_g: recipe.fiberG,
          },
          calories: recipe.calories,
          protein_g: recipe.proteinG,
          fat_g: recipe.fatG,
          carbs_g: recipe.carbsG,
          fiber_g: recipe.fiberG,
        }),
      });

      if (res.ok) {
        showToast(`Berhasil mencatat "${recipe.title}" ke Diari Gizi!`);
      } else {
        showToast("Gagal mencatat ke diari gizi.");
      }
    } catch {
      showToast("Terjadi kendala koneksi.");
    } finally {
      setIsLogging(false);
    }
  };

  const handleDeleteRecipe = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Gagal menghapus resep.");
        setIsDeleting(false);
        setShowDeleteModal(false);
      } else {
        showToast(`Resep "${recipe.title}" berhasil dihapus.`);
        router.push("/recipes");
      }
    } catch {
      showToast("Gagal menghapus resep.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link resep berhasil disalin!");
    }
  };

  return (
    <div className="w-full min-h-screen pb-24 md:pb-16 text-stone-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl bg-stone-900 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl animate-fade-in flex items-center gap-2 border border-stone-700">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Auth Prompt Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#F7F5F1] p-7 shadow-2xl border border-stone-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-normal font-['Instrument_Serif'] text-stone-800 mb-1">
              Masuk untuk Melanjutkan
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-['Inter'] mb-6 leading-relaxed">
              Fitur menyimpan resep dan mencatat ke Diari Gizi memerlukan akun agar riwayatmu tersimpan aman di semua perangkat.
            </p>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/login"
                className="h-11 w-full rounded-xl bg-orange-700 hover:bg-[#B34718] text-white text-xs font-semibold font-['Inter'] flex items-center justify-center transition shadow-xs"
              >
                Masuk / Buat Akun
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="h-10 w-full rounded-xl text-xs font-semibold font-['Inter'] text-stone-600 hover:bg-stone-200/60 transition cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#F7F5F1] p-6 shadow-2xl border border-stone-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-normal font-['Instrument_Serif'] text-stone-800 mb-1">
              Hapus Resep Ini?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-['Inter'] mb-6 leading-relaxed">
              Resep <strong className="text-stone-900">&ldquo;{recipe.title}&rdquo;</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="h-10 px-4 rounded-[10px] text-xs sm:text-sm font-semibold font-['Inter'] text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteRecipe}
                disabled={isDeleting}
                className="h-10 px-5 rounded-[10px] bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-semibold font-['Inter'] text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Resep"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Recipe Content Container */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-10 pb-12 sm:pb-16 flex flex-col gap-6 sm:gap-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold font-['Inter'] text-stone-600 hover:text-orange-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Kembali ke Koleksi Resep</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="h-9 px-3.5 rounded-[10px] bg-white outline outline-1 outline-offset-[-1px] outline-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold font-['Inter'] inline-flex items-center gap-1.5 transition cursor-pointer"
              title="Bagikan tautan resep"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="hidden sm:inline">Bagikan</span>
            </button>

            {/* Save / Bookmark Button */}
            <button
              type="button"
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`h-9 px-3.5 rounded-[10px] text-xs font-semibold font-['Inter'] inline-flex items-center gap-1.5 transition cursor-pointer ${
                recipe.isSaved
                  ? "bg-rose-600 text-white shadow-xs hover:bg-rose-700"
                  : "bg-white outline outline-1 outline-offset-[-1px] outline-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              <svg
                className={`w-3.5 h-3.5 ${recipe.isSaved ? "fill-white" : "fill-none stroke-current"}`}
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{recipe.isSaved ? "Tersimpan" : "Simpan Resep"}</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-stone-900 shadow-md">
          <div className="h-64 sm:h-80 md:h-96 w-full relative">
            {recipe.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover opacity-85"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-stone-800 text-stone-300 gap-3">
                <svg className="w-16 h-16 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-xs font-['Inter'] text-stone-400">Resep DompetKost</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/40 to-transparent" />

            {/* Badges on hero */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="h-6 sm:h-7 px-2.5 sm:px-3 rounded-[100px] bg-stone-900/85 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold font-['Inter'] flex items-center tracking-wider uppercase">
                  {recipe.category}
                </span>
                {recipe.isAiVerified && (
                  <span className="h-6 sm:h-7 px-2.5 sm:px-3 rounded-[100px] bg-emerald-700/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold font-['Inter'] flex items-center gap-1.5 shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Gizi Terverifikasi AI</span>
                  </span>
                )}
              </div>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="h-6 sm:h-7 px-2.5 sm:px-3 rounded-[100px] bg-red-600/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold font-['Inter'] inline-flex items-center gap-1 hover:bg-red-700 transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Hapus Resep</span>
                </button>
              )}
            </div>

            {/* Bottom info on hero */}
            <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-5 text-white flex flex-col gap-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-normal font-['Instrument_Serif'] leading-tight tracking-tight text-white drop-shadow-sm">
                {recipe.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-stone-300 font-['Inter'] pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Waktu Masak: {recipe.cookTimeMinutes} Menit</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Porsi: {recipe.portions} Orang</span>
                </span>
                <span>•</span>
                <span className="font-semibold text-orange-400">
                  Estimasi Biaya: Rp {recipe.estimatedCost.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Author row & Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white outline outline-1 outline-offset-[-1px] outline-stone-200">
          <div className="flex items-center gap-3">
            {recipe.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={recipe.user.image}
                alt={recipe.user.name || "User"}
                className="w-10 h-10 rounded-full border border-stone-200 object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold text-sm flex items-center justify-center shrink-0">
                {recipe.user?.name?.[0]?.toUpperCase() || "K"}
              </div>
            )}
            <div>
              <div className="text-xs text-stone-400 font-['Inter']">Dibagikan oleh</div>
              <div className="text-sm font-semibold font-['Inter'] text-stone-800">
                {recipe.user?.name || "Komunitas DompetKost"} {isOwner && "(Kamu)"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleLogToDiary}
              disabled={isLogging}
              className="flex-1 sm:flex-initial justify-center h-10 px-4 sm:px-5 rounded-[10px] bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold font-['Inter'] inline-flex items-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{isLogging ? "Mencatat..." : "Catat ke Diari Gizi"}</span>
            </button>
            <Link
              href={`/recipes/ask?title=${encodeURIComponent(recipe.title)}`}
              className="flex-1 sm:flex-initial justify-center h-10 px-4 rounded-[10px] bg-orange-50 hover:bg-orange-100 text-orange-700 outline outline-1 outline-offset-[-1px] outline-orange-200 text-xs font-semibold font-['Inter'] inline-flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <span>Tanya Chef AI</span>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {recipe.description && (
          <div className="p-4 sm:p-6 rounded-2xl bg-white outline outline-1 outline-offset-[-1px] outline-stone-200">
            <h3 className="text-xs uppercase tracking-wider font-semibold font-['Inter'] text-stone-400 mb-2">
              Tentang Resep
            </h3>
            <p className="text-stone-700 font-['Inter'] text-sm leading-relaxed">
              {recipe.description}
            </p>
          </div>
        )}

        {/* Nutrition Breakdown Card */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white outline outline-1 outline-offset-[-1px] outline-stone-200 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xl font-normal font-['Instrument_Serif'] text-stone-800">
                Kandungan Nutrisi (per porsi)
              </h3>
              <p className="text-xs text-stone-500 font-['Inter']">
                Dihitung otomatis berbasis standar gizi pangan Indonesia
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-['Inter']">
              Terverifikasi AI
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-stone-50 text-center border border-stone-100">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-400 block font-['Inter']">
                Kalori
              </span>
              <span className="text-2xl font-bold font-['Inter'] text-stone-900 mt-1 block">
                {recipe.calories}
              </span>
              <span className="text-[10px] text-stone-400 font-['Inter']">kkal</span>
            </div>
            <div className="p-4 rounded-xl bg-orange-50/60 text-center border border-orange-100">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-orange-600 block font-['Inter']">
                Protein
              </span>
              <span className="text-2xl font-bold font-['Inter'] text-orange-700 mt-1 block">
                {recipe.proteinG}g
              </span>
              <span className="text-[10px] text-orange-500 font-['Inter']">protein</span>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 text-center border border-stone-100">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-400 block font-['Inter']">
                Karbohidrat
              </span>
              <span className="text-2xl font-bold font-['Inter'] text-stone-900 mt-1 block">
                {recipe.carbsG}g
              </span>
              <span className="text-[10px] text-stone-400 font-['Inter']">karbo</span>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 text-center border border-stone-100">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-400 block font-['Inter']">
                Lemak
              </span>
              <span className="text-2xl font-bold font-['Inter'] text-stone-900 mt-1 block">
                {recipe.fatG}g
              </span>
              <span className="text-[10px] text-stone-400 font-['Inter']">lemak</span>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 text-center border border-stone-100 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-400 block font-['Inter']">
                Serat
              </span>
              <span className="text-2xl font-bold font-['Inter'] text-stone-900 mt-1 block">
                {recipe.fiberG}g
              </span>
              <span className="text-[10px] text-stone-400 font-['Inter']">serat</span>
            </div>
          </div>

          {recipe.aiFeedback && (
            <div className="mt-2 rounded-xl bg-orange-50/70 p-4 border border-orange-200/80 flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 font-['Inter'] block mb-0.5">
                  Analisis Chef AI:
                </span>
                <p className="text-xs text-orange-900 font-['Inter'] italic leading-relaxed">
                  &ldquo;{recipe.aiFeedback}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ingredients & Steps 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Ingredients Column */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-4 sm:p-6 rounded-2xl bg-white outline outline-1 outline-offset-[-1px] outline-stone-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-normal font-['Instrument_Serif'] text-stone-800">
                    Bahan-Bahan
                  </h3>
                  <p className="text-xs text-stone-500 font-['Inter']">
                    {ingredientList.length} bahan untuk {recipe.portions} porsi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyIngredients}
                  className="text-xs font-semibold font-['Inter'] text-orange-700 hover:text-orange-800 transition inline-flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Salin Belanja</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                {ingredientList.map((item, idx) => {
                  const isChecked = !!checkedIngredients[idx];
                  return (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition cursor-pointer select-none text-xs sm:text-sm font-['Inter'] ${
                        isChecked
                          ? "bg-stone-50 text-stone-400 line-through"
                          : "hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleIngredient(idx)}
                        className="mt-0.5 rounded border-stone-300 text-orange-700 focus:ring-orange-500 cursor-pointer"
                      />
                      <span className="leading-relaxed">{item}</span>
                    </label>
                  );
                })}
              </div>

              {/* Kost Budget Summary Tip */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-['Inter']">
                <span className="text-stone-500">Biaya per Porsi:</span>
                <span className="font-bold text-orange-700">
                  ± Rp {Math.round(recipe.estimatedCost / Math.max(1, recipe.portions)).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Steps Column */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="p-4 sm:p-6 rounded-2xl bg-white outline outline-1 outline-offset-[-1px] outline-stone-200">
              <div className="mb-5">
                <h3 className="text-2xl font-normal font-['Instrument_Serif'] text-stone-800">
                  Langkah-Langkah Memasak
                </h3>
                <p className="text-xs text-stone-500 font-['Inter']">
                  Ikuti langkah berikut dari awal sampai siap disajikan
                </p>
              </div>

              <div className="space-y-4">
                {stepList.map((step, idx) => {
                  const isDone = !!checkedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition cursor-pointer ${
                        isDone
                          ? "bg-emerald-50/50 border-emerald-200/80 text-stone-400"
                          : "bg-white border-stone-200 hover:border-orange-300 text-stone-800"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                          isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-orange-100 text-orange-700 font-['Inter']"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-xs sm:text-sm font-['Inter'] leading-relaxed ${
                            isDone ? "line-through text-stone-400" : "text-stone-700"
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ready to eat card */}
              <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🍚</span>
                  <div className="text-xs font-['Inter']">
                    <strong className="text-stone-800 block">Siap Disantap!</strong>
                    <span className="text-stone-500">Sajikan selagi hangat bersama nasi putih pulen.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogToDiary}
                  disabled={isLogging}
                  className="h-9 px-4 rounded-[8px] bg-orange-700 hover:bg-[#B34718] text-white text-xs font-semibold font-['Inter'] transition cursor-pointer"
                >
                  Catat Diari Gizi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-orange-700 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="max-w-xl">
            <h4 className="text-2xl sm:text-3xl font-normal font-['Instrument_Serif'] text-white mb-2">
              Punya Sisa Bahan Lain di Kamar Kost?
            </h4>
            <p className="text-xs sm:text-sm text-orange-100 font-['Inter'] leading-relaxed">
              Tanyakan pada Chef AI untuk ide olahan cerdas dari telur, tempe, sarden, mie instan, atau bahan apa pun yang tersisa.
            </p>
          </div>
          <Link
            href="/recipes/ask"
            className="h-11 px-6 bg-white hover:bg-orange-50 text-orange-800 rounded-xl text-xs font-semibold font-['Inter'] inline-flex items-center gap-2 shrink-0 transition shadow-sm"
          >
            <span>Tanya Chef AI Sekarang</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
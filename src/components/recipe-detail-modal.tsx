"use client";

import { useState } from "react";

export interface RecipeData {
  id: number;
  userId?: number | null;
  title: string;
  description?: string | null;
  category: string;
  cookTimeMinutes: number;
  portions: number;
  estimatedCost: number;
  imageUrl?: string | null;
  ingredients: string; // JSON array of string
  steps: string; // JSON array of string
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number;
  isAiVerified: boolean;
  aiFeedback?: string | null;
  createdAt: string;
  isSaved?: boolean;
  saveCount?: number;
  user?: {
    id: number;
    name?: string | null;
    image?: string | null;
    email?: string | null;
  } | null;
}

interface RecipeDetailModalProps {
  recipe: RecipeData | null;
  onClose: () => void;
  onLogToDiary?: (recipe: RecipeData) => Promise<void>;
  isLogging?: boolean;
  onToggleSave?: (recipe: RecipeData) => Promise<void>;
  isSaving?: boolean;
  currentUserId?: number | null;
  onDeleteRecipe?: (recipe: RecipeData) => Promise<void>;
  isDeleting?: boolean;
}

export default function RecipeDetailModal({
  recipe,
  onClose,
  onLogToDiary,
  isLogging = false,
  onToggleSave,
  isSaving = false,
  currentUserId,
  onDeleteRecipe,
  isDeleting = false,
}: RecipeDetailModalProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [diarySuccess, setDiarySuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!recipe) return null;

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

  const toggleCheck = (idx: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopyIngredients = () => {
    const text = `Daftar Belanja Resep ${recipe.title}:\n` + ingredientList.map((i) => `- ${i}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLog = async () => {
    if (onLogToDiary) {
      await onLogToDiary(recipe);
      setDiarySuccess(true);
      setTimeout(() => setDiarySuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
        {/* Top Action Buttons (Save/Bookmark & Close) */}
        <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(recipe)}
              disabled={isSaving}
              className={`rounded-full px-3.5 py-1.5 shadow-md transition backdrop-blur-md flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                recipe.isSaved
                  ? "bg-rose-500 text-white hover:bg-rose-600 ring-2 ring-rose-200"
                  : "bg-white/95 text-neutral-700 hover:bg-white hover:text-rose-500"
              }`}
              title={recipe.isSaved ? "Hapus dari Simpanan" : "Simpan Resep Favorit"}
            >
              <svg
                className={`w-4 h-4 ${recipe.isSaved ? "fill-white" : "fill-none stroke-current"}`}
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{recipe.isSaved ? "Tersimpan" : "Simpan Resep"}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="rounded-full bg-white/90 p-2 text-neutral-500 hover:bg-white hover:text-neutral-900 shadow-md transition backdrop-blur-md"
            title="Tutup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hero Image or Fallback Header */}
        <div className="relative -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6 h-56 sm:h-64 overflow-hidden rounded-t-3xl bg-neutral-900">
          {recipe.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="h-full w-full object-cover opacity-90"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 via-orange-950 to-neutral-900 text-white">
              <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badge Kategori & AI */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-2 text-white">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-600/90 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {recipe.category}
              </span>
              {recipe.isAiVerified && (
                <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white flex items-center gap-1">
                  ✓ Gizi Terverifikasi AI
                </span>
              )}
            </div>
            <span className="text-xs text-white/80">
              {recipe.cookTimeMinutes} mnt • {recipe.portions} porsi
            </span>
          </div>
        </div>

        {/* Title & Author */}
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            {recipe.title}
          </h2>
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              {recipe.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={recipe.user.image}
                  alt={recipe.user.name || "User"}
                  className="h-6 w-6 rounded-full border"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-[10px]">
                  {recipe.user?.name?.[0]?.toUpperCase() || "K"}
                </div>
              )}
              <span className="font-semibold text-neutral-700">
                {recipe.user?.name || "Komunitas DompetKost"}
              </span>
            </div>
            <div className="font-bold text-orange-600 text-sm">
              Estimasi Biaya: Rp {recipe.estimatedCost.toLocaleString("id-ID")}
            </div>
          </div>
          {recipe.description && (
            <p className="text-sm text-neutral-600 pt-1 leading-relaxed">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Gizi Hasil Verifikasi AI */}
        <div className="mb-6 rounded-2xl bg-neutral-50 p-4 border border-neutral-200/80">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Kandungan Nutrisi (per porsi)
            </h4>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Kalkulasi Standar AI
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            <div className="rounded-xl bg-white p-2.5 shadow-xs border border-neutral-200/60">
              <span className="text-[10px] text-neutral-400 font-bold block uppercase">Kalori</span>
              <span className="text-base sm:text-lg font-black text-neutral-900">{recipe.calories}</span>
              <span className="text-[9px] text-neutral-400 block">kkal</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 shadow-xs border border-neutral-200/60">
              <span className="text-[10px] text-neutral-400 font-bold block uppercase">Protein</span>
              <span className="text-base sm:text-lg font-black text-blue-600">{recipe.proteinG}g</span>
              <span className="text-[9px] text-neutral-400 block">protein</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 shadow-xs border border-neutral-200/60">
              <span className="text-[10px] text-neutral-400 font-bold block uppercase">Lemak</span>
              <span className="text-base sm:text-lg font-black text-amber-600">{recipe.fatG}g</span>
              <span className="text-[9px] text-neutral-400 block">lemak</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 shadow-xs border border-neutral-200/60">
              <span className="text-[10px] text-neutral-400 font-bold block uppercase">Karbo</span>
              <span className="text-base sm:text-lg font-black text-orange-600">{recipe.carbsG}g</span>
              <span className="text-[9px] text-neutral-400 block">karbo</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 shadow-xs border border-neutral-200/60">
              <span className="text-[10px] text-neutral-400 font-bold block uppercase">Serat</span>
              <span className="text-base sm:text-lg font-black text-emerald-600">{recipe.fiberG}g</span>
              <span className="text-[9px] text-neutral-400 block">serat</span>
            </div>
          </div>
          {recipe.aiFeedback && (
            <div className="mt-3 rounded-xl bg-amber-50/70 p-3 text-xs text-amber-900 border border-amber-200/70 italic flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>&ldquo;{recipe.aiFeedback}&rdquo;</span>
            </div>
          )}
        </div>

        {/* Bahan-Bahan */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-neutral-900">
              Bahan-Bahan ({ingredientList.length})
            </h4>
            <button
              onClick={handleCopyIngredients}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition flex items-center gap-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Disalin!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Salin Daftar Belanja</span>
                </>
              )}
            </button>
          </div>
          <div className="space-y-1.5 rounded-2xl border border-neutral-200/80 p-3 sm:p-4 bg-neutral-50/40">
            {ingredientList.map((item, idx) => (
              <label
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700 cursor-pointer select-none py-1 hover:text-neutral-900"
              >
                <input
                  type="checkbox"
                  checked={!!checkedIngredients[idx]}
                  onChange={() => toggleCheck(idx)}
                  className="mt-0.5 rounded border-neutral-300 text-orange-600 focus:ring-orange-400"
                />
                <span className={checkedIngredients[idx] ? "line-through text-neutral-400" : ""}>
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Langkah Memasak */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-neutral-900 mb-3">
            Langkah-Langkah Memasak
          </h4>
          <ol className="space-y-3">
            {stepList.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700 text-xs">
                  {idx + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition text-center"
            >
              Tutup
            </button>

            {/* Author Delete Button */}
            {recipe.userId && currentUserId === recipe.userId && onDeleteRecipe && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteRecipe(recipe);
                      setConfirmDelete(false);
                    }}
                    disabled={isDeleting}
                    className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
                  >
                    {isDeleting ? "Menghapus..." : "Ya, Hapus Resep"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-full bg-neutral-200 px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-300 transition"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition inline-flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Hapus Resep Saya</span>
                </button>
              )
            )}
          </div>

          {onLogToDiary && (
            <button
              type="button"
              onClick={handleLog}
              disabled={isLogging || diarySuccess}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-md transition active:scale-[0.98] ${
                diarySuccess
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              }`}
            >
              {isLogging ? (
                <span>Mencatat ke Diari...</span>
              ) : diarySuccess ? (
                <span>✓ Berhasil Dicatat ke Diari!</span>
              ) : (
                <span>+ Catat ke Diari Gizi Hari Ini</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

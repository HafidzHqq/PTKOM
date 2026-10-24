"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import UploadRecipeModal from "@/components/upload-recipe-modal";
import RecipeDetailModal, { RecipeData } from "@/components/recipe-detail-modal";
import RiceCookerHacks from "@/components/rice-cooker-hacks";

const CATEGORIES = [
  "Semua",
  "Lauk Hemat",
  "Rice Cooker",
  "Sayur & Sup",
  "Sarapan",
  "Camilan",
];

export default function RecipesPage() {
  const { user } = useAuth();

  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeTab, setActiveTab] = useState<"all" | "my_recipes" | "saved">("all");
  const [sortBy, setSortBy] = useState<"terbaru" | "termurah" | "protein-tertinggi">("terbaru");

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Action states
  const [savingId, setSavingId] = useState<number | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<RecipeData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipes");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecipes(json.data);
        if (json.currentUserId) {
          setCurrentUserId(json.currentUserId);
        }
      }
    } catch (e) {
      console.error("Gagal mengambil resep:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle Save / Bookmark
  const handleToggleSave = async (recipe: RecipeData) => {
    if (!user) {
      showToast("Silakan masuk/login terlebih dahulu untuk menyimpan resep favorit.");
      return;
    }

    setSavingId(recipe.id);
    const prevSaved = Boolean(recipe.isSaved);
    const nextSaved = !prevSaved;

    // Optimistic UI update
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === recipe.id
          ? {
              ...r,
              isSaved: nextSaved,
              saveCount: Math.max(0, (r.saveCount || 0) + (nextSaved ? 1 : -1)),
            }
          : r
      )
    );

    if (selectedRecipe && selectedRecipe.id === recipe.id) {
      setSelectedRecipe((prev) =>
        prev
          ? {
              ...prev,
              isSaved: nextSaved,
              saveCount: Math.max(0, (prev.saveCount || 0) + (nextSaved ? 1 : -1)),
            }
          : null
      );
    }

    try {
      const res = await fetch(`/api/recipes/${recipe.id}/save`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback on failure
        setRecipes((prev) =>
          prev.map((r) =>
            r.id === recipe.id
              ? {
                  ...r,
                  isSaved: prevSaved,
                  saveCount: Math.max(0, (r.saveCount || 0) + (prevSaved ? 1 : -1)),
                }
              : r
          )
        );
        showToast(data.message || "Gagal mengubah status simpan resep.");
      } else {
        showToast(data.message || (nextSaved ? "Resep berhasil disimpan!" : "Resep dihapus dari simpanan."));
      }
    } catch (err) {
      console.error("Gagal menyimpan resep:", err);
      showToast("Terjadi kendala koneksi saat menyimpan resep.");
    } finally {
      setSavingId(null);
    }
  };

  // Delete Recipe
  const confirmDeleteRecipe = async () => {
    if (!recipeToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/recipes/${recipeToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.message || "Gagal menghapus resep.");
      } else {
        showToast(`Resep "${recipeToDelete.title}" berhasil dihapus.`);
        setRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete.id));
        if (selectedRecipe && selectedRecipe.id === recipeToDelete.id) {
          setSelectedRecipe(null);
        }
      }
    } catch (err) {
      console.error("Gagal menghapus resep:", err);
      showToast("Terjadi kesalahan koneksi.");
    } finally {
      setIsDeleting(false);
      setRecipeToDelete(null);
    }
  };

  const handleLogToDiary = async (recipe: RecipeData) => {
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
        showToast("Gagal mencatat ke diari.");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan.");
    } finally {
      setIsLogging(false);
    }
  };

  const myRecipesCount = useMemo(() => {
    if (!currentUserId) return 0;
    return recipes.filter((r) => r.userId === currentUserId).length;
  }, [recipes, currentUserId]);

  const savedRecipesCount = useMemo(() => {
    return recipes.filter((r) => r.isSaved).length;
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes
      .filter((r) => {
        // Tab Filter
        if (activeTab === "my_recipes") {
          if (!currentUserId || r.userId !== currentUserId) return false;
        } else if (activeTab === "saved") {
          if (!r.isSaved) return false;
        }

        // Category Filter
        if (selectedCategory !== "Semua" && r.category !== selectedCategory) {
          return false;
        }

        // Search Filter
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const titleMatch = r.title.toLowerCase().includes(q);
          const descMatch = r.description?.toLowerCase().includes(q) || false;
          const ingMatch = r.ingredients.toLowerCase().includes(q);
          if (!titleMatch && !descMatch && !ingMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "termurah") {
          return a.estimatedCost - b.estimatedCost;
        }
        if (sortBy === "protein-tertinggi") {
          return b.proteinG - a.proteinG;
        }
        // terbaru
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [recipes, activeTab, currentUserId, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-neutral-50/60 pb-24 md:pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl bg-neutral-900 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <section className="border-b border-neutral-200/70 bg-white pt-8 pb-8 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800 mb-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Komunitas Resep Hemat & Bergizi</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              Daftar Resep Anak Kost
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-600 max-w-xl">
              Koleksi resep hemat, mudah dibuat di kost, dan dihitung gizinya secara otomatis oleh AI agar badan tetap bugar dompet tetap aman.
            </p>
          </div>

          {/* Action Buttons: Tanya AI & Upload */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/recipes/ask"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:from-amber-600 hover:to-orange-700 active:scale-[0.98] transition cursor-pointer"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>Tanya Chef AI</span>
            </Link>

            {user ? (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 active:scale-[0.98] transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Upload Resep</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-black active:scale-[0.98] transition"
              >
                <span>Masuk untuk Upload</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Tabs: Semua Resep | Resep Saya | Resep Tersimpan */}
      <div className="bg-white border-b border-neutral-200 w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-3.5 px-1 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Semua Resep ({recipes.length})
          </button>

          {user && (
            <>
              <button
                onClick={() => setActiveTab("my_recipes")}
                className={`py-3.5 px-1 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "my_recipes"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <span>Resep Saya</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    activeTab === "my_recipes"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {myRecipesCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("saved")}
                className={`py-3.5 px-1 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "saved"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <span>Resep Tersimpan</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    activeTab === "saved"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {savedRecipesCount}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari resep, bahan (cth: telur, ayam, mie)..."
              className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-neutral-500 font-semibold whitespace-nowrap">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 focus:border-orange-500 focus:outline-none"
            >
              <option value="terbaru">Terbaru</option>
              <option value="termurah">Biaya Termurah</option>
              <option value="protein-tertinggi">Protein Tertinggi</option>
            </select>
          </div>
        </div>

        {/* AI Chef Promo Card */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-orange-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-orange-600 shadow-xs shrink-0 border border-orange-200/60">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-neutral-900">
                  Bingung Masak Apa dari Sisa Bahan di Kost?
                </span>
                <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  Chef AI
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                Ketik bahan yang kamu punya (telur, sarden, mie, dsb.), Chef AI akan buatkan resep instan & hitung gizinya.
              </p>
            </div>
          </div>
          <Link
            href="/recipes/ask"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 px-4 py-2 text-xs font-bold text-white transition active:scale-[0.98] shrink-0 shadow-xs"
          >
            <span>Tanya Chef AI</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-6">
        {selectedCategory === "Rice Cooker" && (
          <div className="mb-10">
            <RiceCookerHacks />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <svg className="w-8 h-8 animate-spin text-orange-500 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p className="text-sm font-semibold">Memuat resep lezat...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 mb-4">
              {activeTab === "saved" ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              ) : activeTab === "my_recipes" ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              {activeTab === "saved"
                ? "Belum Ada Resep Tersimpan"
                : activeTab === "my_recipes"
                ? "Belum Ada Resep yang Kamu Upload"
                : "Resep Tidak Ditemukan"}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
              {activeTab === "saved"
                ? "Simpan resep favoritmu dengan menekan tombol hati agar mudah dibuka sewaktu-waktu."
                : activeTab === "my_recipes"
                ? "Kamu belum mengupload resep apapun. Ayo bagikan menu andalan kostmu sekarang!"
                : `Tidak ada resep yang cocok dengan kriteria pencarian.`}
            </p>
            {activeTab === "my_recipes" ? (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-orange-700 cursor-pointer"
              >
                + Upload Resep Pertama Kamu
              </button>
            ) : activeTab === "saved" ? (
              <button
                onClick={() => setActiveTab("all")}
                className="rounded-xl bg-neutral-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-neutral-800 cursor-pointer"
              >
                Jelajahi Semua Resep
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredRecipes.map((recipe) => {
              const isOwner = Boolean(currentUserId && recipe.userId === currentUserId);

              return (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="group flex flex-col rounded-3xl border border-neutral-200/80 bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  {/* Image & Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                    {recipe.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-amber-500/10 to-orange-500/20 text-orange-600">
                        <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}

                    {/* Badges Overlay */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
                        {recipe.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {recipe.isAiVerified && (
                          <span className="rounded-full bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                            ✓ AI
                          </span>
                        )}

                        {/* Save / Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(recipe);
                          }}
                          disabled={savingId === recipe.id}
                          className={`rounded-full p-2 shadow-md backdrop-blur-md transition cursor-pointer active:scale-95 ${
                            recipe.isSaved
                              ? "bg-rose-500 text-white hover:bg-rose-600 ring-2 ring-white/80"
                              : "bg-black/60 text-white/90 hover:bg-black/80 hover:text-white"
                          }`}
                          title={recipe.isSaved ? "Hapus dari Tersimpan" : "Simpan Resep"}
                        >
                          <svg
                            className={`w-4 h-4 ${recipe.isSaved ? "fill-white" : "fill-none stroke-current"}`}
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Cook time & Cost tag */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold pointer-events-none drop-shadow">
                      <span className="bg-neutral-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <svg className="w-3 h-3 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{recipe.cookTimeMinutes} mnt</span>
                      </span>
                      <span className="bg-orange-600/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white">
                        Rp {recipe.estimatedCost.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Author + Delete Button for Uploader */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {recipe.user?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={recipe.user.image}
                              alt={recipe.user.name || "User"}
                              className="h-5 w-5 rounded-full border border-neutral-200 shrink-0"
                            />
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-[9px] shrink-0">
                              {recipe.user?.name?.[0]?.toUpperCase() || "K"}
                            </div>
                          )}
                          <span className="text-[11px] font-medium text-neutral-500 truncate">
                            {recipe.user?.name || "Komunitas Kost"}
                            {isOwner && " (Kamu)"}
                          </span>
                        </div>

                        {/* Owner delete button on card */}
                        {isOwner && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRecipeToDelete(recipe);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/70 px-2 py-0.5 text-[10px] font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                            title="Hapus resep buatanmu"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-neutral-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-1">
                        {recipe.title}
                      </h3>

                      {recipe.description && (
                        <p className="text-xs text-neutral-500 line-clamp-2 mb-3">
                          {recipe.description}
                        </p>
                      )}
                    </div>

                    {/* Nutrition Highlights */}
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <div className="grid grid-cols-4 gap-1 text-center bg-neutral-50 rounded-xl p-2">
                        <div>
                          <span className="text-[9px] text-neutral-400 font-bold block uppercase">Kalori</span>
                          <span className="text-xs font-black text-neutral-900">{recipe.calories}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-400 font-bold block uppercase">Protein</span>
                          <span className="text-xs font-black text-blue-600">{recipe.proteinG}g</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-400 font-bold block uppercase">Karbo</span>
                          <span className="text-xs font-black text-orange-600">{recipe.carbsG}g</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-400 font-bold block uppercase">Lemak</span>
                          <span className="text-xs font-black text-amber-600">{recipe.fatG}g</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-orange-600 font-bold pt-1">
                        <span>Lihat Resep & Langkah</span>
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {recipeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              Hapus Resep Ini?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mb-6">
              Resep <strong className="text-neutral-900">&ldquo;{recipeToDelete.title}&rdquo;</strong> akan dihapus permanen dari sistem beserta data gizinya. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRecipeToDelete(null)}
                className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteRecipe}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Resep"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Recipe Modal */}
      <UploadRecipeModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          fetchRecipes();
          showToast("Resep berhasil diupload dan muncul di daftar!");
        }}
      />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onLogToDiary={handleLogToDiary}
        isLogging={isLogging}
        onToggleSave={handleToggleSave}
        isSaving={savingId === selectedRecipe?.id}
        currentUserId={currentUserId}
        onDeleteRecipe={async (r) => {
          setRecipeToDelete(r);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}

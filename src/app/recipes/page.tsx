"use client";

import React, { useState, useEffect, useMemo } from "react";
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

// Reusable Figma Chef AI Callout Card
function ChefAiCalloutCard() {
  return (
    <div
      data-layer="Chef AI callout"
      className="ChefAiCallout w-full self-stretch p-8 bg-orange-50 rounded-2xl outline outline-1 outline-offset-[-1px] outline-red-200 flex flex-col justify-between items-start gap-6 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
    >
      <div
        data-layer="Chef identity"
        className="ChefIdentity self-stretch inline-flex justify-between items-center overflow-hidden"
      >
        <div
          data-layer="Chef symbol"
          className="ChefSymbol size-14 bg-white rounded-2xl flex justify-center items-center overflow-hidden shadow-2xs"
        >
          <div data-svg-wrapper data-layer="chef-hat" className="ChefHat relative">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.99935 19.8323H6.99952M6.99952 19.8323H20.9993M6.99952 19.8323V17.0896C6.99952 16.5576 6.63085 16.1061 6.15135 15.8751C5.15941 15.401 4.3667 14.5919 3.91299 13.5905C3.45928 12.5891 3.3737 11.4596 3.67135 10.4012C3.969 9.34288 4.63075 8.42359 5.53994 7.80545C6.44913 7.1873 7.54736 6.91001 8.64102 7.02245C9.09163 5.97503 9.83933 5.08263 10.7917 4.4556C11.744 3.82856 12.8593 3.49438 13.9995 3.49438C15.1398 3.49438 16.255 3.82856 17.2073 4.4556C18.1597 5.08263 18.9074 5.97503 19.358 7.02245C20.4522 6.90922 21.5511 7.18612 22.461 7.80429C23.3708 8.42246 24.0331 9.34215 24.3308 10.4011C24.6286 11.46 24.5427 12.59 24.0884 13.5918C23.6341 14.5936 22.8405 15.4027 21.8477 15.8763C21.3682 16.1061 20.9995 16.5576 20.9995 17.0908V23.3325C20.9995 23.6419 20.8766 23.9386 20.6578 24.1574C20.439 24.3762 20.1423 24.4991 19.8328 24.4991H8.16618C7.85676 24.4991 7.56002 24.3762 7.34122 24.1574C7.12243 23.9386 6.99952 23.6419 6.99952 23.3325V19.8323Z"
                strokeWidth="1.7"
                strokeLinecap="round"
                stroke="#C65320"
              />
            </svg>
          </div>
        </div>
        <div
          data-layer="Service label"
          className="ServiceLabel justify-start text-orange-700 text-xs font-semibold font-['Inter'] tracking-wider"
        >
          CHEF AI
        </div>
      </div>

      <div
        data-layer="Chef introduction"
        className="ChefIntroduction self-stretch flex flex-col justify-start items-start gap-3 overflow-hidden"
      >
        <div
          data-layer="Title"
          className="Title self-stretch justify-start text-stone-800 text-3xl sm:text-4xl md:text-5xl font-normal font-['Instrument_Serif'] leading-[1.05]"
        >
          Bingung Masak Apa dari Sisa Bahan di Kost?
        </div>
        <div
          data-layer="Description"
          className="Description self-stretch justify-start text-stone-600 text-sm font-normal font-['Inter'] leading-6"
        >
          Ketik bahan yang kamu punya (telur, sarden, mie, dsb.), Chef AI akan buatkan resep instan & hitung gizinya.
        </div>
      </div>

      <div
        data-layer="Chef action"
        className="ChefAction self-stretch flex flex-col justify-start items-start gap-4 overflow-hidden"
      >
        <div
          data-layer="Ingredient illustration"
          className="IngredientIllustration self-stretch inline-flex justify-start items-start gap-2 overflow-hidden flex-wrap"
        >
          <div
            data-layer="Ingredient hint"
            className="IngredientHint px-3 py-1.5 rounded-[100px] outline outline-1 outline-offset-[-1px] outline-red-200 bg-white/70 flex justify-start items-start overflow-hidden"
          >
            <div
              data-layer="Ingredient"
              className="Ingredient justify-start text-orange-700 text-xs font-normal font-['Inter']"
            >
              telur
            </div>
          </div>
          <div
            data-layer="Ingredient hint"
            className="IngredientHint px-3 py-1.5 rounded-[100px] outline outline-1 outline-offset-[-1px] outline-red-200 bg-white/70 flex justify-start items-start overflow-hidden"
          >
            <div
              data-layer="Ingredient"
              className="Ingredient justify-start text-orange-700 text-xs font-normal font-['Inter']"
            >
              sarden
            </div>
          </div>
          <div
            data-layer="Ingredient hint"
            className="IngredientHint px-3 py-1.5 rounded-[100px] outline outline-1 outline-offset-[-1px] outline-red-200 bg-white/70 flex justify-start items-start overflow-hidden"
          >
            <div
              data-layer="Ingredient"
              className="Ingredient justify-start text-orange-700 text-xs font-normal font-['Inter']"
            >
              mie
            </div>
          </div>
        </div>

        <Link
          href="/recipes/ask"
          data-layer="Action"
          className="Action h-11 px-4 bg-orange-700 hover:bg-[#B34718] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-orange-700 inline-flex justify-center items-center gap-2 overflow-hidden transition active:scale-[0.98] shadow-xs cursor-pointer"
        >
          <div data-svg-wrapper data-layer="sparkles" className="Sparkles relative">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.0005 1.50085V3.0008M15.0005 3.0008V4.50074M15.0005 3.0008H16.5006M15.0005 3.0008H13.5004M8.26265 2.11166C8.29479 1.93962 8.38609 1.78424 8.52074 1.67242C8.6554 1.5606 8.82492 1.49939 8.99996 1.49939C9.175 1.49939 9.34452 1.5606 9.47917 1.67242C9.61383 1.78424 9.70513 1.93962 9.73727 2.11166L10.5256 6.28C10.5816 6.57635 10.7256 6.84894 10.9389 7.06219C11.1522 7.27545 11.4248 7.41947 11.7212 7.47545L15.89 8.26367C16.0621 8.2958 16.2175 8.38709 16.3293 8.52173C16.4411 8.65637 16.5024 8.82587 16.5024 9.00089C16.5024 9.17591 16.4411 9.34541 16.3293 9.48005C16.2175 9.61469 16.0621 9.70598 15.89 9.73811L11.7212 10.5263C11.4248 10.5823 11.1522 10.7263 10.9389 10.9396C10.7256 11.1528 10.5816 11.4254 10.5256 11.7218L9.73727 15.8901C9.70513 16.0622 9.61383 16.2175 9.47917 16.3294C9.34452 16.4412 9.175 16.5024 8.99996 16.5024C8.82492 16.5024 8.6554 16.4412 8.52074 16.3294C8.38609 16.2175 8.29479 16.0622 8.26265 15.8901L7.47434 11.7218C7.41835 11.4254 7.27431 11.1528 7.06103 10.9396C6.84775 10.7263 6.57512 10.5823 6.27874 10.5263L2.1099 9.73811C1.93784 9.70598 1.78244 9.61469 1.67061 9.48005C1.55878 9.34541 1.49756 9.17591 1.49756 9.00089C1.49756 8.82587 1.55878 8.65637 1.67061 8.52173C1.78244 8.38709 1.93784 8.2958 2.1099 8.26367L6.27874 7.47545C6.57512 7.41947 6.84775 7.27545 7.06103 7.06219C7.27431 6.84894 7.41835 6.57635 7.47434 6.28L8.26265 2.11166ZM4.49963 15.0003C4.49963 15.8287 3.828 16.5003 2.99951 16.5003C2.17102 16.5003 1.49939 15.8287 1.49939 15.0003C1.49939 14.1719 2.17102 13.5004 2.99951 13.5004C3.828 13.5004 4.49963 14.1719 4.49963 15.0003Z"
                strokeWidth="1.7"
                strokeLinecap="round"
                stroke="white"
              />
            </svg>
          </div>
          <div
            data-layer="Label"
            className="Label justify-start text-white text-xs font-semibold font-['Inter']"
          >
            Tanya Chef AI →
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const { user } = useAuth();

  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeTab, setActiveTab] = useState<"all" | "my_recipes" | "saved">("all");
  const [sortBy, setSortBy] = useState<"terbaru" | "termurah" | "protein-tertinggi" | "tercepat">("terbaru");

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
      setShowAuthModal(true);
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
      showToast("Terjadi kesalahan koneksi.");
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
        if (sortBy === "tercepat") {
          return a.cookTimeMinutes - b.cookTimeMinutes;
        }
        // terbaru
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [recipes, activeTab, currentUserId, selectedCategory, searchQuery, sortBy]);

  return (
    <div
      data-layer="Daftar Resep Anak Kost"
      className="DaftarResepAnakKost min-h-screen bg-[#F7F5F1] w-full text-stone-800 pb-24 md:pb-16"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl bg-stone-900 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl animate-fade-in flex items-center gap-2 border border-stone-700">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-20 pt-10 sm:pt-14 flex flex-col justify-start items-start gap-10 overflow-hidden">
        {/* Page header */}
        <div
          data-layer="Page header"
          className="PageHeader self-stretch flex flex-col justify-start items-start gap-4 overflow-hidden"
        >
          {/* Context Tag */}
          <div
            data-layer="Context"
            className="Context inline-flex justify-start items-center gap-2 overflow-hidden"
          >
            <div data-svg-wrapper data-layer="Accent mark" className="AccentMark">
              <svg width="18" height="2" viewBox="0 0 18 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="18" height="2" fill="#C65320" />
              </svg>
            </div>
            <div
              data-layer="Context label"
              className="ContextLabel justify-start text-orange-700 text-xs font-semibold font-['Inter'] tracking-[0.14em]"
            >
              DOMPETKOST / RESEP ANAK KOST
            </div>
          </div>

          {/* Introduction and actions */}
          <div
            data-layer="Introduction and actions"
            className="IntroductionAndActions self-stretch flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden"
          >
            <div
              data-layer="Introduction"
              className="Introduction max-w-3xl flex flex-col justify-start items-start gap-3 overflow-hidden"
            >
              <h1
                data-layer="Title"
                className="Title self-stretch justify-start text-stone-800 text-4xl sm:text-5xl md:text-6xl font-normal font-['Instrument_Serif'] leading-[1.05] tracking-tight"
              >
                Daftar Resep Anak Kost
              </h1>
              <p
                data-layer="Description"
                className="Description justify-start text-stone-500 text-sm font-normal font-['Inter'] leading-6"
              >
                Koleksi resep hemat, mudah dibuat di kost, dan dihitung gizinya secara otomatis oleh AI agar badan tetap bugar dompet tetap aman.
              </p>
            </div>

            {/* Action Buttons */}
            <div
              data-layer="Recipe actions"
              className="RecipeActions flex flex-wrap items-center gap-2.5 overflow-hidden shrink-0"
            >
              {/* Tanya Chef AI */}
              <Link
                href="/recipes/ask"
                data-layer="Action"
                className="Action h-11 px-4 bg-white rounded-[10px] outline outline-1 outline-offset-[-1px] outline-stone-200 hover:bg-stone-50 flex justify-center items-center gap-2 overflow-hidden transition active:scale-[0.98] shadow-xs cursor-pointer"
              >
                <div data-svg-wrapper data-layer="sparkles" className="Sparkles relative">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.0005 1.50086V3.0008M15.0005 3.0008V4.50074M15.0005 3.0008H16.5006M15.0005 3.0008H13.5004M8.26265 2.11167C8.29479 1.93963 8.38609 1.78424 8.52074 1.67243C8.6554 1.56061 8.82492 1.4994 8.99996 1.4994C9.175 1.4994 9.34452 1.56061 9.47917 1.67243C9.61383 1.78424 9.70513 1.93963 9.73727 2.11167L10.5256 6.28C10.5816 6.57635 10.7256 6.84895 10.9389 7.0622C11.1522 7.27546 11.4248 7.41948 11.7212 7.47546L15.89 8.26368C16.0621 8.29581 16.2175 8.3871 16.3293 8.52174C16.4411 8.65638 16.5024 8.82588 16.5024 9.0009C16.5024 9.17591 16.4411 9.34542 16.3293 9.48006C16.2175 9.61469 16.0621 9.70599 15.89 9.73812L11.7212 10.5263C11.4248 10.5823 11.1522 10.7263 10.9389 10.9396C10.7256 11.1529 10.5816 11.4254 10.5256 11.7218L9.73727 15.8901C9.70513 16.0622 9.61383 16.2176 9.47917 16.3294C9.34452 16.4412 9.175 16.5024 8.99996 16.5024C8.82492 16.5024 8.6554 16.4412 8.52074 16.3294C8.38609 16.2176 8.29479 16.0622 8.26265 15.8901L7.47434 11.7218C7.41835 11.4254 7.27431 11.1529 7.06103 10.9396C6.84775 10.7263 6.57512 10.5823 6.27874 10.5263L2.1099 9.73812C1.93784 9.70599 1.78244 9.61469 1.67061 9.48006C1.55878 9.34542 1.49756 9.17591 1.49756 9.0009C1.49756 8.82588 1.55878 8.65638 1.67061 8.52174C1.78244 8.3871 1.93784 8.29581 2.1099 8.26368L6.27874 7.47546C6.57512 7.41948 6.84775 7.27546 7.06103 7.0622C7.27431 6.84895 7.41835 6.57635 7.47434 6.28L8.26265 2.11167ZM4.49963 15.0003C4.49963 15.8287 3.828 16.5003 2.99951 16.5003C2.17102 16.5003 1.49939 15.8287 1.49939 15.0003C1.49939 14.1719 2.17102 13.5004 2.99951 13.5004C3.828 13.5004 4.49963 14.1719 4.49963 15.0003Z"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      stroke="#555149"
                    />
                  </svg>
                </div>
                <div
                  data-layer="Label"
                  className="Label justify-start text-stone-600 text-xs font-semibold font-['Inter']"
                >
                  Tanya Chef AI
                </div>
              </Link>

              {/* Upload Resep */}
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    setShowAuthModal(true);
                  } else {
                    setIsUploadOpen(true);
                  }
                }}
                data-layer="Action"
                className="Action h-11 px-4 bg-orange-700 hover:bg-[#B34718] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-orange-700 flex justify-center items-center gap-2 overflow-hidden transition active:scale-[0.98] shadow-xs cursor-pointer text-white"
              >
                <div data-svg-wrapper data-layer="plus" className="Plus relative">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.74951 9H9.00011M9.00011 9H14.2507M9.00011 9V3.7494M9.00011 9V14.2506"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      stroke="white"
                    />
                  </svg>
                </div>
                <div
                  data-layer="Label"
                  className="Label justify-start text-white text-xs font-semibold font-['Inter']"
                >
                  Upload Resep
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recipe browsing controls */}
        <div
          data-layer="Recipe browsing controls"
          className="RecipeBrowsingControls self-stretch flex flex-col justify-start items-start gap-6 overflow-hidden"
        >
          {/* Recipe collections tabs */}
          <div
            data-layer="Recipe collections"
            className="RecipeCollections self-stretch border-b border-stone-200 inline-flex justify-start items-start gap-7 overflow-x-auto scrollbar-none"
          >
            {/* Tab: Semua Resep */}
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              data-layer="Recipe tab"
              className={`RecipeTab h-12 px-1 border-b-2 flex justify-start items-center gap-2 overflow-hidden cursor-pointer transition ${
                activeTab === "all"
                  ? "border-orange-700"
                  : "border-transparent hover:border-stone-300"
              }`}
            >
              <div
                data-layer="Label"
                className={`Label justify-start text-sm font-semibold font-['Inter'] ${
                  activeTab === "all" ? "text-orange-700" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Semua Resep
              </div>
              <div
                data-layer="Count badge"
                className={`CountBadge px-1.5 py-[3px] rounded-[100px] flex justify-start items-start overflow-hidden ${
                  activeTab === "all" ? "bg-orange-50" : "bg-stone-200"
                }`}
              >
                <div
                  data-layer="Count"
                  className={`Count justify-start text-xs font-semibold font-['Inter'] ${
                    activeTab === "all" ? "text-orange-700" : "text-stone-500"
                  }`}
                >
                  {recipes.length}
                </div>
              </div>
            </button>

            {/* Tab: Resep Saya */}
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                } else {
                  setActiveTab("my_recipes");
                }
              }}
              data-layer="Recipe tab"
              className={`RecipeTab h-12 px-1 border-b-2 flex justify-start items-center gap-2 overflow-hidden cursor-pointer transition ${
                activeTab === "my_recipes"
                  ? "border-orange-700"
                  : "border-transparent hover:border-stone-300"
              }`}
            >
              <div
                data-layer="Label"
                className={`Label justify-start text-sm font-semibold font-['Inter'] ${
                  activeTab === "my_recipes" ? "text-orange-700" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Resep Saya
              </div>
              <div
                data-layer="Count badge"
                className={`CountBadge px-1.5 py-[3px] rounded-[100px] flex justify-start items-start overflow-hidden ${
                  activeTab === "my_recipes" ? "bg-orange-50" : "bg-stone-200"
                }`}
              >
                <div
                  data-layer="Count"
                  className={`Count justify-start text-xs font-semibold font-['Inter'] ${
                    activeTab === "my_recipes" ? "text-orange-700" : "text-stone-500"
                  }`}
                >
                  {myRecipesCount}
                </div>
              </div>
            </button>

            {/* Tab: Resep Tersimpan */}
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                } else {
                  setActiveTab("saved");
                }
              }}
              data-layer="Recipe tab"
              className={`RecipeTab h-12 px-1 border-b-2 flex justify-start items-center gap-2 overflow-hidden cursor-pointer transition ${
                activeTab === "saved"
                  ? "border-orange-700"
                  : "border-transparent hover:border-stone-300"
              }`}
            >
              <div
                data-layer="Label"
                className={`Label justify-start text-sm font-semibold font-['Inter'] ${
                  activeTab === "saved" ? "text-orange-700" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Resep Tersimpan
              </div>
              <div
                data-layer="Count badge"
                className={`CountBadge px-1.5 py-[3px] rounded-[100px] flex justify-start items-start overflow-hidden ${
                  activeTab === "saved" ? "bg-orange-50" : "bg-stone-200"
                }`}
              >
                <div
                  data-layer="Count"
                  className={`Count justify-start text-xs font-semibold font-['Inter'] ${
                    activeTab === "saved" ? "text-orange-700" : "text-stone-500"
                  }`}
                >
                  {savedRecipesCount}
                </div>
              </div>
            </button>
          </div>

          {/* Search and categories */}
          <div
            data-layer="Search and categories"
            className="SearchAndCategories self-stretch flex flex-col justify-start items-start gap-5 overflow-hidden w-full"
          >
            {/* Search Field */}
            <div
              data-layer="Search field"
              className="SearchField self-stretch h-12 px-4 bg-white rounded-[10px] outline outline-1 outline-offset-[-1px] outline-stone-200 inline-flex justify-start items-center gap-3 overflow-hidden focus-within:outline-orange-700 transition"
            >
              <div data-svg-wrapper data-layer="search" className="Search relative shrink-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.7501 15.7501L12.4951 12.4951M14.25 8.25C14.25 11.5637 11.5637 14.25 8.25 14.25C4.93629 14.25 2.25 11.5637 2.25 8.25C2.25 4.93629 4.93629 2.25 8.25 2.25C11.5637 2.25 14.25 4.93629 14.25 8.25Z"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    stroke="#77736B"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari resep, bahan (cth: telur, ayam, mie)..."
                className="w-full bg-transparent border-none text-stone-800 text-sm font-normal font-['Inter'] placeholder:text-stone-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-stone-400 hover:text-stone-700 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category filters */}
            <div
              data-layer="Category filters"
              className="CategoryFilters self-stretch inline-flex justify-start items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
            >
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    data-layer="Category filter"
                    className={`CategoryFilter h-9 px-4 rounded-[100px] outline outline-1 outline-offset-[-1px] flex justify-start items-center overflow-hidden whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? "bg-orange-700 outline-orange-700 text-white shadow-2xs"
                        : "bg-white outline-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <div
                      data-layer="Category"
                      className={`Category justify-start text-xs font-medium font-['Inter'] ${
                        isActive ? "text-white" : "text-stone-600"
                      }`}
                    >
                      {cat}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rice Cooker Hacks Banner when filter is Rice Cooker */}
        {selectedCategory === "Rice Cooker" && (
          <div className="w-full">
            <RiceCookerHacks />
          </div>
        )}

        {/* Recipe Collection Section */}
        <section
          data-layer="Recipe collection section"
          className="RecipeCollectionSection self-stretch flex flex-col justify-start items-start gap-6 overflow-hidden w-full"
        >
          {/* Section Header with Sort */}
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
            <div>
              <h2 className="text-stone-800 text-2xl sm:text-3xl font-normal font-['Instrument_Serif'] tracking-tight">
                {activeTab === "saved"
                  ? "Resep Tersimpan"
                  : activeTab === "my_recipes"
                  ? "Resep Unggahan Kamu"
                  : selectedCategory === "Semua"
                  ? "Koleksi Resep Pilihan"
                  : `Kategori: ${selectedCategory}`}
              </h2>
              <p className="text-xs text-stone-500 font-['Inter'] mt-1">
                Menampilkan {filteredRecipes.length} resep hemat & bergizi untuk anak kost
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-stone-500 font-medium font-['Inter'] whitespace-nowrap">
                Urutkan:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-3 rounded-[10px] bg-white outline outline-1 outline-offset-[-1px] outline-stone-200 text-xs font-medium font-['Inter'] text-stone-700 focus:outline-orange-700 transition cursor-pointer"
              >
                <option value="terbaru">Terbaru</option>
                <option value="termurah">Biaya Termurah</option>
                <option value="protein-tertinggi">Protein Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="w-full flex flex-col items-center justify-center py-24 text-stone-400 gap-3">
              <svg
                className="w-8 h-8 animate-spin text-orange-700"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <p className="text-sm font-medium font-['Inter'] text-stone-600">
                Memuat resep lezat...
              </p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            /* Empty State */
            <div className="w-full rounded-2xl bg-white outline outline-1 outline-offset-[-1px] outline-stone-200 p-12 text-center shadow-xs flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-700">
                {activeTab === "saved" ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ) : activeTab === "my_recipes" ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-xl font-normal font-['Instrument_Serif'] text-stone-800 mb-1">
                  {activeTab === "saved"
                    ? "Belum Ada Resep Tersimpan"
                    : activeTab === "my_recipes"
                    ? "Belum Ada Resep yang Kamu Upload"
                    : "Resep Tidak Ditemukan"}
                </h3>
                <p className="text-xs text-stone-500 font-['Inter'] max-w-sm mx-auto leading-relaxed">
                  {activeTab === "saved"
                    ? "Simpan resep favoritmu dengan menekan tombol hati agar mudah dibuka sewaktu-waktu."
                    : activeTab === "my_recipes"
                    ? "Kamu belum mengupload resep apapun. Ayo bagikan menu andalan kostmu sekarang!"
                    : "Tidak ada resep yang cocok dengan kriteria pencarian atau filter yang dipilih."}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                {activeTab === "my_recipes" ? (
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(true)}
                    className="h-10 px-5 bg-orange-700 hover:bg-[#B34718] text-white rounded-[10px] text-xs font-semibold font-['Inter'] transition shadow-xs cursor-pointer"
                  >
                    + Upload Resep Pertama Kamu
                  </button>
                ) : activeTab === "saved" ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className="h-10 px-5 bg-stone-800 hover:bg-stone-900 text-white rounded-[10px] text-xs font-semibold font-['Inter'] transition shadow-xs cursor-pointer"
                  >
                    Jelajahi Semua Resep
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("Semua");
                    }}
                    className="h-10 px-5 bg-stone-800 hover:bg-stone-900 text-white rounded-[10px] text-xs font-semibold font-['Inter'] transition shadow-xs cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Recipe Grid: 3 columns matching Figma */
            <div
              data-layer="Recipe grid"
              className="RecipeGrid self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
            >
              {filteredRecipes.map((recipe, index) => {
                const isOwner = Boolean(currentUserId && recipe.userId === currentUserId);

                return (
                  <React.Fragment key={recipe.id}>
                    {/* Render Chef AI Callout card at index 2 (slot 3) if in "all" tab */}
                    {activeTab === "all" && index === 2 && (
                      <ChefAiCalloutCard />
                    )}

                    {/* Recipe Card */}
                    <div
                      data-layer="Recipe card"
                      onClick={() => setSelectedRecipe(recipe)}
                      className="RecipeCard group bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-stone-200 overflow-hidden flex flex-col justify-start items-start transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                    >
                      {/* Media container */}
                      <div
                        data-layer="Media"
                        className="Media self-stretch h-52 relative overflow-hidden bg-stone-100"
                      >
                        {recipe.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 gap-2">
                            <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="text-[11px] font-medium font-['Inter'] text-stone-400">Resep Kost</span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <div className="flex items-center gap-1.5 pointer-events-auto">
                            <span className="h-6 px-2.5 rounded-[100px] bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-semibold font-['Inter'] flex items-center tracking-wider uppercase">
                              {recipe.category}
                            </span>
                            {recipe.isAiVerified && (
                              <span className="h-6 px-2 rounded-[100px] bg-emerald-700/85 backdrop-blur-md text-white text-[10px] font-semibold font-['Inter'] flex items-center gap-1">
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                AI
                              </span>
                            )}
                          </div>

                          {/* Heart / Bookmark Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSave(recipe);
                            }}
                            disabled={savingId === recipe.id}
                            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition cursor-pointer active:scale-90 pointer-events-auto shadow-sm ${
                              recipe.isSaved
                                ? "bg-rose-600 text-white"
                                : "bg-white/85 text-stone-700 hover:bg-white hover:text-rose-600"
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

                        {/* Bottom Overlay Badges: Cook Time & Cost */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold font-['Inter'] pointer-events-none">
                          <span className="h-6 px-2.5 rounded-[100px] bg-stone-900/80 backdrop-blur-md inline-flex items-center gap-1.5 shadow-sm">
                            <svg className="w-3 h-3 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{recipe.cookTimeMinutes} mnt</span>
                          </span>

                          <span className="h-6 px-2.5 rounded-[100px] bg-orange-700/90 backdrop-blur-md text-white font-semibold shadow-sm inline-flex items-center">
                            Rp {recipe.estimatedCost.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div
                        data-layer="Content"
                        className="Content self-stretch p-5 flex flex-col justify-between gap-4 flex-1"
                      >
                        <div className="flex flex-col gap-2">
                          {/* Author row & Owner delete */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {recipe.user?.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={recipe.user.image}
                                  alt={recipe.user.name || "User"}
                                  className="w-5 h-5 rounded-full border border-stone-200 shrink-0 object-cover"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-stone-200 text-stone-600 font-bold text-[9px] flex items-center justify-center shrink-0">
                                  {recipe.user?.name?.[0]?.toUpperCase() || "K"}
                                </div>
                              )}
                              <span className="text-[11px] font-medium font-['Inter'] text-stone-500 truncate">
                                {recipe.user?.name || "Komunitas Kost"}
                                {isOwner && " (Kamu)"}
                              </span>
                            </div>

                            {/* Owner delete action */}
                            {isOwner && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRecipeToDelete(recipe);
                                }}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold font-['Inter'] text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Hapus resep buatanmu"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Hapus</span>
                              </button>
                            )}
                          </div>

                          {/* Title */}
                          <h3
                            data-layer="Title"
                            className="Title text-stone-800 text-2xl font-normal font-['Instrument_Serif'] leading-tight line-clamp-1 group-hover:text-orange-700 transition-colors"
                          >
                            {recipe.title}
                          </h3>

                          {/* Description */}
                          {recipe.description && (
                            <p
                              data-layer="Description"
                              className="Description text-stone-500 text-xs font-normal font-['Inter'] line-clamp-2 leading-relaxed"
                            >
                              {recipe.description}
                            </p>
                          )}
                        </div>

                        {/* Nutrition Grid & Details CTA */}
                        <div className="pt-3 border-t border-stone-200/70 flex flex-col gap-3">
                          {/* Nutrition chips */}
                          <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-stone-50 text-center">
                            <div>
                              <div className="text-[9px] font-medium font-['Inter'] text-stone-400 uppercase tracking-wider">
                                Kalori
                              </div>
                              <div className="text-xs font-semibold font-['Inter'] text-stone-800">
                                {recipe.calories}
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] font-medium font-['Inter'] text-stone-400 uppercase tracking-wider">
                                Protein
                              </div>
                              <div className="text-xs font-semibold font-['Inter'] text-stone-800">
                                {recipe.proteinG}g
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] font-medium font-['Inter'] text-stone-400 uppercase tracking-wider">
                                Karbo
                              </div>
                              <div className="text-xs font-semibold font-['Inter'] text-stone-800">
                                {recipe.carbsG}g
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] font-medium font-['Inter'] text-stone-400 uppercase tracking-wider">
                                Lemak
                              </div>
                              <div className="text-xs font-semibold font-['Inter'] text-stone-800">
                                {recipe.fatG}g
                              </div>
                            </div>
                          </div>

                          {/* View details prompt */}
                          <div className="flex items-center justify-between text-xs font-semibold font-['Inter'] text-orange-700 pt-0.5">
                            <span>Lihat Resep & Langkah</span>
                            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {/* Render Chef AI Callout at end if recipes count is less than 3 */}
              {activeTab === "all" && filteredRecipes.length < 3 && (
                <ChefAiCalloutCard />
              )}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {recipeToDelete && (
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
              Resep <strong className="text-stone-900">&ldquo;{recipeToDelete.title}&rdquo;</strong> akan dihapus permanen dari sistem beserta data gizinya. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRecipeToDelete(null)}
                className="h-10 px-4 rounded-[10px] text-xs sm:text-sm font-semibold font-['Inter'] text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteRecipe}
                disabled={isDeleting}
                className="h-10 px-5 rounded-[10px] bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-semibold font-['Inter'] text-white shadow-xs transition cursor-pointer disabled:opacity-50"
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

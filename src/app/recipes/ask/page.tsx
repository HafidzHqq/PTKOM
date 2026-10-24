"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { GeneratedRecipe } from "@/lib/ai/askRecipe";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  recipe?: GeneratedRecipe | null;
  suggestions?: string[];
  isSaved?: boolean;
  savedRecipeId?: number;
}

const COMMON_INGREDIENTS = [
  "Telur",
  "Tahu",
  "Tempe",
  "Mie Instan",
  "Bawang Merah & Putih",
  "Cabai Rawit",
  "Kecap Manis",
  "Nasi Putih",
  "Sayur Bayam",
  "Sarden Kaleng",
  "Wortel",
  "Sosis",
];

const PROMPT_SUGGESTIONS = [
  {
    title: "Rice Cooker 1 Panci",
    prompt: "Buatkan resep nasi liwet atau masakan 1 panci komplit pakai rice cooker hemat di bawah Rp 15.000",
  },
  {
    title: "Tinggi Protein Hemat",
    prompt: "Rekomendasikan menu tinggi protein (> 20g) dari telur dan tahu/tempe dengan budget super irit",
  },
  {
    title: "Sarapan Kilat 10 Menit",
    prompt: "Ide sarapan bergizi yang bisa dimasak cepat dalam 10 menit sebelum kuliah/kerja",
  },
  {
    title: "Kreasi Sarden / Kornet",
    prompt: "Cara mengolah sarden kaleng atau kornet biar gak amis, kuahnya gurih, dan tambah sayuran",
  },
  {
    title: "Sup Segar Tanggal Tua",
    prompt: "Resep sayur sup bening hangat dan bergizi dengan modal di bawah Rp 10.000",
  },
];

export default function AskRecipePage() {
  const { user } = useAuth();

  // Mode: "pantry" (form bahan) vs "chat" (tanya bebas)
  const [mode, setMode] = useState<"pantry" | "chat">("pantry");

  // Pantry Form State
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [cookingTool, setCookingTool] = useState("Rice Cooker");
  const [budgetLimit, setBudgetLimit] = useState<number>(15000);
  const [dietaryGoal, setDietaryGoal] = useState("Tinggi Protein & Hemat");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Per-recipe action states
  const [savingRecipeTitle, setSavingRecipeTitle] = useState<string | null>(null);
  const [loggingRecipeTitle, setLoggingRecipeTitle] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  // Initial greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          role: "assistant",
          text: `Halo ${user?.name ? user.name.split(" ")[0] : "Sobat Kost"}! Aku **Chef Kost AI**, asisten memasak pintarmu.
          
Punya bahan sisa apa saja di kamar kost? Atau mau masak hemat dengan rice cooker? 
Pilih tab **"Racik dari Bahan di Kost"** atau langsung ketik apa yang ingin kamu masak di bawah!`,
          suggestions: [
            "Punya telur dan kecap, bisa buat apa?",
            "Resep rice cooker praktis 1 panci",
            "Menu hemat berprotein tinggi di bawah 15rb",
          ],
        },
      ]);
    }
  }, [user]);

  // Add quick ingredient chip to input
  const handleAddIngredient = (item: string) => {
    setIngredientsInput((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return item;
      const lowerArr = trimmed.split(",").map((s) => s.trim().toLowerCase());
      if (lowerArr.includes(item.toLowerCase())) return prev;
      return `${trimmed}, ${item}`;
    });
  };

  // Submit Request to AI
  const handleAsk = async (customPrompt?: string) => {
    const promptToSend = customPrompt || (mode === "chat" ? inputValue : `Buatkan resep lezat dari bahan yang tersedia`);
    if (!promptToSend.trim() && mode === "chat") return;

    const userMessageText =
      mode === "pantry" && !customPrompt
        ? `Tolong buatkan resep dengan bahan: ${ingredientsInput || "Bahan umum kost"}, alat: ${cookingTool}, budget: ${
            budgetLimit === 0 ? "Bahan yang ada saja (Rp 0)" : `Maksimal Rp ${budgetLimit.toLocaleString("id-ID")}`
          }, fokus: ${dietaryGoal}.`
        : promptToSend;

    // Add user message to UI
    const userMsgId = `user-${Date.now()}`;
    const newHistory = [
      ...messages,
      {
        id: userMsgId,
        role: "user" as const,
        text: userMessageText,
      },
    ];

    setMessages(newHistory);
    if (mode === "chat") setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/recipes/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          ingredients: mode === "pantry" ? ingredientsInput : undefined,
          budget: mode === "pantry" ? budgetLimit : undefined,
          cookingTool: mode === "pantry" ? cookingTool : undefined,
          dietaryGoal: mode === "pantry" ? dietaryGoal : undefined,
          history: newHistory.slice(-6).map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.message || "Gagal mendapatkan respon dari Chef AI.");
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "assistant",
            text: "Maaf Sobat Kost, Chef AI sedang sibuk meracik bumbu di dapur. Boleh coba tanyakan sekali lagi?",
          },
        ]);
      } else {
        const { replyText, recipe, suggestions } = json.data;
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "assistant",
            text: replyText,
            recipe: recipe || null,
            suggestions: suggestions || [],
          },
        ]);
      }
    } catch (err) {
      console.error("Ask Recipe error:", err);
      showToast("Terjadi kendala jaringan saat menghubungi Chef AI.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save AI Recipe directly to database catalog
  const handleSaveToCatalog = async (recipe: GeneratedRecipe, messageId: string) => {
    if (!user) {
      showToast("Silakan masuk/login terlebih dahulu untuk menyimpan resep ke katalogmu.");
      return;
    }

    setSavingRecipeTitle(recipe.title);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: recipe.title,
          description: recipe.description,
          category: recipe.category || "Lauk Hemat",
          cookTimeMinutes: recipe.cookTimeMinutes || 15,
          portions: recipe.portions || 1,
          estimatedCost: recipe.estimatedCost || 12000,
          ingredients: JSON.stringify(recipe.ingredients),
          steps: JSON.stringify(recipe.steps),
          calories: recipe.nutrition.calories,
          proteinG: recipe.nutrition.protein_g,
          fatG: recipe.nutrition.fat_g,
          carbsG: recipe.nutrition.carbs_g,
          fiberG: recipe.nutrition.fiber_g,
          aiFeedback: `${recipe.chefTips} (Dibuat otomatis oleh Chef Kost AI)`,
          isAiVerified: true,
        }),
      });

      const json = await res.json();
      if (res.status === 409 || json.is_duplicate) {
        showToast(`Resep "${recipe.title}" sudah ada di database resep!`);
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, isSaved: true } : m))
        );
      } else if (!res.ok || !json.success) {
        showToast(json.message || "Gagal menyimpan resep ke database.");
      } else {
        showToast(`Resep "${recipe.title}" berhasil disimpan ke Daftar Resep!`);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, isSaved: true, savedRecipeId: json.data?.id }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Save recipe error:", err);
      showToast("Terjadi kesalahan koneksi saat menyimpan resep.");
    } finally {
      setSavingRecipeTitle(null);
    }
  };

  // Log recipe to today's nutrition diary
  const handleLogToDiary = async (recipe: GeneratedRecipe) => {
    if (!user) {
      showToast("Silakan login untuk mencatat ke Diari Gizi.");
      return;
    }

    setLoggingRecipeTitle(recipe.title);
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
                calories: recipe.nutrition.calories,
                protein_g: recipe.nutrition.protein_g,
                fat_g: recipe.nutrition.fat_g,
                carbs_g: recipe.nutrition.carbs_g,
                fiber_g: recipe.nutrition.fiber_g,
              },
            },
          ],
          calories: recipe.nutrition.calories,
          protein_g: recipe.nutrition.protein_g,
          fat_g: recipe.nutrition.fat_g,
          carbs_g: recipe.nutrition.carbs_g,
          fiber_g: recipe.nutrition.fiber_g,
        }),
      });

      if (res.ok) {
        showToast(`Berhasil mencatat "${recipe.title}" ke Diari Gizi hari ini!`);
      } else {
        showToast("Gagal mencatat ke Diari Gizi.");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kendala saat mencatat ke Diari.");
    } finally {
      setLoggingRecipeTitle(null);
    }
  };

  // Copy full recipe to clipboard
  const handleCopyRecipe = (recipe: GeneratedRecipe) => {
    const text = `*${recipe.title}*
_${recipe.description}_

Waktu: ${recipe.cookTimeMinutes} menit | Porsi: ${recipe.portions} orang
Perkiraan Biaya: Rp ${recipe.estimatedCost.toLocaleString("id-ID")}
Alat: ${recipe.cookingTool}

*Nilai Gizi*:
• Kalori: ${recipe.nutrition.calories} kcal
• Protein: ${recipe.nutrition.protein_g}g
• Lemak: ${recipe.nutrition.fat_g}g
• Karbohidrat: ${recipe.nutrition.carbs_g}g
• Serat: ${recipe.nutrition.fiber_g}g

*Bahan-bahan*:
${recipe.ingredients.map((ing) => `• ${ing}`).join("\n")}

*Langkah Memasak*:
${recipe.steps.map((st, i) => `${i + 1}. ${st}`).join("\n")}

*Tips Chef AI*:
${recipe.chefTips}

_Dibuat dengan Chef AI DompetKost_`;

    navigator.clipboard.writeText(text);
    setCopiedTitle(recipe.title);
    showToast("Resep berhasil disalin ke clipboard!");
    setTimeout(() => setCopiedTitle(null), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-50/70 pb-24 md:pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl bg-neutral-900 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <section className="border-b border-neutral-200/70 bg-white pt-6 pb-6 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full">
        <div className="w-full">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
            <Link href="/dashboard" className="hover:text-neutral-900 transition">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/recipes" className="hover:text-neutral-900 transition">
              Daftar Resep
            </Link>
            <span>/</span>
            <span className="font-semibold text-orange-600">Tanya Chef AI</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/60 px-3 py-1 text-xs font-bold text-orange-800 mb-2">
                <svg className="w-3.5 h-3.5 text-orange-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Asisten Koki & Ahli Gizi Anak Kost</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                <span>Tanya Resep ke Chef AI</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 max-w-2xl">
                Bingung mau masak apa dengan bahan seadanya di kamar kost? Minta Chef AI racikkan resep lezat, pas di kantong, dan terhitung nilai gizinya!
              </p>
            </div>

            <Link
              href="/recipes"
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition shadow-2xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Kembali ke Katalog Resep</span>
            </Link>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-6 flex items-center gap-2 p-1.5 bg-neutral-100 rounded-full w-full sm:w-fit border border-neutral-200/60 shadow-2xs">
            <button
              onClick={() => setMode("pantry")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
                mode === "pantry"
                  ? "bg-white text-orange-700 shadow-2xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Racik dari Bahan di Kost</span>
            </button>
            <button
              onClick={() => setMode("chat")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
                mode === "chat"
                  ? "bg-white text-orange-700 shadow-2xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Tanya Bebas / Konsultasi</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input Panel (Pantry or Prompt Suggestions) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {mode === "pantry" ? (
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm flex flex-col gap-5 sticky top-24">
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span>Bahan & Kondisi Memasak</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Masukkan bahan yang kamu punya, Chef AI akan meracik resep yang cocok.
                  </p>
                </div>

                {/* Ingredients Input */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Bahan-Bahan yang Kamu Punya:
                  </label>
                  <textarea
                    rows={3}
                    value={ingredientsInput}
                    onChange={(e) => setIngredientsInput(e.target.value)}
                    placeholder="Contoh: 2 butir telur, tahu putih, sedikit daun bawang, kecap..."
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 p-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition resize-none"
                  />

                  {/* Quick Click Badges */}
                  <div className="mt-2.5">
                    <p className="text-[11px] font-semibold text-neutral-400 mb-1.5">
                      Klik cepat untuk menambahkan:
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {COMMON_INGREDIENTS.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleAddIngredient(item)}
                          className="rounded-lg bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-orange-100 hover:text-orange-700 transition cursor-pointer"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cooking Equipment */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Alat Masak Tersedia:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Rice Cooker" },
                      { label: "Wajan / Teflon" },
                      { label: "Panci Rebus" },
                      { label: "Air Panas Saja" },
                    ].map((tool) => (
                      <button
                        key={tool.label}
                        type="button"
                        onClick={() => setCookingTool(tool.label)}
                        className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                          cookingTool === tool.label
                            ? "border-orange-500 bg-orange-50/70 text-orange-800"
                            : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
                        }`}
                      >
                        <span>{tool.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-neutral-700">Budget Belanja Tambahan:</span>
                    <span className="font-black text-orange-600">
                      {budgetLimit === 0 ? "Bahan Ada (Rp 0)" : `≤ Rp ${budgetLimit.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { val: 0, label: "Rp 0" },
                      { val: 10000, label: "< 10rb" },
                      { val: 15000, label: "< 15rb" },
                      { val: 25000, label: "< 25rb" },
                    ].map((b) => (
                      <button
                        key={b.val}
                        type="button"
                        onClick={() => setBudgetLimit(b.val)}
                        className={`py-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                          budgetLimit === b.val
                            ? "border-orange-500 bg-orange-600 text-white"
                            : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Goal */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Target & Preferensi:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "Tinggi Protein" },
                      { label: "Super Hemat" },
                      { label: "Cepat < 15 mnt" },
                      { label: "Rendah Lemak" },
                    ].map((goal) => (
                      <button
                        key={goal.label}
                        type="button"
                        onClick={() => setDietaryGoal(goal.label)}
                        className={`flex items-center justify-center p-2 rounded-xl border text-[11px] font-bold transition cursor-pointer text-center ${
                          dietaryGoal === goal.label
                            ? "border-amber-500 bg-amber-50 text-amber-900"
                            : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                        }`}
                      >
                        <span>{goal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleAsk()}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 py-3.5 px-4 text-sm font-bold text-white shadow-md hover:from-orange-600 hover:to-amber-700 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Chef AI Sedang Meracik...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Racik Resep Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Chat Mode: Suggestions & Quick Questions */
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm flex flex-col gap-4 sticky top-24">
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Inspirasi Tanya Chef AI</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Klik salah satu ide cepat di bawah untuk langsung menanyakan ke Chef AI:
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {PROMPT_SUGGESTIONS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleAsk(item.prompt)}
                      className="group flex items-start gap-3 rounded-2xl border border-neutral-200/90 bg-neutral-50/50 p-3 text-left transition hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-neutral-900 group-hover:text-orange-700 transition">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                          {item.prompt}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl bg-amber-50/70 border border-amber-200/60 p-3.5 mt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Tips Bertanya</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                    Kamu bisa tanya apa saja: takaran bumbu, cara rebus telur agar mudah dikupas, tips simpan tempe tahan 1 minggu, atau variasi saus hemat.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Chat & Generated Recipe Stream */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-4 sm:p-6 flex flex-col min-h-[580px]">
              {/* Conversation Area */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Role Tag & Avatar */}
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      {msg.role === "assistant" ? (
                        <>
                          <div className="h-6 w-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <span className="text-xs font-bold text-neutral-800">
                            Chef Kost AI
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-neutral-500">
                            Kamu
                          </span>
                          <div className="h-6 w-6 rounded-full bg-neutral-800 text-white flex items-center justify-center text-xs font-bold">
                            {user?.name ? user.name[0].toUpperCase() : "U"}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed max-w-[90%] sm:max-w-[85%] ${
                        msg.role === "user"
                          ? "bg-neutral-900 text-white rounded-tr-xs"
                          : "bg-neutral-100 text-neutral-800 rounded-tl-xs whitespace-pre-line"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Generated Recipe Card (if present) */}
                    {msg.recipe && (
                      <div className="w-full mt-4 rounded-3xl border border-orange-200 bg-gradient-to-b from-orange-50/40 via-white to-white p-4 sm:p-6 shadow-md">
                        {/* Header Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-lg bg-orange-600 px-2.5 py-1 text-[11px] font-extrabold text-white">
                              {msg.recipe.category}
                            </span>
                            <span className="rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-900 flex items-center gap-1">
                              <span>{msg.recipe.cookingTool}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-bold text-neutral-600">
                            <span className="flex items-center gap-1">
                              <span>{msg.recipe.cookTimeMinutes} mnt</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span>{msg.recipe.portions} porsi</span>
                            </span>
                            <span className="text-orange-700 font-extrabold bg-orange-100/80 px-2.5 py-0.5 rounded-lg">
                              ± Rp {msg.recipe.estimatedCost.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="mt-3">
                          <h3 className="text-lg sm:text-xl font-black text-neutral-900">
                            {msg.recipe.title}
                          </h3>
                          <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                            {msg.recipe.description}
                          </p>
                        </div>

                        {/* Health Tags */}
                        {msg.recipe.healthTags && msg.recipe.healthTags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {msg.recipe.healthTags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Nutrition Grid */}
                        <div className="mt-4 rounded-2xl bg-neutral-900 text-white p-3 sm:p-4">
                          <div className="flex items-center justify-between text-xs font-bold mb-2">
                            <span className="text-neutral-300">Estimasi Kandungan Gizi AI:</span>
                            <span className="text-orange-400 font-black">
                              {msg.recipe.nutrition.calories} kkal
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                            <div className="bg-neutral-800/80 rounded-xl p-2 border border-neutral-700/50">
                              <span className="block text-neutral-400 text-[10px]">Protein</span>
                              <span className="font-bold text-amber-400 text-xs sm:text-sm">
                                {msg.recipe.nutrition.protein_g}g
                              </span>
                            </div>
                            <div className="bg-neutral-800/80 rounded-xl p-2 border border-neutral-700/50">
                              <span className="block text-neutral-400 text-[10px]">Lemak</span>
                              <span className="font-bold text-rose-400 text-xs sm:text-sm">
                                {msg.recipe.nutrition.fat_g}g
                              </span>
                            </div>
                            <div className="bg-neutral-800/80 rounded-xl p-2 border border-neutral-700/50">
                              <span className="block text-neutral-400 text-[10px]">Karbo</span>
                              <span className="font-bold text-sky-400 text-xs sm:text-sm">
                                {msg.recipe.nutrition.carbs_g}g
                              </span>
                            </div>
                            <div className="bg-neutral-800/80 rounded-xl p-2 border border-neutral-700/50">
                              <span className="block text-neutral-400 text-[10px]">Serat</span>
                              <span className="font-bold text-emerald-400 text-xs sm:text-sm">
                                {msg.recipe.nutrition.fiber_g}g
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ingredients */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                              Bahan-Bahan & Perkiraan Harga:
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                const list = msg.recipe?.ingredients.join("\n") || "";
                                navigator.clipboard.writeText(list);
                                showToast("Daftar bahan disalin ke clipboard!");
                              }}
                              className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span>Salin Bahan</span>
                            </button>
                          </div>
                          <ul className="space-y-1.5 bg-neutral-50/70 rounded-2xl p-3 border border-neutral-200/60 text-xs text-neutral-800">
                            {msg.recipe.ingredients.map((ing, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-orange-500 font-bold">•</span>
                                <span className="flex-1">{ing}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Steps */}
                        <div className="mt-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 mb-2">
                            Langkah Memasak:
                          </h4>
                          <ol className="space-y-2">
                            {msg.recipe.steps.map((step, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2.5 text-xs text-neutral-700 leading-relaxed"
                              >
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-black text-orange-800">
                                  {i + 1}
                                </span>
                                <span className="pt-0.5">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Chef Tips */}
                        {msg.recipe.chefTips && (
                          <div className="mt-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-3 flex items-start gap-2.5">
                            <svg className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <div>
                              <span className="block text-[11px] font-bold text-amber-900">
                                Tips Hemat Chef AI:
                              </span>
                              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                                {msg.recipe.chefTips}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons: Simpan ke Katalog, Catat ke Diari, Salin */}
                        <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-2">
                          {/* Simpan ke Resep */}
                          {msg.isSaved ? (
                            <Link
                              href="/recipes"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition"
                            >
                              <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Tersimpan di Katalog Resep</span>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              disabled={savingRecipeTitle === msg.recipe.title}
                              onClick={() => handleSaveToCatalog(msg.recipe!, msg.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-700 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                            >
                              {savingRecipeTitle === msg.recipe.title ? (
                                <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              )}
                              <span>Simpan ke Resep Saya</span>
                            </button>
                          )}

                          {/* Catat ke Diari */}
                          <button
                            type="button"
                            disabled={loggingRecipeTitle === msg.recipe.title}
                            onClick={() => handleLogToDiary(msg.recipe!)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                          >
                            {loggingRecipeTitle === msg.recipe.title ? (
                              <div className="h-3 w-3 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                            )}
                            <span>Catat ke Diari Gizi</span>
                          </button>

                          {/* Salin Seluruh Resep */}
                          <button
                            type="button"
                            onClick={() => handleCopyRecipe(msg.recipe!)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>{copiedTitle === msg.recipe.title ? "Tersalin!" : "Salin Resep"}</span>
                          </button>

                          {/* Variasi Lain */}
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              handleAsk(
                                `Buatkan alternatif atau variasi menu lain yang berbeda dari "${msg.recipe?.title}" dengan bahan serupa.`
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl text-xs font-bold text-orange-600 hover:text-orange-700 py-2 px-2 hover:bg-orange-50 transition cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Minta Variasi Lain</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Follow-up Suggestion Chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 self-start">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleAsk(sug)}
                            className="rounded-full border border-orange-200/80 bg-orange-50/60 px-3.5 py-1.5 text-[11px] font-semibold text-orange-800 hover:bg-orange-100 hover:border-orange-300 transition cursor-pointer disabled:opacity-50"
                          >
                            &ldquo;{sug}&rdquo;
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="rounded-2xl rounded-tl-xs bg-neutral-100 px-4 py-3 text-xs text-neutral-600 flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 bg-orange-600 rounded-full animate-bounce"></span>
                      </div>
                      <span>Chef AI sedang meracik resep & menghitung nilai gizinya...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAsk();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Tanya resep, tips masak, atau bahan pengganti..."
                    disabled={isLoading}
                    className="flex-1 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white hover:bg-orange-700 active:scale-95 transition disabled:opacity-40 cursor-pointer shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
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
  "Bawang Merah",
  "Bawang Putih",
  "Cabai",
  "Nasi Dingin",
  "Mie Instan",
  "Kangkung",
  "Wortel",
  "Kecap",
  "Kornet",
];

const COOKING_TOOLS = [
  { id: "Rice Cooker", label: "Rice Cooker", desc: "Kukus & rebus serbaguna" },
  { id: "Wajan / Teflon", label: "Wajan / Teflon", desc: "Goreng, tumis & oseng" },
  { id: "Panci Rebus", label: "Panci Rebus", desc: "Sup, rebusan & kuah" },
  { id: "Air Panas Saja", label: "Air Panas Saja", desc: "Tanpa kompor / no cook" },
];

const BUDGET_OPTIONS = [
  { value: 0, label: "Rp 0 (Bahan ada saja)", short: "Rp 0" },
  { value: 10000, label: "≤ Rp 10.000", short: "≤10rb" },
  { value: 15000, label: "≤ Rp 15.000", short: "≤15rb" },
  { value: 25000, label: "≤ Rp 25.000", short: "≤25rb" },
];

const DIETARY_GOALS = [
  { id: "Tinggi Protein", label: "Tinggi Protein", emoji: "💪" },
  { id: "Super Hemat", label: "Super Hemat", emoji: "🪙" },
  { id: "Cepat (< 15 menit)", label: "Cepat <15 mnt", emoji: "⚡" },
  { id: "Rendah Lemak", label: "Rendah Lemak", emoji: "🥗" },
];

const CHAT_PROMPTS = [
  "Resep olahan nasi dingin + telur selain nasi goreng biasa",
  "Ide makan malam modal tempe & kecap < 10 menit",
  "Cara bikin kuah ramen enak pakai bumbu kost sederhana",
  "Gimana cara masak ayam suwir awet 3 hari di kost?",
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

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome-1",
  role: "assistant",
  text: "Halo Sobat Kost! Mau masak apa hari ini? Masukkan bahan yang kamu punya di sebelah kiri atau ketik pertanyaan langsung di bawah. Aku siap carikan resep sehat, lezat, dan tetap ramah kantong kost!",
  suggestions: [
    "Punya telur dan kecap, bisa buat apa?",
    "Resep rice cooker praktis 1 panci",
    "Menu hemat berprotein tinggi di bawah 15rb",
  ],
};

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
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Per-recipe action states
  const [savingRecipeTitle, setSavingRecipeTitle] = useState<string | null>(null);
  const [loggingRecipeTitle, setLoggingRecipeTitle] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Update greeting with user's name when authenticated
  useEffect(() => {
    if (user?.name) {
      const firstName = user.name.split(" ")[0] || "Sobat Kost";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "welcome-1"
            ? {
                ...m,
                text: `Halo ${firstName}! Mau masak apa hari ini? Masukkan bahan yang kamu punya di sebelah kiri atau ketik pertanyaan langsung di bawah. Aku siap carikan resep sehat, lezat, dan tetap ramah kantong kost!`,
              }
            : m
        )
      );
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

  // Helper to send query to Chef AI
  const sendRequestToAI = async ({
    userDisplayText,
    promptToSend,
    ingredients,
    budget,
    cookingToolVal,
    dietaryGoalVal,
  }: {
    userDisplayText: string;
    promptToSend: string;
    ingredients?: string;
    budget?: number;
    cookingToolVal?: string;
    dietaryGoalVal?: string;
  }) => {
    if (isLoading) return;

    // Add user message to UI
    const userMsgId = `user-${Date.now()}`;
    const newHistory = [
      ...messages,
      {
        id: userMsgId,
        role: "user" as const,
        text: userDisplayText,
      },
    ];

    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch("/api/recipes/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          ingredients: ingredients || undefined,
          budget: budget !== undefined ? budget : undefined,
          cookingTool: cookingToolVal || undefined,
          dietaryGoal: dietaryGoalVal || undefined,
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

  // Submit from bottom chat input bar
  const handleChatSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    if (!query || isLoading) return;

    setInputValue("");
    sendRequestToAI({
      userDisplayText: query,
      promptToSend: query,
      ingredients: ingredientsInput.trim() || undefined,
      budget: budgetLimit,
      cookingToolVal: cookingTool,
      dietaryGoalVal: dietaryGoal,
    });
  };

  // Submit from left pantry form ("Racik Resep Sekarang")
  const handlePantrySubmit = () => {
    if (isLoading) return;
    const userText = `Tolong buatkan resep dengan bahan: ${ingredientsInput.trim() || "Bahan umum kost"}, alat: ${cookingTool}, budget: ${
      budgetLimit === 0 ? "Bahan yang ada saja (Rp 0)" : `Maksimal Rp ${budgetLimit.toLocaleString("id-ID")}`
    }, fokus: ${dietaryGoal}.`;

    sendRequestToAI({
      userDisplayText: userText,
      promptToSend: `Buatkan resep lezat dan bergizi dari bahan ${ingredientsInput.trim() || "seadanya di kost"} dengan alat ${cookingTool}`,
      ingredients: ingredientsInput.trim() || "Bahan umum kost",
      budget: budgetLimit,
      cookingToolVal: cookingTool,
      dietaryGoalVal: dietaryGoal,
    });
  };

  // Submit predefined prompt suggestion or chip
  const handlePromptSuggestion = (prompt: string) => {
    if (isLoading) return;
    sendRequestToAI({
      userDisplayText: prompt,
      promptToSend: prompt,
      ingredients: ingredientsInput.trim() || undefined,
      budget: budgetLimit,
      cookingToolVal: cookingTool,
      dietaryGoalVal: dietaryGoal,
    });
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
          total_nutrition: {
            calories: recipe.nutrition.calories,
            protein_g: recipe.nutrition.protein_g,
            fat_g: recipe.nutrition.fat_g,
            carbs_g: recipe.nutrition.carbs_g,
            fiber_g: recipe.nutrition.fiber_g,
          },
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

  const selectedBudgetLabel =
    BUDGET_OPTIONS.find((b) => b.value === budgetLimit)?.label ||
    (budgetLimit === 0 ? "Bahan Kost Aja" : `Maks. Rp ${budgetLimit.toLocaleString("id-ID")}`);

  return (
    <div className="w-full min-h-screen bg-stone-100 flex flex-col items-center">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-stone-900 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 1440px Container */}
      <div className="w-full max-w-[1440px] px-6 sm:px-12 lg:px-20 pt-10 sm:pt-14 pb-20 flex flex-col justify-start items-start gap-8">
        {/* Page Header (PageHeader Figma) */}
        <div className="self-stretch flex flex-col justify-start items-start gap-5">
          <div className="self-stretch flex justify-between items-center">
            {/* Breadcrumbs */}
            <div className="inline-flex justify-start items-center gap-2">
              <span className="text-stone-500 text-xs font-semibold font-['Inter'] uppercase tracking-wider">
                DOMPETKOST
              </span>
              <span className="text-stone-400 text-xs font-semibold font-['Inter']">/</span>
              <span className="text-orange-700 text-xs font-semibold font-['Inter'] uppercase tracking-wider">
                CHEF AI
              </span>
            </div>

            {/* Back Button */}
            <Link
              href="/recipes"
              className="px-4 py-2 bg-white rounded-full outline outline-1 outline-stone-200 inline-flex justify-center items-center gap-2 hover:bg-stone-50 hover:outline-stone-300 transition"
            >
              <svg className="w-3.5 h-3.5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-stone-700 text-xs font-bold font-['Inter']">
                Kembali ke Katalog Resep
              </span>
            </Link>
          </div>

          <div className="inline-flex justify-start items-center gap-3.5">
            <div className="w-1.5 self-stretch bg-orange-700 rounded-full" />
            <div className="inline-flex flex-col justify-start items-start gap-1">
              <h1 className="text-stone-800 text-4xl sm:text-5xl lg:text-6xl font-normal font-['Instrument_Serif'] leading-tight">
                Tanya Resep ke Chef AI
              </h1>
              <p className="self-stretch text-stone-500 text-xs sm:text-sm font-normal font-['Inter'] leading-tight">
                Bingung mau masak apa dengan bahan seadanya di kamar kost? Minta Chef AI racikkan resep lezat, pas di kantong, dan terhitung nilai gizinya!
              </p>
            </div>
          </div>
        </div>

        {/* Page Modes (PageModes Figma) */}
        <div className="inline-flex justify-start items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("pantry")}
            className={`px-5 py-2.5 rounded-full inline-flex justify-center items-center gap-2 transition cursor-pointer ${
              mode === "pantry"
                ? "bg-orange-700 text-white font-bold"
                : "bg-white text-stone-600 font-semibold outline outline-1 outline-stone-200 hover:bg-stone-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs font-['Inter']">Racik dari Bahan di Kost</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("chat")}
            className={`px-5 py-2.5 rounded-full inline-flex justify-center items-center gap-2 transition cursor-pointer ${
              mode === "chat"
                ? "bg-orange-700 text-white font-bold"
                : "bg-white text-stone-600 font-semibold outline outline-1 outline-stone-200 hover:bg-stone-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-['Inter']">Tanya Bebas / Konsultasi</span>
          </button>
        </div>

        {/* Main Grid (MainGrid Figma): Left Column (540px) & Right Column (flex-1) */}
        <div className="self-stretch flex flex-col lg:flex-row justify-start items-start gap-7">
          {/* Left Column: Input Panel (Pantry or Prompt Suggestions) */}
          <div className="w-full lg:w-[540px] shrink-0">
            {mode === "pantry" ? (
              <div className="w-full p-6 sm:p-8 bg-white rounded-3xl outline outline-1 outline-stone-200 flex flex-col justify-start items-start gap-6">
                <div className="self-stretch flex justify-between items-center">
                  <div className="inline-flex justify-start items-center gap-2.5">
                    <svg className="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h2 className="text-stone-800 text-2xl font-normal font-['Instrument_Serif']">
                      Bahan & Kondisi Memasak
                    </h2>
                  </div>
                  <div className="px-3 py-1 bg-amber-50 rounded-full inline-flex justify-start items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                    <span className="text-amber-800 text-xs font-bold font-['Inter']">Mode Racik</span>
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-5">
                  {/* Bahan yang ada di kost */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="self-stretch flex justify-between items-center">
                      <label className="text-stone-800 text-xs font-bold font-['Inter']">
                        Bahan yang Ada di Kost:
                      </label>
                      <span className="text-stone-400 text-xs font-normal font-['Inter']">
                        Contoh: Telur, nasi putih, bawang, kecap
                      </span>
                    </div>

                    <div className="self-stretch h-28 p-3.5 bg-stone-50 rounded-2xl outline outline-1 outline-stone-200 flex justify-start items-start focus-within:outline-orange-700 transition">
                      <textarea
                        rows={3}
                        value={ingredientsInput}
                        onChange={(e) => setIngredientsInput(e.target.value)}
                        placeholder="Telur 2 butir, nasi sisa semalam, bawang merah 3 siung, kecap manis, cabai rawit..."
                        className="w-full h-full bg-transparent resize-none text-stone-700 text-xs font-normal font-['Inter'] leading-relaxed placeholder:text-stone-400 focus:outline-none"
                      />
                    </div>

                    {/* Quick Chips */}
                    <div className="self-stretch flex flex-wrap justify-start items-center gap-1.5 pt-1">
                      {COMMON_INGREDIENTS.map((item) => {
                        const isAdded = ingredientsInput.toLowerCase().includes(item.toLowerCase());
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleAddIngredient(item)}
                            className={`px-2.5 py-1 rounded-full text-xs font-['Inter'] inline-flex justify-center items-center gap-1 transition cursor-pointer ${
                              isAdded
                                ? "bg-orange-50 text-orange-700 font-bold outline outline-1 outline-orange-200"
                                : "bg-stone-50 text-stone-600 font-normal outline outline-1 outline-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            <span>{isAdded ? "✓" : "+"}</span>
                            <span>{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Alat Masak yang Tersedia */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <label className="text-stone-800 text-xs font-bold font-['Inter']">
                      Alat Masak yang Tersedia:
                    </label>
                    <div className="self-stretch grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {COOKING_TOOLS.map((tool) => {
                        const isSelected = cookingTool === tool.label;
                        return (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => setCookingTool(tool.label)}
                            className={`px-2.5 py-2 rounded-xl text-xs font-['Inter'] flex items-center justify-center transition cursor-pointer text-center ${
                              isSelected
                                ? "bg-orange-50 text-orange-700 font-bold outline outline-1 outline-orange-200"
                                : "bg-stone-50 text-stone-600 font-normal outline outline-1 outline-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            {tool.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Budget Tambahan */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="self-stretch flex justify-between items-center">
                      <label className="text-stone-800 text-xs font-bold font-['Inter']">
                        Budget Tambahan:
                      </label>
                      <span className="text-orange-700 text-xs font-bold font-['Inter']">
                        {selectedBudgetLabel}
                      </span>
                    </div>
                    <div className="self-stretch grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {BUDGET_OPTIONS.map((item) => {
                        const isSelected = budgetLimit === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setBudgetLimit(item.value)}
                            className={`px-2.5 py-2 rounded-xl text-xs font-['Inter'] flex items-center justify-center transition cursor-pointer text-center ${
                              isSelected
                                ? "bg-orange-50 text-orange-700 font-bold outline outline-1 outline-orange-200"
                                : "bg-stone-50 text-stone-600 font-normal outline outline-1 outline-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target & Preferensi */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <label className="text-stone-800 text-xs font-bold font-['Inter']">
                      Target & Preferensi:
                    </label>
                    <div className="self-stretch grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DIETARY_GOALS.map((goal) => {
                        const isSelected = dietaryGoal === goal.label;
                        return (
                          <button
                            key={goal.label}
                            type="button"
                            onClick={() => setDietaryGoal(goal.label)}
                            className={`px-2 py-2 rounded-xl text-xs font-['Inter'] flex items-center justify-center transition cursor-pointer text-center ${
                              isSelected
                                ? "bg-orange-50 text-orange-700 font-bold outline outline-1 outline-orange-200"
                                : "bg-stone-50 text-stone-600 font-normal outline outline-1 outline-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            {goal.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Action Button */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handlePantrySubmit()}
                    className="self-stretch p-3.5 bg-orange-700 rounded-full inline-flex justify-center items-center gap-2 hover:bg-[#B34718] active:scale-[0.99] transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-white text-xs font-bold font-['Inter']">
                          Chef AI Sedang Meracik...
                        </span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-white text-xs font-bold font-['Inter']">
                          Racik Resep Sekarang
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Mode Chat: Inspirasi Tanya Chef AI */
              <div className="w-full p-6 sm:p-8 bg-white rounded-3xl outline outline-1 outline-stone-200 flex flex-col justify-start items-start gap-6">
                <div className="self-stretch flex justify-between items-center border-b border-stone-100 pb-3">
                  <div className="inline-flex justify-start items-center gap-2.5">
                    <svg className="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h2 className="text-stone-800 text-2xl font-normal font-['Instrument_Serif']">
                      Inspirasi Tanya Chef AI
                    </h2>
                  </div>
                  <div className="px-3 py-1 bg-orange-50 rounded-full inline-flex justify-start items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                    <span className="text-orange-800 text-xs font-bold font-['Inter']">Mode Chat</span>
                  </div>
                </div>

                <p className="text-xs text-stone-500 font-['Inter']">
                  Klik salah satu topik di bawah untuk langsung menanyakan ke Chef AI:
                </p>

                <div className="self-stretch flex flex-col gap-2.5">
                  {PROMPT_SUGGESTIONS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handlePromptSuggestion(item.prompt)}
                      className="group self-stretch p-3.5 bg-stone-50 rounded-2xl outline outline-1 outline-stone-200 hover:outline-orange-300 hover:bg-orange-50/50 transition cursor-pointer text-left disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800 group-hover:text-orange-700 font-['Inter'] transition">
                          {item.title}
                        </span>
                        <svg className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-700 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 font-['Inter'] leading-relaxed">
                        {item.prompt}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="self-stretch p-3.5 bg-amber-50 rounded-2xl outline outline-1 outline-amber-200 inline-flex justify-start items-start gap-2.5">
                  <svg className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-amber-900 text-xs font-bold font-['Inter']">
                      Tips Bertanya:
                    </span>
                    <p className="text-amber-800 text-xs font-normal font-['Inter'] leading-relaxed">
                      Kamu bisa tanya apa saja: takaran bumbu, cara rebus telur agar mudah dikupas, tips simpan tempe tahan 1 minggu, atau variasi saus hemat.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Chat & Generated Recipe Stream */}
          <div data-layer="PercakapanDenganChefAi" className="Percakapandenganchefai flex-1 p-6 sm:p-8 bg-white rounded-3xl outline outline-1 outline-stone-200 flex flex-col justify-between items-start gap-6 min-h-[640px]">
            {/* Chef Header */}
            <div data-layer="ChefHeader" className="Chefheader self-stretch pb-4 border-b border-stone-200 inline-flex justify-between items-center">
              <div data-layer="ChefAvatarRow" className="Chefavatarrow inline-flex justify-start items-center gap-3">
                <div data-layer="ChefAvatar" className="Chefavatar w-10 h-10 p-2.5 bg-orange-700 rounded-full flex justify-center items-center gap-2.5 shadow-xs">
                  <div className="w-5 h-5 relative overflow-hidden flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                </div>
                <div data-layer="ChefInfo" className="Chefinfo flex flex-col justify-start items-start">
                  <div data-layer="Chef Kost AI" className="ChefKostAi justify-start text-stone-800 text-base font-bold font-['Inter']">Chef Kost AI</div>
                  <div data-layer="Asisten Koki & Ahli Gizi Anak Kost" className="AsistenKokiAhliGiziAnakKost justify-start text-stone-500 text-xs font-normal font-['Inter']">Asisten Koki & Ahli Gizi Anak Kost</div>
                </div>
              </div>
              <div data-layer="StatusBadge" className="Statusbadge px-3 py-1 bg-emerald-50 rounded-full inline-flex justify-start items-center gap-1.5">
                <div data-layer="Dot" className="Dot w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                <div data-layer="Aktif" className="Aktif justify-start text-emerald-800 text-xs font-bold font-['Inter']">Aktif</div>
              </div>
            </div>

            {/* Chat Body */}
            <div data-layer="ChatBody" className="Chatbody self-stretch flex flex-col justify-start items-start gap-4 flex-1 overflow-y-auto pr-1">
              {/* Message List */}
              {messages.map((msg) => (
                <div key={msg.id} className="self-stretch">
                  {msg.role === "user" ? (
                    <div data-layer="UserMessage" className="Usermessage self-stretch flex flex-col justify-start items-end gap-1 my-2">
                      <div data-layer="UserBubble" className="Userbubble max-w-[560px] p-4 bg-orange-700 rounded-2xl inline-flex justify-start items-start gap-2.5 shadow-xs">
                        <div className="justify-start text-white text-xs font-normal font-['Inter'] leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                      <div className="justify-start text-stone-400 text-[10px] font-normal font-['Inter'] px-1">
                        {user?.name ? user.name : "Kamu"}
                      </div>
                    </div>
                  ) : (
                    <div data-layer="ChefMessage" className="Chefmessage self-stretch flex flex-col justify-start items-start gap-3 my-2">
                      <div data-layer="ChefBubble" className="Chefbubble max-w-[560px] p-4 bg-stone-50 rounded-2xl inline-flex justify-start items-start gap-2.5">
                        <div className="justify-start text-stone-700 text-xs font-normal font-['Inter'] leading-relaxed whitespace-pre-line">
                          {msg.text}
                        </div>
                      </div>

                      {/* Starter chips on initial welcome */}
                      {msg.id === "welcome-1" && (
                        <div data-layer="StarterChips" className="Starterchips self-stretch flex flex-col justify-start items-start gap-2 mt-1">
                          <div data-layer="Mulai Dari Ide Sederhana:" className="MulaiDariIdeSederhana justify-start text-stone-400 text-[10px] font-bold font-['Inter'] uppercase tracking-wider">
                            Mulai dari ide sederhana:
                          </div>
                          <div data-layer="ChipsRow" className="Chipsrow self-stretch flex flex-wrap justify-start items-center gap-2">
                            {PROMPT_SUGGESTIONS.map((item) => (
                              <button
                                key={item.title}
                                type="button"
                                disabled={isLoading}
                                onClick={() => handlePromptSuggestion(item.prompt)}
                                className="px-3 py-1.5 bg-stone-50 rounded-full outline outline-1 outline-stone-200 inline-flex justify-center items-center gap-1.5 cursor-pointer hover:bg-orange-50 hover:outline-orange-300 transition disabled:opacity-50"
                              >
                                <span className="justify-start text-stone-600 text-xs font-normal font-['Inter']">{item.title}</span>
                                <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Generated Recipe Card */}
                      {msg.recipe && (
                        <div data-layer="RecipeCard" className="Recipecard self-stretch p-5 sm:p-6 bg-white rounded-2xl outline outline-1 outline-stone-200 flex flex-col justify-start items-start gap-4 shadow-xs">
                          {/* Recipe Header */}
                          <div data-layer="RecipeHeader" className="Recipeheader self-stretch flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-stone-100 pb-3">
                            <div data-layer="TitleCol" className="Titlecol flex flex-col justify-start items-start gap-1">
                              <h3 className="justify-start text-stone-800 text-2xl font-normal font-['Instrument_Serif']">
                                {msg.recipe.title}
                              </h3>
                              <p className="justify-start text-stone-500 text-xs font-normal font-['Inter'] leading-relaxed">
                                {msg.recipe.description}
                              </p>
                            </div>
                            <div data-layer="RecipeMeta" className="Recipemeta inline-flex flex-wrap justify-start items-center gap-3 shrink-0">
                              <div className="inline-flex justify-start items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="justify-start text-stone-600 text-xs font-normal font-['Inter']">
                                  {msg.recipe.cookTimeMinutes} Menit
                                </span>
                              </div>
                              <div className="inline-flex justify-start items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="justify-start text-stone-600 text-xs font-normal font-['Inter']">
                                  {msg.recipe.portions} Porsi
                                </span>
                              </div>
                              <div className="inline-flex justify-start items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                </svg>
                                <span className="justify-start text-orange-700 text-xs font-bold font-['Inter']">
                                  {msg.recipe.nutrition.calories} Kkal
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Macros Box */}
                          <div data-layer="MacrosBox" className="Macrosbox self-stretch p-3.5 bg-stone-50 rounded-xl inline-flex justify-between items-center">
                            <div className="flex-1 flex flex-col justify-start items-center gap-0.5">
                              <span className="text-stone-500 text-[10px] font-normal font-['Inter']">Protein</span>
                              <span className="text-stone-800 text-xs font-bold font-['Inter']">{msg.recipe.nutrition.protein_g}g</span>
                            </div>
                            <div className="w-px h-6 bg-stone-200" />
                            <div className="flex-1 flex flex-col justify-start items-center gap-0.5">
                              <span className="text-stone-500 text-[10px] font-normal font-['Inter']">Lemak</span>
                              <span className="text-stone-800 text-xs font-bold font-['Inter']">{msg.recipe.nutrition.fat_g}g</span>
                            </div>
                            <div className="w-px h-6 bg-stone-200" />
                            <div className="flex-1 flex flex-col justify-start items-center gap-0.5">
                              <span className="text-stone-500 text-[10px] font-normal font-['Inter']">Karbo</span>
                              <span className="text-stone-800 text-xs font-bold font-['Inter']">{msg.recipe.nutrition.carbs_g}g</span>
                            </div>
                            <div className="w-px h-6 bg-stone-200" />
                            <div className="flex-1 flex flex-col justify-start items-center gap-0.5">
                              <span className="text-stone-500 text-[10px] font-normal font-['Inter']">Serat</span>
                              <span className="text-stone-800 text-xs font-bold font-['Inter']">{msg.recipe.nutrition.fiber_g}g</span>
                            </div>
                          </div>

                          {/* Ingredients */}
                          <div data-layer="IngredientsBox" className="Ingredientsbox self-stretch flex flex-col justify-start items-start gap-2">
                            <div className="self-stretch flex justify-between items-center">
                              <h4 className="text-stone-800 text-xs font-bold font-['Inter']">Bahan-Bahan:</h4>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = msg.recipe?.ingredients.join("\n") || "";
                                  navigator.clipboard.writeText(list);
                                  showToast("Daftar bahan disalin!");
                                }}
                                className="text-[11px] font-medium text-orange-700 hover:underline cursor-pointer"
                              >
                                Salin Bahan
                              </button>
                            </div>
                            <div data-layer="IngredientsList" className="Ingredientslist self-stretch flex flex-col justify-start items-start gap-1.5 bg-stone-50 p-3 rounded-xl">
                              {msg.recipe.ingredients.map((ing, i) => (
                                <div key={i} className="inline-flex justify-start items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-orange-700 rounded-full shrink-0" />
                                  <span className="text-stone-600 text-xs font-normal font-['Inter']">{ing}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Steps */}
                          <div data-layer="StepsBox" className="Stepsbox self-stretch flex flex-col justify-start items-start gap-2">
                            <h4 className="text-stone-800 text-xs font-bold font-['Inter']">Langkah Memasak:</h4>
                            <div data-layer="StepsList" className="Stepslist self-stretch flex flex-col justify-start items-start gap-2.5">
                              {msg.recipe.steps.map((step, i) => (
                                <div key={i} className="inline-flex justify-start items-start gap-2.5">
                                  <div className="w-5 h-5 bg-orange-50 rounded-full flex justify-center items-center shrink-0 mt-0.5">
                                    <span className="text-orange-700 text-xs font-bold font-['Inter']">{i + 1}</span>
                                  </div>
                                  <p className="flex-1 text-stone-600 text-xs font-normal font-['Inter'] leading-relaxed">
                                    {step}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Chef Tips */}
                          {msg.recipe.chefTips && (
                            <div data-layer="ChefTips" className="Cheftips self-stretch p-3.5 bg-amber-50 rounded-xl inline-flex justify-start items-start gap-2.5">
                              <svg className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <div className="flex flex-col justify-start items-start gap-0.5">
                                <span className="text-amber-900 text-xs font-bold font-['Inter']">Tips Chef:</span>
                                <p className="text-amber-800 text-xs font-normal font-['Inter'] leading-relaxed">
                                  {msg.recipe.chefTips}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Recipe Actions */}
                          <div data-layer="RecipeActions" className="Recipeactions self-stretch flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-stone-100">
                            <div className="inline-flex flex-wrap items-center gap-2">
                              {msg.isSaved ? (
                                <Link
                                  href="/recipes"
                                  className="px-3 py-1.5 bg-emerald-100 rounded-full inline-flex justify-center items-center gap-1.5 text-emerald-800 text-xs font-bold font-['Inter'] hover:bg-emerald-200 transition"
                                >
                                  <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Tersimpan di Katalog</span>
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  disabled={savingRecipeTitle === msg.recipe.title}
                                  onClick={() => handleSaveToCatalog(msg.recipe!, msg.id)}
                                  className="px-3.5 py-1.5 bg-orange-700 rounded-full inline-flex justify-center items-center gap-1.5 cursor-pointer hover:bg-[#B34718] transition text-white text-xs font-bold font-['Inter'] disabled:opacity-50"
                                >
                                  {savingRecipeTitle === msg.recipe.title ? (
                                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                  )}
                                  <span>Simpan ke Resep Saya</span>
                                </button>
                              )}

                              <button
                                type="button"
                                disabled={loggingRecipeTitle === msg.recipe.title}
                                onClick={() => handleLogToDiary(msg.recipe!)}
                                className="px-3.5 py-1.5 bg-stone-100 rounded-full inline-flex justify-center items-center gap-1.5 cursor-pointer hover:bg-stone-200 transition text-stone-700 text-xs font-medium font-['Inter'] disabled:opacity-50"
                              >
                                {loggingRecipeTitle === msg.recipe.title ? (
                                  <div className="h-3 w-3 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg className="w-3.5 h-3.5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                  </svg>
                                )}
                                <span>Catat ke Diari Gizi</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyRecipe(msg.recipe!)}
                                className="px-3 py-1.5 bg-stone-100 rounded-full inline-flex justify-center items-center gap-1.5 cursor-pointer hover:bg-stone-200 transition text-stone-700 text-xs font-medium font-['Inter']"
                              >
                                <svg className="w-3.5 h-3.5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>{copiedTitle === msg.recipe.title ? "Tersalin!" : "Salin Teks"}</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() =>
                                handlePromptSuggestion(
                                  `Buatkan alternatif atau variasi menu lain yang berbeda dari "${msg.recipe?.title}" dengan bahan serupa.`
                                )
                              }
                              className="inline-flex items-center gap-1 text-orange-700 text-xs font-bold font-['Inter'] hover:underline cursor-pointer"
                            >
                              <span>Minta Variasi Lain</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Suggestions Chips for follow-up turns */}
                      {msg.id !== "welcome-1" && msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {msg.suggestions.map((sug, i) => (
                            <button
                              key={i}
                              type="button"
                              disabled={isLoading}
                              onClick={() => handlePromptSuggestion(sug)}
                              className="px-3 py-1.5 bg-stone-50 rounded-full outline outline-1 outline-stone-200 text-stone-600 text-xs font-normal font-['Inter'] hover:bg-orange-50 hover:outline-orange-300 transition cursor-pointer disabled:opacity-50"
                            >
                              &ldquo;{sug}&rdquo;
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="self-stretch flex items-start gap-2.5 my-2">
                  <div className="w-8 h-8 rounded-full bg-orange-700 flex items-center justify-center text-white shrink-0">
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-2xl outline outline-1 outline-stone-200 text-stone-600 text-xs font-['Inter'] flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 bg-orange-700 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 bg-orange-700 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 bg-orange-700 rounded-full animate-bounce"></span>
                    </div>
                    <span>Chef AI sedang meracik resep & menghitung nilai gizinya...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div data-layer="ChatInputBar" className="Chatinputbar self-stretch p-2 bg-stone-50 rounded-full outline outline-1 outline-stone-200 inline-flex justify-between items-center mt-2">
              <form
                onSubmit={handleChatSubmit}
                className="w-full flex items-center justify-between pl-4 pr-1 gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tanya apa saja ke Chef AI (misal: 'Cara bikin telur ceplok krispi tapi minim minyak')..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-stone-700 text-xs font-normal font-['Inter'] placeholder:text-stone-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="w-8 h-8 p-1.5 bg-orange-700 rounded-full flex justify-center items-center hover:bg-[#B34718] active:scale-95 transition disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <div className="w-4 h-4 relative overflow-hidden flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

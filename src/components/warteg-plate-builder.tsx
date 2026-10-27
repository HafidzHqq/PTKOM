"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export type WartegCategory = "karbo" | "lauk-hewani" | "lauk-nabati" | "sayur" | "pelengkap";

export interface WartegItem {
  id: string;
  name: string;
  category: WartegCategory;
  minPrice: number;
  maxPrice: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  badge?: string;
  isBerkuah?: boolean;
}

export const WARTEG_MENU: WartegItem[] = [
  // 1. Karbo
  {
    id: "nasi-full",
    name: "Nasi Putih (1 Piring)",
    category: "karbo",
    minPrice: 3000,
    maxPrice: 4000,
    calories: 260,
    protein_g: 4.5,
    fat_g: 0.5,
    carbs_g: 57,
    fiber_g: 0.6,
    badge: "Wajib Kenyang",
  },
  {
    id: "nasi-half",
    name: "Nasi Putih (1/2 Porsi)",
    category: "karbo",
    minPrice: 2000,
    maxPrice: 3000,
    calories: 130,
    protein_g: 2.2,
    fat_g: 0.3,
    carbs_g: 28,
    fiber_g: 0.3,
    badge: "Porsi Ringan",
  },
  {
    id: "nasi-uduk",
    name: "Nasi Uduk Gurih",
    category: "karbo",
    minPrice: 4000,
    maxPrice: 5000,
    calories: 290,
    protein_g: 4.5,
    fat_g: 7.5,
    carbs_g: 51,
    fiber_g: 0.8,
    badge: "Wangi Rempah",
  },
  {
    id: "lontong",
    name: "Lontong Daun",
    category: "karbo",
    minPrice: 2500,
    maxPrice: 3500,
    calories: 180,
    protein_g: 3.2,
    fat_g: 0.5,
    carbs_g: 40,
    fiber_g: 1.2,
  },

  // 2. Lauk Hewani
  {
    id: "telur-dadar",
    name: "Telur Dadar Tebal Warteg",
    category: "lauk-hewani",
    minPrice: 4000,
    maxPrice: 6000,
    calories: 190,
    protein_g: 11,
    fat_g: 14,
    carbs_g: 3,
    fiber_g: 0.2,
    badge: "Favorit Anak Kost",
  },
  {
    id: "ayam-goreng",
    name: "Ayam Goreng Lengkuas",
    category: "lauk-hewani",
    minPrice: 10000,
    maxPrice: 13000,
    calories: 280,
    protein_g: 26,
    fat_g: 17,
    carbs_g: 4,
    fiber_g: 0.5,
    badge: "Tinggi Protein",
  },
  {
    id: "tongkol-balado",
    name: "Tongkol Suwir Balado",
    category: "lauk-hewani",
    minPrice: 7000,
    maxPrice: 9000,
    calories: 185,
    protein_g: 22,
    fat_g: 8,
    carbs_g: 4,
    fiber_g: 1.0,
    badge: "Pedas Gurih",
  },
  {
    id: "ikan-kembung",
    name: "Ikan Kembung Goreng",
    category: "lauk-hewani",
    minPrice: 8000,
    maxPrice: 11000,
    calories: 210,
    protein_g: 24,
    fat_g: 11,
    carbs_g: 1,
    fiber_g: 0,
    badge: "Kaya Omega 3",
  },
  {
    id: "ati-ampela",
    name: "Ati Ampela Goreng",
    category: "lauk-hewani",
    minPrice: 5000,
    maxPrice: 7000,
    calories: 160,
    protein_g: 18,
    fat_g: 8,
    carbs_g: 2,
    fiber_g: 0,
  },

  // 3. Lauk Nabati
  {
    id: "orek-tempe",
    name: "Orek Tempe Basah Manis",
    category: "lauk-nabati",
    minPrice: 3000,
    maxPrice: 4000,
    calories: 140,
    protein_g: 9,
    fat_g: 6,
    carbs_g: 12,
    fiber_g: 2.5,
    badge: "Legenda Warteg",
  },
  {
    id: "tahu-tempe-bacem",
    name: "Tahu & Tempe Bacem",
    category: "lauk-nabati",
    minPrice: 2500,
    maxPrice: 3500,
    calories: 160,
    protein_g: 12,
    fat_g: 6,
    carbs_g: 14,
    fiber_g: 3,
    badge: "Manis Gurih",
  },
  {
    id: "perkedel-kentang",
    name: "Perkedel Kentang Lembut",
    category: "lauk-nabati",
    minPrice: 3000,
    maxPrice: 4000,
    calories: 125,
    protein_g: 3,
    fat_g: 6,
    carbs_g: 16,
    fiber_g: 1.2,
  },
  {
    id: "tempe-mendoan",
    name: "Tempe Mendoan Hangat",
    category: "lauk-nabati",
    minPrice: 2000,
    maxPrice: 3000,
    calories: 130,
    protein_g: 6,
    fat_g: 8,
    carbs_g: 10,
    fiber_g: 1.8,
  },

  // 4. Sayur & Tumisan
  {
    id: "tumis-kangkung",
    name: "Tumis Kangkung Terasi",
    category: "sayur",
    minPrice: 3000,
    maxPrice: 4000,
    calories: 75,
    protein_g: 3,
    fat_g: 4,
    carbs_g: 7,
    fiber_g: 3.5,
    badge: "Segar Gurih",
  },
  {
    id: "sayur-asem",
    name: "Sayur Asem Segar",
    category: "sayur",
    minPrice: 3500,
    maxPrice: 4500,
    calories: 85,
    protein_g: 2.5,
    fat_g: 2,
    carbs_g: 15,
    fiber_g: 3.2,
    badge: "Kuah Segar",
    isBerkuah: true,
  },
  {
    id: "capcay-kuah",
    name: "Capcay Kuah Warteg",
    category: "sayur",
    minPrice: 3500,
    maxPrice: 5000,
    calories: 95,
    protein_g: 3.5,
    fat_g: 3.5,
    carbs_g: 12,
    fiber_g: 4,
    badge: "Kaya Serat",
    isBerkuah: true,
  },
  {
    id: "sayur-lodeh",
    name: "Sayur Lodeh Labu Siam",
    category: "sayur",
    minPrice: 3500,
    maxPrice: 4500,
    calories: 120,
    protein_g: 3,
    fat_g: 8,
    carbs_g: 9,
    fiber_g: 3,
    isBerkuah: true,
  },
  {
    id: "tumis-tauge-tahu",
    name: "Tumis Tauge Tahu",
    category: "sayur",
    minPrice: 2500,
    maxPrice: 3500,
    calories: 70,
    protein_g: 4.5,
    fat_g: 3,
    carbs_g: 6,
    fiber_g: 2.2,
    badge: "Renyah Segar",
  },

  // 5. Pelengkap & Minuman
  {
    id: "sambal-terasi",
    name: "Sambal Terasi Colek",
    category: "pelengkap",
    minPrice: 1000,
    maxPrice: 2000,
    calories: 25,
    protein_g: 0.5,
    fat_g: 1.5,
    carbs_g: 3,
    fiber_g: 0.8,
    badge: "Wajib Nampol",
  },
  {
    id: "kerupuk",
    name: "Kerupuk Putih Kaleng",
    category: "pelengkap",
    minPrice: 1000,
    maxPrice: 2000,
    calories: 70,
    protein_g: 0.8,
    fat_g: 3.5,
    carbs_g: 9,
    fiber_g: 0.2,
    badge: "Kriuk",
  },
  {
    id: "bakwan",
    name: "Gorengan Bakwan Sayur",
    category: "pelengkap",
    minPrice: 1500,
    maxPrice: 2000,
    calories: 135,
    protein_g: 2.5,
    fat_g: 8,
    carbs_g: 14,
    fiber_g: 1.2,
  },
  {
    id: "es-teh-tawar",
    name: "Es Teh Tawar",
    category: "pelengkap",
    minPrice: 1000,
    maxPrice: 2000,
    calories: 0,
    protein_g: 0,
    fat_g: 0,
    carbs_g: 0,
    fiber_g: 0,
    badge: "0 Kalori",
  },
  {
    id: "es-teh-manis",
    name: "Es Teh Manis Segar",
    category: "pelengkap",
    minPrice: 2500,
    maxPrice: 3500,
    calories: 90,
    protein_g: 0,
    fat_g: 0,
    carbs_g: 22,
    fiber_g: 0,
  },
];

interface QuickTemplate {
  name: string;
  desc: string;
  tag: string;
  itemIds: string[];
}

export const WARTEG_TEMPLATES: QuickTemplate[] = [
  {
    name: "Paket Hemat 10 Ribu",
    desc: "Nasi 1/2 + Telur Dadar + Orek Tempe",
    tag: "Hemat Juara",
    itemIds: ["nasi-half", "telur-dadar", "orek-tempe"],
  },
  {
    name: "Paket Tanggal Tua",
    desc: "Nasi Putih + Tahu Tempe Bacem + Tumis Kangkung + Kerupuk",
    tag: "Ramah Kantong",
    itemIds: ["nasi-full", "tahu-tempe-bacem", "tumis-kangkung", "kerupuk"],
  },
  {
    name: "Paket Juara Protein",
    desc: "Nasi Putih + Ayam Goreng + Telur Dadar + Sayur Asem",
    tag: "Kenyang Berenergi",
    itemIds: ["nasi-full", "ayam-goreng", "telur-dadar", "sayur-asem"],
  },
  {
    name: "Paket Segar Berkuah",
    desc: "Nasi Putih + Tongkol Balado + Sayur Asem + Sambal Terasi",
    tag: "Pedas & Segar",
    itemIds: ["nasi-full", "tongkol-balado", "sayur-asem", "sambal-terasi"],
  },
];

export default function WartegPlateBuilder() {
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "nasi-full",
    "telur-dadar",
    "orek-tempe",
    "tumis-kangkung",
  ]);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [perMealBudget, setPerMealBudget] = useState<number>(15000);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Hidden canvas for image generator
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load user profile budget
  useEffect(() => {
    async function loadBudget() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.monthly_food_budget) {
            // Asumsi 30 hari x 2-3 kali makan = 75-90 makan/bulan
            const mealBudget = Math.round(json.data.monthly_food_budget / 75);
            setPerMealBudget(Math.max(10000, mealBudget));
          }
        }
      } catch {
        // Fallback to 15.000
      }
    }
    if (user) {
      loadBudget();
    }
  }, [user]);

  const selectedItems = WARTEG_MENU.filter((item) => selectedIds.includes(item.id));

  // Range Calculations (Fase 4.1b)
  const minCost = selectedItems.reduce((sum, item) => sum + item.minPrice, 0);
  const maxCost = selectedItems.reduce((sum, item) => sum + item.maxPrice, 0);
  const avgCost = Math.round((minCost + maxCost) / 2);

  const totalCalories = selectedItems.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = selectedItems.reduce((sum, item) => sum + item.protein_g, 0);
  const totalFat = selectedItems.reduce((sum, item) => sum + item.fat_g, 0);
  const totalCarbs = selectedItems.reduce((sum, item) => sum + item.carbs_g, 0);
  const totalFiber = selectedItems.reduce((sum, item) => sum + item.fiber_g, 0);

  const toggleItem = (item: WartegItem) => {
    setSelectedIds((prev) => {
      // 1 Staple Karbo rule
      if (item.category === "karbo") {
        if (prev.includes(item.id)) {
          return prev.filter((id) => id !== item.id);
        } else {
          const withoutKarbo = prev.filter((id) => {
            const f = WARTEG_MENU.find((m) => m.id === id);
            return f?.category !== "karbo";
          });
          return [...withoutKarbo, item.id];
        }
      }

      if (prev.includes(item.id)) {
        return prev.filter((id) => id !== item.id);
      } else {
        return [...prev, item.id];
      }
    });
    setSaveSuccess(false);
    setShareSuccess(false);
  };

  const applyTemplate = (tpl: QuickTemplate) => {
    setSelectedIds(tpl.itemIds);
    setSaveSuccess(false);
    setShareSuccess(false);
  };

  // Rule-based Pelayan Warteg commentary (Fase 4.1c)
  const getWartegServerComment = () => {
    if (selectedItems.length === 0) {
      return "Etalase Warteg masih kosong nih! Pilih nasi dan lauk favoritmu untuk mulai meracik piring.";
    }

    const hasSayur = selectedItems.some((i) => i.category === "sayur");
    const hasSambal = selectedIds.includes("sambal-terasi");
    const hasKuah = selectedItems.some((i) => i.isBerkuah);
    const hasProteinHewani = selectedItems.some((i) => i.category === "lauk-hewani");
    const hasProteinNabati = selectedItems.some((i) => i.category === "lauk-nabati");

    // Aturan 1: Ada sambal + lauk berkuah
    if (hasSambal && hasKuah) {
      return "Ada sambal terasi nampol ketemu kuah segar, siap-siap seger gobyos keringetan ya!";
    }

    // Aturan 2: Total melebihi budget pengguna
    if (minCost > perMealBudget) {
      const selisih = minCost - perMealBudget;
      return `Wah, agak lewat budget makanmu (Rp ${perMealBudget.toLocaleString("id-ID")}). Kalau ganti lauk ke tempe atau telur dadar, bisa hemat sekitar Rp ${selisih.toLocaleString("id-ID")} lho!`;
    }

    // Aturan 3: Tanpa sayur sama sekali
    if (!hasSayur && selectedItems.length >= 2) {
      return "Mas / Mbak, tumis tauge atau kangkungnya sekalian biar piringnya segar dan nggak seret.";
    }

    // Aturan 4: Tinggi protein
    if (totalProtein >= 26) {
      return "Piring juara protein! Stamina aman seharian dan mantap buat dukung fokus nugas atau aktivitas fisik.";
    }

    // Aturan 5: Karbo + gorengan tanpa protein utama
    if (!hasProteinHewani && !hasProteinNabati && selectedItems.length >= 2) {
      return "Nasi ketemu gorengan emang gurih, tapi selipin tempe atau telur yuk biar tenaganya tahan lama!";
    }

    // Aturan 6: Seimbang lengkap
    return "Racikan piring mantap mas/mbak! Komposisinya pas, kenyang nendang, dan ramah kantong kost.";
  };

  // Budget comparison & percentage
  const budgetRatio = perMealBudget > 0 ? (avgCost / perMealBudget) * 100 : 0;
  const isOverBudget = avgCost > perMealBudget;

  // Handle Catat ke Diari (Fase 4.1e)
  const handleSaveToDiary = async () => {
    if (selectedItems.length === 0) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        foods: selectedItems.map((item) => ({
          name: item.name,
          portion_grams: item.category === "karbo" ? 200 : item.category.startsWith("lauk") ? 100 : 70,
          nutrition: {
            calories: item.calories,
            protein_g: item.protein_g,
            fat_g: item.fat_g,
            carbs_g: item.carbs_g,
            fiber_g: item.fiber_g,
          },
        })),
        total_nutrition: {
          calories: totalCalories,
          protein_g: totalProtein,
          fat_g: totalFat,
          carbs_g: totalCarbs,
          fiber_g: totalFiber,
        },
      };

      const res = await fetch("/api/nutrition-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menyimpan ke riwayat makan");
      }

      setSaveSuccess(true);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  // Share plate as image / canvas drawing (Fase 4.1e)
  const handleSharePlateImage = async () => {
    if (selectedItems.length === 0) return;

    try {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 760;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background warm culinary gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 760);
      bgGrad.addColorStop(0, "#fffbeb");
      bgGrad.addColorStop(1, "#fef3c7");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 600, 760);

      // Card border
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, 568, 728);

      // Header Bar
      ctx.fillStyle = "#c2410c";
      ctx.fillRect(20, 20, 560, 90);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("DOMPETKOST • PIRING WARTEG", 40, 60);

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#ffedd5";
      ctx.fillText("Struk Etalase Kuliner & Keseimbangan Porsi", 40, 88);

      // Date stamp
      const now = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#78350f";
      ctx.fillText(now, 40, 140);

      // Items list
      let y = 175;
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "#1c1917";
      ctx.fillText("PILIHAN MENU:", 40, y);
      y += 28;

      ctx.lineWidth = 1;
      ctx.strokeStyle = "#e5e7eb";
      ctx.beginPath();
      ctx.moveTo(40, y - 10);
      ctx.lineTo(560, y - 10);
      ctx.stroke();

      selectedItems.forEach((item) => {
        ctx.font = "15px sans-serif";
        ctx.fillStyle = "#292524";
        ctx.fillText(`• ${item.name}`, 40, y);

        const priceText = `Rp ${item.minPrice.toLocaleString("id-ID")} - ${item.maxPrice.toLocaleString("id-ID")}`;
        ctx.textAlign = "right";
        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = "#78350f";
        ctx.fillText(priceText, 560, y);
        ctx.textAlign = "left";

        y += 26;
      });

      // Divider
      y += 10;
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(560, y);
      ctx.stroke();
      y += 35;

      // Total Kasir
      ctx.font = "bold 15px sans-serif";
      ctx.fillStyle = "#57534e";
      ctx.fillText("ESTIMASI KASIR WARTEG:", 40, y);

      ctx.textAlign = "right";
      ctx.font = "bold 24px sans-serif";
      ctx.fillStyle = "#9a3412";
      ctx.fillText(`≈ Rp ${minCost.toLocaleString("id-ID")} – Rp ${maxCost.toLocaleString("id-ID")}`, 560, y);
      ctx.textAlign = "left";

      // Nutrition Highlights Box
      y += 40;
      ctx.fillStyle = "#ffffff";
      ctx.roundRect(40, y, 520, 85, 8);
      ctx.fill();
      ctx.strokeStyle = "#fed7aa";
      ctx.stroke();

      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#78350f";
      ctx.fillText("KESEIMBANGAN PORSI:", 55, y + 25);

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#1c1917";
      ctx.fillText(
        `Kalori: ${totalCalories} kkal  •  Protein: ${totalProtein.toFixed(1)}g  •  Lemak: ${totalFat.toFixed(1)}g`,
        55,
        y + 50
      );
      ctx.fillText(
        `Karbo: ${totalCarbs.toFixed(1)}g  •  Serat: ${totalFiber.toFixed(1)}g`,
        55,
        y + 70
      );

      // Pelayan Warteg Quote
      y += 115;
      ctx.font = "italic 13px sans-serif";
      ctx.fillStyle = "#451a03";
      const comment = getWartegServerComment();
      ctx.fillText(`" ${comment.slice(0, 65)}... "`, 40, y);

      // Footer
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#9a3412";
      ctx.fillText("Rakit piring hemat & bergizi ala anak kost di dompetkost.id", 40, 725);

      // Share or Download
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "Piring-Warteg-DompetKost.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: "Piring Warteg DompetKost",
              text: `Racikan piring Wartegku: ≈ Rp ${minCost.toLocaleString("id-ID")} - Rp ${maxCost.toLocaleString("id-ID")} (${totalCalories} kkal, ${totalProtein.toFixed(1)}g protein).`,
              files: [file],
            });
            setShareSuccess(true);
            return;
          } catch {
            // User canceled or failed, fallback to download
          }
        }

        // Direct Download Fallback
        const link = document.createElement("a");
        link.download = "Piring-Warteg-DompetKost.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        setShareSuccess(true);
      });
    } catch (e) {
      console.error("Failed to generate plate image:", e);
    }
  };

  const categories = [
    { key: "all", title: "Semua Menu", desc: "Lihat semua lauk etalase" },
    { key: "karbo", title: "1. Karbohidrat", desc: "Pilih 1 jenis pokok" },
    { key: "lauk-hewani", title: "2. Lauk Hewani", desc: "Ayam, ikan, telur tebal" },
    { key: "lauk-nabati", title: "3. Lauk Nabati", desc: "Orek tempe, tahu bacem" },
    { key: "sayur", title: "4. Sayur & Tumisan", desc: "Kangkung, sayur asem, capcay" },
    { key: "pelengkap", title: "5. Pelengkap & Minum", desc: "Sambal, kerupuk, es teh" },
  ];

  function getCategoryIcon(category: WartegCategory) {
    switch (category) {
      case "karbo":
        return (
          <svg className="w-3.5 h-3.5 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case "lauk-hewani":
        return (
          <svg className="w-3.5 h-3.5 text-orange-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "lauk-nabati":
        return (
          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case "sayur":
        return (
          <svg className="w-3.5 h-3.5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case "pelengkap":
      default:
        return (
          <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        );
    }
  }

  const displayedMenu =
    activeCategory === "all"
      ? WARTEG_MENU
      : WARTEG_MENU.filter((m) => m.category === activeCategory);

  return (
    <div className="space-y-6 sm:space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      {/* Intro Header */}
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-6 md:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-amber-50 mb-3 border border-white/20">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Etalase Warteg Interaktif
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Rakit Piring Warteg Impianmu
          </h2>
          <p className="mt-2 text-sm sm:text-base text-amber-50/90 leading-relaxed font-medium">
            Tunjuk lauk langsung dari etalase kaca Warteg! Cek rentang harga kasir seketika, komentar ramah pelayan, indikator budget makan, dan pantau keseimbangan gizi sebelum melangkah keluar kost.
          </p>
        </div>
      </div>

      {/* Quick Templates (Fase 4.1f) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Paket Piring Rekomendasi (1-Tap):
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">Langsung terisi ke piring</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {WARTEG_TEMPLATES.map((tpl) => (
            <button
              key={tpl.name}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="flex flex-col text-left p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-amber-400 hover:bg-amber-50/40 transition-all shadow-2xs group"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-black text-neutral-900 group-hover:text-amber-950">
                  {tpl.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {tpl.tag}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium line-clamp-1">{tpl.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Menu Selection (Left Column) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Category Filter Pills (Fase 4.1a) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  activeCategory === cat.key
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-300"
                }`}
              >
                <span>{cat.title}</span>
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  {categories.find((c) => c.key === activeCategory)?.title || "Etalase Warteg"}
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  Ketuk untuk menambah atau mencoret lauk di piringmu
                </p>
              </div>
              <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                {selectedItems.length} Terpilih
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {displayedMenu.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item)}
                    className={`flex items-start justify-between p-3.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/70 ring-1 ring-amber-500/50 shadow-2xs"
                        : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/70"
                    }`}
                  >
                    <div className="space-y-1.5 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryIcon(item.category)}
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            isSelected ? "text-amber-950 font-black" : "text-neutral-900"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
                        <span>{item.calories} kkal</span>
                        <span>•</span>
                        <span>{item.protein_g}g pro</span>
                      </div>
                      {item.badge && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs font-black text-neutral-900">
                        Rp {item.minPrice.toLocaleString("id-ID")}–{item.maxPrice.toLocaleString("id-ID")}
                      </span>
                      <div
                        className={`mt-2 h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-amber-600 border-amber-600 text-white"
                            : "border-neutral-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Piring Warteg Preview & Kasir (Right Column) */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
            {/* Visual Piring */}
            <div className="relative rounded-2xl border-4 border-amber-100 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 p-5 text-center min-h-[190px] flex flex-col justify-between items-center shadow-inner">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900/80 bg-amber-100/70 px-3.5 py-1 rounded-full border border-amber-200">
                Isi Piringmu Sekarang
              </span>

              {selectedItems.length > 0 ? (
                <div className="flex flex-wrap justify-center items-center gap-2 my-4 max-w-sm">
                  {selectedItems.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-200 shadow-2xs text-xs font-bold text-neutral-800"
                    >
                      {getCategoryIcon(item.category)}
                      <span>{item.name.split("(")[0]}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="my-8 text-xs font-medium text-neutral-400">
                  Piring masih kosong. Pilih menu di samping untuk meracik!
                </p>
              )}

              {/* Total Kasir Warteg Rentang (Fase 4.1b) */}
              <div className="w-full pt-3 border-t border-amber-200/60 flex items-baseline justify-between">
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Total Tagihan Kasir
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
                  ≈ Rp {minCost.toLocaleString("id-ID")} – {maxCost.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Indikator Budget Makan (Fase 4.1d) */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-600 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Target Budget Per Makan:
                </span>
                <span className="text-neutral-900">Rp {perMealBudget.toLocaleString("id-ID")}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    budgetRatio > 115
                      ? "bg-rose-500"
                      : budgetRatio > 90
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, budgetRatio)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span
                  className={
                    isOverBudget
                      ? "text-rose-600 font-bold"
                      : "text-emerald-700 font-bold"
                  }
                >
                  {isOverBudget
                    ? `+ Rp ${(avgCost - perMealBudget).toLocaleString("id-ID")} dari target`
                    : `Hemat Rp ${(perMealBudget - avgCost).toLocaleString("id-ID")} dari target`}
                </span>
                <span className="text-neutral-400">{Math.round(budgetRatio)}% budget</span>
              </div>
            </div>

            {/* Komentar Pelayan Warteg (Fase 4.1c) */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-amber-950">
                <svg className="w-3.5 h-3.5 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Komentar Pelayan Warteg:
              </div>
              <p className="text-xs sm:text-sm text-neutral-800 font-medium leading-relaxed italic">
                &ldquo;{getWartegServerComment()}&rdquo;
              </p>
            </div>

            {/* Nutrition Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-2.5">
                <p className="text-[10px] font-bold text-neutral-500 uppercase">Kalori</p>
                <p className="text-base font-black text-black mt-0.5">{totalCalories}</p>
                <span className="text-[10px] text-neutral-400">kkal</span>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-2.5">
                <p className="text-[10px] font-bold text-neutral-500 uppercase">Protein</p>
                <p className="text-base font-black text-black mt-0.5">{totalProtein.toFixed(1)}</p>
                <span className="text-[10px] text-neutral-400">g</span>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-2.5">
                <p className="text-[10px] font-bold text-neutral-500 uppercase">Lemak</p>
                <p className="text-base font-black text-black mt-0.5">{totalFat.toFixed(1)}</p>
                <span className="text-[10px] text-neutral-400">g</span>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-2.5">
                <p className="text-[10px] font-bold text-neutral-500 uppercase">Serat</p>
                <p className="text-base font-black text-black mt-0.5">{totalFiber.toFixed(1)}</p>
                <span className="text-[10px] text-neutral-400">g</span>
              </div>
            </div>

            {/* Action Buttons (Fase 4.1e) */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleSaveToDiary}
                disabled={selectedItems.length === 0 || saving}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 p-3.5 font-bold text-white shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <span>Menyimpan ke Diari Makan...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Catat Menu Ini ke Diari Makan</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSharePlateImage}
                disabled={selectedItems.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 hover:border-black p-3 font-bold text-neutral-800 shadow-2xs transition-all active:scale-[0.99] disabled:opacity-50 text-xs sm:text-sm"
              >
                <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Bagikan Hasil Piring (Gambar Struk)</span>
              </button>

              {saveSuccess && (
                <div className="rounded-full border border-emerald-200 bg-emerald-50 py-2.5 px-4 text-xs font-bold text-emerald-900 text-center flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Piring Warteg tersimpan di Diari Kuliner!</span>
                </div>
              )}

              {shareSuccess && (
                <div className="rounded-full border border-amber-200 bg-amber-50 py-2.5 px-4 text-xs font-bold text-amber-900 text-center flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Gambar piring siap dibagikan ke teman kost!</span>
                </div>
              )}

              {saveError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 text-center">
                  {saveError}
                </div>
              )}

              {!user && (
                <p className="text-[11px] text-neutral-500 text-center">
                  <Link href="/login" className="underline font-bold text-neutral-700 hover:text-black">
                    Masuk akun
                  </Link>{" "}
                  agar racikan menu otomatis tersimpan di riwayat harianmu.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";

export interface RecipeHack {
  id: string;
  title: string;
  category: "nasi" | "lauk" | "sup";
  costPerPortion: number;
  cookTimeMinutes: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  equipment: string;
  badge: string;
  pantryIngredients: string[]; // ID bahan untuk fitur "Pakai yang ada di kost"
  ingredients: string[];
  steps: string[];
  proTip: string;
  troubleshooting: {
    problem: string;
    solution: string;
  };
}

// Opsi bahan yang umum tersimpan di kamar kost (Fase 4.3b)
export const PANTRY_OPTIONS = [
  { id: "beras", label: "Beras" },
  { id: "telur", label: "Telur" },
  { id: "mie", label: "Mie Instan" },
  { id: "tahu-tempe", label: "Tahu / Tempe" },
  { id: "ayam", label: "Daging Ayam" },
  { id: "ikan-teri", label: "Ikan Asin / Teri" },
  { id: "bawang", label: "Bawang Merah / Putih" },
  { id: "cabai", label: "Cabai" },
  { id: "kecap-saus", label: "Kecap / Saus" },
  { id: "santan", label: "Santan Instan" },
  { id: "sayuran", label: "Sayuran (Wortel/Sawi/Tomat)" },
];

export const RICE_COOKER_RECIPES: RecipeHack[] = [
  {
    id: "nasi-liwet-teri",
    title: "Nasi Liwet Teri Magic Com",
    category: "nasi",
    costPerPortion: 8500,
    cookTimeMinutes: 25,
    calories: 420,
    protein_g: 16,
    fat_g: 9,
    carbs_g: 68,
    fiber_g: 2.5,
    equipment: "Rice Cooker standar",
    badge: "Super Gurih Wangi",
    pantryIngredients: ["beras", "ikan-teri", "bawang", "cabai"],
    ingredients: [
      "Beras 1 cup (Rp 2.500)",
      "Teri asin / medan 30g (Rp 3.000)",
      "Bawang merah & putih iris (Rp 1.000)",
      "Serai, daun salam, cabai rawit utuh (Rp 1.000)",
      "Minyak goreng 1 sdm & garam secukupnya (Rp 1.000)",
    ],
    steps: [
      "Cuci bersih beras dan masukkan air sesuai takaran masak biasa di rice cooker.",
      "Goreng sebentar teri asin, bawang, dan cabai langsung di panci rice cooker (mode Cook) dengan 1 sdm minyak sampai wangi.",
      "Masukkan beras, daun salam, serai geprek, dan garam.",
      "Tutup rice cooker, tekan tombol 'Cook', dan tunggu hingga matang beralih ke 'Warm'. Aduk perlahan dan siap santap!",
    ],
    proTip: "Biarkan dalam posisi Warm selama 10 menit setelah tombol jeglek agar bumbu meresap sempurna ke bulir nasi.",
    troubleshooting: {
      problem: "Nasi bagian bawah agak gosong atau berkerak keras.",
      solution: "Kurangi waktu menumis teri di awal (cukup 1-2 menit saja), atau campurkan tumisan teri setelah air rebusan beras mulai hangat.",
    },
  },
  {
    id: "sup-telur-tomat",
    title: "Sup Telur Tomat Kilat 5 Menit",
    category: "sup",
    costPerPortion: 6000,
    cookTimeMinutes: 10,
    calories: 160,
    protein_g: 13,
    fat_g: 8,
    carbs_g: 8,
    fiber_g: 2,
    equipment: "Rice Cooker / Teko Listrik",
    badge: "Hangat & Segar",
    pantryIngredients: ["telur", "bawang", "sayuran"],
    ingredients: [
      "2 butir telur ayam (Rp 4.000)",
      "1 buah tomat merah matang potong dadu (Rp 1.000)",
      "Bawang putih cincang & daun bawang (Rp 500)",
      "Kecap asin, merica, kaldu bubuk, air 400ml (Rp 500)",
    ],
    steps: [
      "Panaskan air di panci rice cooker dalam mode Cook hingga mendidih.",
      "Masukkan tomat potong dan bawang putih cincang, biarkan tomat sedikit empuk dan mengeluarkan kaldu asam segar.",
      "Kocok lepas 2 butir telur di mangkuk kecil.",
      "Tuang telur perlahan ke dalam air mendidih sambil diaduk memutar cepat agar membentuk serabut pita telur yang cantik.",
      "Bumbui garam, merica, dan taburi daun bawang. Sajikan selagi hangat!",
    ],
    proTip: "Tambahkan sedikit larutan maizena kalau kamu suka tekstur kuah kental gurih ala restoran oriental.",
    troubleshooting: {
      problem: "Telur menggumpal jadi satu dan kuah jadi keruh.",
      solution: "Pastikan air benar-benar mendidih bergolak sebelum menuang kocokan telur, dan tuangkan perlahan sambil kuah diputar searah jarum jam.",
    },
  },
  {
    id: "omelet-mie-magic-com",
    title: "Omelet Mie Telur Sayur Tebal",
    category: "lauk",
    costPerPortion: 7500,
    cookTimeMinutes: 15,
    calories: 450,
    protein_g: 15,
    fat_g: 19,
    carbs_g: 54,
    fiber_g: 2.8,
    equipment: "Rice Cooker",
    badge: "Comfort Food Kost",
    pantryIngredients: ["mie", "telur", "sayuran"],
    ingredients: [
      "1 bungkus mie instan favorit (Rp 3.500)",
      "2 butir telur ayam (Rp 4.000)",
      "Irisan kol / wortel / daun bawang (Rp 1.000)",
      "1 sdm minyak / mentega untuk olesan panci",
    ],
    steps: [
      "Rebus mie setengah matang di panci rice cooker, lalu tiriskan.",
      "Campurkan mie rebus dengan bumbu mie, telur kocok, dan irisan sayuran.",
      "Olesi dasar panci rice cooker dengan sedikit minyak/mentega, lalu tuangkan adonan mie telur secara merata.",
      "Tekan tombol Cook. Jika tombol meloncat ke Warm sebelum matang, tunggu 2 menit lalu tekan Cook lagi hingga bagian bawah renyah keemasan.",
    ],
    proTip: "Potong seperti pizza dan nikmati dengan cocolan saus sambal pedas manis.",
    troubleshooting: {
      problem: "Tombol jeglek ke 'Warm' terlalu cepat padahal adonan atas masih basah.",
      solution: "Beri jeda 2 menit agar sensor dingin sebentar, lalu tekan lagi tombol 'Cook' atau biarkan tertutup rapat di posisi Warm selama 5 menit karena panas panci masih mematangkan bagian dalam.",
    },
  },
  {
    id: "nasi-kuning-magic-com",
    title: "Nasi Kuning Harum Gurih",
    category: "nasi",
    costPerPortion: 7000,
    cookTimeMinutes: 25,
    calories: 330,
    protein_g: 5.5,
    fat_g: 9,
    carbs_g: 56,
    fiber_g: 1.2,
    equipment: "Rice Cooker",
    badge: "Wangi Semerbak",
    pantryIngredients: ["beras", "santan", "bawang"],
    ingredients: [
      "Beras 1 cup (Rp 2.500)",
      "Santan instan 65ml (Rp 3.500)",
      "Kunyit bubuk 1/2 sdt (Rp 500)",
      "Daun pandan, serai, daun salam, sedikit garam (Rp 500)",
    ],
    steps: [
      "Cuci beras bersih, campurkan air dan santan dengan rasio normal masak nasi biasa.",
      "Larutkan bubuk kunyit dan garam ke dalam air santan, aduk rata hingga berwarna kuning cerah merata.",
      "Masukkan serai geprek, daun pandan ikat simpul, dan daun salam.",
      "Masak di rice cooker sampai tombol beralih ke Warm. Diamkan 10 menit sebelum dibuka dan diaduk.",
    ],
    proTip: "Cocok dipadu dengan orek tempe basah dan telur iris tipis ala sarapan pagi.",
    troubleshooting: {
      problem: "Nasi kuning agak pera atau kurang matang merata di bagian atas.",
      solution: "Santan membuat kuah lebih kental; percikkan 2-3 sdm air panas setelah matang lalu aduk nasi dan tutup kembali selama 5 menit dalam posisi Warm.",
    },
  },
  {
    id: "ayam-kecap-rice-cooker",
    title: "Ayam Kecap Manis Gurih Simple",
    category: "lauk",
    costPerPortion: 12000,
    cookTimeMinutes: 20,
    calories: 310,
    protein_g: 28,
    fat_g: 14,
    carbs_g: 16,
    fiber_g: 1.0,
    equipment: "Rice Cooker",
    badge: "Tinggi Protein",
    pantryIngredients: ["ayam", "kecap-saus", "bawang"],
    ingredients: [
      "Daging ayam potong 150g (Rp 8.000)",
      "Bawang bombay & bawang putih iris (Rp 1.500)",
      "Kecap manis 2 sdm, saus tiram 1 sdt, merica (Rp 1.500)",
      "Minyak 1 sdm & air 100ml (Rp 1.000)",
    ],
    steps: [
      "Tumis bawang di panci rice cooker (mode Cook) dengan minyak sampai harum selama 2 menit.",
      "Masukkan potongan ayam, aduk perlahan sampai berubah warna putih pucat.",
      "Tuangkan kecap manis, saus tiram, merica, dan 100ml air.",
      "Tutup dan biarkan mendidih serta kuah menyusut kental selama 12-15 menit hingga ayam empuk meresap.",
    ],
    proTip: "Bumbunya sangat gurih dan nikmat disiramkan langsung di atas nasi hangat pulen.",
    troubleshooting: {
      problem: "Kuah mengering dan gosong sebelum ayam empuk.",
      solution: "Tambahkan air hangat 50ml dan jangan buka-tutup panci terlalu sering agar uap panas pengempuk daging tetap terperangkap di dalam.",
    },
  },
  {
    id: "bubur-ayam-magic-com",
    title: "Bubur Ayam Gurih Magic Com",
    category: "nasi",
    costPerPortion: 7500,
    cookTimeMinutes: 35,
    calories: 290,
    protein_g: 18,
    fat_g: 6,
    carbs_g: 42,
    fiber_g: 1.5,
    equipment: "Rice Cooker",
    badge: "Sarapan Lembut Pulen",
    pantryIngredients: ["beras", "ayam", "bawang", "kecap-saus"],
    ingredients: [
      "Beras 1/2 cup cuci bersih (Rp 1.500)",
      "Fillet dada ayam 75g (Rp 4.000)",
      "Bawang putih cincang & jahe geprek (Rp 1.000)",
      "Kecap asin, minyak wijen/goreng 1 sdt, kaldu ayam (Rp 1.000)",
      "Air 4-5 gelas (rasio 1:8)",
    ],
    steps: [
      "Masukkan beras, air 4-5 gelas, jahe, dan bawang putih ke panci rice cooker.",
      "Masukkan potongan ayam mentah langsung ke dalam air beras agar kaldunya keluar meresap ke bulir bubur.",
      "Tekan tombol 'Cook'. Biarkan tutup sedikit diganjal sendok jika uap berbusa terlalu banyak.",
      "Setelah 25-30 menit, angkat ayam lalu suwir-suwir. Aduk bubur hingga lembut, tambahkan kecap asin dan suwiran ayam.",
    ],
    proTip: "Ganjal tutup rice cooker dengan sumpit bambu tahan panas agar busa tajin bubur tidak meluap ke luar.",
    troubleshooting: {
      problem: "Air tajin beras meluap keluar lewat lubang uap penutup.",
      solution: "Buka sedikit tutupnya atau ganjal pinggir tutup dengan sumpit bambu, lalu aduk sebentar bagian dasar panci.",
    },
  },
  {
    id: "nasi-tim-telur-jamur",
    title: "Nasi Tim Telur Jamur Praktis",
    category: "nasi",
    costPerPortion: 8000,
    cookTimeMinutes: 25,
    calories: 380,
    protein_g: 14,
    fat_g: 10,
    carbs_g: 58,
    fiber_g: 3.0,
    equipment: "Rice Cooker",
    badge: "Rasa Gurih Resto",
    pantryIngredients: ["beras", "telur", "bawang", "kecap-saus"],
    ingredients: [
      "Beras 1 cup (Rp 2.500)",
      "1 butir telur ayam (Rp 2.000)",
      "Jamur tiram suwir 50g (Rp 2.000)",
      "Kecap manis 1 sdm, kecap asin 1 sdm, merica (Rp 1.000)",
      "Bawang putih cincang & 1 sdm minyak (Rp 500)",
    ],
    steps: [
      "Tumis bawang putih dan jamur tiram sebentar dengan 1 sdm minyak di panci rice cooker.",
      "Masukkan beras dan air seperti menanak nasi biasa, tambahkan kecap manis, kecap asin, dan merica.",
      "Saat air mulai mendidih dan menyusut setengahnya, ceplok 1 butir telur utuh tepat di atas beras.",
      "Tutup dan biarkan hingga matang 'Warm'. Telur akan matang kukus lembut sempurna bersama nasi tim.",
    ],
    proTip: "Kuning telur setengah matang yang lumer saat diaduk bersama nasi tim panas memberi rasa creamy alami.",
    troubleshooting: {
      problem: "Kuning telur hancur dan tercampur keruh dengan kuah.",
      solution: "Jangan aduk setelah telur diceplokkan. Biarkan telur mengapung tenang di atas bulir beras hingga matang oleh uap.",
    },
  },
  {
    id: "mie-kuah-sayur-poached",
    title: "Mie Kuah Sayur Poached Egg",
    category: "sup",
    costPerPortion: 6500,
    cookTimeMinutes: 8,
    calories: 390,
    protein_g: 14,
    fat_g: 16,
    carbs_g: 48,
    fiber_g: 3.5,
    equipment: "Rice Cooker",
    badge: "Hangat Saat Hujan",
    pantryIngredients: ["mie", "telur", "sayuran", "cabai"],
    ingredients: [
      "1 bungkus mie instan kuah (Rp 3.500)",
      "1 butir telur ayam (Rp 2.000)",
      "Sawi hijau / kol & cabai rawit iris (Rp 1.000)",
      "Air 350ml",
    ],
    steps: [
      "Didihkan air di rice cooker dengan mode 'Cook'.",
      "Masukkan potongan sawi dan cabai rawit, lalu masukkan mie instan.",
      "Segera pecahkan telur di samping mie tanpa diaduk agar terbentuk poached egg yang lembut.",
      "Tutup rice cooker selama 3 menit. Tuangkan bumbu mie ke mangkuk, siram kuah dan tata mie serta telur di atasnya.",
    ],
    proTip: "Gunakan hanya 3/4 bungkus bumbu mie instan untuk menjaga asupan garam tetap seimbang, ganti rasa asin dengan cabai segar.",
    troubleshooting: {
      problem: "Mie jadi terlalu lembek dan lodoh karena ditinggal.",
      solution: "Set timer 3-4 menit di HP sejak mie masuk, langsung angkat saat mie masih sedikit kenyal.",
    },
  },
  {
    id: "nasi-goreng-magic-com",
    title: "Nasi Goreng Magic Com Teflon-Free",
    category: "nasi",
    costPerPortion: 6500,
    cookTimeMinutes: 15,
    calories: 410,
    protein_g: 12,
    fat_g: 13,
    carbs_g: 62,
    fiber_g: 1.8,
    equipment: "Rice Cooker",
    badge: "Solusi Nasi Sisa",
    pantryIngredients: ["beras", "telur", "bawang", "cabai", "kecap-saus"],
    ingredients: [
      "1 piring nasi dingin sisa semalam (Rp 2.000)",
      "1 butir telur ayam (Rp 2.000)",
      "Bawang merah, bawang putih, cabai rawit cincang (Rp 1.000)",
      "1 sdm margarin / minyak (Rp 500)",
      "Kecap manis 1 sdm, garam & kaldu secukupnya (Rp 1.000)",
    ],
    steps: [
      "Lelehkan margarin di panci rice cooker (mode Cook), masukkan irisan bawang dan cabai hingga harum.",
      "Pinggirkan bumbu, pecahkan telur di sisi panci lalu orak-arik hingga setengah matang.",
      "Masukkan nasi dingin, kecap manis, garam, dan kaldu.",
      "Aduk terus secara merata selama 4-5 menit hingga nasi berasap dan bumbu meresap sempurna.",
    ],
    proTip: "Gunakan sendok kayu atau centong silikon agar tidak merusak lapisan teflon antilengket panci.",
    troubleshooting: {
      problem: "Nasi menggumpal keras dan bumbu tidak tercampur rata.",
      solution: "Urai butiran nasi dingin dengan tangan bersih sebelum dimasukkan ke dalam panci agar bumbu merata seketika.",
    },
  },
  {
    id: "pepes-tahu-kukus",
    title: "Pepes Tahu Kukus Kemangi Magic Com",
    category: "lauk",
    costPerPortion: 5000,
    cookTimeMinutes: 20,
    calories: 180,
    protein_g: 15,
    fat_g: 9,
    carbs_g: 10,
    fiber_g: 3.2,
    equipment: "Rice Cooker + Tray Kukusan",
    badge: "Hemat & Rendah Lemak",
    pantryIngredients: ["tahu-tempe", "telur", "bawang", "cabai"],
    ingredients: [
      "2 buah tahu putih besar, haluskan (Rp 2.500)",
      "1 butir telur ayam kocok (Rp 2.000)",
      "Segenggam kemangi & cabai rawit utuh (Rp 500)",
      "Bawang merah, putih, garam, kaldu bubuk (Rp 500)",
      "Daun pisang / mangkuk tahan panas",
    ],
    steps: [
      "Campurkan tahu halus dengan telur kocok, irisan bawang, garam, kaldu bubuk, dan daun kemangi.",
      "Bungkus adonan dengan daun pisang atau letakkan di mangkuk kecil tahan panas.",
      "Taruh bungkusan di atas tray kukusan bawaan rice cooker (bisa dimasak berbarengan saat menanak nasi!).",
      "Kukus selama 15-20 menit sampai tahu memadat dan aroma kemangi harum merebak.",
    ],
    proTip: "Masak pepes tahu ini tepat di atas beras yang sedang dimasak nasi: sekali pencet, lauk dan nasi matang barengan!",
    troubleshooting: {
      problem: "Adonan pepes terlalu berair dan becek.",
      solution: "Peras air dari tahu putih menggunakan kain bersih sebelum dihaluskan bersama bumbu.",
    },
  },
  {
    id: "sup-ayam-jagung",
    title: "Sup Ayam Bening Jagung Manis",
    category: "sup",
    costPerPortion: 9500,
    cookTimeMinutes: 25,
    calories: 220,
    protein_g: 22,
    fat_g: 5,
    carbs_g: 22,
    fiber_g: 3.5,
    equipment: "Rice Cooker",
    badge: "Imun Booster Kost",
    pantryIngredients: ["ayam", "sayuran", "bawang"],
    ingredients: [
      "Dada ayam fillet potong dadu 100g (Rp 5.500)",
      "1/2 buah jagung manis pipil (Rp 1.500)",
      "1 buah wortel iris bulat (Rp 1.000)",
      "Bawang putih geprek, daun bawang, seledri (Rp 1.000)",
      "Garam, merica bubuk, air 500ml (Rp 500)",
    ],
    steps: [
      "Didihkan 500ml air bersama bawang putih geprek di rice cooker (mode Cook).",
      "Masukkan ayam dan jagung manis pipil, tutup dan biarkan mendidih selama 10 menit hingga kaldu ayam keluar.",
      "Masukkan irisan wortel, garam, dan merica bubuk. Masak 5-8 menit lagi hingga wortel empuk.",
      "Taburkan irisan daun bawang dan seledri sebelum dihidangkan.",
    ],
    proTip: "Kuah kaldu alami dari rebusan dada ayam dan jagung manis sangat gurih tanpa perlu tambahan banyak MSG.",
    troubleshooting: {
      problem: "Ada buih busa kecokelatan di permukaan kuah sup.",
      solution: "Sendok dan buang busa kaldu di 5 menit pertama perebusan ayam agar hasil kuah bening bersih dan harum.",
    },
  },
  {
    id: "tempe-orek-basah",
    title: "Tempe Orek Basah Manis Gurih",
    category: "lauk",
    costPerPortion: 5500,
    cookTimeMinutes: 15,
    calories: 260,
    protein_g: 17,
    fat_g: 11,
    carbs_g: 24,
    fiber_g: 4.2,
    equipment: "Rice Cooker",
    badge: "Lauk Awet Anak Kost",
    pantryIngredients: ["tahu-tempe", "kecap-saus", "bawang", "cabai"],
    ingredients: [
      "1 papan tempe potong dadu kecil (Rp 3.000)",
      "Bawang merah, putih, cabai merah iris (Rp 1.000)",
      "Kecap manis 2 sdm, gula merah sedikit, garam (Rp 1.000)",
      "Minyak 1 sdm & air 50ml (Rp 500)",
    ],
    steps: [
      "Panaskan 1 sdm minyak di panci rice cooker (mode Cook), tumis bawang dan cabai sampai wangi.",
      "Masukkan potongan tempe, aduk sebentar agar terkena minyak hangat.",
      "Tuangkan kecap manis, garam, dan 50ml air hangat.",
      "Aduk rata, tutup panci selama 5 menit hingga kuah kecap meresap pekat ke dalam tempe.",
    ],
    proTip: "Lauk ini tahan disimpan 1-2 hari di suhu ruang asalkan kuahnya dimasak hingga benar-benar meresap kesat.",
    troubleshooting: {
      problem: "Tempe masih berasa langu atau agak hambar di dalam.",
      solution: "Potong tempe lebih tipis/kecil dan biarkan mendidih dalam kuah kecap selama minimal 5 menit sebelum tombol jeglek.",
    },
  },
];

export default function RiceCookerHacks() {
  const [activeCategory, setActiveCategory] = useState<"all" | "nasi" | "lauk" | "sup">("all");
  const [expandedId, setExpandedId] = useState<string | null>("nasi-liwet-teri");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Filter "Pakai yang ada di kost" (Fase 4.3b)
  const [selectedPantry, setSelectedPantry] = useState<string[]>([]);
  const [isPantryFilterActive, setIsPantryFilterActive] = useState<boolean>(false);

  // Toggle checklist bahan kost
  const togglePantryIngredient = (id: string) => {
    setSelectedPantry((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter recipes berdasarkan kategori dan pantry
  const filteredRecipes = RICE_COOKER_RECIPES.filter((r) => {
    // Kategori
    if (activeCategory !== "all" && r.category !== activeCategory) {
      return false;
    }
    // Filter bahan kost jika aktif
    if (isPantryFilterActive && selectedPantry.length > 0) {
      // Tampilkan resep yang setidaknya memiliki 1 atau lebih bahan yang dicentang
      const matchCount = r.pantryIngredients.filter((p) => selectedPantry.includes(p)).length;
      return matchCount > 0;
    }
    return true;
  });

  const handleCopyIngredients = (recipe: RecipeHack) => {
    const text = `Belanja Masak ${recipe.title}:\n- ` + recipe.ingredients.join("\n- ");
    navigator.clipboard.writeText(text);
    setCopiedId(recipe.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveToHistory = async (recipe: RecipeHack) => {
    try {
      const payload = {
        foods: [
          {
            name: recipe.title,
            portion_grams: 250,
            nutrition: {
              calories: recipe.calories,
              protein_g: recipe.protein_g,
              fat_g: recipe.fat_g,
              carbs_g: recipe.carbs_g,
              fiber_g: recipe.fiber_g,
            },
          },
        ],
        total_nutrition: {
          calories: recipe.calories,
          protein_g: recipe.protein_g,
          fat_g: recipe.fat_g,
          carbs_g: recipe.carbs_g,
          fiber_g: recipe.fiber_g,
        },
      };

      const res = await fetch("/api/nutrition-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSavedId(recipe.id);
        setTimeout(() => setSavedId(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Banner */}
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 md:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-amber-50 mb-3 border border-white/20">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Masak Hemat Tanpa Kompor Ribet</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Kosan Hacks: 12 Resep Rice Cooker Lezat & Murah
          </h2>
          <p className="mt-2 text-sm sm:text-base text-amber-50/90 leading-relaxed font-medium">
            Siapa bilang anak kost cuma bisa makan mie instan polos? Cuma modal 1 rice cooker, kamu bisa bikin hidangan lezat berprotein tinggi dengan modal di bawah Rp 10.000/porsi!
          </p>
        </div>
      </div>

      {/* 4.3d Peringatan Keselamatan Rice Cooker Anak Kost */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-amber-200 text-amber-900 border border-amber-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
          <h3 className="text-sm sm:text-base font-black text-amber-950">
            Panduan Keselamatan Memasak dengan Rice Cooker
          </h3>
        </div>
        <p className="text-xs text-amber-900 font-medium">
          Rice cooker dirancang praktis, tetapi tetap alat listrik bertegangan tinggi. Ikuti 5 tips aman ini:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 text-xs text-amber-950">
          <div className="rounded-xl bg-white/80 p-3.5 border border-amber-200 flex items-start gap-2">
            <span className="font-bold text-amber-700">1.</span>
            <span><strong>Batas Garis Maksimal:</strong> Jangan isi air/kuah melebihi batas <em>MAX</em> agar tidak meluap ke elemen pemanas bawah.</span>
          </div>
          <div className="rounded-xl bg-white/80 p-3.5 border border-amber-200 flex items-start gap-2">
            <span className="font-bold text-amber-700">2.</span>
            <span><strong>Waspada Uap Panas:</strong> Jangan posisikan wajah atau tangan tepat di atas lubang ventilasi uap saat mendidih atau saat membuka tutup.</span>
          </div>
          <div className="rounded-xl bg-white/80 p-3.5 border border-amber-200 flex items-start gap-2">
            <span className="font-bold text-amber-700">3.</span>
            <span><strong>Daging & Telur Matang:</strong> Pastikan ayam matang tanpa semburat merah dan putih telur mengeras sempurna demi higienitas pencernaan.</span>
          </div>
          <div className="rounded-xl bg-white/80 p-3.5 border border-amber-200 flex items-start gap-2">
            <span className="font-bold text-amber-700">4.</span>
            <span><strong>Gunakan Centong Non-Besi:</strong> Pakai sendok kayu atau centong plastik agar lapisan antilengket panci tidak tergores.</span>
          </div>
          <div className="rounded-xl bg-white/80 p-3.5 border border-amber-200 flex items-start gap-2">
            <span className="font-bold text-amber-700">5.</span>
            <span><strong>Cabut Colokan Usai Masak:</strong> Selalu cabut kabel listrik bila sudah selesai makan agar hemat daya dan mencegah korsleting.</span>
          </div>
          <div className="rounded-xl bg-white/80 p-3.5 border border-amber-200 flex items-start gap-2">
            <span className="font-bold text-amber-700">6.</span>
            <span><strong>Panci Bagian Luar Kering:</strong> Lap kering dasar luar panci sebelum dimasukkan ke badan rice cooker agar elemen tidak mendesis atau rusak.</span>
          </div>
        </div>
      </div>

      {/* 4.3b Filter "Pakai yang ada di kost" */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-neutral-900 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Filter: &ldquo;Pakai yang Ada di Kost&rdquo;</span>
            </h3>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Centang bahan apa saja yang ada di kamarmu, kami rekomendasikan resep yang cocok tanpa perlu belanja banyak!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsPantryFilterActive(!isPantryFilterActive);
                if (!isPantryFilterActive && selectedPantry.length === 0) {
                  // Default preselect 2-3 common items
                  setSelectedPantry(["beras", "telur"]);
                }
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] cursor-pointer ${
                isPantryFilterActive
                  ? "bg-orange-700 text-white shadow-2xs"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {isPantryFilterActive ? "Filter Bahan Aktif" : "Aktifkan Filter Bahan Kost"}
            </button>
            {selectedPantry.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedPantry([])}
                className="text-xs font-semibold text-neutral-400 hover:text-black underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Pantry Checklist Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {PANTRY_OPTIONS.map((item) => {
            const isChecked = selectedPantry.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  togglePantryIngredient(item.id);
                  if (!isPantryFilterActive) setIsPantryFilterActive(true);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border min-h-[36px] cursor-pointer ${
                  isChecked
                    ? "bg-amber-100 border-amber-400 text-amber-950 font-black shadow-2xs"
                    : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                <span>{item.label}</span>
                {isChecked && <span className="text-amber-800 font-bold">✓</span>}
              </button>
            );
          })}
        </div>

        {isPantryFilterActive && (
          <p className="text-xs text-neutral-500 font-medium pt-1 border-t border-neutral-100">
            Ditemukan <strong>{filteredRecipes.length}</strong> resep yang cocok dengan stok bahanmu.
          </p>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {([
          { key: "all" as const, label: "Semua Resep (12)" },
          { key: "nasi" as const, label: "Aneka Nasi (5)" },
          { key: "lauk" as const, label: "Lauk Praktis (4)" },
          { key: "sup" as const, label: "Sup Segar (3)" },
        ]).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all min-h-[40px] cursor-pointer ${
              activeCategory === tab.key
                ? "bg-orange-700 text-white shadow-xs"
                : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* State Kosong bila filter tidak cocok */}
      {filteredRecipes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 border border-amber-300">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-amber-950">
              Belum ada resep yang cocok dengan bahan ini
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
              Coba centang bahan dasar seperti <strong>Beras</strong> atau <strong>Telur</strong> untuk melihat rekomendasi kreasi rice cooker yang paling pas!
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedPantry(["beras", "telur"]);
              setIsPantryFilterActive(false);
            }}
            className="px-5 py-2.5 rounded-full bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs sm:text-sm shadow-xs min-h-[44px] cursor-pointer inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Tampilkan Semua Resep</span>
          </button>
        </div>
      ) : (
        /* Recipes Grid (4.3a) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredRecipes.map((recipe) => {
            const isExpanded = expandedId === recipe.id;
            // Hitung persentase kecocokan bahan jika filter aktif
            const matchedIngredients = recipe.pantryIngredients.filter((p) =>
              selectedPantry.includes(p)
            );
            const isFullyMatched =
              selectedPantry.length > 0 &&
              recipe.pantryIngredients.every((p) => selectedPantry.includes(p));

            return (
              <div
                key={recipe.id}
                className={`rounded-2xl border transition-all bg-white shadow-xs overflow-hidden flex flex-col justify-between ${
                  isExpanded
                    ? "border-amber-400 ring-1 ring-amber-400/40"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {/* Card Header */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {recipe.badge}
                        </span>
                        {isPantryFilterActive && isFullyMatched && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            Bahan Lengkap di Kost!
                          </span>
                        )}
                        {isPantryFilterActive && !isFullyMatched && matchedIngredients.length > 0 && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-300">
                            ✓ {matchedIngredients.length}/{recipe.pantryIngredients.length} Bahan Tersedia
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-neutral-900 leading-snug">
                        {recipe.title}
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium mt-1 flex items-center gap-1">
                        <span>Alat: <strong>{recipe.equipment}</strong></span>
                        <span>•</span>
                        <svg className="w-3.5 h-3.5 text-neutral-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{recipe.cookTimeMinutes} menit</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                        Modal / Porsi
                      </span>
                      <span className="text-base sm:text-lg font-black text-orange-900">
                        Rp {recipe.costPerPortion.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Macro Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      {recipe.calories} kkal
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                      {recipe.protein_g}g Protein
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                      {recipe.carbs_g}g Karbo
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                      {recipe.fiber_g}g Serat
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : recipe.id)}
                      className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 py-2.5 text-xs font-bold text-neutral-800 transition-colors flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                    >
                      <span>{isExpanded ? "Tutup Resep" : "Lihat Cara Masak & Bahan"}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyIngredients(recipe)}
                      className="px-4 py-2.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors shrink-0 min-h-[44px] cursor-pointer inline-flex items-center gap-1.5"
                      title="Salin Daftar Belanjaan"
                    >
                      {copiedId === recipe.id ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Disalin</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>Bahan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Accordion Content (4.3a) */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 bg-neutral-50/70 p-5 sm:p-6 space-y-4">
                    {/* Ingredients with estimated cost */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                        Bahan-Bahan yang Dibutuhkan:
                      </h4>
                      <ul className="space-y-1.5 text-xs text-neutral-700">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Numbered Steps */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                        Langkah Pembuatan Bernomor:
                      </h4>
                      <ol className="space-y-2 text-xs text-neutral-800">
                        {recipe.steps.map((st, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="h-5 w-5 rounded-full bg-orange-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{st}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Pro Tip */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950 flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p className="leading-snug">
                        <strong>Trik Kost:</strong> {recipe.proTip}
                      </p>
                    </div>

                    {/* Tips Gagal-dan-Solusi (Troubleshooting) (4.3a) */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-3 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-neutral-800 font-bold">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Tips Gagal & Solusi:</span>
                      </div>
                      <p className="text-neutral-600 leading-snug">
                        <strong>Kendala:</strong> {recipe.troubleshooting.problem}
                      </p>
                      <p className="text-emerald-800 font-medium leading-snug">
                        <strong>Solusi:</strong> {recipe.troubleshooting.solution}
                      </p>
                    </div>

                    {/* Save to History */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleSaveToHistory(recipe)}
                        className="w-full rounded-full bg-orange-700 hover:bg-orange-800 text-white py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.99] min-h-[44px] cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>
                          {savedId === recipe.id
                            ? "Tersimpan di Diari Kuliner!"
                            : "Catat Resep Ini ke Diari Makan"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
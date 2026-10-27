import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { Mistral } from "@mistralai/mistralai";
import { prisma } from "@/lib/prisma";

/**
 * Ambil acuan harga bahan pangan terkini langsung dari tabel Ingredient (database),
 * supaya estimasi biaya resep AI selalu konsisten dengan data harga pasar yang tersimpan.
 */
async function getIngredientPriceReference(): Promise<string> {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: "asc" },
      select: { name: true, unit: true, pricePerUnit: true, region: true },
    });

    if (ingredients.length === 0) return "";

    const region = ingredients[0]?.region || "Bandar Lampung";

    const lines = ingredients.map(
      (i) => `- ${i.name}: Rp ${Math.round(i.pricePerUnit).toLocaleString("id-ID")}/${i.unit}`
    );

    return `\n\nACUAN HARGA BAHAN PANGAN REAL DARI DATABASE (${region}, update terakhir):\n${lines.join(
      "\n"
    )}\nGunakan harga di atas sebagai dasar perhitungan "estimatedCost" dan harga per item pada array "ingredients" agar akurat.`;
  } catch (error) {
    console.error("[Ask Recipe AI] Gagal memuat acuan harga bahan dari database:", error);
    return "";
  }
}

export interface AskRecipeRequest {
  prompt?: string;
  ingredients?: string;
  budget?: number;
  cookingTool?: string;
  dietaryGoal?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  category: string;
  cookTimeMinutes: number;
  portions: number;
  estimatedCost: number;
  cookingTool: string;
  ingredients: string[];
  steps: string[];
  nutrition: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  chefTips: string;
  healthTags: string[];
}

export interface AskRecipeResponse {
  replyText: string;
  recipe?: GeneratedRecipe | null;
  suggestions: string[];
}

export const ASK_RECIPE_SYSTEM_PROMPT = `
Kamu adalah "Chef Kost AI", asisten koki pintar dan ahli gizi ramah khusus anak kost di Indonesia dari aplikasi DompetKost.
Gaya bicaramu: hangat, suportif, santai khas mahasiswa/anak muda Indonesia, cerdas dalam menghemat uang belanja, dan selalu peduli gizi seimbang.

Tugas utamamu:
1. Membantu pengguna menemukan ide masakan lezat, praktis, bergizi, dan murah meriah.
2. Memaksimalkan bahan-bahan yang pengguna miliki di kost (mengurangi mubazir / sisa makanan).
3. Menyesuaikan alat masak yang umum di kamar kost (Rice Cooker, Kompor 1 Tungku / Wajan Teflon, Panci Rebus, atau Air Panas).
4. Menyediakan kalkulasi nutrisi ilmiah (Kalori, Protein, Lemak, Karbohidrat, Serat) dan perkiraan biaya belanja pasar/warung (Rupiah).
5. Selalu memberikan tips memasak hemat ("chefTips").

ATURAN OUTPUT MUTLAK:
- JIKA pengguna HANYA MENYAPA (misalnya: "hai", "halo", "selamat pagi", "assalamualaikum", "ping"), perkenalkan diri secara hangat sebagai Chef AI DompetKost, tanyakan bahan makanan apa yang mereka miliki atau masakan apa yang ingin dibuat.
  PADA KASUS MENYAPA / BERBINCANG: WAJIB SET "recipe": null.
- JIKA pengguna BERTANYA TIPS KULINER / NON-RESEP (misal: "cara simpan tahu biar gak asem", "berapa lama rebus telur", "tips belanja hemat", "cara bersihkan kerak rice cooker"):
  Jawab secara lengkap, praktis, dan ramah di "replyText", dan WAJIB SET "recipe": null.
- JIKA pengguna MENGUCAPKAN TERIMA KASIH atau penutup percakapan ("makasih", "mantap", "sip"):
  Balas dengan santai dan beri semangat memasak di "replyText", dan WAJIB SET "recipe": null.
- HANYA JIKA pengguna MEMINTA RESEP, menyebutkan bahan makanan yang ingin dimasak, atau meminta ide masakan:
  Berikan objek "recipe" yang lengkap sesuai format JSON di bawah.

ATURAN FORMATTING TEKS PADA "replyText":
- DILARANG menggunakan karakter asterisk (*) atau bintang liar untuk bullet points atau penekanan berlebihan. Jangan menuliskan teks seperti "*Catatan:*" atau "**Judul**" jika tidak diperlukan. Tuliskan teks secara bersih dan natural.
- Jika perlu membuat daftar atau poin-poin penjelasan, gunakan nomor (1., 2.) atau tanda strip (-), jangan gunakan asterisk (*).
- Tulisan harus mengalir hangat, santai, komunikatif, dan langsung nyaman dibaca seperti obrolan WhatsApp/chat anak muda.

PATOKAN HARGA BAHAN PANGAN REAL (Bandar Lampung / Pasar Tradisional Indonesia):
- Beras: Rp 15.100/kg (~Rp 1.500/porsi)
- Telur Ayam: Rp 28.500/kg (~Rp 1.800 - 2.000/butir)
- Daging Ayam: Rp 33.800/kg (~Rp 8.500/250g)
- Tempe: Rp 5.000/papan
- Tahu: Rp 4.000/bungkus
- Minyak Goreng: Rp 21.000/liter (~Rp 1.000/pemakaian)
- Bawang Merah & Putih: Rp 1.000 - 1.500 untuk bumbu 1 porsi
- Cabai Merah: Rp 1.000 - 2.000 untuk bumbu pedas 1 porsi
- Sayuran (Kangkung, Bayam, Sawi): Rp 2.500 - 3.000/ikat
- Mie Instan: Rp 3.000/bungkus
- Ikan Lele / Nila: Rp 25.000 - 30.000/kg
- Daging Sapi: Rp 140.000/kg
Gunakan acuan harga pasar di atas saat menghitung "estimatedCost" dan estimasi harga per item di dalam "ingredients" agar angka perhitungan akurat dan realistis.

Format output WAJIB HANYA JSON MURNI (valid JSON) tanpa awalan/akhiran markdown:
{
  "replyText": "Penjelasan ramah dari Chef Kost AI kepada user...",
  "recipe": {
    "title": "Nama Resep Unik & Menggugah Selera",
    "description": "Deskripsi singkat resep (1-2 kalimat)",
    "category": "Lauk Hemat | Rice Cooker | Sayur & Sup | Sarapan | Camilan",
    "cookTimeMinutes": 15,
    "portions": 1,
    "estimatedCost": 12000,
    "cookingTool": "Rice Cooker | Teflon / Wajan | Panci | Tanpa Api",
    "ingredients": [
      "2 butir telur ayam (Rp 4.000)",
      "1 kotak tahu putih, potong dadu (Rp 2.500)",
      "2 siung bawang merah & 1 siung bawang putih (Rp 1.000)",
      "1 sdm kecap manis & sedikit garam"
    ],
    "steps": [
      "Kocok telur bersama tahu dadu dan sedikit garam hingga merata.",
      "Panaskan 1 sdm minyak di wajan atau rice cooker (mode cook).",
      "Tuang adonan telur tahu, masak dengan api kecil hingga bagian bawah kecokelatan.",
      "Balik perlahan, beri kecap manis di atasnya, angkat dan nikmati hangat!"
    ],
    "nutrition": {
      "calories": 380,
      "protein_g": 22.5,
      "fat_g": 14.0,
      "carbs_g": 38.0,
      "fiber_g": 3.0
    },
    "chefTips": "Gunakan api kecil saat mendadar tahu telur agar bagian dalamnya matang merata tanpa gosong.",
    "healthTags": ["Tinggi Protein", "Hemat Kantong", "Cepat Matang"]
  },
  "suggestions": [
    "Bisa dibuat versi tanpa minyak gak?",
    "Gimana kalau ditambah nasi langsung?",
    "Ide olahan tempe untuk menu besok"
  ]
}
`.trim();

function cleanJson(str: string) {
  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Format JSON tidak valid");
  return JSON.parse(str.substring(start, end + 1));
}

export function normalizeRecipe(raw: any): GeneratedRecipe | null {
  if (!raw || typeof raw !== "object" || !raw.title) return null;

  const rawSteps = Array.isArray(raw.steps) ? raw.steps : [];
  const steps: string[] = rawSteps
    .map((s: any, idx: number) => {
      if (typeof s === "string") return s;
      if (s && typeof s === "object") {
        return s.description || s.text || s.instruction || s.step || `Langkah ${idx + 1}`;
      }
      return String(s || "");
    })
    .filter(Boolean);

  const rawIngredients = Array.isArray(raw.ingredients) ? raw.ingredients : [];
  const ingredients: string[] = rawIngredients
    .map((ing: any) => {
      if (typeof ing === "string") return ing;
      if (ing && typeof ing === "object") {
        const name = ing.name || ing.item || ing.ingredient || "";
        const amount = ing.amount || ing.quantity || ing.portion || "";
        const cost = ing.estimatedCost || ing.cost || ing.price;
        const costStr = cost
          ? ` (Rp ${typeof cost === "number" ? cost.toLocaleString("id-ID") : cost})`
          : "";
        return `${amount ? `${amount} ` : ""}${name}${costStr}`.trim() || JSON.stringify(ing);
      }
      return String(ing || "");
    })
    .filter(Boolean);

  let chefTips: string | undefined = undefined;
  if (typeof raw.chefTips === "string") {
    chefTips = raw.chefTips;
  } else if (Array.isArray(raw.chefTips)) {
    chefTips = raw.chefTips
      .map((t: any) => (typeof t === "string" ? t : t?.tip || t?.text || JSON.stringify(t)))
      .filter(Boolean)
      .join(" ");
  } else if (raw.chefTips && typeof raw.chefTips === "object") {
    chefTips = raw.chefTips.tip || raw.chefTips.text || JSON.stringify(raw.chefTips);
  }

  const rawTags = Array.isArray(raw.healthTags) ? raw.healthTags : [];
  const healthTags: string[] = rawTags
    .map((t: any) => (typeof t === "string" ? t : String(t)))
    .filter(Boolean);

  const nutrition =
    raw.nutrition && typeof raw.nutrition === "object"
      ? {
          calories: Number(raw.nutrition.calories) || 0,
          protein_g: Number(raw.nutrition.protein_g ?? raw.nutrition.protein) || 0,
          fat_g: Number(raw.nutrition.fat_g ?? raw.nutrition.fat) || 0,
          carbs_g: Number(raw.nutrition.carbs_g ?? raw.nutrition.carbs) || 0,
          fiber_g: Number(raw.nutrition.fiber_g ?? raw.nutrition.fiber) || 0,
        }
      : { calories: 300, protein_g: 10, fat_g: 10, carbs_g: 40, fiber_g: 2 };

  return {
    title: String(raw.title || "Resep Kost Praktis"),
    description: String(raw.description || "Menu lezat hemat bergizi."),
    category: String(raw.category || "Lauk Hemat"),
    cookTimeMinutes: Number(raw.cookTimeMinutes) || 15,
    portions: Number(raw.portions) || 1,
    estimatedCost: Number(raw.estimatedCost) || 10000,
    cookingTool: String(raw.cookingTool || "Wajan / Teflon"),
    ingredients: ingredients.length ? ingredients : ["Bahan sesuai persediaan di kost"],
    steps: steps.length ? steps : ["Masak semua bahan hingga matang."],
    nutrition,
    chefTips: chefTips || "Masak dengan api sedang dan bumbui secukupnya agar pas di lidah.",
    healthTags: healthTags.length ? healthTags : ["Hemat", "Praktis"],
  };
}

// ----------------------------------------------------
// HEURISTIC / LOCAL INTELLIGENCE ENGINE FOR CHEF KOST
// ----------------------------------------------------

export function hasRecipeIntent(text: string): boolean {
  const norm = text.toLowerCase();
  return /\b(resep|masak|bikin|buatkan|goreng|tumis|rebus|panggang|sayur|sup|sop|nasi|telur|tahu|tempe|ayam|mie|sarden|sosis|bakso|kangkung|bayam|daging|ikan|sarapan|makan|lauk|bahan|budget|rp|ribu|porsi|kalori|racik)\b/i.test(
    norm
  );
}

export function isGreetingOnly(text: string): boolean {
  const norm = text.trim().toLowerCase();
  if (!norm) return true;
  // If query mentions ingredients or explicit recipe actions, it's not JUST a greeting
  if (hasRecipeIntent(norm)) return false;

  const greetingRegex =
    /^(hai|halo|helo|hello|hey|hei|hi|pagi|siang|sore|malam|assalamu'?alaikum|assalamualaikum|samlikum|ping|test|tes|halo chef|hi chef|hai chef|selamat pagi|selamat siang|selamat sore|selamat malam)[!?. ]*$/i;
  return greetingRegex.test(norm);
}

export function isIdentityOrAbout(text: string): boolean {
  const norm = text.trim().toLowerCase();
  return (
    /\b(siapa kamu|kamu siapa|bisa apa|bisa ngapain|fungsi kamu|tentang kamu|fitur kamu|cara pakai|siapa anda|apa tugasmu)\b/i.test(
      norm
    ) && !hasRecipeIntent(norm)
  );
}

export function isGratitudeOrClosing(text: string): boolean {
  const norm = text.trim().toLowerCase();
  if (hasRecipeIntent(norm)) return false;
  return (
    norm.length <= 40 &&
    /\b(terima kasih|terimakasih|makasih|makasi|thanks|thank you|matur nuwun|mantap|keren|oke deh|sip|siap chef|siap|makasih chef)\b/i.test(
      norm
    )
  );
}

export function getCulinaryTipsResponse(text: string): AskRecipeResponse | null {
  const norm = text.toLowerCase();

  // 1. Simpan bahan makanan & anti basi
  if (/\b(simpan|menyimpan|awet|tahan lama|basi|busuk|kulkas|tanpa kulkas)\b/i.test(norm)) {
    return {
      replyText:
        "Berikut tips jitu menyimpan bahan makanan di kamar kost agar tetap awet dan segar meski fasilitas terbatas:\n\n" +
        "🥚 **Telur Ayam**: Jangan mencuci telur sebelum disimpan. Air merusak lapisan kutikula pelindung alami sehingga bakteri mudah masuk. Simpan telur dengan ujung runcing menghadap ke bawah agar kantung udara di bagian tumpul tetap di atas dan kuning telur tetap segar di tengah. Tahan 3-4 minggu di suhu ruang!\n\n" +
        "🧈 **Tahu Putih**: Tahu cepat berlendir/asam karena air rendaman mentah. Rebus tahu sebentar (2 menit) dalam air mendidih yang diberi sejumput garam, tiriskan hingga dingin, lalu simpan dalam wadah tertutup berisi air matang dingin. Ganti air matangnya tiap 1-2 hari. Awet 4-5 hari tanpa kulkas!\n\n" +
        "🌱 **Tempe**: Bungkus tempe rapat dengan kertas koran atau wadah berpori. Jangan simpan dalam kantong plastik kedap udara yang lembap/berembun karena kelembapan membuat tempe cepat berlendir dan menghitam.\n\n" +
        "🥬 **Sayuran Hijau**: Jangan dicuci sebelum disimpan. Bungkus dengan tisu dapur atau kertas koran kering, lalu letakkan di tempat yang sejuk dan tidak terpapar sinar matahari langsung.",
      recipe: null,
      suggestions: [
        "Resep olahan tahu tempe hemat",
        "Berapa menit merebus telur yang pas?",
        "Tips belanja hemat anak kost di pasar",
      ],
    };
  }

  // 2. Merebus telur / waktu kematangan
  if (/\b(rebus telur|berapa menit|telur setengah matang|waktu rebus|soft boiled|hard boiled)\b/i.test(norm)) {
    return {
      replyText:
        "Panduan durasi merebus telur yang pas (masukkan telur setelah air mendidih di atas api sedang):\n\n" +
        "⏱️ **6 Menit (Soft Boiled)**: Putih telur lembut, kuning telur masih cair meleleh sempurna ala telur ramen Jepang.\n" +
        "⏱️ **8 Menit (Medium / Jammy)**: Putih telur matang kokoh, kuning telur berbentuk pasta lembut yang lumer di mulut.\n" +
        "⏱️ **10-12 Menit (Hard Boiled)**: Matang sempurna sampai ke bagian dalam, sangat cocok untuk lauk bekal atau campuran sup.\n\n" +
        "💡 **Trik Chef Kost**: Tambahkan 1/2 sdt garam atau 1 sdt cuka ke air rebusan agar kulit telur tidak retak. Begitu matang, segera rendam telur dalam mangkuk air dingin selama 3 menit agar kulitnya terkelupas sangat mulus tanpa cacat!",
      recipe: null,
      suggestions: [
        "Resep telur dadar tebal ala warteg",
        "Resep telur ceplok kecap pedas",
        "Ide menu sarapan kilat anak kost",
      ],
    };
  }

  // 3. Masak nasi & perawatan rice cooker
  if (/\b(air beras|takaran air|nasi lembek|nasi keras|beras pulen|rice cooker gosong|kerak rice cooker|nasi basi)\b/i.test(norm)) {
    return {
      replyText:
        "Trik rahasia memasak nasi pulen dan merawat rice cooker di kost:\n\n" +
        "🍚 **Takaran Air Pulen**: Gunakan rasio 1 ruas jari telunjuk di atas permukaan beras yang sudah diratakan. Untuk beras yang agak keras/pera, lebihkan 1-2 sdm air.\n\n" +
        "✨ **Mencegah Nasi Cepat Basi/Kuning**: Segera setelah tombol berpindah dari COOK ke WARM, buka penutup rice cooker dan aduk nasi dari bawah ke atas agar uap air panas keluar merata, lalu tutup kembali. Uap air yang terperangkap adalah biang keladi nasi cepat berlendir dan basi!\n\n" +
        "🧽 **Membersihkan Kerak Gosong**: Jangan pernah mengerik panci dengan sendok logam! Rendam panci dengan air panas yang diberi 1 sdm sabun cuci piring atau garam dapur selama 20-30 menit. Kerak nasi akan melunak dan terlepas sendiri tanpa menggores teflon.",
      recipe: null,
      suggestions: [
        "Resep nasi liwet rice cooker praktis",
        "Resep nasi goreng rice cooker",
        "Ide masakan 1 panci hemat",
      ],
    };
  }

  // 4. Belanja hemat & manajemen budget
  if (/\b(belanja hemat|tips hemat|hemat uang makan|uang belanja|anak kost hemat|atur budget|tips belanja)\b/i.test(norm)) {
    return {
      replyText:
        "Strategi belanja cerdas agar dompet aman dan asupan gizi tetap tercukupi:\n\n" +
        "1. **Beli Telur Per Kilogram**: Di warung eceran, 1 butir telur sering dihargai Rp 2.500 - 3.000. Kalau beli per 1 kg di pasar atau agen telur (sekitar Rp 28.000 isi 16 butir), jatuhnya cuma Rp 1.750 per butir!\n" +
        "2. **Jadikan Tahu & Tempe Sahabat Utama**: Rp 5.000 sudah dapat 1 papan tempe dan 1 bungkus tahu, cukup untuk 3 kali makan dengan asupan protein nabati lebih dari 30 gram.\n" +
        "3. **Belanja ke Pasar Tradisional Pagi/Sore**: Harga sayuran dan bumbu di pasar tradisional bisa 40-50% lebih hemat dibanding minimarket.\n" +
        "4. **Selalu Masak Nasi Sendiri**: Membeli nasi putih di warung menghabiskan Rp 4.000 - 5.000 per porsi. Kalau masak beras sendiri di rice cooker, biayanya kurang dari Rp 1.000 per porsi!",
      recipe: null,
      suggestions: [
        "Rekomendasi resep di bawah Rp 10.000",
        "Resep olahan telur tinggi protein",
        "Ide menu meal-prep 3 hari",
      ],
    };
  }

  return null;
}

// ----------------------------------------------------
// KOST CULINARY DATABASE FOR HEURISTIC RECOMMENDATIONS
// ----------------------------------------------------

interface KostRecipeEntry {
  keys: string[];
  toolMatch: string[];
  recipe: GeneratedRecipe;
  friendlyReason: string;
}

const KOST_RECIPES_CATALOG: KostRecipeEntry[] = [
  {
    keys: ["telur dadar", "dadar", "omelet", "warteg", "telur bawang", "telur"],
    toolMatch: ["wajan", "teflon", "kompor"],
    friendlyReason: "Menu favorit anak kost dengan bahan telur yang selalu ada, gurih garing berempah, dan tinggi protein.",
    recipe: {
      title: "Omelet Telur Bawang Cabai Gurih",
      description: "Telur dadar tebal garing di luar lembut di dalam dengan wangi bawang melimpah dan sengatan cabai rawit.",
      category: "Sarapan",
      cookTimeMinutes: 10,
      portions: 1,
      estimatedCost: 6500,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "2 butir telur ayam (Rp 4.000)",
        "3 siung bawang merah, iris tebal (Rp 1.500)",
        "2 buah cabai rawit merah, iris (Rp 500)",
        "1/2 batang daun bawang & sejumput garam/kaldu bubuk (Rp 500)",
      ],
      steps: [
        "Kocok lepas telur bersama irisan bawang merah, cabai, daun bawang, dan kaldu bubuk sampai berbusa.",
        "Panaskan 2 sdm minyak di wajan hingga benar-benar panas.",
        "Tuang kocokan telur, kecilkan api ke sedang. Biarkan pinggirannya mengembang garing.",
        "Balik sekali, masak hingga kedua sisi kecokelatan keemasan. Sajikan hangat bersama nasi!",
      ],
      nutrition: {
        calories: 275,
        protein_g: 14.5,
        fat_g: 18.0,
        carbs_g: 6.5,
        fiber_g: 1.2,
      },
      chefTips: "Kocok telur agak lama sampai berbusa dan pastikan minyak cukup panas agar telur dadar mengembang keriting garing.",
      healthTags: ["Tinggi Protein", "Siap dalam 10 Menit", "Bahan Selalu Ada"],
    },
  },
  {
    keys: ["telur ceplok", "ceplok", "mata sapi", "telur kecap", "kecap"],
    toolMatch: ["wajan", "teflon", "rice cooker"],
    friendlyReason: "Lauk kilat manis pedas gurih yang selalu sukses bikin nambah nasi.",
    recipe: {
      title: "Telur Ceplok Masak Kecap Pedas Gurih",
      description: "Telur ceplok setengah matang berpadu kuah kecap bawang manis gurih pedas yang meresap sedap.",
      category: "Lauk Hemat",
      cookTimeMinutes: 8,
      portions: 1,
      estimatedCost: 5500,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "2 butir telur ayam (Rp 4.000)",
        "2 siung bawang merah & 1 siung bawang putih, iris (Rp 800)",
        "2 buah cabai rawit, iris serong (Rp 500)",
        "1.5 sdm kecap manis & 1 sdt kecap asin (Rp 500)",
        "Sedikit air & 1 sdm minyak goreng",
      ],
      steps: [
        "Goreng telur ceplok hingga tingkat kematangan yang diinginkan (bisa setengah matang atau matang), angkat dan tiriskan.",
        "Tumis bawang merah, bawang putih, dan cabai dengan sedikit minyak hingga harum.",
        "Masukkan kecap manis, kecap asin, dan sedikit air. Aduk rata hingga kuah berbuih.",
        "Masukkan telur ceplok, siram-siramkan kuah kecap ke atasnya selama 1 menit sampai meresap. Angkat dan sajikan!",
      ],
      nutrition: {
        calories: 240,
        protein_g: 13.0,
        fat_g: 15.5,
        carbs_g: 12.0,
        fiber_g: 0.8,
      },
      chefTips: "Gunakan api kecil saat mencampur telur dengan kuah kecap agar kuah tidak lekas gosong.",
      healthTags: ["Super Kilat", "Kaya Protein", "Budget Murah"],
    },
  },
  {
    keys: ["rice cooker", "liwet", "nasi gurih", "teri", "nasi liwet"],
    toolMatch: ["rice cooker"],
    friendlyReason: "Solusi masak 1 panci rice cooker tanpa kompor, harum rempah dan super kenyang.",
    recipe: {
      title: "Nasi Liwet Rice Cooker Teri Telur Harum",
      description: "Nasi gurih harum rempah dengan taburan teri renyah dan telur orak-arik praktis langsung matang bersama di rice cooker.",
      category: "Rice Cooker",
      cookTimeMinutes: 25,
      portions: 1,
      estimatedCost: 11000,
      cookingTool: "Rice Cooker",
      ingredients: [
        "1 gelas beras (Rp 3.000)",
        "1 butir telur ayam (Rp 2.000)",
        "2 sdm teri medan / teri jengki (Rp 3.000)",
        "2 siung bawang merah & 1 siung bawang putih, iris (Rp 1.000)",
        "1 batang serai & 1 lembar daun salam (Rp 500)",
        "1 sdt kaldu bubuk & 1 sdm minyak goreng (Rp 1.500)",
      ],
      steps: [
        "Cuci beras bersih, masukkan air sesuai takaran masak biasa di panci rice cooker.",
        "Tumis sebentar bawang, serai, daun salam, dan teri di rice cooker dengan 1 sdm minyak hingga harum.",
        "Masukkan beras dan air, tambahkan kaldu bubuk, aduk rata lalu tekan tombol COOK.",
        "Saat tombol beralih ke WARM, ceplokkan telur di atas nasi hangat, tutup lagi 5 menit sampai telur matang lembut.",
        "Aduk nasi liwet hingga pulen dan nikmati selagi hangat!",
      ],
      nutrition: {
        calories: 520,
        protein_g: 19.5,
        fat_g: 13.0,
        carbs_g: 78.0,
        fiber_g: 3.2,
      },
      chefTips: "Gunakan minyak bekas menggoreng bawang agar aroma nasi liwet semakin harum khas resto sunda.",
      healthTags: ["Praktis 1 Panci", "Tinggi Karbo & Protein", "Super Harum"],
    },
  },
  {
    keys: ["nasi goreng", "nasgor", "nasi sisa", "nasi"],
    toolMatch: ["wajan", "teflon", "rice cooker"],
    friendlyReason: "Memanfaatkan nasi sisa semalam jadi hidangan gurih mantap tanpa mubazir.",
    recipe: {
      title: "Nasi Goreng Kampung Rice Cooker Praktis",
      description: "Nasi goreng gurih harum bawang dengan orak-arik telur dan sentuhan cabai rawit pedas nikmat.",
      category: "Lauk Hemat",
      cookTimeMinutes: 12,
      portions: 1,
      estimatedCost: 8000,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "1 piring nasi putih dingin (Rp 2.500)",
        "1 butir telur ayam (Rp 2.000)",
        "2 siung bawang merah & 1 siung bawang putih, cincang (Rp 1.000)",
        "2 buah cabai rawit merah, iris (Rp 500)",
        "1 sdm kecap manis, 1/2 sdt terasi bakar, garam & kaldu bubuk (Rp 2.000)",
      ],
      steps: [
        "Panaskan wajan dengan 1 sdm minyak, buat orak-arik telur hingga matang, sisihkan ke tepi wajan.",
        "Tumis bawang merah, bawang putih, cabai, dan terasi hingga harum semerbak.",
        "Masukkan nasi putih dingin, tekan-tekan agar tidak ada nasi yang menggumpal.",
        "Bumbui dengan kecap manis, garam, dan kaldu bubuk. Aduk cepat dengan api besar sampai bumbu merata dan tercium aroma sangit yang sedap.",
      ],
      nutrition: {
        calories: 480,
        protein_g: 15.0,
        fat_g: 14.5,
        carbs_g: 71.0,
        fiber_g: 2.5,
      },
      chefTips: "Pakai nasi sisa yang sudah disimpan di kulkas atau diangin-anginkan agar teksturnya tidak lembek saat digoreng.",
      healthTags: ["Mengurangi Food Waste", "Kenyang Seharian", "Murah Meriah"],
    },
  },
  {
    keys: ["tahu tempe", "tempe tahu", "tahu dan tempe"],
    toolMatch: ["wajan", "teflon"],
    friendlyReason: "Kombinasi duo protein nabati paling ekonomis, gurih pedas manis yang ramah dompet.",
    recipe: {
      title: "Tumis Tahu Tempe Kecap Pedas Manis",
      description: "Paduan tahu tempe kaya protein nabati dengan balutan kuah kecap gurih kental yang boros nasi.",
      category: "Lauk Hemat",
      cookTimeMinutes: 15,
      portions: 1,
      estimatedCost: 8500,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "1/2 papan tempe, potong dadu (Rp 3.000)",
        "1 kotak tahu putih, potong dadu (Rp 2.500)",
        "3 buah cabai rawit & 2 siung bawang merah (Rp 1.500)",
        "2 sdm kecap manis & 1 sdt saus tiram (Rp 1.500)",
        "Sedikit air & garam secukupnya",
      ],
      steps: [
        "Goreng tahu dan tempe sebentar sampai berkulit (setengah matang), tiriskan.",
        "Tumis irisan bawang dan cabai hingga layu dan harum.",
        "Masukkan tahu dan tempe, tambahkan kecap manis, saus tiram, dan sedikit air.",
        "Masak hingga bumbu meresap dan kuah mengental menyelimuti tahu tempe. Siap disajikan!",
      ],
      nutrition: {
        calories: 360,
        protein_g: 24.0,
        fat_g: 12.5,
        carbs_g: 39.0,
        fiber_g: 5.5,
      },
      chefTips: "Potong tempe dan tahu seukuran dadu kecil agar bumbu kecap lebih cepat meresap tanpa perlu dimasak lama.",
      healthTags: ["Super Tinggi Protein", "Kaya Serat Nabati", "Budget Super Irit"],
    },
  },
  {
    keys: ["orek tempe", "tempe orek", "orek", "tempe"],
    toolMatch: ["wajan", "teflon"],
    friendlyReason: "Lauk andalan warteg yang tahan berhari-hari, manis gurih nagih.",
    recipe: {
      title: "Orek Tempe Basah Manis Gurih",
      description: "Tempe potong korek api dimasak kecap bawang karamel dengan tekstur kenyal dan rasa manis gurih meresap.",
      category: "Lauk Hemat",
      cookTimeMinutes: 12,
      portions: 1,
      estimatedCost: 7000,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "1 papan tempe, potong korek api (Rp 4.000)",
        "3 siung bawang merah & 2 siung bawang putih, iris (Rp 1.200)",
        "2 buah cabai merah keriting & rawit (Rp 800)",
        "2 sdm kecap manis & 1 lembar daun salam (Rp 1.000)",
        "Garam, gula merah sedikit, dan 50ml air",
      ],
      steps: [
        "Goreng tempe hingga setengah matang (jangan terlalu kering agar orek tetap juicy dan bumbu meresap).",
        "Tumis bawang merah, bawang putih, cabai, dan daun salam hingga harum.",
        "Tuang sedikit air, kecap manis, garam, dan sedikit gula merah. Aduk hingga mendidih dan agak mengental.",
        "Masukkan tempe goreng, aduk cepat sampai seluruh permukaan tempe terbalut kuah karamel kecap.",
      ],
      nutrition: {
        calories: 320,
        protein_g: 20.5,
        fat_g: 11.0,
        carbs_g: 36.0,
        fiber_g: 4.8,
      },
      chefTips: "Jangan goreng tempe terlalu garing jika ingin tekstur orek basah yang kenyal dan bumbunya mengunci di dalam.",
      healthTags: ["Tinggi Protein Nabati", "Tahan Lama", "Menu Klasik Warteg"],
    },
  },
  {
    keys: ["tahu", "cabe garam", "tahu krispi", "tahu goreng"],
    toolMatch: ["wajan", "teflon"],
    friendlyReason: "Camilan sekaligus lauk renyah ala kafe dengan modal receh rasa bintang lima.",
    recipe: {
      title: "Tahu Crispy Cabe Garam Wangi Bawang",
      description: "Tahu putih garing renyah dibalut taburan bawang putih cincang gurih dan irisan cabai rawit pedas nikmat.",
      category: "Lauk Hemat",
      cookTimeMinutes: 12,
      portions: 1,
      estimatedCost: 6500,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "2 kotak tahu putih, potong dadu kecil (Rp 3.500)",
        "2 sdm tepung maizena / serbaguna (Rp 1.000)",
        "3 siung bawang putih, cincang halus (Rp 1.000)",
        "3 buah cabai rawit merah & hijau, iris (Rp 1.000)",
        "1/2 sdt garam & kaldu jamur",
      ],
      steps: [
        "Baluri potongan tahu dadu dengan tepung maizena hingga terlapisi tipis.",
        "Goreng tahu dalam minyak panas hingga berkulit renyah keemasan, tiriskan.",
        "Kurangi minyak di wajan, tumis bawang putih cincang dan cabai rawit sampai harum kekuningan.",
        "Beri garam dan kaldu bubuk, matikan api, masukkan tahu goreng lalu aduk cepat sampai terbalut rata.",
      ],
      nutrition: {
        calories: 280,
        protein_g: 16.0,
        fat_g: 14.0,
        carbs_g: 22.0,
        fiber_g: 2.5,
      },
      chefTips: "Pastikan tahu ditiriskan airnya sebelum dibaluri tepung agar hasil gorengannya renyah tahan lama.",
      healthTags: ["Super Crispy", "Rendah Biaya", "Gurih Nagih"],
    },
  },
  {
    keys: ["mie", "indomie", "mie nyemek", "mie kuah", "mie rebus"],
    toolMatch: ["panci", "wajan"],
    friendlyReason: "Upgrade mie instan biasa jadi santapan bernutrisi lengkap dengan tambahan telur dan serat sayur.",
    recipe: {
      title: "Mie Nyemek Sayur Telur Gurih Spesial Kost",
      description: "Mie kuah kental gurih dengan telur orak-arik creamy, sayur sawi renyah, dan aroma bawang cabai pedas mantap.",
      category: "Lauk Hemat",
      cookTimeMinutes: 10,
      portions: 1,
      estimatedCost: 8500,
      cookingTool: "Panci / Wajan",
      ingredients: [
        "1 bungkus mie instan kuah/goreng (Rp 3.500)",
        "1 butir telur ayam (Rp 2.000)",
        "1 ikat kecil sawi hijau / kol, iris (Rp 1.500)",
        "2 siung bawang merah & 2 buah cabai rawit (Rp 1.000)",
        "1 sdt kecap manis & 1 sdt saus sambal (Rp 500)",
      ],
      steps: [
        "Tumis irisan bawang dan cabai dengan sedikit minyak hingga wangi.",
        "Ceplokkan telur, orak-arik kasar di wajan.",
        "Tuang 250ml air, tunggu hingga mendidih lalu masukkan mie dan sayuran.",
        "Tambahkan bumbu mie instan, kecap manis, dan saus sambal. Masak hingga kuah menyusut menjadi nyemek kental. Angkat hangat-hangat!",
      ],
      nutrition: {
        calories: 430,
        protein_g: 16.5,
        fat_g: 17.0,
        carbs_g: 54.0,
        fiber_g: 3.5,
      },
      chefTips: "Jangan buang kuah rebusan terlalu banyak, biarkan kuahnya mengental alami bersama bumbu dan kocokan telur.",
      healthTags: ["Hangat Berkuah", "Upgrade Gizi", "Cepat Matang"],
    },
  },
  {
    keys: ["spaghetti", "pasta", "aglio olio"],
    toolMatch: ["panci", "wajan"],
    friendlyReason: "Menu ala cafe mewah dengan bahan dasar yang simpel dan murah di kamar kost.",
    recipe: {
      title: "Spaghetti Aglio Olio Cabai Bawang Simple",
      description: "Pasta kenyal al dente ditumis bersama minyak zaitun/mentega, bawang putih melimpah, dan sensasi pedas cabai rawit.",
      category: "Lauk Hemat",
      cookTimeMinutes: 15,
      portions: 1,
      estimatedCost: 12000,
      cookingTool: "Panci / Wajan",
      ingredients: [
        "80g pasta spaghetti (Rp 5.000)",
        "3 siung bawang putih, iris tipis (Rp 1.200)",
        "3 buah cabai rawit atau cabai kering (Rp 800)",
        "1 butir sosis atau telur (opsional) (Rp 2.500)",
        "1 sdm mentega / minyak goreng & sejumput oregano/garam (Rp 2.500)",
      ],
      steps: [
        "Rebus spaghetti dalam air mendidih bergaram selama 8-9 menit hingga al dente, sisihkan 3 sdm air rebusannya.",
        "Panaskan minyak/mentega dengan api kecil, tumis bawang putih iris dan cabai sampai wangi kekuningan.",
        "Masukkan potongan sosis/topping, tumis sebentar.",
        "Masukkan pasta dan air rebusannya, aduk cepat sampai minyak mengemulsi dan melapisi spaghetti. Sajikan hangat!",
      ],
      nutrition: {
        calories: 420,
        protein_g: 12.0,
        fat_g: 11.5,
        carbs_g: 68.0,
        fiber_g: 2.8,
      },
      chefTips: "Gunakan api sangat kecil saat menumis bawang putih agar tidak gosong dan rasanya tetap manis harum.",
      healthTags: ["Menu Ala Resto", "Simpel Cuma Bawang Cabai", "Karbohidrat Mantap"],
    },
  },
  {
    keys: ["bayam", "sup bening", "sayur bening", "sayur bayam", "jagung"],
    toolMatch: ["panci"],
    friendlyReason: "Kuah bening penyegar dahaga, kaya zat besi dan serat untuk menjaga stamina belajar.",
    recipe: {
      title: "Sup Bening Bayam Jagung Manis Segar",
      description: "Kuah bening segar penambah stamina anak kost dengan paduan bayam kaya zat besi dan manisnya pipilan jagung.",
      category: "Sayur & Sup",
      cookTimeMinutes: 12,
      portions: 1,
      estimatedCost: 7000,
      cookingTool: "Panci Rebus",
      ingredients: [
        "1 ikat bayam segar (Rp 3.000)",
        "1/2 buah jagung manis, potong (Rp 2.000)",
        "2 siung bawang merah, iris tipis (Rp 1.000)",
        "1 ruas temu kunci (opsional) & garam, gula secukupnya (Rp 1.000)",
      ],
      steps: [
        "Didihkan 400ml air di panci, masukkan irisan bawang merah dan jagung manis.",
        "Masak selama 5 menit sampai jagung empuk dan manis alaminya keluar.",
        "Bumbui dengan garam dan sedikit gula, koreksi rasa.",
        "Masukkan daun bayam, masak sebentar saja (1-2 menit) agar tetap hijau segar. Angkat segera!",
      ],
      nutrition: {
        calories: 140,
        protein_g: 5.8,
        fat_g: 1.2,
        carbs_g: 28.0,
        fiber_g: 6.5,
      },
      chefTips: "Jangan merebus bayam terlalu lama agar warna tetap hijau cerah dan kandungan vitaminnya tidak rusak.",
      healthTags: ["Kaya Zat Besi & Serat", "Rendah Kalori", "Menyegarkan Tubuh"],
    },
  },
  {
    keys: ["kangkung", "cah kangkung", "tumis kangkung"],
    toolMatch: ["wajan", "teflon"],
    friendlyReason: "Sayuran murah meriah yang renyah dan cepat matang, teman setia nasi hangat.",
    recipe: {
      title: "Tumis Kangkung Belacan Bawang Putih",
      description: "Kangkung hijau renyah ditumis api besar dengan bumbu terasi harum dan irisan cabai rawit pedas.",
      category: "Sayur & Sup",
      cookTimeMinutes: 7,
      portions: 1,
      estimatedCost: 6000,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "1 ikat kangkung segar, petik daunnya (Rp 3.000)",
        "2 siung bawang putih & 2 siung bawang merah, iris (Rp 1.200)",
        "2 buah cabai rawit merah (Rp 500)",
        "1/2 sdt terasi matang & 1 sdm saus tiram (Rp 1.300)",
      ],
      steps: [
        "Panaskan wajan dengan 1 sdm minyak sampai benar-benar panas.",
        "Tumis bawang, cabai, dan terasi yang sudah dihaluskan sebentar sampai semerbak harum.",
        "Masukkan kangkung, beri saus tiram dan sedikit air (2 sdm).",
        "Aduk cepat dengan api besar selama 2 menit sampai kangkung layu tapi batangnya masih garing renyah. Angkat segera!",
      ],
      nutrition: {
        calories: 130,
        protein_g: 5.2,
        fat_g: 4.5,
        carbs_g: 18.0,
        fiber_g: 4.2,
      },
      chefTips: "Masak kangkung dengan api besar dan waktu singkat agar warnanya tetap hijau segar dan tidak menghitam.",
      healthTags: ["Super Cepat 7 Menit", "Tinggi Serat", "Budget Ekonomis"],
    },
  },
  {
    keys: ["sayur asem", "asem", "kuah segar"],
    toolMatch: ["panci"],
    friendlyReason: "Menu kuah asam segar tradisional yang membangkitkan nafsu makan dan melancarkan pencernaan.",
    recipe: {
      title: "Sayur Asem Sederhana Segar Anak Kost",
      description: "Sayuran campur jagung, labu siam, dan kacang panjang dalam kuah asam tamarind segar yang melegakan tenggorokan.",
      category: "Sayur & Sup",
      cookTimeMinutes: 15,
      portions: 1,
      estimatedCost: 8000,
      cookingTool: "Panci Rebus",
      ingredients: [
        "1 bungkus paket sayur asem pasar (Rp 4.000)",
        "2 siung bawang merah & 1 siung bawang putih (Rp 1.000)",
        "2 butir asam jawa & 1 lembar daun salam (Rp 1.000)",
        "1/2 sdt terasi, gula merah, dan garam secukupnya (Rp 2.000)",
      ],
      steps: [
        "Didihkan 500ml air di panci bersama irisan bawang, asam jawa, terasi, dan daun salam.",
        "Masukkan sayuran yang keras terlebih dahulu (jagung dan melinjo), masak 5 menit hingga empuk.",
        "Masukkan labu siam dan kacang panjang, bumbui dengan garam dan gula merah hingga rasa asam manisnya seimbang.",
        "Terakhir masukkan daun so/tangkil, didihkan 1 menit lalu matikan api.",
      ],
      nutrition: {
        calories: 125,
        protein_g: 4.5,
        fat_g: 1.0,
        carbs_g: 26.0,
        fiber_g: 5.0,
      },
      chefTips: "Remas asam jawa dengan sedikit air hangat terlebih dahulu sebelum dimasukkan agar rasa segarnya lebih merata.",
      healthTags: ["Rendah Lemak", "Kaya Antioksidan", "Segar & Alami"],
    },
  },
  {
    keys: ["ayam", "suwir", "balado", "dada ayam"],
    toolMatch: ["wajan", "teflon", "panci"],
    friendlyReason: "Lauk tinggi protein hewani yang cocok untuk pembentukan otot dan mengenyangkan lebih lama.",
    recipe: {
      title: "Ayam Suwir Balado Pedas Manis Hemat",
      description: "Dada ayam rebus disuwir tipis lalu ditumis bersama sambal balado merah pedas gurih yang meresap sempurna.",
      category: "Lauk Hemat",
      cookTimeMinutes: 20,
      portions: 1,
      estimatedCost: 15000,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "120g dada ayam filet (Rp 9.000)",
        "4 buah cabai merah & 3 cabai rawit (Rp 2.000)",
        "3 siung bawang merah & 2 siung bawang putih (Rp 1.500)",
        "1 lembar daun jeruk & 1 sdm kecap manis (Rp 1.000)",
        "Garam, gula, dan 1 sdm minyak (Rp 1.500)",
      ],
      steps: [
        "Rebus dada ayam selama 10 menit hingga matang, tiriskan lalu suwir-suwir seratnya.",
        "Haluskan atau ulek kasar cabai, bawang merah, dan bawang putih.",
        "Tumis bumbu halus bersama daun jeruk dengan 1 sdm minyak sampai matang dan harum semerbak.",
        "Masukkan suwiran ayam, tambahkan kecap manis, garam, dan sedikit air rebusan ayam. Aduk rata hingga bumbu meresap kering.",
      ],
      nutrition: {
        calories: 340,
        protein_g: 28.5,
        fat_g: 10.0,
        carbs_g: 24.0,
        fiber_g: 2.5,
      },
      chefTips: "Gunakan air kaldu sisa rebusan ayam untuk melembutkan bumbu balado agar rasanya makin gurih nendang.",
      healthTags: ["Super Tinggi Protein", "Cocok untuk Fitness", "Kenyang Tahan Lama"],
    },
  },
  {
    keys: ["sop ayam", "sup ayam", "kaldu ayam"],
    toolMatch: ["panci", "rice cooker"],
    friendlyReason: "Sup hangat berkhasiat saat tubuh lelah atau cuaca sedang hujan dingin.",
    recipe: {
      title: "Sop Ayam Bening Sayuran Segar",
      description: "Kuah kaldu ayam gurih bening dengan wortel empuk, kentang, dan daun seledri harum pelega tenggorokan.",
      category: "Sayur & Sup",
      cookTimeMinutes: 20,
      portions: 1,
      estimatedCost: 14000,
      cookingTool: "Panci Rebus",
      ingredients: [
        "100g daging ayam bertulang / filet (Rp 7.500)",
        "1 buah wortel & 1/2 buah kentang, potong (Rp 3.000)",
        "2 siung bawang putih, geprek & tumis sebentar (Rp 1.000)",
        "1 batang seledri & daun bawang (Rp 1.000)",
        "Garam, merica bubuk, dan kaldu bubuk (Rp 1.500)",
      ],
      steps: [
        "Rebus ayam dalam 500ml air dengan api kecil hingga keluar kaldu alaminya.",
        "Masukkan bawang putih geprek yang sudah ditumis harum.",
        "Masukkan potongan kentang dan wortel, masak selama 7 menit hingga sayuran empuk.",
        "Bumbui dengan garam, merica, dan kaldu bubuk. Taburkan irisan seledri dan daun bawang sebelum diangkat.",
      ],
      nutrition: {
        calories: 290,
        protein_g: 24.0,
        fat_g: 8.5,
        carbs_g: 31.0,
        fiber_g: 3.8,
      },
      chefTips: "Rebus ayam dengan api kecil agar kuah kaldu tetap bening jernih dan daging ayam empuk juicy.",
      healthTags: ["Kaya Protein & Kaldu Alami", "Hangat & Menyehatkan", "Rendah Lemak"],
    },
  },
  {
    keys: ["sosis", "bakso", "mentega", "kornet", "sosis bakso"],
    toolMatch: ["wajan", "teflon", "rice cooker"],
    friendlyReason: "Olahan cepat siap saji dengan wangi mentega gurih yang disukai semua kalangan.",
    recipe: {
      title: "Tumis Sosis Bakso Mentega Saus Tiram",
      description: "Potongan sosis dan bakso kenyal ditumis mentega gurih dengan siraman saus tiram dan bawang bombay harum.",
      category: "Lauk Hemat",
      cookTimeMinutes: 10,
      portions: 1,
      estimatedCost: 10000,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "2 buah sosis sapi/ayam, potong serong (Rp 4.000)",
        "4 butir bakso sapi, belah empat (Rp 3.500)",
        "1/4 buah bawang bombay & 1 siung bawang putih (Rp 1.000)",
        "1 sdm mentega / margarin (Rp 1.000)",
        "1 sdm saus tiram & 1 sdm saus sambal (Rp 500)",
      ],
      steps: [
        "Lelehkan mentega di wajan, tumis bawang putih dan bawang bombay hingga layu dan harum.",
        "Masukkan potongan sosis dan bakso, tumis hingga merekah.",
        "Tambahkan saus tiram, saus sambal, dan 2 sdm air agar bumbu tidak lekas gosong.",
        "Aduk cepat sampai saus mengental menyelimuti sosis dan bakso. Sajikan hangat!",
      ],
      nutrition: {
        calories: 310,
        protein_g: 14.0,
        fat_g: 16.5,
        carbs_g: 26.0,
        fiber_g: 1.5,
      },
      chefTips: "Kerat-kerat ujung sosis dan bakso agar bentuknya mekar cantik saat ditumis dan bumbu saus tiram terserap ke dalam.",
      healthTags: ["Super Praktis 10 Menit", "Gurih Mentega", "Disukai Anak Kost"],
    },
  },
  {
    keys: ["sarden", "ikan kaleng", "sarden kaleng"],
    toolMatch: ["wajan", "teflon", "rice cooker"],
    friendlyReason: "Menu andalan akhir bulan berkuah pedas kaya omega-3 yang boros nasi.",
    recipe: {
      title: "Sarden Tumis Bawang Cabai Tomat Boros Nasi",
      description: "Ikan sarden kaleng dimasak ulang dengan tumisan bawang merah melimpah, cabai rawit, dan tomat segar yang mematikan rasa amis.",
      category: "Lauk Hemat",
      cookTimeMinutes: 10,
      portions: 1,
      estimatedCost: 12000,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "1 kaleng kecil sarden saus tomat/cabai (Rp 9.000)",
        "3 siung bawang merah & 1 siung bawang putih, iris (Rp 1.000)",
        "3 buah cabai rawit merah, iris (Rp 1.000)",
        "1/2 buah tomat merah segar, potong dadu (Rp 1.000)",
      ],
      steps: [
        "Tumis irisan bawang merah, bawang putih, dan cabai rawit hingga matang dan harum.",
        "Masukkan potongan tomat, tumis sebentar sampai tomat agak layu.",
        "Tuang sarden beserta seluruh kuahnya ke dalam wajan secara perlahan agar ikan tidak hancur.",
        "Masak dengan api sedang hingga kuah meletup-letup kental. Sajikan bersama nasi putih panas!",
      ],
      nutrition: {
        calories: 330,
        protein_g: 21.0,
        fat_g: 15.0,
        carbs_g: 18.0,
        fiber_g: 2.0,
      },
      chefTips: "Menumis bawang dan cabai terlebih dahulu adalah kunci ampuh menghilangkan bau amis sarden kalengan.",
      healthTags: ["Kaya Omega-3", "Tinggi Kalsium", "Lauk Akhir Bulan Terbaik"],
    },
  },
  {
    keys: ["roti", "roti bakar", "sarapan roti", "keju"],
    toolMatch: ["teflon", "wajan"],
    friendlyReason: "Sarapan ala kafe tanpa pemanggang khusus, cukup teflon sederhana di kamar kost.",
    recipe: {
      title: "Roti Bakar Teflon Telur Keju Gurih",
      description: "Roti tawar renyah keemasan dengan isian telur mata sapi lembut dan lelehan keju gurih mantap.",
      category: "Sarapan",
      cookTimeMinutes: 8,
      portions: 1,
      estimatedCost: 7500,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "2 lembar roti tawar (Rp 2.500)",
        "1 butir telur ayam (Rp 2.000)",
        "1 lembar keju slice / parut (Rp 2.000)",
        "1 sdm margarin & saus sambal/tomat secukupnya (Rp 1.000)",
      ],
      steps: [
        "Goreng telur ceplok atau dadar di teflon dengan sedikit margarin hingga matang, angkat.",
        "Olesi permukaan luar roti tawar dengan margarin.",
        "Letakkan telur, keju, dan sedikit saus di antara dua lembar roti.",
        "Panggang roti di atas teflon dengan api kecil sambil ditekan perlahan hingga kedua sisinya cokelat keemasan dan keju meleleh.",
      ],
      nutrition: {
        calories: 310,
        protein_g: 14.0,
        fat_g: 15.0,
        carbs_g: 32.0,
        fiber_g: 2.0,
      },
      chefTips: "Gunakan api sangat kecil saat memanggang roti di teflon agar rotinya garing renyah tanpa gosong.",
      healthTags: ["Sarapan Cepat", "Tinggi Energi", "Renyah & Gurih"],
    },
  },
];

// Fallback jika API AI tidak tersedia atau kuota habis
export function fallbackAskRecipe(input: AskRecipeRequest): AskRecipeResponse {
  const promptRaw = (input.prompt || "").trim();
  const ingredientsRaw = (input.ingredients || "").trim();
  const fullQuery = `${promptRaw} ${ingredientsRaw} ${input.dietaryGoal || ""} ${input.cookingTool || ""}`.toLowerCase();

  // 1. Cek apakah ini murni sapaan / greeting
  if (!ingredientsRaw && isGreetingOnly(promptRaw)) {
    return {
      replyText:
        "Halo Sobat Kost! 👋 Aku Chef AI dari DompetKost, asisten masak hemat dan ahli gizi pribadimu.\n\n" +
        "Ada bahan apa saja nih di kamar kost hari ini? Atau kamu lagi pengen masak menu apa dengan budget berapa? " +
        "Kasih tahu aku ya, biar kuracikkan menu yang lezat, praktis, ramah kantong, dan pas nutrisinya! 🍳✨",
      recipe: null,
      suggestions: [
        "Punya telur dan nasi, bisa bikin apa?",
        "Ide resep hemat di bawah Rp 10.000",
        "Resep praktis masak pakai rice cooker",
        "Tips belanja hemat anak kost",
      ],
    };
  }

  // 2. Cek apakah pengguna bertanya identitas / cara kerja
  if (!ingredientsRaw && isIdentityOrAbout(promptRaw)) {
    return {
      replyText:
        "Halo Sobat Kost! 👨‍🍳 Aku adalah **Chef AI DompetKost**, asisten kuliner pintar khusus anak kost di Indonesia. Ini yang bisa aku bantu untukmu:\n\n" +
        "1. **Racik Resep dari Sisa Bahan**: Sebutkan bahan apa saja yang ada di kamarmu, aku carikan menu lezat tanpa sisa mubazir.\n" +
        "2. **Sesuaikan dengan Alat Kost**: Nggak punya kompor? Tenang, aku bisa buatkan resep khusus rice cooker atau teflon sederhana.\n" +
        "3. **Transparansi Biaya & Gizi**: Lengkap dengan perkiraan harga pasar/warung dan hitungan nutrisi ilmiah (kalori, protein, lemak, karbohidrat, serat).\n" +
        "4. **Tips & Trik Dapur Kost**: Tanyakan cara menyimpan bahan agar tidak cepat basi, cara merebus telur pas, hingga tips belanja hemat!",
      recipe: null,
      suggestions: [
        "Racik resep dari bahan yang ada di kost",
        "Rekomendasi resep tinggi protein murah",
        "Menu masakan rice cooker 1 panci",
      ],
    };
  }

  // 3. Cek apakah pengguna mengucapkan terima kasih / salam penutup
  if (!ingredientsRaw && isGratitudeOrClosing(promptRaw)) {
    return {
      replyText:
        "Sama-sama Sobat Kost! Senang sekali bisa membantumu. Selamat berkreasi di dapur kost ya! " +
        "Jangan lupa catat ke Diari Gizi kalau sudah matang agar asupan gizimu tetap terjaga seimbang. " +
        "Kalau ada bahan lain yang mau diolah, panggil aku lagi kapan saja! 🍳✨",
      recipe: null,
      suggestions: [
        "Cari ide resep hemat lainnya",
        "Tips menyimpan sisa bahan agar awet",
        "Ide menu sarapan kilat besok pagi",
      ],
    };
  }

  // 4. Cek apakah ini pertanyaan tips kuliner / dapur non-resep
  if (!ingredientsRaw) {
    const tipResult = getCulinaryTipsResponse(promptRaw);
    if (tipResult) return tipResult;
  }

  // 5. Pencocokan Resep Cerdas dari Katalog Lokal
  let bestEntry: KostRecipeEntry = KOST_RECIPES_CATALOG[0];
  let highestScore = -1;

  for (const entry of KOST_RECIPES_CATALOG) {
    let score = 0;

    // Kecocokan kata kunci
    for (const key of entry.keys) {
      if (fullQuery.includes(key)) {
        score += 10;
      }
    }

    // Kecocokan alat masak
    if (input.cookingTool) {
      const toolLower = input.cookingTool.toLowerCase();
      if (entry.toolMatch.some((tm) => toolLower.includes(tm))) {
        score += 5;
      }
    }

    // Kecocokan budget
    if (input.budget && entry.recipe.estimatedCost <= input.budget) {
      score += 3;
    }

    // Kecocokan target gizi
    if (input.dietaryGoal) {
      const goalLower = input.dietaryGoal.toLowerCase();
      if (goalLower.includes("protein") && entry.recipe.nutrition.protein_g >= 15) {
        score += 4;
      } else if (goalLower.includes("rendah kalori") && entry.recipe.nutrition.calories <= 300) {
        score += 4;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestEntry = entry;
    }
  }

  const recipe = bestEntry.recipe;

  // Personalisasi replyText ramah
  let replyText = "";
  if (ingredientsRaw) {
    replyText = `Bahan yang kamu punya mantap banget untuk diolah, Sobat Kost! Berdasarkan bahan **${ingredientsRaw}**, Chef AI racikkan menu spesial: **${recipe.title}**. ${bestEntry.friendlyReason} Estimasi biayanya sekitar Rp ${recipe.estimatedCost.toLocaleString("id-ID")}, sangat pas di kantong!`;
  } else if (input.cookingTool && input.cookingTool.toLowerCase().includes("rice cooker")) {
    replyText = `Masak pakai rice cooker itu solusi paling praktis dan minim cucian piring di kost! Chef AI racikkan menu andalan: **${recipe.title}**. ${bestEntry.friendlyReason}`;
  } else {
    replyText = `Halo Sobat Kost! Menanggapi permintaanmu, Chef AI racikkan menu spesial: **${recipe.title}**. ${bestEntry.friendlyReason} Estimasi biayanya cuma Rp ${recipe.estimatedCost.toLocaleString("id-ID")} dengan nutrisi yang seimbang!`;
  }

  return {
    replyText,
    recipe,
    suggestions: [
      `Bagaimana cara memasak "${recipe.title}" pakai rice cooker saja?`,
      `Bisakah diganti dengan bahan lain yang lebih murah?`,
      `Rekomendasikan menu hemat lain di bawah Rp 10.000`,
    ],
  };
}

export async function askRecipeWithAI(input: AskRecipeRequest): Promise<AskRecipeResponse> {
  const promptText = (input.prompt || "").trim();
  const ingredientsText = (input.ingredients || "").trim();

  // If prompt is clearly a greeting, about query, gratitude, or non-recipe tip, handle immediately
  if (!ingredientsText) {
    if (isGreetingOnly(promptText)) {
      return fallbackAskRecipe(input);
    }
    if (isIdentityOrAbout(promptText)) {
      return fallbackAskRecipe(input);
    }
    if (isGratitudeOrClosing(promptText)) {
      return fallbackAskRecipe(input);
    }
    const tip = getCulinaryTipsResponse(promptText);
    if (tip) return tip;
  }

  let userContent = "";
  if (!ingredientsText && !hasRecipeIntent(promptText)) {
    userContent = `Pesan Pengguna: "${promptText}". Pengguna sedang menyapa atau berbincang santai. Balas dengan ramah dan tanyakan bahan yang dimiliki, serta WAJIB set "recipe": null.`;
  } else {
    const priceRef = await getIngredientPriceReference();
    userContent = `
Permintaan User: ${promptText || "Buatkan ide resep hemat & lezat"}
Bahan yang tersedia: ${ingredientsText || "Bebas / Bahan umum anak kost"}
Target Budget: ${input.budget ? `Maksimal Rp ${input.budget.toLocaleString("id-ID")}` : "Hemat anak kost"}
Alat Masak Tersedia: ${input.cookingTool || "Rice Cooker atau Teflon Kompor Sederhana"}
Target Gizi: ${input.dietaryGoal || "Seimbang & Bergizi"}
${priceRef}
    `.trim();
  }

  const providers: string[] = [];
  if (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2) providers.push("gemini");
  if (process.env.GROQ_API_KEY) providers.push("groq");
  if (process.env.MISTRAL_API_KEY) providers.push("mistral");

  if (providers.length === 0) {
    return fallbackAskRecipe(input);
  }

  const shuffled = [...providers].sort(() => 0.5 - Math.random());

  for (const provider of shuffled) {
    try {
      console.log(`[Ask Recipe AI] Trying provider: ${provider}`);
      let resultText = "";

      if (provider === "gemini") {
        const rawKeys = [
          ...(process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.split(",") : []),
          process.env.GEMINI_API_KEY_2 || "",
        ]
          .map((k) => k.trim())
          .filter(Boolean);

        const geminiKeys = [...new Set(rawKeys)];
        const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

        for (const key of geminiKeys) {
          try {
            const ai = new GoogleGenerativeAI(key);
            const model = ai.getGenerativeModel({
              model: modelName,
              systemInstruction: ASK_RECIPE_SYSTEM_PROMPT,
            });

            const response = await model.generateContent({
              contents: [
                ...(input.history || []).map((h) => ({
                  role: h.role === "assistant" ? "model" : "user",
                  parts: [{ text: h.content }],
                })),
                { role: "user", parts: [{ text: userContent }] },
              ],
              generationConfig: {
                responseMimeType: "application/json",
              },
            });

            resultText = response.response.text() || "";
            if (resultText) break;
          } catch (e) {
            console.warn(`[Ask Recipe Gemini] key failed:`, e);
          }
        }
      } else if (provider === "groq") {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const modelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

        const completion = await groq.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: ASK_RECIPE_SYSTEM_PROMPT },
            ...(input.history || []).map((h) => ({
              role: h.role as "user" | "assistant",
              content: h.content,
            })),
            { role: "user", content: userContent },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        resultText = completion.choices[0]?.message?.content || "";
      } else if (provider === "mistral") {
        const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
        const modelName = process.env.MISTRAL_MODEL || "pixtral-12b-2409";

        const chatResponse = await mistral.chat.complete({
          model: modelName,
          messages: [
            { role: "system", content: ASK_RECIPE_SYSTEM_PROMPT },
            ...(input.history || []).map((h) => ({
              role: h.role as "user" | "assistant",
              content: h.content,
            })),
            { role: "user", content: userContent },
          ],
          responseFormat: { type: "json_object" },
        });

        const content = chatResponse.choices?.[0]?.message?.content;
        resultText = typeof content === "string" ? content : "";
      }

      if (resultText) {
        const parsed = cleanJson(resultText);
        return {
          replyText: parsed.replyText || "Ini rekomendasi resep terbaik untukmu:",
          recipe: normalizeRecipe(parsed.recipe),
          suggestions: Array.isArray(parsed.suggestions)
            ? parsed.suggestions
            : [
                "Bagaimana cara memasaknya pakai rice cooker?",
                "Bisakah diganti dengan bahan lain yang lebih murah?",
                "Buatkan variasi menu hemat lainnya",
              ],
        };
      }
    } catch (err) {
      console.error(`[Ask Recipe AI] Provider ${provider} failed:`, err);
    }
  }

  console.warn("[Ask Recipe AI] All providers failed, falling back to heuristic generator");
  return fallbackAskRecipe(input);
}


import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { Mistral } from "@mistralai/mistralai";
import { UNIFIED_PROMPT } from "./prompts";
import { CULINARY_CATALOG } from "@/lib/data/culinaryCatalog";
import { FlavorTag, FoodItem } from "@/lib/validators";

const VALID_FLAVOR_TAGS: FlavorTag[] = [
  "pedas-gurih",
  "berkuah-segar",
  "gurih-renyah",
  "wangi-rempah",
  "manis-legit",
  "asam-segar",
];

function sanitizeFlavorTags(rawTags: unknown[]): FlavorTag[] {
  if (!Array.isArray(rawTags)) return ["gurih-renyah", "berkuah-segar"];
  const cleaned: FlavorTag[] = [];

  for (const t of rawTags) {
    if (typeof t !== "string") continue;
    const lower = t.toLowerCase().trim();
    const matched = VALID_FLAVOR_TAGS.find((v) => v === lower || lower.includes(v.split("-")[0]));
    if (matched && !cleaned.includes(matched)) {
      cleaned.push(matched);
    } else if (lower.includes("pedas") && !cleaned.includes("pedas-gurih")) {
      cleaned.push("pedas-gurih");
    } else if (lower.includes("gurih") && !cleaned.includes("gurih-renyah")) {
      cleaned.push("gurih-renyah");
    } else if (lower.includes("manis") && !cleaned.includes("manis-legit")) {
      cleaned.push("manis-legit");
    } else if (lower.includes("kuah") || lower.includes("soto") || lower.includes("sup") || lower.includes("kaldu")) {
      if (!cleaned.includes("berkuah-segar")) cleaned.push("berkuah-segar");
    } else if (lower.includes("rempah") || lower.includes("wangi")) {
      if (!cleaned.includes("wangi-rempah")) cleaned.push("wangi-rempah");
    } else if (lower.includes("asam")) {
      if (!cleaned.includes("asam-segar")) cleaned.push("asam-segar");
    }
    if (cleaned.length >= 3) break;
  }

  return cleaned.length > 0 ? cleaned : ["gurih-renyah", "berkuah-segar"];
}

// Kata kunci objek yang jelas BUKAN makanan/minuman (validasi cepat sebelum AI)
const NON_FOOD_KEYWORDS = [
  "kucing",
  "anjing",
  "hewan",
  "binatang",
  "burung",
  "ikan hias",
  "laptop",
  "komputer",
  "keyboard",
  "mouse",
  "monitor",
  "handphone",
  "smartphone",
  "hp",
  "charger",
  "sepatu",
  "sandal",
  "baju",
  "kaos",
  "celana",
  "jaket",
  "tas",
  "dompet",
  "topi",
  "kacamata",
  "buku",
  "pulpen",
  "pensil",
  "kertas",
  "meja",
  "kursi",
  "lemari",
  "kasur",
  "bantal",
  "motor",
  "mobil",
  "helm",
  "sepeda",
  "kunci",
  "uang",
  "koin",
  "orang",
  "manusia",
  "wajah",
  "muka",
  "selfie",
  "tangan",
  "kaki",
  "rambut",
  "dinding",
  "langit",
  "pemandangan",
];

function detectNonFoodKeyword(input?: string): string | null {
  if (!input) return null;
  const lower = input.toLowerCase();
  for (const kw of NON_FOOD_KEYWORDS) {
    if (lower.includes(kw)) return kw;
  }
  return null;
}

export interface NonFoodResult {
  is_food: false;
  detected_object?: string;
  error_message: string;
}

export type FoodAnalysisResponse = FoodAnalysisResult | NonFoodResult;

export function isNonFoodResult(result: FoodAnalysisResponse): result is NonFoodResult {
  return (result as NonFoodResult).is_food === false;
}

// 3.1c Pencocokan hasil AI ke CULINARY_CATALOG agar gizi memakai data lokal TKPI
function matchWithLocalCatalog(foodName: string): FoodItem | null {
  const nameNorm = foodName.toLowerCase().trim();
  // 1. Exact match
  let found = CULINARY_CATALOG.find((c: FoodItem) => c.name.toLowerCase() === nameNorm);
  if (found) return found;

  // 2. Partial match
  found = CULINARY_CATALOG.find(
    (c: FoodItem) => nameNorm.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(nameNorm),
  );
  return found || null;
}

export interface FoodAnalysisResult {
  culinary_review?: string;
  culinary_tips?: string | string[];
  flavor_tags?: FlavorTag[];
  foods: Array<{
    name: string;
    name_en?: string;
    portion_grams?: number;
    portion_estimate?: string;
    confidence: number;
    nutrition: {
      kcal?: number;
      calories: number;
      protein: number;
      protein_g: number;
      fat: number;
      fat_g: number;
      carbs: number;
      carbs_g: number;
      fiber: number;
      fiber_g: number;
    };
    price_estimate: {
      min: number;
      max: number;
    };
  }>;
  total_nutrition: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  health_notes: string[];
  confidence?: number;
  low_confidence?: boolean;
  alternatives?: string[];
  disclaimer_key?: string;
}

export async function analyzeFoodWithAI(imageBase64?: string, text?: string): Promise<FoodAnalysisResponse> {
  const providers: string[] = [];

  // Validasi cepat: input teks yang jelas bukan makanan langsung ditolak
  if (!imageBase64 && text) {
    const keyword = detectNonFoodKeyword(text);
    if (keyword) {
      return {
        is_food: false,
        detected_object: keyword,
        error_message: `Objek "${keyword}" bukan makanan atau minuman. Silakan masukkan nama hidangan atau foto makanan yang ingin direview.`,
      };
    }
  }

  if (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2) providers.push("gemini");
  if (process.env.GROQ_API_KEY) providers.push("groq");
  if (process.env.MISTRAL_API_KEY) providers.push("mistral");

  // Fallback to offline catalog heuristics if no keys are set or in mock/offline mode
  if (providers.length === 0) {
    return generateCatalogFallback(text);
  }

  // Shuffle providers for simple round-robin/fallback
  const shuffled = [...providers].sort(() => 0.5 - Math.random());
  let lastError: unknown = null;

  for (const provider of shuffled) {
    try {
      console.log(`[AI Analysis] Attempting with provider: ${provider}`);
      let resultText = "";

      if (provider === "gemini") {
        const rawKeys = [
          ...(process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.split(",") : []),
          process.env.GEMINI_API_KEY_2 || "",
        ]
          .map((k) => k.trim())
          .filter(Boolean);

        const geminiKeys = [...new Set(rawKeys)];
        const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parts: any[] = [];
        if (text) {
          parts.push({ text: `Analisis makanan berikut: ${text}` });
        }
        if (imageBase64) {
          parts.push({
            inlineData: {
              data: imageBase64,
              mimeType: "image/jpeg",
            },
          });
        }

        let geminiSuccess = false;
        let lastGeminiErr: unknown = null;

        for (const key of geminiKeys) {
          try {
            const ai = new GoogleGenerativeAI(key);
            const model = ai.getGenerativeModel({
              model: modelName,
              systemInstruction: UNIFIED_PROMPT,
            });

            const response = await model.generateContent({
              contents: [{ role: "user", parts }],
              generationConfig: {
                responseMimeType: "application/json",
              },
            });
            resultText = response.response.text() || "";
            geminiSuccess = true;
            break;
          } catch (keyErr) {
            console.warn("[Gemini roundRobin] API Key failed, trying next key if any:", keyErr);
            lastGeminiErr = keyErr;
          }
        }

        if (!geminiSuccess) {
          throw lastGeminiErr || new Error("All Gemini keys failed");
        }
      } else if (provider === "groq") {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const model = process.env.GROQ_MODEL || "llama-3.2-11b-vision-preview";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content: any[] = [];
        if (text) {
          content.push({ type: "text", text: `Analisis makanan berikut: ${text}` });
        }
        if (imageBase64) {
          content.push({
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          });
        }

        const response = await groq.chat.completions.create({
          model,
          messages: [
            { role: "system", content: UNIFIED_PROMPT },
            { role: "user", content },
          ],
          response_format: { type: "json_object" },
        });
        resultText = response.choices[0]?.message?.content || "";
      } else if (provider === "mistral") {
        const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
        const model = process.env.MISTRAL_MODEL || "pixtral-12b-2409";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content: any[] = [];
        if (text) {
          content.push({ type: "text", text: `Analisis makanan berikut: ${text}` });
        }
        if (imageBase64) {
          content.push({
            type: "image_url",
            imageUrl: `data:image/jpeg;base64,${imageBase64}`,
          });
        }

        const response = await mistral.chat.complete({
          model,
          messages: [
            { role: "system", content: UNIFIED_PROMPT },
            { role: "user", content },
          ],
          responseFormat: { type: "json_object" },
        });
        const choice = response.choices?.[0]?.message?.content;
        resultText = typeof choice === "string" ? choice : JSON.stringify(choice);
      }

      // Parse JSON from result
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      const parsedRaw = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(resultText);

      // Tahap 0: AI menyatakan objek BUKAN makanan -> hentikan, jangan fallback ke katalog
      if (parsedRaw && parsedRaw.is_food === false) {
        return {
          is_food: false,
          detected_object:
            typeof parsedRaw.detected_object === "string" ? parsedRaw.detected_object : undefined,
          error_message:
            typeof parsedRaw.error_message === "string" && parsedRaw.error_message.length > 5
              ? parsedRaw.error_message
              : "Objek yang dipindai bukan makanan atau minuman. Silakan arahkan kamera ke hidangan makanan atau minuman yang ingin kamu review.",
        };
      }

      // Normalize & enrich with TKPI Indonesian Local Catalog
      return processAndValidateAIResult(parsedRaw, text);
    } catch (error) {
      console.warn(`[AI Analysis] Provider ${provider} failed:`, error);
      lastError = error;
      // Continue to next provider in loop
    }
  }

  // If all providers fail, use intelligent catalog fallback
  console.warn("Semua provider AI gagal, menggunakan fallback katalog lokal:", lastError);
  return generateCatalogFallback(text);
}

function processAndValidateAIResult(raw: any, queryText?: string): FoodAnalysisResult {
  const rawFoods = Array.isArray(raw.foods) && raw.foods.length > 0 ? raw.foods : [raw];

  const processedFoods = rawFoods.map((f: any) => {
    const rawName = String(f.name || queryText || "Menu Kuliner Campur").trim();
    const catalogMatch = matchWithLocalCatalog(rawName);

    // Prefer local TKPI catalog nutrition when matched
    const kcal = catalogMatch ? catalogMatch.nutrition.kcal : Number(f.nutrition?.kcal || f.nutrition?.calories || 250);
    const protein = catalogMatch ? catalogMatch.nutrition.protein : Number(f.nutrition?.protein || f.nutrition?.protein_g || 10);
    const fat = catalogMatch ? catalogMatch.nutrition.fat : Number(f.nutrition?.fat || f.nutrition?.fat_g || 8);
    const carbs = catalogMatch ? catalogMatch.nutrition.carbs : Number(f.nutrition?.carbs || f.nutrition?.carbs_g || 35);
    const fiber = catalogMatch ? (catalogMatch.nutrition.fiber ?? 1) : Number(f.nutrition?.fiber || f.nutrition?.fiber_g || 1);

    const priceMin = catalogMatch ? catalogMatch.priceRange.min : Number(f.price_estimate?.min || 8000);
    const priceMax = catalogMatch ? catalogMatch.priceRange.max : Number(f.price_estimate?.max || 15000);

    const conf = typeof f.confidence === "number" ? Math.min(Math.max(f.confidence, 0.1), 1.0) : 0.85;

    return {
      name: catalogMatch ? catalogMatch.name : rawName,
      name_en: f.name_en || (catalogMatch ? catalogMatch.name : rawName),
      confidence: conf,
      portion_grams: f.portion_grams || (catalogMatch ? catalogMatch.portion.grams : 200),
      portion_estimate: f.portion_estimate || (catalogMatch ? catalogMatch.portion.label : "1 porsi standar"),
      nutrition: {
        kcal,
        calories: kcal,
        protein,
        protein_g: protein,
        fat,
        fat_g: fat,
        carbs,
        carbs_g: carbs,
        fiber,
        fiber_g: fiber,
      },
      price_estimate: {
        min: priceMin,
        max: priceMax,
      },
    };
  });

  const totalCalories = processedFoods.reduce((s: number, f: any) => s + f.nutrition.calories, 0);
  const totalProtein = processedFoods.reduce((s: number, f: any) => s + f.nutrition.protein_g, 0);
  const totalFat = processedFoods.reduce((s: number, f: any) => s + f.nutrition.fat_g, 0);
  const totalCarbs = processedFoods.reduce((s: number, f: any) => s + f.nutrition.carbs_g, 0);
  const totalFiber = processedFoods.reduce((s: number, f: any) => s + f.nutrition.fiber_g, 0);

  const flavorTags = sanitizeFlavorTags(raw.flavor_tags);

  const tipsArray: string[] = Array.isArray(raw.culinary_tips)
    ? raw.culinary_tips.map((t: any) => String(t))
    : typeof raw.culinary_tips === "string"
    ? [raw.culinary_tips]
    : [];

  // Pair with suggestion from catalog if available
  const firstCatalog = matchWithLocalCatalog(processedFoods[0]?.name || "");
  if (firstCatalog && firstCatalog.pairWith && firstCatalog.pairWith.length > 0) {
    const pair = firstCatalog.pairWith[0];
    const pairSuggestion = `Biar makin seimbang & mantap, coba pasangkan dengan ${firstCatalog.pairWith.join(" atau ")}.`;
    if (pair && !tipsArray.some((t) => t.includes(pair))) {
      tipsArray.unshift(pairSuggestion);
    }
  }

  if (tipsArray.length === 0) {
    tipsArray.push("Biar makin segar dan seimbang di tenggorokan, tambahkan lalapan timun segar atau es teh tawar.");
  }

  const avgConfidence = processedFoods.reduce((s: number, f: any) => s + f.confidence, 0) / processedFoods.length;
  const isLowConfidence = avgConfidence < 0.6;

  // 3.2a 3 alternatif tombol cepat jika confidence < 0.6
  const alternatives = isLowConfidence
    ? [
        CULINARY_CATALOG[Math.floor(Math.random() * 15)].name,
        CULINARY_CATALOG[15 + Math.floor(Math.random() * 15)].name,
        CULINARY_CATALOG[30 + Math.floor(Math.random() * 15)].name,
      ]
    : undefined;

  const finalReview =
    raw.culinary_review && String(raw.culinary_review).length > 10
      ? String(raw.culinary_review).slice(0, 350)
      : `Pilihan hidangan lokal ${processedFoods[0]?.name || "Nusantara"} yang nikmat dan pas buat membangkitkan semangat anak kost!`;

  return {
    culinary_review: finalReview,
    culinary_tips: tipsArray.slice(0, 3),
    flavor_tags: flavorTags,
    foods: processedFoods,
    total_nutrition: {
      calories: Math.round(totalCalories),
      protein_g: Math.round(totalProtein * 10) / 10,
      fat_g: Math.round(totalFat * 10) / 10,
      carbs_g: Math.round(totalCarbs * 10) / 10,
      fiber_g: Math.round(totalFiber * 10) / 10,
    },
    health_notes: [
      `Keseimbangan porsi menghasilkan energi sekitar ${Math.round(totalCalories)} kkal.`,
      `Sumber protein utama: ~${Math.round(totalProtein)}g, pas untuk aktivitas harian.`,
    ],
    confidence: Math.round(avgConfidence * 100) / 100,
    low_confidence: isLowConfidence,
    alternatives,
    disclaimer_key: "estimate",
  };
}

function generateCatalogFallback(text?: string): FoodAnalysisResponse {
  // Jangan pernah menebak "Nasi Telur Dadar" untuk input yang jelas bukan makanan
  if (text) {
    const keyword = detectNonFoodKeyword(text);
    if (keyword) {
      return {
        is_food: false,
        detected_object: keyword,
        error_message: `Objek "${keyword}" bukan makanan atau minuman. Silakan masukkan nama hidangan atau foto makanan yang ingin direview.`,
      };
    }
  }

  const match = matchWithLocalCatalog(text || "Nasi Telur Dadar");
  const baseItem = match || CULINARY_CATALOG[1]; // Telur Dadar

  const priceMin = baseItem.priceRange.min;
  const priceMax = baseItem.priceRange.max;

  return {
    culinary_review: `Aroma harum ${baseItem.name} yang menggoda selera! Menu favorit penyelamat anak kost dengan cita rasa gurih nagih dan ramah di kantong.`,
    culinary_tips: [
      `Biar makin komplit, pasangkan dengan ${baseItem.pairWith?.join(" atau ") || "lalapan segar"}.`,
      "Minum air putih hangat atau es teh tawar biar tenggorokan tetap plong.",
    ],
    flavor_tags: baseItem.flavorTags as FlavorTag[],
    foods: [
      {
        name: baseItem.name,
        name_en: baseItem.name,
        confidence: 0.75,
        portion_grams: baseItem.portion.grams,
        portion_estimate: baseItem.portion.label,
        nutrition: {
          kcal: baseItem.nutrition.kcal,
          calories: baseItem.nutrition.kcal,
          protein: baseItem.nutrition.protein,
          protein_g: baseItem.nutrition.protein,
          fat: baseItem.nutrition.fat,
          fat_g: baseItem.nutrition.fat,
          carbs: baseItem.nutrition.carbs,
          carbs_g: baseItem.nutrition.carbs,
          fiber: baseItem.nutrition.fiber ?? 1,
          fiber_g: baseItem.nutrition.fiber ?? 1,
        },
        price_estimate: {
          min: priceMin,
          max: priceMax,
        },
      },
    ],
    total_nutrition: {
      calories: baseItem.nutrition.kcal,
      protein_g: baseItem.nutrition.protein,
      fat_g: baseItem.nutrition.fat,
      carbs_g: baseItem.nutrition.carbs,
      fiber_g: baseItem.nutrition.fiber ?? 1,
    },
    health_notes: [
      `Porsi standar ${baseItem.name} memberikan energi ~${baseItem.nutrition.kcal} kkal.`,
      `Kandungan protein ~${baseItem.nutrition.protein}g mendukung fokus kuliah dan aktivitas harian.`,
    ],
    confidence: 0.75,
    low_confidence: false,
    disclaimer_key: "estimate",
  };
}

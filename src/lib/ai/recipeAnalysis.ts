import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { Mistral } from "@mistralai/mistralai";
import { prisma } from "@/lib/prisma";

export interface RecipeAnalysisInput {
  title: string;
  ingredients: string; // or string[]
  steps?: string;
  imageBase64?: string;
  portions?: number;
}

/**
 * Mengambil acuan harga bahan pokok dari tabel Ingredient di database
 * agar AI menghitung estimasi biaya resep sesuai harga pasar riil.
 */
async function getIngredientPriceReference(): Promise<string> {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: "asc" },
      select: { name: true, unit: true, pricePerUnit: true, region: true },
    });

    if (ingredients.length === 0) return "";

    const lines = ingredients.map(
      (i) => `- ${i.name}: Rp ${Math.round(i.pricePerUnit).toLocaleString("id-ID")}/${i.unit}`
    );

    return `\nACUAN HARGA BAHAN DARI DATABASE (Gunakan untuk menghitung estimated_cost agar akurat):\n${lines.join("\n")}`;
  } catch (error) {
    console.error("[Recipe Analysis] Gagal memuat harga bahan dari database:", error);
    return "";
  }
}

export interface RecipeAnalysisResult {
  is_food: boolean;
  rejection_reason: string | null;
  nutrition: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  estimated_cost: number;
  cook_time_minutes: number;
  ai_feedback: string;
  health_tags: string[];
}

export const RECIPE_VERIFICATION_PROMPT = `
Kamu adalah Pakar Kuliner dan Ahli Gizi untuk aplikasi anak kost DompetKost.
Tugas utamamu:
1. MEMERIKSA KELAYAKAN MAKANAN (Food Safety & Validity Check):
   - Periksa judul resep, bahan-bahan, langkah-langkah, dan foto (jika ada).
   - Apakah ini benar-benar makanan atau masakan yang nyata, aman, dan layak dikonsumsi manusia?
   - Jika BUKAN makanan (contoh: barang elektronik, sepatu, sabun, oli, plastik, batu, zat beracun/berbahaya, teks sampah/lelucon non-makanan), wajib set "is_food": false dan berikan alasan penolakan dalam "rejection_reason".
2. JIKA INI BENAR MAKANAN ("is_food": true):
   - Hitung kandungan nutrisi per porsi:
     * calories (kkal): total energi
     * protein_g (gram)
     * fat_g (gram)
     * carbs_g (gram)
     * fiber_g (gram)
   - Estimasi biaya wajar bahan untuk anak kost di Indonesia (estimated_cost dalam Rupiah, misal 15000).
   - Estimasi waktu memasak (cook_time_minutes dalam menit).
   - Berikan ulasan kuliner singkat yang hangat & memotivasi anak kost (maksimal 200 karakter) di "ai_feedback".
   - Berikan 2-4 tag kesehatan/tips ("health_tags", misal: ["Tinggi Protein", "Hemat Kantong", "Mudah Dimasak"]).

Format output WAJIB HANYA JSON MURNI (valid JSON) tanpa markdown \`\`\`json:
{
  "is_food": true,
  "rejection_reason": null,
  "nutrition": {
    "calories": 420,
    "protein_g": 18.5,
    "fat_g": 12.0,
    "carbs_g": 58.0,
    "fiber_g": 3.5
  },
  "estimated_cost": 15000,
  "cook_time_minutes": 20,
  "ai_feedback": "Resep mantap dan bergizi! Perpaduan protein nabati dan bumbu rempah sederhana yang pas untuk anak kost.",
  "health_tags": ["Tinggi Protein", "Hemat Kantong", "Mudah Dimasak"]
}

Jika BUKAN makanan:
{
  "is_food": false,
  "rejection_reason": "Bahan atau item yang dimasukkan terdeteksi bukan makanan atau bahan konsumsi yang aman.",
  "nutrition": {
    "calories": 0,
    "protein_g": 0,
    "fat_g": 0,
    "carbs_g": 0,
    "fiber_g": 0
  },
  "estimated_cost": 0,
  "cook_time_minutes": 0,
  "ai_feedback": "",
  "health_tags": []
}
`;

function fallbackAnalyzeRecipe(input: RecipeAnalysisInput): RecipeAnalysisResult {
  const combined = `${input.title} ${input.ingredients} ${input.steps || ""}`.toLowerCase();
  
  // Non-food / hazardous keywords blacklist
  const nonFoodKeywords = [
    "sabun", "deterjen", "oli", "bensin", "solar", "minyak tanah", "racun", "batu", "pasir",
    "plastik", "kaca", "besi", "baja", "sepatu", "baju", "celana", "kabel", "hp", "handphone",
    "laptop", "baterai", "shampoo", "odol", "pasta gigi", "cat", "tiner", "sianida"
  ];

  for (const word of nonFoodKeywords) {
    if (combined.includes(word)) {
      return {
        is_food: false,
        rejection_reason: `Terdeteksi bahan non-makanan atau tidak aman dikonsumsi (${word}). Harap masukkan resep makanan yang layak konsumsi.`,
        nutrition: { calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 },
        estimated_cost: 0,
        cook_time_minutes: 0,
        ai_feedback: "",
        health_tags: [],
      };
    }
  }

  // Heuristic nutrition calculation
  let calories = 350;
  let protein_g = 12;
  let fat_g = 10;
  let carbs_g = 45;
  let fiber_g = 3;
  let cost = 12000;

  if (combined.includes("telur")) {
    calories += 140;
    protein_g += 12;
    fat_g += 10;
    cost += 4000;
  }
  if (combined.includes("ayam")) {
    calories += 200;
    protein_g += 22;
    fat_g += 8;
    cost += 8000;
  }
  if (combined.includes("tahu") || combined.includes("tempe")) {
    calories += 150;
    protein_g += 14;
    fat_g += 7;
    fiber_g += 3;
    cost += 3000;
  }
  if (combined.includes("nasi")) {
    calories += 180;
    carbs_g += 40;
    cost += 2000;
  }
  if (combined.includes("mie") || combined.includes("indomie")) {
    calories += 380;
    carbs_g += 52;
    fat_g += 14;
    cost += 3500;
  }
  if (combined.includes("sayur") || combined.includes("kangkung") || combined.includes("bayam") || combined.includes("wortel")) {
    calories += 40;
    fiber_g += 4;
    cost += 3000;
  }

  const portions = Math.max(1, input.portions || 1);
  return {
    is_food: true,
    rejection_reason: null,
    nutrition: {
      calories: Math.round(calories / portions),
      protein_g: Math.round((protein_g / portions) * 10) / 10,
      fat_g: Math.round((fat_g / portions) * 10) / 10,
      carbs_g: Math.round((carbs_g / portions) * 10) / 10,
      fiber_g: Math.round((fiber_g / portions) * 10) / 10,
    },
    estimated_cost: Math.round(cost / portions),
    cook_time_minutes: combined.includes("rebus") || combined.includes("tumis") ? 15 : 25,
    ai_feedback: "Resep praktis dan lezat khas anak kost! Kandungan gizi seimbang dan ramah di kantong.",
    health_tags: ["Praktis & Lezat", "Ramah Anak Kost", protein_g > 15 ? "Tinggi Protein" : "Energi Cepat"],
  };
}

export async function verifyAndAnalyzeRecipeWithAI(input: RecipeAnalysisInput): Promise<RecipeAnalysisResult> {
  const priceRef = await getIngredientPriceReference();
  const textPrompt = `
Judul Resep: ${input.title}
Porsi: ${input.portions || 1} porsi
Bahan-Bahan:
${input.ingredients}

Langkah Memasak:
${input.steps || "Tidak disertakan"}
${priceRef}
  `.trim();

  let cleanBase64 = input.imageBase64;
  if (cleanBase64) {
    cleanBase64 = cleanBase64.replace(/^data:image\/\w+;base64,/, "");
  }

  const providers: string[] = [];
  if (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2) providers.push("gemini");
  if (process.env.GROQ_API_KEY) providers.push("groq");
  if (process.env.MISTRAL_API_KEY) providers.push("mistral");

  if (providers.length === 0) {
    console.log("[AI Recipe] No AI keys configured, using heuristic fallback");
    return fallbackAnalyzeRecipe(input);
  }

  const shuffled = [...providers].sort(() => 0.5 - Math.random());
  for (const provider of shuffled) {
    try {
      console.log(`[AI Recipe Analysis] Trying provider: ${provider}`);
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
        const parts: any[] = [{ text: textPrompt }];
        if (cleanBase64) {
          parts.push({
            inlineData: {
              data: cleanBase64,
              mimeType: "image/jpeg",
            },
          });
        }

        let success = false;
        for (const key of geminiKeys) {
          try {
            const ai = new GoogleGenerativeAI(key);
            const model = ai.getGenerativeModel({
              model: modelName,
              systemInstruction: RECIPE_VERIFICATION_PROMPT,
            });

            const response = await model.generateContent({
              contents: [{ role: "user", parts }],
              generationConfig: {
                responseMimeType: "application/json",
              },
            });
            resultText = response.response.text() || "";
            success = true;
            break;
          } catch (keyErr) {
            console.warn("[Gemini Recipe] Key failed, trying next:", keyErr);
          }
        }
        if (!success) throw new Error("Gemini keys exhausted");
      } else if (provider === "groq") {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const model = process.env.GROQ_MODEL || "llama-3.2-11b-vision-preview";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content: any[] = [{ type: "text", text: textPrompt }];
        if (cleanBase64) {
          content.push({
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${cleanBase64}` },
          });
        }

        const response = await groq.chat.completions.create({
          model,
          messages: [
            { role: "system", content: RECIPE_VERIFICATION_PROMPT },
            { role: "user", content },
          ],
          response_format: { type: "json_object" },
        });
        resultText = response.choices[0]?.message?.content || "";
      } else if (provider === "mistral") {
        const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
        const model = process.env.MISTRAL_MODEL || "pixtral-12b-2409";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content: any[] = [{ type: "text", text: textPrompt }];
        if (cleanBase64) {
          content.push({
            type: "image_url",
            imageUrl: `data:image/jpeg;base64,${cleanBase64}`,
          });
        }

        const response = await mistral.chat.complete({
          model,
          messages: [
            { role: "system", content: RECIPE_VERIFICATION_PROMPT },
            { role: "user", content },
          ],
        });
        const raw = response.choices?.[0]?.message?.content;
        resultText = typeof raw === "string" ? raw : "";
      }

      if (resultText) {
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            is_food: Boolean(parsed.is_food),
            rejection_reason: parsed.is_food ? null : (parsed.rejection_reason || "Resep atau gambar terdeteksi bukan makanan yang aman dikonsumsi."),
            nutrition: {
              calories: Number(parsed.nutrition?.calories) || 0,
              protein_g: Number(parsed.nutrition?.protein_g) || 0,
              fat_g: Number(parsed.nutrition?.fat_g) || 0,
              carbs_g: Number(parsed.nutrition?.carbs_g) || 0,
              fiber_g: Number(parsed.nutrition?.fiber_g) || 0,
            },
            estimated_cost: Number(parsed.estimated_cost) || 12000,
            cook_time_minutes: Number(parsed.cook_time_minutes) || 20,
            ai_feedback: String(parsed.ai_feedback || "Resep berhasil diverifikasi oleh AI DompetKost!"),
            health_tags: Array.isArray(parsed.health_tags) ? parsed.health_tags : ["Terverifikasi AI", "Ramah Anak Kost"],
          };
        }
      }
    } catch (err) {
      console.warn(`[AI Recipe Analysis] Provider ${provider} failed:`, err);
    }
  }

  // Fallback if all providers fail
  console.log("[AI Recipe Analysis] All providers failed, falling back to heuristics");
  return fallbackAnalyzeRecipe(input);
}

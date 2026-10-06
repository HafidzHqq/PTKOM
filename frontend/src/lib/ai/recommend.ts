import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { RECOMMENDATION_PROMPT } from "./prompts";

export interface RecommendationResult {
  deficiency: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  recommendations: {
    food_name: string;
    estimated_nutrition: {
      calories: number;
      protein_g: number;
      fat_g: number;
      carbs_g: number;
      fiber_g: number;
    };
    reason: string;
  }[];
  advice: string;
  metadata?: {
    provider: string;
    model: string;
  };
}

const cleanJson = (str: string) => {
  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Invalid JSON response");
  return JSON.parse(str.substring(start, end + 1));
};

export async function getRecommendations(
  target: Record<string, number>,
  consumed: Record<string, number>
): Promise<RecommendationResult> {
  const prompt = `${RECOMMENDATION_PROMPT}\n\nTarget Harian:\n${JSON.stringify(target, null, 2)}\n\nSudah Dikonsumsi Hari Ini:\n${JSON.stringify(consumed, null, 2)}`;
  const errors: string[] = [];

  // Try Gemini first
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const parsed = cleanJson(result.response.text());
      parsed.metadata = { provider: "Gemini", model: process.env.GEMINI_MODEL || "gemini-1.5-flash" };
      return parsed;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Gemini recommendation failed:", msg);
      errors.push(`Gemini: ${msg}`);
    }
  }

  // Try Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const result = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile", // Use text model for recommendations
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const parsed = cleanJson(result.choices[0]?.message?.content || "{}");
      parsed.metadata = { provider: "Groq", model: "llama-3.3-70b-versatile" };
      return parsed;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Groq recommendation failed:", msg);
      errors.push(`Groq: ${msg}`);
    }
  }

  // Try Mistral
  if (process.env.MISTRAL_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: process.env.MISTRAL_API_KEY, baseURL: "https://api.mistral.ai/v1" });
      const result = await client.chat.completions.create({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const parsed = cleanJson(result.choices[0]?.message?.content || "{}");
      parsed.metadata = { provider: "Mistral", model: "mistral-small-latest" };
      return parsed;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Mistral recommendation failed:", msg);
      errors.push(`Mistral: ${msg}`);
    }
  }

  console.warn("Semua AI gagal, menggunakan rekomendasi cerdas lokal (fallback).");

  // Fallback lokal berdasarkan kekurangan gizi
  const deficiency = {
    calories: Math.max(0, (target.calories || 2000) - (consumed.calories || 0)),
    protein_g: Math.max(0, (target.protein_g || 60) - (consumed.protein_g || 0)),
    fat_g: Math.max(0, (target.fat_g || 65) - (consumed.fat_g || 0)),
    carbs_g: Math.max(0, (target.carbs_g || 300) - (consumed.carbs_g || 0)),
    fiber_g: Math.max(0, (target.fiber_g || 25) - (consumed.fiber_g || 0)),
  };

  const localRecs = [];

  if (deficiency.protein_g > 15) {
    localRecs.push({
      food_name: "Dada Ayam Bakar / Pecel Lele",
      estimated_nutrition: { calories: 300, protein_g: 28, fat_g: 12, carbs_g: 0, fiber_g: 0 },
      reason: "Tinggi protein untuk membantu menutupi kekurangan protein harian Anda."
    });
  }

  if (deficiency.fiber_g > 5) {
    localRecs.push({
      food_name: "Gado-Gado / Sayur Bayam",
      estimated_nutrition: { calories: 250, protein_g: 10, fat_g: 8, carbs_g: 35, fiber_g: 8 },
      reason: "Kaya akan serat dan mikronutrien penting untuk pencernaan."
    });
  }

  if (deficiency.calories > 300) {
    localRecs.push({
      food_name: "Nasi Campur Warteg (Nasi + Tempe Orek + Telur)",
      estimated_nutrition: { calories: 450, protein_g: 16, fat_g: 14, carbs_g: 65, fiber_g: 4 },
      reason: "Pilihan seimbang dan terjangkau untuk memenuhi sisa kebutuhan energi/kalori."
    });
  }

  // Jika sudah cukup atau list masih kurang dari 3
  if (localRecs.length < 3) {
    localRecs.push({
      food_name: "Tahu & Tempe Bacem",
      estimated_nutrition: { calories: 180, protein_g: 12, fat_g: 6, carbs_g: 18, fiber_g: 3 },
      reason: "Camilan bernutrisi tinggi protein nabati yang ramah di kantong."
    });
  }

  return {
    deficiency,
    recommendations: localRecs.slice(0, 3),
    advice: "Kebutuhan gizi Anda hampir terpenuhi! Tetap jaga asupan air putih dan istirahat yang cukup.",
    metadata: {
      provider: "Local Rule-Based (Fallback)",
      model: "gizi-local-v1"
    }
  };
}

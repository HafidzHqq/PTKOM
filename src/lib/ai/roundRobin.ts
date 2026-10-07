import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { Mistral } from "@mistralai/mistralai";

const SYSTEM_PROMPT = `Anda adalah ahli gizi AI untuk aplikasi DompetKost.
Tugas Anda adalah menganalisis makanan dari gambar atau teks yang diberikan.
Berikan estimasi nutrisi yang realistis untuk porsi standar (sekitar 200-250g).
Fokus pada makanan lokal Indonesia (warteg, padang, jajanan).

KEMBALIKAN HANYA JSON VALID DENGAN FORMAT BERIKUT, TANPA MARKDOWN ATAU TEKS LAIN:
{
  "foods": [
    {
      "name": "Nama Makanan (Indonesia)",
      "name_en": "Food Name (English)",
      "portion_grams": 250,
      "confidence": 0.85,
      "nutrition": {
        "calories": 350,
        "protein_g": 15,
        "fat_g": 10,
        "carbs_g": 45,
        "fiber_g": 3
      }
    }
  ],
  "total_nutrition": {
    "calories": 350,
    "protein_g": 15,
    "fat_g": 10,
    "carbs_g": 45,
    "fiber_g": 3
  },
  "health_notes": [
    "Catatan kesehatan 1",
    "Catatan kesehatan 2"
  ]
}`;

export interface FoodAnalysisResult {
  foods: Array<{
    name: string;
    name_en?: string;
    portion_grams: number;
    confidence: number;
    nutrition: {
      calories: number;
      protein_g: number;
      fat_g: number;
      carbs_g: number;
      fiber_g: number;
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
}

export async function analyzeFoodWithAI(imageBase64?: string, text?: string): Promise<FoodAnalysisResult> {
  const providers: string[] = [];

  if (process.env.GEMINI_API_KEY) providers.push("gemini");
  if (process.env.GROQ_API_KEY) providers.push("groq");
  if (process.env.MISTRAL_API_KEY) providers.push("mistral");

  if (providers.length === 0) {
    throw new Error("No AI providers configured. Set API keys in .env.local");
  }

  // Shuffle providers for simple round-robin/fallback
  const shuffled = [...providers].sort(() => 0.5 - Math.random());
  let lastError: unknown = null;

  for (const provider of shuffled) {
    try {
      console.log(`[AI Analysis] Attempting with provider: ${provider}`);
      let resultText = "";

      if (provider === "gemini") {
        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
        const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        const model = ai.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parts: any[] = [];
        if (text) {
          parts.push({ text });
        }
        if (imageBase64) {
          parts.push({
            inlineData: {
              data: imageBase64,
              mimeType: "image/jpeg",
            },
          });
        }

        const response = await model.generateContent({
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        });
        resultText = response.response.text() || "";
      } else if (provider === "groq") {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const model = process.env.GROQ_MODEL || "llama-3.2-11b-vision-preview";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content: any[] = [];
        if (text) {
          content.push({ type: "text", text });
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
            { role: "system", content: SYSTEM_PROMPT },
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
          content.push({ type: "text", text });
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
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content },
          ],
          responseFormat: { type: "json_object" },
        });
        const choice = response.choices?.[0]?.message?.content;
        resultText = typeof choice === "string" ? choice : JSON.stringify(choice);
      }

      // Parse JSON from result
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(resultText);
    } catch (error) {
      console.warn(`[AI Analysis] Provider ${provider} failed:`, error);
      lastError = error;
      // Continue to next provider in loop
    }
  }

  throw new Error(`Semua AI provider gagal merespons. Error terakhir: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

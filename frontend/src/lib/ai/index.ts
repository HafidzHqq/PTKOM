import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai"; // For OpenRouter and Mistral if using openai compatibility
import { UNIFIED_PROMPT } from "./prompts";

export interface FoodAnalysisResult {
  foods: {
    name: string;
    name_en: string;
    portion_grams: number;
    confidence: number;
    nutrition: {
      calories: number;
      protein_g: number;
      fat_g: number;
      carbs_g: number;
      fiber_g: number;
    };
  }[];
  total_nutrition: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  health_notes: string[];
}

// Ensure clean JSON string extraction
const cleanJson = (str: string) => {
  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Invalid JSON response");
  return JSON.parse(str.substring(start, end + 1));
};

const geminiAdapter = {
  analyze: async (base64Image: string): Promise<FoodAnalysisResult> => {
    if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });

    // Assumes base64Image is just the raw base64 string without data:image/... prefix
    const result = await model.generateContent([
      UNIFIED_PROMPT,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);
    const response = await result.response;
    return cleanJson(response.text());
  },
};

const groqAdapter = {
  analyze: async (base64Image: string): Promise<FoodAnalysisResult> => {
    if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const result = await groq.chat.completions.create({
      model:
        process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: UNIFIED_PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    return cleanJson(result.choices[0]?.message?.content || "{}");
  },
};

const mistralAdapter = {
  analyze: async (base64Image: string): Promise<FoodAnalysisResult> => {
    if (!process.env.MISTRAL_API_KEY)
      throw new Error("Missing MISTRAL_API_KEY");
    const client = new OpenAI({
      apiKey: process.env.MISTRAL_API_KEY,
      baseURL: "https://api.mistral.ai/v1",
    });

    const result = await client.chat.completions.create({
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: UNIFIED_PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    return cleanJson(result.choices[0]?.message?.content || "{}");
  },
};

const openrouterAdapter = {
  analyze: async (base64Image: string): Promise<FoodAnalysisResult> => {
    if (!process.env.OPENROUTER_API_KEY)
      throw new Error("Missing OPENROUTER_API_KEY");
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const result = await client.chat.completions.create({
      model: "qwen/qwen-2.5-vl-72b-instruct:free",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: UNIFIED_PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    return cleanJson(result.choices[0]?.message?.content || "{}");
  },
};

const AI_PROVIDERS = [
  { name: "gemini", adapter: geminiAdapter, dailyLimit: 1500, used: 0 },
  { name: "groq", adapter: groqAdapter, dailyLimit: 1000, used: 0 },
  { name: "mistral", adapter: mistralAdapter, dailyLimit: 500, used: 0 },
  { name: "openrouter", adapter: openrouterAdapter, dailyLimit: 500, used: 0 },
];

let currentIndex = 0;

export async function analyzeFood(
  imageBase64: string,
): Promise<FoodAnalysisResult> {
  const maxRetries = AI_PROVIDERS.length;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const provider = AI_PROVIDERS[currentIndex % AI_PROVIDERS.length];
    currentIndex++;

    // Skip if provider has reached daily limit
    if (provider.used >= provider.dailyLimit) continue;

    try {
      console.log(`[AI Load Balancer] Using provider: ${provider.name}`);
      const result = await provider.adapter.analyze(imageBase64);
      provider.used++;
      return result;
    } catch (error) {
      console.warn(
        `[AI Load Balancer] ${provider.name} failed, trying next...`,
        (error as Error).message,
      );
      lastError = error;
      continue;
    }
  }

  const errorMessage =
    lastError instanceof Error ? lastError.message : "Unknown error";
  throw new Error(
    `Semua AI provider sedang tidak tersedia. Last error: ${errorMessage}`,
  );
}

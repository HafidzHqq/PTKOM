import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai"; // For OpenRouter and Mistral if using openai compatibility
import { UNIFIED_PROMPT, TEXT_PROMPT } from "./prompts";

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
  metadata?: {
    provider: string;
    model: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
}

// Ensure clean JSON string extraction
const cleanJson = (str: string) => {
  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Invalid JSON response");
  return JSON.parse(str.substring(start, end + 1));
};

export interface AnalyzeInput {
  imageBase64?: string;
  text?: string;
}

const geminiAdapter = {
  analyze: async (input: AnalyzeInput): Promise<FoodAnalysisResult> => {
    if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });

    let content: Array<string | Part>;
    if (input.imageBase64) {
      content = [
        UNIFIED_PROMPT,
        {
          inlineData: {
            data: input.imageBase64,
            mimeType: "image/jpeg",
          },
        },
      ];
    } else if (input.text) {
      content = [TEXT_PROMPT, `Nama makanan: ${input.text}`];
    } else {
      throw new Error("Either imageBase64 or text must be provided");
    }

    const result = await model.generateContent(content);
    const response = await result.response;
    const parsed = cleanJson(response.text());

    parsed.metadata = {
      provider: "Gemini",
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      usage: response.usageMetadata
        ? {
            promptTokens: response.usageMetadata.promptTokenCount || 0,
            completionTokens: response.usageMetadata.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
    };

    return parsed;
  },
};

const groqAdapter = {
  analyze: async (input: AnalyzeInput): Promise<FoodAnalysisResult> => {
    if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    let content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;
    if (input.imageBase64) {
      content = [
        { type: "text", text: UNIFIED_PROMPT },
        {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${input.imageBase64}` },
        },
      ];
    } else if (input.text) {
      content = [
        { type: "text", text: TEXT_PROMPT },
        { type: "text", text: `Nama makanan: ${input.text}` },
      ];
    } else {
      throw new Error("Either imageBase64 or text must be provided");
    }

    const result = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
    });

    const parsed = cleanJson(result.choices[0]?.message?.content || "{}");

    parsed.metadata = {
      provider: "Groq",
      model: process.env.GROQ_MODEL || "llama-3.2-11b-vision-preview",
      usage: result.usage
        ? {
            promptTokens: result.usage.prompt_tokens || 0,
            completionTokens: result.usage.completion_tokens || 0,
            totalTokens: result.usage.total_tokens || 0,
          }
        : undefined,
    };

    return parsed;
  },
};

const mistralAdapter = {
  analyze: async (input: AnalyzeInput): Promise<FoodAnalysisResult> => {
    if (!process.env.MISTRAL_API_KEY)
      throw new Error("Missing MISTRAL_API_KEY");
    const client = new OpenAI({
      apiKey: process.env.MISTRAL_API_KEY,
      baseURL: "https://api.mistral.ai/v1",
    });

    let content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;
    if (input.imageBase64) {
      content = [
        { type: "text", text: UNIFIED_PROMPT },
        {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${input.imageBase64}` },
        },
      ];
    } else if (input.text) {
      content = [
        { type: "text", text: TEXT_PROMPT },
        { type: "text", text: `Nama makanan: ${input.text}` },
      ];
    } else {
      throw new Error("Either imageBase64 or text must be provided");
    }

    const result = await client.chat.completions.create({
      model: process.env.MISTRAL_MODEL || "pixtral-12b-2409",
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
    });

    const parsed = cleanJson(result.choices[0]?.message?.content || "{}");

    parsed.metadata = {
      provider: "Mistral",
      model: process.env.MISTRAL_MODEL || "pixtral-12b-2409",
      usage: result.usage
        ? {
            promptTokens: result.usage.prompt_tokens || 0,
            completionTokens: result.usage.completion_tokens || 0,
            totalTokens: result.usage.total_tokens || 0,
          }
        : undefined,
    };

    return parsed;
  },
};

const openrouterAdapter = {
  analyze: async (input: AnalyzeInput): Promise<FoodAnalysisResult> => {
    if (!process.env.OPENROUTER_API_KEY)
      throw new Error("Missing OPENROUTER_API_KEY");
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    let content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;
    if (input.imageBase64) {
      content = [
        { type: "text", text: UNIFIED_PROMPT },
        {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${input.imageBase64}` },
        },
      ];
    } else if (input.text) {
      content = [
        { type: "text", text: TEXT_PROMPT },
        { type: "text", text: `Nama makanan: ${input.text}` },
      ];
    } else {
      throw new Error("Either imageBase64 or text must be provided");
    }

    const result = await client.chat.completions.create({
      model: "qwen/qwen-2.5-vl-72b-instruct:free",
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
    });

    const parsed = cleanJson(result.choices[0]?.message?.content || "{}");

    parsed.metadata = {
      provider: "OpenRouter",
      model: "qwen/qwen-2.5-vl-72b-instruct:free",
      usage: result.usage
        ? {
            promptTokens: result.usage.prompt_tokens || 0,
            completionTokens: result.usage.completion_tokens || 0,
            totalTokens: result.usage.total_tokens || 0,
          }
        : undefined,
    };

    return parsed;
  },
};

const AI_PROVIDERS = [
  {
    name: "gemini",
    adapter: geminiAdapter,
    dailyLimit: 1500,
    used: 0,
    isAvailable: () => Boolean(process.env.GEMINI_API_KEY),
  },
  {
    name: "groq",
    adapter: groqAdapter,
    dailyLimit: 1000,
    used: 0,
    isAvailable: () => Boolean(process.env.GROQ_API_KEY),
  },
  {
    name: "mistral",
    adapter: mistralAdapter,
    dailyLimit: 500,
    used: 0,
    isAvailable: () => Boolean(process.env.MISTRAL_API_KEY),
  },
  {
    name: "openrouter",
    adapter: openrouterAdapter,
    dailyLimit: 500,
    used: 0,
    isAvailable: () => Boolean(process.env.OPENROUTER_API_KEY),
  },
];

let currentIndex = 0;

export async function analyzeFood(
  input: AnalyzeInput,
): Promise<FoodAnalysisResult> {
  const availableProviders = AI_PROVIDERS.filter(
    (p) => p.isAvailable() && p.used < p.dailyLimit,
  );

  if (availableProviders.length === 0) {
    throw new Error(
      "Tidak ada AI provider yang tersedia atau API Key belum dikonfigurasi.",
    );
  }

  let lastError: unknown = null;

  for (let attempt = 0; attempt < availableProviders.length; attempt++) {
    const provider =
      availableProviders[currentIndex % availableProviders.length];
    currentIndex++;

    try {
      console.log(`[AI Load Balancer] Using provider: ${provider.name}`);
      const result = await provider.adapter.analyze(input);
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
    `Semua AI provider yang tersedia gagal memproses permintaan. Last error: ${errorMessage}`,
  );
}

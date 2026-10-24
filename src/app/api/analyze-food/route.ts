import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeFoodWithAI } from "@/lib/ai/roundRobin";
import { aiFoodAnalysisSchema } from "@/lib/validators";

export const maxDuration = 60; // Limit execution to 60s for Vercel Hobby

const requestSchema = z
  .object({
    imageBase64: z.string().optional(),
    text: z.string().optional(),
  })
  .refine((data) => data.imageBase64 || data.text, {
    message: "Harap berikan gambar atau nama makanan untuk di-review",
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, text } = requestSchema.parse(body);

    let cleanBase64 = imageBase64;
    if (imageBase64) {
      // Clean base64 prefix if present
      cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    }

    let result = await analyzeFoodWithAI(cleanBase64, text);

    // 3.1a Validasi Zod output AI
    const validation = aiFoodAnalysisSchema.safeParse(result);
    if (!validation.success) {
      console.warn("[POST /api/analyze-food] Initial schema validation warning:", validation.error.format());
      // Retry once if invalid
      try {
        result = await analyzeFoodWithAI(cleanBase64, text);
      } catch (retryErr) {
        console.warn("[POST /api/analyze-food] Retry failed, using processed output:", retryErr);
      }
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[POST /api/analyze-food] Error:", error);
    const isTimeout = error instanceof Error && (error.message.includes("timeout") || error.message.includes("abort"));
    const friendlyMessage = isTimeout
      ? "Waktu review habis. Fotonya kurang jelas atau koneksi sedang lambat, coba foto dari atas dengan cahaya terang atau pilih manual dari katalog."
      : "Fotonya kurang jelas, coba foto dari atas dengan cahaya terang atau pilih manual dari katalog.";

    return NextResponse.json(
      {
        error: friendlyMessage,
        retryable: true,
      },
      { status: 422 },
    );
  }
}

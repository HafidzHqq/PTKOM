import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeFoodWithAI, isNonFoodResult } from "@/lib/ai/roundRobin";
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

    // Tahap 0: Objek bukan makanan -> tolak scan, jangan simpan ke diary
    if (isNonFoodResult(result)) {
      const label = result.detected_object ? ` (terdeteksi: ${result.detected_object})` : "";
      return NextResponse.json(
        {
          is_food: false,
          error: `Objek yang dipindai bukan makanan atau minuman${label}. Silakan arahkan kamera ke hidangan makanan atau minuman yang ingin kamu review.`,
          detected_object: result.detected_object,
          retryable: true,
        },
        { status: 422 },
      );
    }

    // 3.1a Validasi Zod output AI
    const validation = aiFoodAnalysisSchema.safeParse(result);
    if (!validation.success) {
      console.warn("[POST /api/analyze-food] Initial schema validation warning:", validation.error.format());
      // Retry once if invalid
      try {
        const retryResult = await analyzeFoodWithAI(cleanBase64, text);
        if (isNonFoodResult(retryResult)) {
          const label = retryResult.detected_object ? ` (terdeteksi: ${retryResult.detected_object})` : "";
          return NextResponse.json(
            {
              is_food: false,
              error: `Objek yang dipindai bukan makanan atau minuman${label}. Silakan arahkan kamera ke hidangan makanan atau minuman yang ingin kamu review.`,
              detected_object: retryResult.detected_object,
              retryable: true,
            },
            { status: 422 },
          );
        }
        result = retryResult;
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

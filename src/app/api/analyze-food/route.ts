import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeFoodWithAI } from "@/lib/ai/roundRobin";

export const maxDuration = 60; // Limit execution to 60s for Vercel Hobby

const requestSchema = z
  .object({
    imageBase64: z.string().optional(),
    text: z.string().optional(),
  })
  .refine((data) => data.imageBase64 || data.text, {
    message: "Either imageBase64 or text must be provided",
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

    const result = await analyzeFoodWithAI(cleanBase64, text);
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[POST /api/analyze-food] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze food";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

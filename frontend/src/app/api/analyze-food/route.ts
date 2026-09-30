import { NextRequest, NextResponse } from "next/server";
import { analyzeFood } from "@/lib/ai";
import { z } from "zod";

export const maxDuration = 60; // Limit execution to 60s for Vercel Hobby

const requestSchema = z.object({
  imageBase64: z.string().min(1, "Image is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64 } = requestSchema.parse(body);

    // Clean base64 prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const result = await analyzeFood(cleanBase64);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[POST /api/analyze-food] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze food" },
      { status: 500 }
    );
  }
}

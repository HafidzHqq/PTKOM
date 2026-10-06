import { NextRequest, NextResponse } from "next/server";
import { analyzeFood } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const maxDuration = 60; // Limit execution to 60s for Vercel Hobby

const requestSchema = z.object({
  imageBase64: z.string().min(1, "Image is required"),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { imageBase64 } = requestSchema.parse(body);

    // Clean base64 prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const result = await analyzeFood(cleanBase64);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[POST /api/analyze-food] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze food";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

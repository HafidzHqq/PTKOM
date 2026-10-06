import { NextRequest, NextResponse } from "next/server";
import { analyzeFood } from "@/lib/ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

export const maxDuration = 60; // Limit execution to 60s for Vercel Hobby

const requestSchema = z.object({
  imageBase64: z.string().optional(),
  text: z.string().optional(),
}).refine((data) => data.imageBase64 || data.text, {
  message: "Either imageBase64 or text must be provided",
});

export async function POST(req: NextRequest) {
  // Bypass auth for now
  // const session = await getServerSession(authOptions);
  // if (!session?.user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const body = await req.json();
    const { imageBase64, text } = requestSchema.parse(body);

    let result;
    if (imageBase64) {
      // Clean base64 prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      result = await analyzeFood({ imageBase64: cleanBase64 });
    } else if (text) {
      result = await analyzeFood({ text });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[POST /api/analyze-food] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze food";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

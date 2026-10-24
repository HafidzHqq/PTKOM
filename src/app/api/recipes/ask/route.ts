import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { askRecipeWithAI } from "@/lib/ai/askRecipe";

const askSchema = z.object({
  prompt: z.string().optional(),
  ingredients: z.string().optional(),
  budget: z.number().optional(),
  cookingTool: z.string().optional(),
  dietaryGoal: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = askSchema.parse(body);

    // Call askRecipeWithAI
    const result = await askRecipeWithAI({
      prompt: parsed.prompt,
      ingredients: parsed.ingredients,
      budget: parsed.budget,
      cookingTool: parsed.cookingTool,
      dietaryGoal: parsed.dietaryGoal,
      history: parsed.history,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("[API Ask Recipe Error]", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server AI";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

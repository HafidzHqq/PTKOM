import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAndAnalyzeRecipeWithAI } from "@/lib/ai/recipeAnalysis";
import { prisma } from "@/lib/prisma";

const analyzeSchema = z.object({
  title: z.string().min(2, "Judul resep minimal 2 karakter"),
  ingredients: z.string().min(3, "Bahan-bahan harus diisi"),
  steps: z.string().optional(),
  imageBase64: z.string().optional(),
  portions: z.number().int().min(1).default(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = analyzeSchema.parse(body);

    const cleanTitle = parsed.title.trim();

    // 1. Cek duplikasi resep di database sebelum memanggil AI
    const exactMatch = await prisma.recipe.findFirst({
      where: { title: cleanTitle },
      select: { id: true, title: true },
    });

    let duplicateFound = exactMatch;
    if (!duplicateFound) {
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const targetNorm = normalize(cleanTitle);
      const allExisting = await prisma.recipe.findMany({
        select: { id: true, title: true },
      });
      duplicateFound = allExisting.find((r) => normalize(r.title) === targetNorm) || null;
    }

    if (duplicateFound) {
      return NextResponse.json(
        {
          success: false,
          is_duplicate: true,
          message: `Resep dengan judul "${duplicateFound.title}" sudah terdaftar di database. Resep yang sama tidak bisa dimasukkan lagi. Silakan gunakan judul berbeda atau buat variasi baru.`,
        },
        { status: 409 }
      );
    }

    const result = await verifyAndAnalyzeRecipeWithAI({
      title: parsed.title,
      ingredients: parsed.ingredients,
      steps: parsed.steps,
      imageBase64: parsed.imageBase64,
      portions: parsed.portions,
    });

    if (!result.is_food) {
      return NextResponse.json(
        {
          success: false,
          is_food: false,
          message: result.rejection_reason || "Resep terdeteksi bukan makanan atau bahan yang layak konsumsi.",
          result,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      is_food: true,
      data: result,
    });
  } catch (error) {
    console.error("[POST /api/recipes/analyze] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menganalisis resep dengan AI" },
      { status: 500 }
    );
  }
}

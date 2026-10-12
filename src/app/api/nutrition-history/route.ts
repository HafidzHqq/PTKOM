import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const foodSchema = z.object({
  name: z.string().min(1),
  name_en: z.string().nullish(),
  portion_grams: z.coerce.number().nonnegative().catch(0),
  nutrition: z.object({
    calories: z.coerce.number().nonnegative().catch(0),
    protein_g: z.coerce.number().nonnegative().catch(0),
    fat_g: z.coerce.number().nonnegative().catch(0),
    carbs_g: z.coerce.number().nonnegative().catch(0),
    fiber_g: z.coerce.number().nonnegative().catch(0),
  }).catch({ calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 }),
});

const historySchema = z.object({
  foods: z.array(foodSchema).catch([]),
  total_nutrition: z.object({
    calories: z.coerce.number().nonnegative().catch(0),
    protein_g: z.coerce.number().nonnegative().catch(0),
    fat_g: z.coerce.number().nonnegative().catch(0),
    carbs_g: z.coerce.number().nonnegative().catch(0),
    fiber_g: z.coerce.number().nonnegative().catch(0),
  }).catch({ calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 }),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  // Bypass auth for now, use guest user ID 1
  const userId = session?.user?.id || 1;

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const rows = await prisma.nutritionHistory.findMany({
      where: {
        userId,
        loggedAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        loggedAt: "desc",
      },
      take: 100,
    });

    const data = rows.map((row) => ({
      id: row.id,
      user_id: row.userId,
      foods: typeof row.foods === "string" ? JSON.parse(row.foods) : row.foods,
      calories: row.calories,
      protein_g: row.proteinG,
      fat_g: row.fatG,
      carbs_g: row.carbsG,
      fiber_g: row.fiberG,
      logged_at: row.loggedAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/nutrition-history] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat riwayat gizi" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Bypass auth for now, use guest user ID 1
  const userId = session?.user?.id || 1;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 });
  }

  const parsed = historySchema.safeParse(body);
  if (!parsed.success) {
    console.error("[POST /api/nutrition-history] Validation error:", parsed.error.format());
    return NextResponse.json(
      { error: "Format data gizi tidak valid", details: parsed.error.format() },
      { status: 400 },
    );
  }

  const { data: nutrition } = parsed;

  try {
    const row = await prisma.nutritionHistory.create({
      data: {
        userId,
        foods: JSON.stringify(nutrition.foods),
        calories: nutrition.total_nutrition.calories,
        proteinG: nutrition.total_nutrition.protein_g,
        fatG: nutrition.total_nutrition.fat_g,
        carbsG: nutrition.total_nutrition.carbs_g,
        fiberG: nutrition.total_nutrition.fiber_g,
      },
    });

    const data = {
      id: row.id,
      user_id: row.userId,
      foods: typeof row.foods === "string" ? JSON.parse(row.foods) : row.foods,
      calories: row.calories,
      protein_g: row.proteinG,
      fat_g: row.fatG,
      carbs_g: row.carbsG,
      fiber_g: row.fiberG,
      logged_at: row.loggedAt.toISOString(),
    };

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[POST /api/nutrition-history] Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan riwayat gizi" },
      { status: 500 },
    );
  }
}

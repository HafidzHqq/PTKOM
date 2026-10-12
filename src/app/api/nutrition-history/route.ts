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

  let userId: number;
  if (session?.user?.id) {
    userId = Number(session.user.id);
  } else {
    const guestUser = await prisma.user.findFirst({
      where: { email: "guest@gizikost.local" },
    });
    if (!guestUser) {
      return NextResponse.json([]);
    }
    userId = guestUser.id;
  }

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

  let userId: number;
  if (session?.user?.id) {
    userId = Number(session.user.id);
  } else {
    // Cari atau buat user tamu default agar foreign key selalu valid
    let guestUser = await prisma.user.findFirst({
      where: { email: "guest@gizikost.local" },
    });
    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          email: "guest@gizikost.local",
          name: "Teman Kost",
          gender: "male",
          age: 20,
          weightKg: 60,
          heightCm: 170,
          activityLevel: "light",
          dailyCalorieTarget: 2250,
          dailyProteinTarget: 84,
          dailyFatTarget: 62,
          dailyCarbTarget: 337,
          dailyFiberTarget: 25,
          bmr: 1540,
          tdee: 2117.5,
          monthlyFoodBudget: 900000,
          provider: "credentials",
        },
      });
    }
    userId = guestUser.id;
  }

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

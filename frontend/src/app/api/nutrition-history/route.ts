import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

const foodSchema = z.object({
  name: z.string().min(1),
  name_en: z.string().optional(),
  portion_grams: z.number().nonnegative(),
  nutrition: z.object({
    calories: z.number().nonnegative(),
    protein_g: z.number().nonnegative(),
    fat_g: z.number().nonnegative(),
    carbs_g: z.number().nonnegative(),
    fiber_g: z.number().nonnegative(),
  }),
});

const historySchema = z.object({
  foods: z.array(foodSchema),
  total_nutrition: z.object({
    calories: z.number().nonnegative(),
    protein_g: z.number().nonnegative(),
    fat_g: z.number().nonnegative(),
    carbs_g: z.number().nonnegative(),
    fiber_g: z.number().nonnegative(),
  }),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  // Bypass auth for now, use guest user ID 1
  const userId = session?.user?.id || 1;

  try {
    const db = await getDb();
    const rows = await db.all(
      `SELECT id, foods, calories, protein_g, fat_g, carbs_g, fiber_g, logged_at 
       FROM nutrition_history 
       WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')
       ORDER BY logged_at DESC 
       LIMIT 100`,
      [userId],
    );

    // Parse JSON string back to object for foods
    const data = rows.map((row) => ({
      ...row,
      foods: typeof row.foods === "string" ? JSON.parse(row.foods) : row.foods,
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
    return NextResponse.json(
      { error: "Format data gizi tidak valid" },
      { status: 400 },
    );
  }

  const { data: nutrition } = parsed;

  try {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO nutrition_history 
       (user_id, foods, calories, protein_g, fat_g, carbs_g, fiber_g) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        JSON.stringify(nutrition.foods),
        nutrition.total_nutrition.calories,
        nutrition.total_nutrition.protein_g,
        nutrition.total_nutrition.fat_g,
        nutrition.total_nutrition.carbs_g,
        nutrition.total_nutrition.fiber_g,
      ],
    );

    const insertId = result.lastID;

    const row = await db.get(
      `SELECT id, foods, calories, protein_g, fat_g, carbs_g, fiber_g, logged_at 
       FROM nutrition_history 
       WHERE id = ?`,
      [insertId],
    );

    const data = {
      ...row,
      foods: typeof row.foods === "string" ? JSON.parse(row.foods) : row.foods,
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

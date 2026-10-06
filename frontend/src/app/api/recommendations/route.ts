import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getRecommendations } from "@/lib/ai/recommend";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || 1;

  try {
    const db = await getDb();

    // Get today's nutrition history
    const rows = await db.all(
      `SELECT calories, protein_g, fat_g, carbs_g, fiber_g 
       FROM nutrition_history 
       WHERE user_id = ? AND date(logged_at) = date('now', 'localtime')`,
      [userId],
    );

    // Calculate total consumed today
    const consumed = rows.reduce(
      (acc, row) => ({
        calories: acc.calories + (row.calories || 0),
        protein_g: acc.protein_g + (row.protein_g || 0),
        fat_g: acc.fat_g + (row.fat_g || 0),
        carbs_g: acc.carbs_g + (row.carbs_g || 0),
        fiber_g: acc.fiber_g + (row.fiber_g || 0),
      }),
      { calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 },
    );

    // Standard daily target (can be customized later based on user profile)
    const target = {
      calories: 2000,
      protein_g: 60,
      fat_g: 65,
      carbs_g: 300,
      fiber_g: 25,
    };

    // Get recommendations from AI
    const recommendations = await getRecommendations(target, consumed);

    return NextResponse.json({
      target,
      consumed,
      ...recommendations,
    });
  } catch (error) {
    console.error("[GET /api/recommendations] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mendapatkan rekomendasi",
      },
      { status: 500 },
    );
  }
}

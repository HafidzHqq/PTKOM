import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

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

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    
    const response = await fetch(`${backendUrl}/api/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        daily_calorie_target: target.calories,
        daily_protein_target: target.protein_g,
        daily_fat_target: target.fat_g,
        daily_carb_target: target.carbs_g,
        daily_fiber_target: target.fiber_g,
        current_calories: consumed.calories,
        current_protein_g: consumed.protein_g,
        current_fat_g: consumed.fat_g,
        current_carbs_g: consumed.carbs_g,
        current_fiber_g: consumed.fiber_g,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} ${errorText}`);
    }

    const result = await response.json();

    const mappedRecommendations = (result.data.recommendations || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => ({
        food_name: item.food?.name || item.food_name,
        estimated_price_idr: item.food?.avg_price_idr || item.estimated_price_idr,
        estimated_nutrition: {
          calories: item.food?.calories ?? item.estimated_nutrition?.calories ?? 0,
          protein_g: item.food?.protein_g ?? item.estimated_nutrition?.protein_g ?? 0,
          fat_g: item.food?.fat_g ?? item.estimated_nutrition?.fat_g ?? 0,
          carbs_g: item.food?.carbs_g ?? item.estimated_nutrition?.carbs_g ?? 0,
          fiber_g: item.food?.fiber_g ?? item.estimated_nutrition?.fiber_g ?? 0,
        },
        reason: item.reason,
      }),
    );

    return NextResponse.json({
      target,
      consumed,
      deficiency: {
        calories: Math.max(0, target.calories - consumed.calories),
        protein_g: Math.max(0, target.protein_g - consumed.protein_g),
        fat_g: Math.max(0, target.fat_g - consumed.fat_g),
        carbs_g: Math.max(0, target.carbs_g - consumed.carbs_g),
        fiber_g: Math.max(0, target.fiber_g - consumed.fiber_g),
      },
      recommendations: mappedRecommendations,
      advice:
        result.data.deficiencies?.join(". ") || "Tetap jaga pola makan sehat!",
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

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { LOCAL_FOODS } from "@/lib/data/localFoods";

export const dynamic = "force-dynamic";

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

    // WHO Guidelines (Average Adult)
    // Calories: ~2250 kcal
    // Protein: 15% of calories (84g)
    // Fat: 25% of calories (62g)
    // Carbs: 60% of calories (337g)
    // Fiber: 25g
    const target = {
      calories: 2250,
      protein_g: 84,
      fat_g: 62,
      carbs_g: 337,
      fiber_g: 25,
    };

    // Calculate deficiencies
    const deficiencies: string[] = [];
    const deficitMap: Record<string, number> = {};

    const calPct = target.calories ? (consumed.calories / target.calories) * 100 : 100;
    const proPct = target.protein_g ? (consumed.protein_g / target.protein_g) * 100 : 100;
    const fatPct = target.fat_g ? (consumed.fat_g / target.fat_g) * 100 : 100;
    const carbPct = target.carbs_g ? (consumed.carbs_g / target.carbs_g) * 100 : 100;
    const fiberPct = target.fiber_g ? (consumed.fiber_g / target.fiber_g) * 100 : 100;

    const threshold = 70;

    if (proPct < threshold) {
      deficiencies.push(`Protein rendah (${proPct.toFixed(0)}% standar WHO)`);
      deficitMap["protein_g"] = target.protein_g - consumed.protein_g;
    }
    if (fiberPct < threshold) {
      deficiencies.push(`Serat rendah (${fiberPct.toFixed(0)}% standar WHO)`);
      deficitMap["fiber_g"] = target.fiber_g - consumed.fiber_g;
    }
    if (calPct < threshold) {
      deficiencies.push(`Kalori rendah (${calPct.toFixed(0)}% standar WHO)`);
      deficitMap["calories"] = target.calories - consumed.calories;
    }
    if (carbPct < threshold) {
      deficiencies.push(`Karbohidrat rendah (${carbPct.toFixed(0)}% standar WHO)`);
      deficitMap["carbs_g"] = target.carbs_g - consumed.carbs_g;
    }
    if (fatPct > 100) {
      deficiencies.push(`Lemak berlebih (${fatPct.toFixed(0)}% standar WHO)`);
    } else if (fatPct < threshold) {
      deficiencies.push(`Lemak rendah (${fatPct.toFixed(0)}% standar WHO)`);
      deficitMap["fat_g"] = target.fat_g - consumed.fat_g;
    }

    // Smart Combo Recommendation Algorithm
    const recommendations: { food: (typeof LOCAL_FOODS)[number]; reason: string }[] = [];
    const maxBudget = 15000; // Max budget for recommendations

    // Helper to find best food by category and nutrient
    const findBestFood = (category: string, nutrient: string, minNutrient: number) => {
      const candidates = LOCAL_FOODS.filter(
        (f) => f.category === category && f.avg_price_idr <= maxBudget
      );
      
      // Sort by nutrient density per price
      candidates.sort((a, b) => {
        const scoreA = (a[nutrient as keyof typeof a] as number) / a.avg_price_idr;
        const scoreB = (b[nutrient as keyof typeof b] as number) / b.avg_price_idr;
        return scoreB - scoreA;
      });

      return candidates.find((f) => (f[nutrient as keyof typeof f] as number) >= minNutrient) || candidates[0];
    };

    if (deficitMap["protein_g"] && deficitMap["protein_g"] > 15) {
      const bestProtein = findBestFood("lauk", "protein_g", 10);
      if (bestProtein) {
        recommendations.push({
          food: bestProtein,
          reason: `Tinggi protein (${bestProtein.protein_g}g) untuk memenuhi target WHO. Harga terjangkau (Rp ${bestProtein.avg_price_idr.toLocaleString("id-ID")}).`,
        });
      }
    }

    if (deficitMap["fiber_g"] && deficitMap["fiber_g"] > 5) {
      const bestFiber = findBestFood("sayur", "fiber_g", 2);
      if (bestFiber) {
        recommendations.push({
          food: bestFiber,
          reason: `Sumber serat baik (${bestFiber.fiber_g}g) untuk pencernaan sesuai standar WHO.`,
        });
      }
    }

    if (deficitMap["calories"] && deficitMap["calories"] > 500) {
      const bestPaket = findBestFood("paket", "calories", 400);
      if (bestPaket) {
        recommendations.push({
          food: bestPaket,
          reason: `Paket kenyang untuk menambah asupan kalori harianmu yang masih kurang banyak.`,
        });
      }
    }

    // If no specific deficiencies or we need more recommendations, add healthy snacks/fruits
    if (recommendations.length < 3) {
      const bestFruit = findBestFood("buah", "fiber_g", 1);
      if (bestFruit && !recommendations.find(r => r.food.name === bestFruit.name)) {
        recommendations.push({
          food: bestFruit,
          reason: `Cemilan sehat kaya vitamin untuk melengkapi nutrisi harian.`,
        });
      }
    }

    if (deficiencies.length === 0) {
      deficiencies.push("Asupan gizi sudah sangat baik sesuai standar WHO! Pertahankan pola makanmu.");
    }

    const mappedRecommendations = recommendations.map((item) => ({
      food_name: item.food.name,
      estimated_price_idr: item.food.avg_price_idr,
      estimated_nutrition: {
        calories: item.food.calories,
        protein_g: item.food.protein_g,
        fat_g: item.food.fat_g,
        carbs_g: item.food.carbs_g,
        fiber_g: item.food.fiber_g,
      },
      reason: item.reason,
    }));

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
      advice: deficiencies.join(". "),
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

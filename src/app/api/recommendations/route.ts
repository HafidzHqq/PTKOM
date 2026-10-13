import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LOCAL_FOODS } from "@/lib/data/localFoods";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  let userId = Number(session?.user?.id);
  if (!userId || isNaN(userId) || userId <= 0 || userId > 2147483647) {
    if (session?.user?.email) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (dbUser) userId = dbUser.id;
      } catch (e) {
        console.error("[GET /api/recommendations] dbUser lookup error:", e);
      }
    }
  }

  if (!userId || isNaN(userId) || userId <= 0 || userId > 2147483647) {
    userId = 1;
  }

  try {
    // Get today's start and end date
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's nutrition history from MySQL
    let rows: { calories: number | null; proteinG: number | null; fatG: number | null; carbsG: number | null; fiberG: number | null }[] = [];
    try {
      rows = await prisma.nutritionHistory.findMany({
        where: {
          userId,
          loggedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: {
          calories: true,
          proteinG: true,
          fatG: true,
          carbsG: true,
          fiberG: true,
        },
      });
    } catch (e) {
      console.error("[GET /api/recommendations] error fetching rows:", e);
      rows = [];
    }

    // Calculate total consumed today
    const consumed = rows.reduce(
      (acc, row) => ({
        calories: acc.calories + (row.calories || 0),
        protein_g: acc.protein_g + (row.proteinG || 0),
        fat_g: acc.fat_g + (row.fatG || 0),
        carbs_g: acc.carbs_g + (row.carbsG || 0),
        fiber_g: acc.fiber_g + (row.fiberG || 0),
      }),
      { calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 },
    );

    // WHO Guidelines (Average Adult) as fallback
    let target = {
      calories: 2250,
      protein_g: 84,
      fat_g: 62,
      carbs_g: 337,
      fiber_g: 25,
    };

    // Use saved profile targets if available from MySQL
    try {
      const profile = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (profile?.dailyCalorieTarget) {
        target = {
          calories: profile.dailyCalorieTarget,
          protein_g: profile.dailyProteinTarget ?? target.protein_g,
          fat_g: profile.dailyFatTarget ?? target.fat_g,
          carbs_g: profile.dailyCarbTarget ?? target.carbs_g,
          fiber_g: profile.dailyFiberTarget ?? target.fiber_g,
        };
      }
    } catch (e) {
      console.error("[GET /api/recommendations] profile target fallback", e);
    }

    // Load local foods from MySQL with fallback to static dataset
    let localFoods: any[] = [];
    try {
      const localFoodsFromDb = await prisma.localFood.findMany();
      if (localFoodsFromDb && localFoodsFromDb.length > 0) {
        localFoods = localFoodsFromDb.map((f) => ({
          name: f.name,
          category: f.category,
          avg_price_idr: f.avgPriceIdr,
          calories: f.calories,
          protein_g: f.proteinG,
          fat_g: f.fatG,
          carbs_g: f.carbsG,
          fiber_g: f.fiberG,
          availability: f.availability,
          is_budget_friendly: f.isBudgetFriendly,
        }));
      }
    } catch (e) {
      console.error("[GET /api/recommendations] db localFood error:", e);
    }

    if (localFoods.length === 0) {
      localFoods = LOCAL_FOODS;
    }

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
      deficiencies.push(`Protein rendah (${proPct.toFixed(0)}% target harian)`);
      deficitMap["protein_g"] = target.protein_g - consumed.protein_g;
    }
    if (fiberPct < threshold) {
      deficiencies.push(`Serat rendah (${fiberPct.toFixed(0)}% target harian)`);
      deficitMap["fiber_g"] = target.fiber_g - consumed.fiber_g;
    }
    if (calPct < threshold) {
      deficiencies.push(`Kalori rendah (${calPct.toFixed(0)}% target harian)`);
      deficitMap["calories"] = target.calories - consumed.calories;
    }
    if (carbPct < threshold) {
      deficiencies.push(`Karbohidrat rendah (${carbPct.toFixed(0)}% target harian)`);
      deficitMap["carbs_g"] = target.carbs_g - consumed.carbs_g;
    }
    if (fatPct > 100) {
      deficiencies.push(`Lemak berlebih (${fatPct.toFixed(0)}% target harian)`);
    } else if (fatPct < threshold) {
      deficiencies.push(`Lemak rendah (${fatPct.toFixed(0)}% target harian)`);
      deficitMap["fat_g"] = target.fat_g - consumed.fat_g;
    }

    // Smart Combo Recommendation Algorithm
    const recommendations: { food: (typeof localFoods)[number]; reason: string }[] = [];
    const maxBudget = 15000; // Max budget for recommendations

    // Helper to find best food by category and nutrient
    const findBestFood = (category: string, nutrient: string, minNutrient: number) => {
      const candidates = localFoods.filter(
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
          reason: `Tinggi protein (${bestProtein.protein_g}g) untuk memenuhi target harian. Harga terjangkau (Rp ${bestProtein.avg_price_idr.toLocaleString("id-ID")}).`,
        });
      }
    }

    if (deficitMap["fiber_g"] && deficitMap["fiber_g"] > 5) {
      const bestFiber = findBestFood("sayur", "fiber_g", 2);
      if (bestFiber) {
        recommendations.push({
          food: bestFiber,
          reason: `Sumber serat baik (${bestFiber.fiber_g}g) untuk pencernaan sesuai standar gizi harian.`,
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
      deficiencies.push("Asupan gizi sudah sangat baik sesuai target harian! Pertahankan pola makanmu.");
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
    // Graceful fallback rekomendasi agar halaman rekomendasi tetap aktif dan berfungsi
    const defaultTarget = { calories: 2250, protein_g: 84, fat_g: 62, carbs_g: 337, fiber_g: 25 };
    const defaultConsumed = { calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 };
    return NextResponse.json({
      target: defaultTarget,
      consumed: defaultConsumed,
      deficiency: defaultTarget,
      recommendations: [
        {
          food_name: "Tahu & Tempe Bacem",
          estimated_price_idr: 4000,
          estimated_nutrition: { calories: 180, protein_g: 12, fat_g: 6, carbs_g: 18, fiber_g: 3 },
          reason: "Tinggi protein nabati hemat untuk memenuhi kebutuhan harian.",
        },
        {
          food_name: "Tumis Kangkung",
          estimated_price_idr: 5000,
          estimated_nutrition: { calories: 85, protein_g: 3, fat_g: 4, carbs_g: 8, fiber_g: 3 },
          reason: "Sumber serat dan mikronutrien seimbang.",
        },
        {
          food_name: "Telur Dadar Warteg",
          estimated_price_idr: 5000,
          estimated_nutrition: { calories: 155, protein_g: 9, fat_g: 12, carbs_g: 2, fiber_g: 0 },
          reason: "Protein hewani terjangkau ramah kantong anak kost.",
        },
      ],
      advice: "Mulai catat makananmu hari ini untuk mendapatkan rekomendasi gizi yang lebih presisi.",
    });
  }
}

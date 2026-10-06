export interface RecommendationResult {
  deficiency: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  recommendations: {
    food_name: string;
    estimated_price_idr: number;
    estimated_nutrition: {
      calories: number;
      protein_g: number;
      fat_g: number;
      carbs_g: number;
      fiber_g: number;
    };
    reason: string;
  }[];
  advice: string;
  metadata?: {
    provider: string;
    model: string;
  };
}

const FOOD_DATABASE = [
  { name: "Pecel Lele + Nasi", price: 15000, nutrition: { calories: 450, protein_g: 25, fat_g: 20, carbs_g: 40, fiber_g: 3 } },
  { name: "Gado-Gado", price: 12000, nutrition: { calories: 300, protein_g: 12, fat_g: 15, carbs_g: 35, fiber_g: 8 } },
  { name: "Dada Ayam Bakar + Nasi", price: 18000, nutrition: { calories: 350, protein_g: 30, fat_g: 8, carbs_g: 40, fiber_g: 2 } },
  { name: "Soto Ayam + Nasi", price: 15000, nutrition: { calories: 400, protein_g: 20, fat_g: 12, carbs_g: 50, fiber_g: 2 } },
  { name: "Nasi Padang (Rendang)", price: 20000, nutrition: { calories: 600, protein_g: 25, fat_g: 30, carbs_g: 60, fiber_g: 4 } },
  { name: "Nasi Padang (Ayam Pop)", price: 18000, nutrition: { calories: 500, protein_g: 22, fat_g: 20, carbs_g: 55, fiber_g: 3 } },
  { name: "Ketoprak", price: 13000, nutrition: { calories: 450, protein_g: 15, fat_g: 20, carbs_g: 55, fiber_g: 6 } },
  { name: "Sate Ayam (10 tusuk) + Lontong", price: 20000, nutrition: { calories: 500, protein_g: 28, fat_g: 22, carbs_g: 45, fiber_g: 3 } },
  { name: "Sayur Sop + Tempe Goreng", price: 10000, nutrition: { calories: 250, protein_g: 12, fat_g: 10, carbs_g: 25, fiber_g: 5 } },
  { name: "Telur Rebus (2 butir)", price: 6000, nutrition: { calories: 140, protein_g: 12, fat_g: 10, carbs_g: 1, fiber_g: 0 } },
  { name: "Buah Pisang (2 buah)", price: 5000, nutrition: { calories: 180, protein_g: 2, fat_g: 0, carbs_g: 46, fiber_g: 6 } },
  { name: "Tahu & Tempe Bacem", price: 5000, nutrition: { calories: 180, protein_g: 12, fat_g: 6, carbs_g: 18, fiber_g: 3 } },
  { name: "Nasi Goreng Telur", price: 13000, nutrition: { calories: 500, protein_g: 12, fat_g: 20, carbs_g: 65, fiber_g: 2 } },
  { name: "Mie Ayam", price: 12000, nutrition: { calories: 400, protein_g: 15, fat_g: 15, carbs_g: 50, fiber_g: 3 } },
  { name: "Bubur Ayam", price: 10000, nutrition: { calories: 300, protein_g: 12, fat_g: 8, carbs_g: 45, fiber_g: 2 } },
  { name: "Omelet Sayur", price: 8000, nutrition: { calories: 200, protein_g: 14, fat_g: 12, carbs_g: 5, fiber_g: 3 } },
  { name: "Tumis Kangkung + Nasi", price: 10000, nutrition: { calories: 250, protein_g: 6, fat_g: 5, carbs_g: 45, fiber_g: 6 } },
  { name: "Ikan Nila Bakar + Nasi", price: 22000, nutrition: { calories: 400, protein_g: 35, fat_g: 10, carbs_g: 40, fiber_g: 2 } },
];

export async function getRecommendations(
  target: Record<string, number>,
  consumed: Record<string, number>
): Promise<RecommendationResult> {
  const deficiency = {
    calories: Math.max(0, (target.calories || 2000) - (consumed.calories || 0)),
    protein_g: Math.max(0, (target.protein_g || 60) - (consumed.protein_g || 0)),
    fat_g: Math.max(0, (target.fat_g || 65) - (consumed.fat_g || 0)),
    carbs_g: Math.max(0, (target.carbs_g || 300) - (consumed.carbs_g || 0)),
    fiber_g: Math.max(0, (target.fiber_g || 25) - (consumed.fiber_g || 0)),
  };

  // Score each food based on how well it fills the deficiency without exceeding it too much
  const scoredFoods = FOOD_DATABASE.map(food => {
    let score = 0;
    let reason = "";

    // Protein is usually the most important to hit
    if (deficiency.protein_g > 10 && food.nutrition.protein_g >= 15) {
      score += 30;
      reason = "Tinggi protein untuk membantu memenuhi target harian Anda.";
    } else if (deficiency.protein_g > 5 && food.nutrition.protein_g >= 10) {
      score += 15;
      reason = "Sumber protein yang baik.";
    }

    // Fiber is also important
    if (deficiency.fiber_g > 5 && food.nutrition.fiber_g >= 5) {
      score += 25;
      reason = "Kaya serat untuk pencernaan dan memenuhi target serat Anda.";
    }

    // Penalize if it exceeds remaining calories significantly
    if (food.nutrition.calories > deficiency.calories + 200) {
      score -= 50; // Too many calories
    } else if (food.nutrition.calories <= deficiency.calories) {
      score += 10; // Fits well within calorie budget
      if (!reason) reason = "Kalori pas untuk sisa kebutuhan energi Anda hari ini.";
    }

    // Penalize if it exceeds remaining fat significantly
    if (food.nutrition.fat_g > deficiency.fat_g + 10) {
      score -= 20;
    }

    // Default reason if none matched
    if (!reason) {
      reason = "Pilihan seimbang untuk melengkapi nutrisi harian Anda.";
    }

    // Add some randomness to avoid always recommending the exact same things
    score += Math.random() * 10;

    return { ...food, score, reason };
  });

  // Sort by score descending
  scoredFoods.sort((a, b) => b.score - a.score);

  // Take top 3
  const top3 = scoredFoods.slice(0, 3).map(food => ({
    food_name: food.name,
    estimated_price_idr: food.price,
    estimated_nutrition: food.nutrition,
    reason: food.reason
  }));

  let advice = "Kebutuhan gizi Anda hampir terpenuhi! Tetap jaga asupan air putih dan istirahat yang cukup.";
  if (deficiency.protein_g > 20) {
    advice = "Anda masih kekurangan cukup banyak protein hari ini. Prioritaskan lauk pauk seperti ayam, ikan, telur, atau tempe/tahu.";
  } else if (deficiency.fiber_g > 10) {
    advice = "Asupan serat Anda masih kurang. Jangan lupa tambahkan sayur-sayuran atau buah-buahan pada menu makan Anda.";
  } else if (deficiency.calories > 800) {
    advice = "Anda masih membutuhkan banyak kalori hari ini. Pastikan Anda tidak melewatkan waktu makan utama.";
  }

  return {
    deficiency,
    recommendations: top3,
    advice,
    metadata: {
      provider: "Local Algorithm",
      model: "gizi-local-v2"
    }
  };
}

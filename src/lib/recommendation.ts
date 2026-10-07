import { prisma } from './prisma';
import { RecommendationInput } from './validators';

// Estimasi biaya gas/listrik per masak (Bandar Lampung)
const GAS_COST_PER_COOK = 2000;

export async function calculateCookCost(foodId: string) {
  const food = await prisma.food.findUnique({
    where: { id: foodId },
    include: {
      recipeItems: {
        include: { ingredient: true }
      }
    }
  });

  if (!food) throw new Error('Food not found');
  if (food.type === 'BELI') throw new Error('Food is not cookable');

  let totalCost = 0;
  const breakdown = [];

  for (const item of food.recipeItems) {
    const cost = item.quantity * item.ingredient.pricePerUnit;
    totalCost += cost;
    breakdown.push({
      ingredient: item.ingredient.name,
      quantity: item.quantity,
      unit: item.unit,
      pricePerUnit: item.ingredient.pricePerUnit,
      cost
    });
  }

  // Tambah biaya gas
  totalCost += GAS_COST_PER_COOK;
  breakdown.push({
    ingredient: 'Gas/Listrik (estimasi)',
    quantity: 1,
    unit: 'paket masak',
    pricePerUnit: GAS_COST_PER_COOK,
    cost: GAS_COST_PER_COOK
  });

  const portions = food.portionsYielded || 1;
  const costPerPortion = totalCost / portions;

  return {
    foodId: food.id,
    foodName: food.name,
    totalCost,
    portions,
    costPerPortion,
    breakdown
  };
}

export async function getRecommendations(input: RecommendationInput) {
  const { budget, period, meals_per_day, mode, filters } = input;

  // 1. Hitung budget harian
  const dailyBudget = period === 'monthly' ? budget / 30 : budget;
  const budgetPerMeal = dailyBudget / meals_per_day;

  // 2. Build where clause
  const where: any = {};
  
  if (mode === 'beli') {
    where.type = 'BELI';
  } else if (mode === 'masak') {
    where.type = 'MASAK';
  }
  // if 'both', no type filter

  if (filters?.halal) {
    where.isHalal = true;
  }
  if (filters?.vegetarian) {
    where.isVegetarian = true;
  }

  // 3. Fetch all candidate foods
  let candidates = await prisma.food.findMany({
    where,
    include: {
      recipeItems: { include: { ingredient: true } },
      places: { include: { place: true } }
    }
  });

  // 4. Filter allergens (manual karena Json)
  if (filters?.allergens && filters.allergens.length > 0) {
    candidates = candidates.filter(food => {
      const foodAllergens = (food.allergens as string[]) || [];
      return !filters.allergens!.some(a => foodAllergens.includes(a));
    });
  }

  // 5. Hitung harga per porsi untuk setiap kandidat
  const candidatesWithPrice = await Promise.all(
    candidates.map(async (food) => {
      let price = food.pricePerPortion || 0;
      
      if (food.type === 'MASAK') {
        try {
          const cookCalc = await calculateCookCost(food.id);
          price = cookCalc.costPerPortion;
        } catch {
          price = 999999; // Skip jika gagal hitung
        }
      }

      return { ...food, calculatedPrice: price };
    })
  );

  // 6. Filter yang muat di budget per meal (dengan toleransi 20% untuk fleksibilitas)
  const affordable = candidatesWithPrice
    .filter(f => f.calculatedPrice <= budgetPerMeal * 1.2)
    .sort((a, b) => {
      // Prioritaskan: murah + protein tinggi (skor gizi per rupiah)
      const scoreA = (a.protein / a.calculatedPrice) * 1000;
      const scoreB = (b.protein / b.calculatedPrice) * 1000;
      return scoreB - scoreA;
    });

  // 7. Jika budget terlalu kecil
  if (affordable.length === 0) {
    const cheapest = [...candidatesWithPrice].sort((a, b) => a.calculatedPrice - b.calculatedPrice).slice(0, 5);
    return {
      success: false,
      message: `Budget Rp ${budgetPerMeal.toLocaleString('id-ID')} per makan terlalu kecil. Berikut alternatif termurah:`,
      dailyBudget,
      budgetPerMeal,
      cheapest,
      recommendations: [],
      totalCost: 0,
      remaining: dailyBudget,
    };
  }

  // 8. Buat rencana makan (variasi, tidak berulang)
  const plan = [];
  const usedIds = new Set<string>();
  let totalCost = 0;

  // Kategorikan berdasarkan waktu makan
  const breakfast = affordable.filter(f => f.category === 'SARAPAN');
  const lunch = affordable.filter(f => f.category === 'MAKAN_SIANG');
  const dinner = affordable.filter(f => f.category === 'MAKAN_MALAM');
  const snacks = affordable.filter(f => f.category === 'CAMILAN' || f.category === 'MINUMAN');

  const pickFood = (pool: typeof affordable, fallbackPool: typeof affordable) => {
    // Cari yang belum dipakai
    let pick = pool.find(f => !usedIds.has(f.id));
    if (!pick) pick = fallbackPool.find(f => !usedIds.has(f.id));
    if (!pick) pick = fallbackPool[0]; // Terpaksa ulang jika semua sudah dipakai
    if (pick) usedIds.add(pick.id);
    return pick;
  };

  if (meals_per_day >= 1) {
    const b = pickFood(breakfast, affordable);
    if (b) { plan.push({ meal: 'Sarapan', ...b }); totalCost += b.calculatedPrice; }
  }
  if (meals_per_day >= 2) {
    const l = pickFood(lunch, affordable);
    if (l) { plan.push({ meal: 'Makan Siang', ...l }); totalCost += l.calculatedPrice; }
  }
  if (meals_per_day >= 3) {
    const d = pickFood(dinner, affordable);
    if (d) { plan.push({ meal: 'Makan Malam', ...d }); totalCost += d.calculatedPrice; }
  }
  // Tambahan camilan jika meals_per_day > 3
  for (let i = 3; i < meals_per_day; i++) {
    const s = pickFood(snacks, affordable);
    if (s) { plan.push({ meal: `Camilan ${i - 2}`, ...s }); totalCost += s.calculatedPrice; }
  }

  // 9. Hitung rencana bulanan jika period monthly
  let monthlyPlan = null;
  if (period === 'monthly') {
    // Buat variasi 7 hari (rotasi menu)
    const weeklyPlan = [];
    for (let day = 1; day <= 7; day++) {
      const dayPlan = [];
      let dayCost = 0;
      // Rotasi dengan offset agar tidak sama setiap hari
      const offset = (day - 1) * meals_per_day;
      for (let m = 0; m < meals_per_day; m++) {
        const idx = (offset + m) % affordable.length;
        const food = affordable[idx];
        dayPlan.push({ meal: `Makan ${m + 1}`, ...food });
        dayCost += food.calculatedPrice;
      }
      weeklyPlan.push({ day, menus: dayPlan, totalCost: dayCost });
    }
    monthlyPlan = {
      weeklyPlan,
      estimatedMonthlyCost: totalCost * 30,
      note: 'Menu dirotasi setiap 7 hari agar tidak bosan. Estimasi bulanan = biaya harian x 30.'
    };
  }

  return {
    success: true,
    dailyBudget,
    budgetPerMeal,
    recommendations: plan,
    totalCost,
    remaining: dailyBudget - totalCost,
    savingsVsEatingOut: null, // Bisa dihitung jika ada data pembanding
    monthlyPlan,
  };
}

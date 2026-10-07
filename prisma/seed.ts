import { PrismaClient, FoodType, FoodCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Mulai seeding data untuk Bandar Lampung...');

  // 1. Seed Ingredients (Bahan Baku - Harga Bandar Lampung)
  const ingredientsData = [
    { name: 'Beras', unit: 'kg', pricePerUnit: 14000, region: 'Bandar Lampung' },
    { name: 'Telur Ayam', unit: 'kg', pricePerUnit: 28000, region: 'Bandar Lampung' },
    { name: 'Daging Ayam', unit: 'kg', pricePerUnit: 35000, region: 'Bandar Lampung' },
    { name: 'Tempe', unit: 'papan', pricePerUnit: 5000, region: 'Bandar Lampung' },
    { name: 'Tahu', unit: 'bungkus', pricePerUnit: 4000, region: 'Bandar Lampung' },
    { name: 'Bawang Merah', unit: 'kg', pricePerUnit: 30000, region: 'Bandar Lampung' },
    { name: 'Bawang Putih', unit: 'kg', pricePerUnit: 35000, region: 'Bandar Lampung' },
    { name: 'Cabai Merah', unit: 'kg', pricePerUnit: 45000, region: 'Bandar Lampung' },
    { name: 'Minyak Goreng', unit: 'liter', pricePerUnit: 16000, region: 'Bandar Lampung' },
    { name: 'Garam', unit: 'bungkus', pricePerUnit: 2000, region: 'Bandar Lampung' },
    { name: 'Kangkung', unit: 'ikat', pricePerUnit: 2500, region: 'Bandar Lampung' },
    { name: 'Bayam', unit: 'ikat', pricePerUnit: 2500, region: 'Bandar Lampung' },
    { name: 'Mie Instan', unit: 'bungkus', pricePerUnit: 3000, region: 'Bandar Lampung' },
    { name: 'Sawi Hijau', unit: 'ikat', pricePerUnit: 3000, region: 'Bandar Lampung' },
    { name: 'Tomat', unit: 'kg', pricePerUnit: 12000, region: 'Bandar Lampung' },
    { name: 'Kecap Manis', unit: 'botol', pricePerUnit: 10000, region: 'Bandar Lampung' },
    { name: 'Ikan Lele', unit: 'kg', pricePerUnit: 25000, region: 'Bandar Lampung' },
    { name: 'Ikan Nila', unit: 'kg', pricePerUnit: 30000, region: 'Bandar Lampung' },
    { name: 'Kacang Panjang', unit: 'ikat', pricePerUnit: 3000, region: 'Bandar Lampung' },
    { name: 'Wortel', unit: 'kg', pricePerUnit: 15000, region: 'Bandar Lampung' },
  ];

  const createdIngredients = [];
  for (const ing of ingredientsData) {
    const created = await prisma.ingredient.create({ data: ing });
    createdIngredients.push(created);
  }
  console.log(`✅ Berhasil insert ${createdIngredients.length} bahan baku.`);

  // Helper function to find ingredient ID
  const getIngId = (name: string) => createdIngredients.find(i => i.name === name)?.id || '';

  // 2. Seed Places (Tempat Makan di Bandar Lampung)
  const placesData = [
    { name: 'Warteg Bahari Pramuka', priceRange: 'Rp 10.000 - Rp 20.000', location: 'Jl. Pramuka, Rajabasa', source: 'warteg' },
    { name: 'Kantin Unila', priceRange: 'Rp 8.000 - Rp 15.000', location: 'Kampus Unila', source: 'kantin' },
    { name: 'Ayam Geprek Bensu Kedaton', priceRange: 'Rp 15.000 - Rp 25.000', location: 'Kedaton', source: 'restoran' },
    { name: 'Nasi Uduk Toha', priceRange: 'Rp 12.000 - Rp 25.000', location: 'Jl. Kartini', source: 'kaki lima' },
    { name: 'Pecel Lele Mas Budi', priceRange: 'Rp 12.000 - Rp 20.000', location: 'Way Halim', source: 'kaki lima' },
  ];

  const createdPlaces = [];
  for (const place of placesData) {
    const created = await prisma.place.create({ data: place });
    createdPlaces.push(created);
  }
  console.log(`✅ Berhasil insert ${createdPlaces.length} tempat makan.`);

  // 3. Seed Foods (Makanan Beli & Masak)
  const foodsData = [
    // --- MAKANAN BELI JADI ---
    {
      name: 'Nasi Telur Dadar Warteg',
      category: FoodCategory.MAKAN_SIANG,
      type: FoodType.BELI,
      pricePerPortion: 10000,
      calories: 450,
      protein: 12,
      carbs: 50,
      fat: 20,
      isHalal: true,
      isVegetarian: false,
      allergens: ['telur'],
      tags: ['murah', 'warteg', 'nasi'],
      places: [createdPlaces[0].id, createdPlaces[1].id]
    },
    {
      name: 'Ayam Geprek Nasi',
      category: FoodCategory.MAKAN_MALAM,
      type: FoodType.BELI,
      pricePerPortion: 15000,
      calories: 650,
      protein: 25,
      carbs: 60,
      fat: 30,
      isHalal: true,
      isVegetarian: false,
      allergens: ['gluten'],
      tags: ['pedas', 'ayam', 'populer'],
      places: [createdPlaces[2].id]
    },
    {
      name: 'Nasi Uduk Telur Bulat',
      category: FoodCategory.SARAPAN,
      type: FoodType.BELI,
      pricePerPortion: 12000,
      calories: 500,
      protein: 10,
      carbs: 55,
      fat: 22,
      isHalal: true,
      isVegetarian: false,
      allergens: ['telur', 'kacang'],
      tags: ['sarapan', 'nasi uduk', 'khas'],
      places: [createdPlaces[3].id]
    },
    {
      name: 'Pecel Lele + Nasi',
      category: FoodCategory.MAKAN_MALAM,
      type: FoodType.BELI,
      pricePerPortion: 16000,
      calories: 550,
      protein: 22,
      carbs: 50,
      fat: 25,
      isHalal: true,
      isVegetarian: false,
      allergens: ['ikan'],
      tags: ['malam', 'lele', 'kaki lima'],
      places: [createdPlaces[4].id]
    },

    // --- MAKANAN MASAK SENDIRI ---
    {
      name: 'Tumis Kangkung Tempe',
      category: FoodCategory.MAKAN_SIANG,
      type: FoodType.MASAK,
      portionsYielded: 2,
      calories: 250,
      protein: 15,
      carbs: 20,
      fat: 12,
      isHalal: true,
      isVegetarian: true,
      allergens: ['kedelai'],
      tags: ['sehat', 'sayur', 'murah'],
      cookTimeMinutes: 15,
      recipe: [
        { ingredientId: getIngId('Kangkung'), quantity: 1, unit: 'ikat' },
        { ingredientId: getIngId('Tempe'), quantity: 0.5, unit: 'papan' },
        { ingredientId: getIngId('Bawang Merah'), quantity: 0.02, unit: 'kg' },
        { ingredientId: getIngId('Bawang Putih'), quantity: 0.01, unit: 'kg' },
        { ingredientId: getIngId('Minyak Goreng'), quantity: 0.02, unit: 'liter' },
      ]
    },
    {
      name: 'Mie Instan Telur Sawi',
      category: FoodCategory.MAKAN_MALAM,
      type: FoodType.MASAK,
      portionsYielded: 1,
      calories: 480,
      protein: 14,
      carbs: 60,
      fat: 18,
      isHalal: true,
      isVegetarian: false,
      allergens: ['telur', 'gluten'],
      tags: ['cepat', 'mie', 'akhir bulan'],
      cookTimeMinutes: 10,
      recipe: [
        { ingredientId: getIngId('Mie Instan'), quantity: 1, unit: 'bungkus' },
        { ingredientId: getIngId('Telur Ayam'), quantity: 0.06, unit: 'kg' }, // ~1 butir
        { ingredientId: getIngId('Sawi Hijau'), quantity: 0.2, unit: 'ikat' },
      ]
    },
    {
      name: 'Ayam Goreng Bumbu Kuning',
      category: FoodCategory.MAKAN_SIANG,
      type: FoodType.MASAK,
      portionsYielded: 4,
      calories: 350,
      protein: 25,
      carbs: 5,
      fat: 22,
      isHalal: true,
      isVegetarian: false,
      allergens: [],
      tags: ['ayam', 'lauk', 'protein tinggi'],
      cookTimeMinutes: 45,
      recipe: [
        { ingredientId: getIngId('Daging Ayam'), quantity: 0.5, unit: 'kg' },
        { ingredientId: getIngId('Minyak Goreng'), quantity: 0.1, unit: 'liter' },
        { ingredientId: getIngId('Bawang Putih'), quantity: 0.02, unit: 'kg' },
      ]
    }
  ];

  // Generate more dummy data to reach ~150 items
  // We will programmatically generate variations of basic meals
  const baseMeals = [
    { name: 'Nasi Goreng', baseCal: 500, baseProt: 10, baseCarb: 60, baseFat: 20 },
    { name: 'Mie Goreng', baseCal: 450, baseProt: 8, baseCarb: 55, baseFat: 18 },
    { name: 'Soto Ayam', baseCal: 300, baseProt: 15, baseCarb: 20, baseFat: 10 },
    { name: 'Bakso', baseCal: 400, baseProt: 12, baseCarb: 30, baseFat: 15 },
    { name: 'Sate Ayam', baseCal: 350, baseProt: 20, baseCarb: 15, baseFat: 18 },
    { name: 'Gado-Gado', baseCal: 350, baseProt: 12, baseCarb: 40, baseFat: 15 },
    { name: 'Ketoprak', baseCal: 450, baseProt: 10, baseCarb: 50, baseFat: 20 },
    { name: 'Nasi Padang', baseCal: 700, baseProt: 25, baseCarb: 70, baseFat: 30 },
    { name: 'Ayam Bakar', baseCal: 400, baseProt: 25, baseCarb: 10, baseFat: 15 },
    { name: 'Ikan Bakar', baseCal: 350, baseProt: 22, baseCarb: 5, baseFat: 12 },
  ];

  const variants = ['Biasa', 'Spesial', 'Jumbo', 'Pedas', 'Seafood', 'Sapi', 'Ayam', 'Telur'];
  const categories = [FoodCategory.SARAPAN, FoodCategory.MAKAN_SIANG, FoodCategory.MAKAN_MALAM];

  let generatedCount = 0;
  for (const base of baseMeals) {
    for (const variant of variants) {
      if (generatedCount >= 143) break; // To reach exactly 150 total (7 manual + 143 generated)
      
      const isMasak = Math.random() > 0.6;
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const food = {
        name: `${base.name} ${variant}`,
        category: category,
        type: isMasak ? FoodType.MASAK : FoodType.BELI,
        pricePerPortion: isMasak ? null : Math.floor(Math.random() * 15000) + 10000,
        portionsYielded: isMasak ? Math.floor(Math.random() * 3) + 1 : null,
        calories: base.baseCal + (Math.random() * 100 - 50),
        protein: base.baseProt + (Math.random() * 10 - 5),
        carbs: base.baseCarb + (Math.random() * 20 - 10),
        fat: base.baseFat + (Math.random() * 10 - 5),
        isHalal: true,
        isVegetarian: variant === 'Biasa' && (base.name === 'Gado-Gado' || base.name === 'Ketoprak'),
        allergens: variant === 'Seafood' ? ['seafood'] : (variant === 'Telur' ? ['telur'] : []),
        tags: ['generated', variant.toLowerCase()],
        cookTimeMinutes: isMasak ? Math.floor(Math.random() * 30) + 15 : null,
        recipe: isMasak ? [
          { ingredientId: getIngId('Beras'), quantity: 0.1, unit: 'kg' },
          { ingredientId: getIngId('Bawang Merah'), quantity: 0.01, unit: 'kg' },
        ] : [],
        places: isMasak ? [] : [createdPlaces[Math.floor(Math.random() * createdPlaces.length)].id]
      };
      
      foodsData.push(food);
      generatedCount++;
    }
  }

  let successCount = 0;
  for (const food of foodsData) {
    const { recipe, places, ...foodData } = food;
    
    const createdFood = await prisma.food.create({
      data: {
        ...foodData,
        recipeItems: recipe && recipe.length > 0 ? {
          create: recipe.map(r => ({
            ingredientId: r.ingredientId,
            quantity: r.quantity,
            unit: r.unit
          }))
        } : undefined,
        places: places && places.length > 0 ? {
          create: places.map(placeId => ({
            placeId: placeId
          }))
        } : undefined
      }
    });
    successCount++;
  }

  console.log(`✅ Berhasil insert ${successCount} menu makanan (Beli & Masak).`);
  console.log('🎉 Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
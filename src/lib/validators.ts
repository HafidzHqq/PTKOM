import { z } from 'zod';

export const flavorTagSchema = z.enum([
  'pedas-gurih',
  'berkuah-segar',
  'gurih-renyah',
  'wangi-rempah',
  'manis-legit',
  'asam-segar',
]);
export type FlavorTag = z.infer<typeof flavorTagSchema>;

export const foodItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum([
    'karbo',
    'lauk-hewani',
    'lauk-nabati',
    'sayur',
    'pelengkap',
    'minuman',
    'paket',
  ]),
  venue: z.enum(['warteg', 'warmindo', 'angkringan', 'kantin', 'rice-cooker']),
  flavorTags: z.array(flavorTagSchema).max(3),
  portion: z.object({
    label: z.string(),
    grams: z.number().nonnegative(),
  }),
  priceRange: z.object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
    unit: z.literal('IDR'),
  }),
  nutrition: z.object({
    kcal: z.number().nonnegative(),
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fat: z.number().nonnegative(),
    fiber: z.number().nonnegative().optional(),
  }),
  image: z
    .object({
      src: z.string(),
      alt: z.string(),
      credit: z.string(),
      license: z.string(),
    })
    .optional(),
  pairWith: z.array(z.string()).optional(),
  source: z.enum(['manual', 'tkpi', 'ai-estimate']).default('tkpi'),
  updatedAt: z.string().default('2025-01-01'),
  // Backward compatibility fields
  avg_price_idr: z.number().default(0),
  calories: z.number().default(0),
  protein_g: z.number().default(0),
  fat_g: z.number().default(0),
  carbs_g: z.number().default(0),
  fiber_g: z.number().default(0),
  availability: z.string().default('warteg'),
  is_budget_friendly: z.boolean().default(true),
});
export type FoodItem = z.infer<typeof foodItemSchema>;

// AI Food Reviewer Analysis Result Schema (FinalPlan v2 §3.1)
export const aiFoodAnalysisSchema = z.object({
  foods: z.array(
    z.object({
      name: z.string(),
      confidence: z.number().min(0).max(1).optional().default(0.8),
      portion_estimate: z.string().optional().default('1 porsi standar'),
      nutrition: z.object({
        kcal: z.number().nonnegative(),
        protein: z.number().nonnegative(),
        carbs: z.number().nonnegative(),
        fat: z.number().nonnegative(),
        fiber: z.number().nonnegative().optional().default(0),
      }),
      price_estimate: z.object({
        min: z.number().nonnegative(),
        max: z.number().nonnegative(),
      }),
    })
  ),
  culinary_review: z.string().max(350),
  culinary_tips: z.array(z.string()).max(3),
  flavor_tags: z.array(z.string()).max(3),
  disclaimer_key: z.string().optional().default('estimate'),
});
export type AiFoodAnalysis = z.infer<typeof aiFoodAnalysisSchema>;

export const recommendationSchema = z.object({
  budget: z.number().min(5000, 'Budget minimal Rp 5.000'),
  period: z.enum(['daily', 'monthly']),
  meals_per_day: z.number().min(1).max(5).default(3),
  mode: z.enum(['beli', 'masak', 'both']).default('both'),
  filters: z.object({
    halal: z.boolean().optional(),
    vegetarian: z.boolean().optional(),
    allergens: z.array(z.string()).optional(),
  }).optional(),
});

export type RecommendationInput = z.infer<typeof recommendationSchema>;

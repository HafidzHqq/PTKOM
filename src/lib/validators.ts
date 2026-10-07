import { z } from 'zod';

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

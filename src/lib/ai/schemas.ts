import { z } from 'zod';

export const mealTypeSchema = z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']);

export const nutritionSchema = z.object({
  calories: z.number().min(0).max(5000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(500),
  fats: z.number().min(0).max(500),
  fiber: z.number().min(0).max(200),
  sodium: z.number().min(0).max(20000).optional(),
});

export const analyzedIngredientSchema = z.object({
  name: z.string().min(1).max(120),
  grams: z.number().min(0).max(3000),
  cookingMethod: z.string().max(120).nullable().optional(),
  confidence: z.number().min(0).max(1),
  nutrition: nutritionSchema,
  sourceRef: z.string().max(120).nullable().optional(),
});

export const structuredMealSchema = z.object({
  ingredients: z.array(analyzedIngredientSchema).min(1).max(25),
  cookingMethod: z.string().max(120).nullable().optional(),
  mealTypeGuess: mealTypeSchema,
  clarifyingQuestions: z.array(z.string().max(300)).max(4),
  notes: z.string().max(500).nullable().optional(),
});

export const dietTargetsSchema = z.object({
  calories: z.number().min(0).max(10000),
  protein_g: z.number().min(0).max(600),
  carbs_g: z.number().min(0).max(1000),
  fats_g: z.number().min(0).max(400),
  fiber_g: z.number().min(0).max(200),
});

export const dietPlanSchema = z.object({
  dailyTargets: dietTargetsSchema,
  mealTargets: z
    .object({
      breakfast: dietTargetsSchema.partial().optional(),
      lunch: dietTargetsSchema.partial().optional(),
      dinner: dietTargetsSchema.partial().optional(),
      snack: dietTargetsSchema.partial().optional(),
    })
    .nullable()
    .optional(),
  rules: z.array(z.string().max(300)).max(40).default([]),
  forbidden: z.array(z.string().max(120)).max(60).default([]),
  encouraged: z.array(z.string().max(120)).max(60).default([]),
  notes: z.string().max(1000).nullable().optional(),
});

export type StructuredMealOut = z.infer<typeof structuredMealSchema>;
export type DietPlanOut = z.infer<typeof dietPlanSchema>;

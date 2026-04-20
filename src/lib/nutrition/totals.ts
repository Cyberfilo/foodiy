import type { Nutrition } from '@/types';

export interface IngredientLike {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium?: number;
}

export function sumIngredients(list: IngredientLike[]): Nutrition & { sodium: number } {
  return list.reduce(
    (acc, i) => ({
      calories: acc.calories + (i.calories || 0),
      protein: acc.protein + (i.protein || 0),
      carbs: acc.carbs + (i.carbs || 0),
      fats: acc.fats + (i.fats || 0),
      fiber: acc.fiber + (i.fiber || 0),
      sodium: acc.sodium + (i.sodium || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sodium: 0 }
  );
}

export function roundTotals<T extends IngredientLike>(t: T): T {
  return {
    ...t,
    calories: Math.round(t.calories),
    protein: +t.protein.toFixed(1),
    carbs: +t.carbs.toFixed(1),
    fats: +t.fats.toFixed(1),
    fiber: +t.fiber.toFixed(1),
    sodium: t.sodium != null ? Math.round(t.sodium) : undefined,
  } as T;
}

import type { MealType } from '@/types';

export interface MealTimeWindows {
  breakfast: [number, number]; // hours (0-24), end exclusive
  lunch: [number, number];
  dinner: [number, number];
}

export const DEFAULT_WINDOWS: MealTimeWindows = {
  breakfast: [5, 10.5],
  lunch: [11.5, 15],
  dinner: [18.5, 22.5],
};

export function classifyByTime(d: Date, windows: MealTimeWindows = DEFAULT_WINDOWS): MealType {
  const h = d.getHours() + d.getMinutes() / 60;
  const inRange = (w: [number, number]) => h >= w[0] && h < w[1];
  if (inRange(windows.breakfast)) return 'BREAKFAST';
  if (inRange(windows.lunch)) return 'LUNCH';
  if (inRange(windows.dinner)) return 'DINNER';
  return 'SNACK';
}

export interface GroupableMeal {
  id: string;
  eatenAt: Date;
  mealType: MealType;
}

export interface MealGroup<T extends GroupableMeal> {
  mealType: MealType;
  earliestAt: Date;
  latestAt: Date;
  items: T[];
}

/**
 * Folds meals within `windowMinutes` that share the same mealType into a single group.
 * Input does not need to be pre-sorted; output is sorted by earliest time.
 */
export function groupMeals<T extends GroupableMeal>(
  meals: T[],
  windowMinutes = 75
): MealGroup<T>[] {
  const sorted = [...meals].sort((a, b) => a.eatenAt.getTime() - b.eatenAt.getTime());
  const groups: MealGroup<T>[] = [];
  const windowMs = windowMinutes * 60 * 1000;

  for (const meal of sorted) {
    const last = groups[groups.length - 1];
    if (
      last &&
      last.mealType === meal.mealType &&
      meal.eatenAt.getTime() - last.latestAt.getTime() <= windowMs
    ) {
      last.items.push(meal);
      if (meal.eatenAt > last.latestAt) last.latestAt = meal.eatenAt;
      if (meal.eatenAt < last.earliestAt) last.earliestAt = meal.eatenAt;
    } else {
      groups.push({
        mealType: meal.mealType,
        earliestAt: meal.eatenAt,
        latestAt: meal.eatenAt,
        items: [meal],
      });
    }
  }

  return groups;
}

/** Convenience: order the four meal types in display order. */
export const MEAL_TYPE_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];

export const MEAL_TYPE_IT: Record<MealType, string> = {
  BREAKFAST: 'Colazione',
  LUNCH: 'Pranzo',
  SNACK: 'Spuntino',
  DINNER: 'Cena',
};

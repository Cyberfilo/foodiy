import { MEAL_TYPE_IT } from '@/lib/meal/grouping';
import type { MealType } from '@/types';
import { round1 } from '@/lib/utils';
import { MealCard } from './meal-card';

interface GroupMeal {
  id: string;
  imageFilename: string;
  name: string;
  eatenAt: Date | string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  score?: number | null;
}

interface MealGroupProps {
  mealType: MealType;
  meals: GroupMeal[];
}

const ICONS: Record<MealType, string> = {
  BREAKFAST: '☕',
  LUNCH: '🍝',
  SNACK: '🍎',
  DINNER: '🍽️',
};

export function MealGroup({ mealType, meals }: MealGroupProps) {
  const totals = meals.reduce(
    (a, m) => ({
      calories: a.calories + m.calories,
      protein: a.protein + m.protein,
      carbs: a.carbs + m.carbs,
      fats: a.fats + m.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
  return (
    <section className="space-y-2">
      <header className="flex items-baseline justify-between px-1">
        <h2 className="text-sm font-semibold text-fg-muted uppercase tracking-wider">
          <span className="mr-2" aria-hidden>
            {ICONS[mealType]}
          </span>
          {MEAL_TYPE_IT[mealType]}
        </h2>
        <div className="text-xs text-fg-muted tabular-nums">
          {Math.round(totals.calories)} kcal · P {round1(totals.protein)}g · C {round1(totals.carbs)}g · G{' '}
          {round1(totals.fats)}g
        </div>
      </header>
      <div className="space-y-2">
        {meals.map((m) => (
          <MealCard key={m.id} {...m} />
        ))}
      </div>
    </section>
  );
}

import type { DietPlan, DietTargets, MealType, ScoreBreakdown, ScoreReason } from '@/types';
import { clamp } from '@/lib/utils';

interface MealTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

interface MealForScoring extends MealTotals {
  mealType: MealType;
  ingredientNames: string[];
}

const TYPE_TO_KEY: Record<MealType, 'breakfast' | 'lunch' | 'dinner' | 'snack'> = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
};

/** Default per-meal fraction of the daily target. */
const FALLBACK_MEAL_FRACTION: Record<MealType, number> = {
  BREAKFAST: 0.25,
  LUNCH: 0.4,
  DINNER: 0.3,
  SNACK: 0.05,
};

function resolveMealTarget(diet: DietPlan, mealType: MealType): DietTargets {
  const key = TYPE_TO_KEY[mealType];
  const mt = diet.mealTargets?.[key];
  const frac = FALLBACK_MEAL_FRACTION[mealType];
  return {
    calories: mt?.calories ?? diet.dailyTargets.calories * frac,
    protein_g: mt?.protein_g ?? diet.dailyTargets.protein_g * frac,
    carbs_g: mt?.carbs_g ?? diet.dailyTargets.carbs_g * frac,
    fats_g: mt?.fats_g ?? diet.dailyTargets.fats_g * frac,
    fiber_g: mt?.fiber_g ?? diet.dailyTargets.fiber_g * frac,
  };
}

/** Smooth penalty: 0 at 0%, grows to `max` at 40% deviation, capped. */
function deviationPenalty(actual: number, target: number, max: number): number {
  if (target <= 0) return 0;
  const dev = Math.abs(actual - target) / target;
  const norm = clamp(dev / 0.4, 0, 1);
  return max * norm;
}

function containsAny(names: string[], terms: string[]): string | null {
  const lowered = names.map((n) => n.toLowerCase());
  for (const term of terms) {
    const t = term.toLowerCase().trim();
    if (!t) continue;
    if (lowered.some((n) => n.includes(t))) return term;
  }
  return null;
}

/**
 * Scores a meal against the active diet. 0–10 scale. Transparent reasons.
 * If diet is null, returns null (no scoring possible).
 */
export function scoreMeal(meal: MealForScoring, diet: DietPlan | null): ScoreBreakdown | null {
  if (!diet) return null;
  const target = resolveMealTarget(diet, meal.mealType);
  const reasons: ScoreReason[] = [];
  let score = 10;

  // Calories
  const calPenalty = deviationPenalty(meal.calories, target.calories, 3);
  score -= calPenalty;
  const calDev = meal.calories - target.calories;
  if (Math.abs(calDev) < target.calories * 0.1) {
    reasons.push({ kind: 'calories', severity: 'good', label: `Calorie sul target (${Math.round(meal.calories)} vs ${Math.round(target.calories)} kcal)` });
  } else {
    reasons.push({
      kind: 'calories',
      severity: calPenalty > 1.5 ? 'bad' : 'warn',
      label: calDev > 0 ? `Calorie +${Math.round(calDev)} sopra target` : `Calorie ${Math.round(calDev)} sotto target`,
      detail: `${Math.round(meal.calories)} vs ${Math.round(target.calories)} kcal`,
    });
  }

  // Macros aggregate (up to 3 points)
  const macroKeys: Array<[keyof MealTotals, keyof DietTargets, string, 'g']> = [
    ['protein', 'protein_g', 'Proteine', 'g'],
    ['carbs', 'carbs_g', 'Carbo', 'g'],
    ['fats', 'fats_g', 'Grassi', 'g'],
  ];
  let macroPenalty = 0;
  for (const [mKey, tKey, label] of macroKeys) {
    const actual = meal[mKey];
    const tgt = target[tKey];
    const p = deviationPenalty(actual, tgt, 1);
    macroPenalty += p;
    const dev = actual - tgt;
    if (Math.abs(dev) < tgt * 0.15) {
      reasons.push({ kind: 'macros', severity: 'good', label: `${label} ok`, detail: `${actual.toFixed(1)}g` });
    } else {
      reasons.push({
        kind: 'macros',
        severity: p > 0.5 ? 'bad' : 'warn',
        label: dev > 0 ? `${label} alti (+${dev.toFixed(1)}g)` : `${label} bassi (${dev.toFixed(1)}g)`,
        detail: `${actual.toFixed(1)}g vs ${tgt.toFixed(0)}g`,
      });
    }
  }
  score -= Math.min(3, macroPenalty);

  // Forbidden
  const forbiddenHit = containsAny(meal.ingredientNames, diet.forbidden);
  if (forbiddenHit) {
    score -= 2;
    reasons.push({ kind: 'forbidden', severity: 'bad', label: `Contiene "${forbiddenHit}" (vietato)` });
  } else if (diet.forbidden.length) {
    reasons.push({ kind: 'forbidden', severity: 'good', label: 'Nessun ingrediente vietato' });
  }

  // Rules (text-only; no enforcement beyond surfacing)
  // We don't auto-penalize rules because they may be time-contextual.
  // The UI can render them as reminders.

  // Encouraged bonus
  const encouragedHit = containsAny(meal.ingredientNames, diet.encouraged);
  if (encouragedHit) {
    score += 1;
    reasons.push({ kind: 'encouraged', severity: 'good', label: `Contiene "${encouragedHit}" (incoraggiato)` });
  }

  score = clamp(score, 0, 10);
  return {
    score: +score.toFixed(1),
    reasons,
    targetUsed: target,
  };
}

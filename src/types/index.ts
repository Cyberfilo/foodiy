export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium?: number;
}

export interface AnalyzedIngredient {
  name: string;
  grams: number;
  cookingMethod?: string | null;
  confidence: number;
  nutrition: Nutrition;
  sourceRef?: string | null;
}

export interface StructuredMeal {
  ingredients: AnalyzedIngredient[];
  cookingMethod?: string | null;
  mealTypeGuess: MealType;
  clarifyingQuestions: string[];
  notes?: string | null;
}

export interface DietTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
}

export interface MealTargets {
  breakfast?: Partial<DietTargets>;
  lunch?: Partial<DietTargets>;
  dinner?: Partial<DietTargets>;
  snack?: Partial<DietTargets>;
}

export interface DietPlan {
  dailyTargets: DietTargets;
  mealTargets?: MealTargets | null;
  rules: string[];
  forbidden: string[];
  encouraged: string[];
  notes?: string | null;
}

export interface ScoreReason {
  kind: 'calories' | 'macros' | 'rule' | 'forbidden' | 'encouraged';
  severity: 'good' | 'warn' | 'bad';
  label: string;
  detail?: string;
}

export interface ScoreBreakdown {
  score: number;
  reasons: ScoreReason[];
  targetUsed: DietTargets;
}

export interface MealWithIngredients {
  id: string;
  userId: string;
  dietId: string | null;
  imageFilename: string;
  mealType: MealType;
  eatenAt: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSodium: number;
  score: number | null;
  scoreBreakdown: ScoreBreakdown | null;
  notes: string | null;
  ingredients: {
    id: string;
    name: string;
    grams: number;
    cookingMethod: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sodium: number;
    sourceRef: string | null;
  }[];
}

export interface SessionPayload {
  userId: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
}

import type { DietPlan, StructuredMeal } from '@/types';

export interface AnalyzeMealInput {
  imageBase64DataUrl: string;
  userNote?: string;
}

export interface ClarifyMealInput extends AnalyzeMealInput {
  previousJson: StructuredMeal;
  userAnswers: { question: string; answer: string }[];
}

export interface ParseDietInput {
  text: string;
}

export interface MealAnalyzer {
  analyze(input: AnalyzeMealInput): Promise<StructuredMeal>;
  clarify(input: ClarifyMealInput): Promise<StructuredMeal>;
}

export interface DietParser {
  parse(input: ParseDietInput): Promise<DietPlan>;
}

import { OpenAIAdapter } from './openai-adapter';

let _singleton: { analyzer: MealAnalyzer; parser: DietParser } | null = null;

export function getAI(): { analyzer: MealAnalyzer; parser: DietParser } {
  if (_singleton) return _singleton;
  const adapter = new OpenAIAdapter();
  _singleton = { analyzer: adapter, parser: adapter };
  return _singleton;
}

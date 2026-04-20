import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth/middleware-helper';
import { mealTypeSchema, analyzedIngredientSchema } from '@/lib/ai/schemas';
import { scoreMeal } from '@/lib/nutrition/scoring';
import { sumIngredients, roundTotals } from '@/lib/nutrition/totals';
import { classifyByTime } from '@/lib/meal/grouping';
import { apiError } from '@/lib/api/errors';
import type { DietPlan } from '@/types';

export const runtime = 'nodejs';

const createInput = z.object({
  imageFilename: z.string().min(1),
  ingredients: z.array(analyzedIngredientSchema).min(1),
  mealType: mealTypeSchema.optional(),
  cookingMethod: z.string().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  eatenAt: z.string().datetime().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    const body = await req.json();
    const parsed = createInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const eatenAt = parsed.data.eatenAt ? new Date(parsed.data.eatenAt) : new Date();
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { activeDiet: true },
    });
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

    const mealType = parsed.data.mealType ?? classifyByTime(eatenAt);

    const totals = roundTotals(
      sumIngredients(
        parsed.data.ingredients.map((i) => ({
          calories: i.nutrition.calories,
          protein: i.nutrition.protein,
          carbs: i.nutrition.carbs,
          fats: i.nutrition.fats,
          fiber: i.nutrition.fiber,
          sodium: i.nutrition.sodium ?? 0,
        }))
      )
    );

    const diet = (user.activeDiet?.parsed ?? null) as unknown as DietPlan | null;
    const score = diet
      ? scoreMeal(
          {
            mealType,
            calories: totals.calories,
            protein: totals.protein,
            carbs: totals.carbs,
            fats: totals.fats,
            fiber: totals.fiber,
            ingredientNames: parsed.data.ingredients.map((i) => i.name),
          },
          diet
        )
      : null;

    const meal = await prisma.meal.create({
      data: {
        userId: session.userId,
        dietId: user.activeDietId ?? null,
        imageFilename: parsed.data.imageFilename,
        mealType,
        eatenAt,
        notes: parsed.data.notes ?? null,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFats: totals.fats,
        totalFiber: totals.fiber,
        totalSodium: totals.sodium ?? 0,
        score: score?.score ?? null,
        scoreBreakdown: score ? (score as unknown as Prisma.InputJsonValue) : undefined,
        ingredients: {
          create: parsed.data.ingredients.map((i) => ({
            name: i.name,
            grams: i.grams,
            cookingMethod: i.cookingMethod ?? null,
            calories: i.nutrition.calories,
            protein: i.nutrition.protein,
            carbs: i.nutrition.carbs,
            fats: i.nutrition.fats,
            fiber: i.nutrition.fiber,
            sodium: i.nutrition.sodium ?? 0,
            sourceRef: i.sourceRef ?? null,
          })),
        },
      },
      include: { ingredients: true },
    });
    return NextResponse.json({ ok: true, meal });
  } catch (e) {
    return apiError(e);
  }
}

export async function GET(req: Request) {
  try {
    const session = await requireUser();
    const url = new URL(req.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const where: Record<string, unknown> = { userId: session.userId };
    if (from || to) {
      const eatenAt: Record<string, Date> = {};
      if (from) eatenAt.gte = new Date(from);
      if (to) eatenAt.lte = new Date(to);
      where.eatenAt = eatenAt;
    }
    const meals = await prisma.meal.findMany({
      where,
      orderBy: { eatenAt: 'desc' },
      include: { ingredients: true },
      take: 500,
    });
    return NextResponse.json({ meals });
  } catch (e) {
    return apiError(e);
  }
}

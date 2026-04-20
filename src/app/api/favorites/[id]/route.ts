import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth/middleware-helper';
import { scoreMeal } from '@/lib/nutrition/scoring';
import { classifyByTime } from '@/lib/meal/grouping';
import { apiError } from '@/lib/api/errors';
import type { DietPlan, MealType, Nutrition } from '@/types';

export const runtime = 'nodejs';

interface StoredIngredient {
  name: string;
  grams: number;
  cookingMethod: string | null;
  nutrition: Nutrition & { sodium?: number };
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await ctx.params;
    const fav = await prisma.favorite.findUnique({ where: { id } });
    if (!fav || fav.userId !== session.userId) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    await prisma.favorite.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

/**
 * Relog a favorite as a new meal "right now" (or at a client-supplied time).
 * Body: { eatenAt?: string, mealType?: MealType }
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const eatenAt = body.eatenAt ? new Date(body.eatenAt) : new Date();

    const fav = await prisma.favorite.findUnique({ where: { id } });
    if (!fav || fav.userId !== session.userId) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { activeDiet: true },
    });
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

    const stored = fav.ingredientsJson as unknown as StoredIngredient[];
    const mealType: MealType = body.mealType ?? classifyByTime(eatenAt);
    const diet = ((user.activeDiet?.parsed ?? null) as unknown as DietPlan | null) ?? null;

    const breakdown = diet
      ? scoreMeal(
          {
            mealType,
            calories: fav.totalCalories,
            protein: fav.totalProtein,
            carbs: fav.totalCarbs,
            fats: fav.totalFats,
            fiber: fav.totalFiber,
            ingredientNames: stored.map((i) => i.name),
          },
          diet
        )
      : null;

    const imageFilename = fav.thumbnailFilename ?? '';

    const meal = await prisma.meal.create({
      data: {
        userId: session.userId,
        dietId: user.activeDietId ?? null,
        imageFilename,
        mealType,
        eatenAt,
        totalCalories: fav.totalCalories,
        totalProtein: fav.totalProtein,
        totalCarbs: fav.totalCarbs,
        totalFats: fav.totalFats,
        totalFiber: fav.totalFiber,
        totalSodium: 0,
        score: breakdown?.score ?? null,
        scoreBreakdown: breakdown ? (breakdown as unknown as Prisma.InputJsonValue) : undefined,
        notes: `Rilogato: ${fav.name}`,
        ingredients: {
          create: stored.map((i) => ({
            name: i.name,
            grams: i.grams,
            cookingMethod: i.cookingMethod,
            calories: i.nutrition.calories,
            protein: i.nutrition.protein,
            carbs: i.nutrition.carbs,
            fats: i.nutrition.fats,
            fiber: i.nutrition.fiber,
            sodium: i.nutrition.sodium ?? 0,
          })),
        },
      },
      include: { ingredients: true },
    });

    await prisma.favorite.update({
      where: { id },
      data: { useCount: { increment: 1 }, lastUsedAt: new Date() },
    });

    return NextResponse.json({ ok: true, meal });
  } catch (e) {
    return apiError(e);
  }
}

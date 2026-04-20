import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth/middleware-helper';
import { analyzedIngredientSchema, mealTypeSchema } from '@/lib/ai/schemas';
import { scoreMeal } from '@/lib/nutrition/scoring';
import { sumIngredients, roundTotals } from '@/lib/nutrition/totals';
import { deleteImage } from '@/lib/storage/volume';
import { apiError } from '@/lib/api/errors';
import type { DietPlan } from '@/types';

export const runtime = 'nodejs';

const patchInput = z.object({
  ingredients: z.array(analyzedIngredientSchema).optional(),
  mealType: mealTypeSchema.optional(),
  notes: z.string().max(1000).nullable().optional(),
  eatenAt: z.string().datetime().optional(),
});

async function loadOwned(id: string, userId: string) {
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: { ingredients: true, diet: true, user: { include: { activeDiet: true } } },
  });
  if (!meal || meal.userId !== userId) return null;
  return meal;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await ctx.params;
    const meal = await loadOwned(id, session.userId);
    if (!meal) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ meal });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await ctx.params;
    const current = await loadOwned(id, session.userId);
    if (!current) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const body = await req.json();
    const parsed = patchInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.mealType) data.mealType = parsed.data.mealType;
    if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;
    if (parsed.data.eatenAt) data.eatenAt = new Date(parsed.data.eatenAt);

    let ingredients = current.ingredients;
    if (parsed.data.ingredients) {
      // replace
      await prisma.mealIngredient.deleteMany({ where: { mealId: id } });
      const createdIngs = parsed.data.ingredients;
      await prisma.mealIngredient.createMany({
        data: createdIngs.map((i) => ({
          mealId: id,
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
      });
      ingredients = await prisma.mealIngredient.findMany({ where: { mealId: id } });
      const totals = roundTotals(sumIngredients(ingredients));
      data.totalCalories = totals.calories;
      data.totalProtein = totals.protein;
      data.totalCarbs = totals.carbs;
      data.totalFats = totals.fats;
      data.totalFiber = totals.fiber;
      data.totalSodium = totals.sodium ?? 0;
    }

    // Always rescore if anything changed that affects nutrition or meal type
    const activeDiet = ((current.user.activeDiet?.parsed ?? null) as unknown as DietPlan | null) ?? null;
    const totals = {
      calories: (data.totalCalories ?? current.totalCalories) as number,
      protein: (data.totalProtein ?? current.totalProtein) as number,
      carbs: (data.totalCarbs ?? current.totalCarbs) as number,
      fats: (data.totalFats ?? current.totalFats) as number,
      fiber: (data.totalFiber ?? current.totalFiber) as number,
    };
    const finalMealType = (data.mealType ?? current.mealType) as
      | 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
    const ingredientNames = ingredients.map((i) => i.name);
    const breakdown = activeDiet
      ? scoreMeal({ ...totals, mealType: finalMealType, ingredientNames }, activeDiet)
      : null;
    if (breakdown) {
      data.score = breakdown.score;
      data.scoreBreakdown = breakdown as unknown as Prisma.InputJsonValue;
    }

    const updated = await prisma.meal.update({
      where: { id },
      data,
      include: { ingredients: true },
    });
    return NextResponse.json({ meal: updated });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await ctx.params;
    const current = await loadOwned(id, session.userId);
    if (!current) return NextResponse.json({ error: 'not found' }, { status: 404 });
    await prisma.meal.delete({ where: { id } });
    // Only remove image if not referenced elsewhere (e.g. a favorite)
    const stillUsed = await prisma.favorite.findFirst({
      where: { thumbnailFilename: current.imageFilename },
      select: { id: true },
    });
    if (!stillUsed) await deleteImage(current.imageFilename);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

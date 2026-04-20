import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth/middleware-helper';
import { apiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

const input = z.object({
  name: z.string().min(1).max(120).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const parsed = input.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }
    const meal = await prisma.meal.findUnique({
      where: { id },
      include: { ingredients: true },
    });
    if (!meal || meal.userId !== session.userId) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    const guess =
      parsed.data.name ||
      (meal.ingredients.length === 1
        ? meal.ingredients[0].name
        : meal.ingredients.slice(0, 3).map((i) => i.name).join(' + '));
    const fav = await prisma.favorite.create({
      data: {
        userId: session.userId,
        name: guess.slice(0, 120),
        thumbnailFilename: meal.imageFilename,
        ingredientsJson: meal.ingredients.map((i) => ({
          name: i.name,
          grams: i.grams,
          cookingMethod: i.cookingMethod,
          nutrition: {
            calories: i.calories,
            protein: i.protein,
            carbs: i.carbs,
            fats: i.fats,
            fiber: i.fiber,
            sodium: i.sodium,
          },
        })),
        totalCalories: meal.totalCalories,
        totalProtein: meal.totalProtein,
        totalCarbs: meal.totalCarbs,
        totalFats: meal.totalFats,
        totalFiber: meal.totalFiber,
      },
    });
    return NextResponse.json({ ok: true, favorite: fav });
  } catch (e) {
    return apiError(e);
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth/middleware-helper';
import { apiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const session = await requireUser();
    const url = new URL(req.url);
    const dateStr = url.searchParams.get('date');
    const day = dateStr ? new Date(dateStr) : new Date();
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    const meals = await prisma.meal.findMany({
      where: { userId: session.userId, eatenAt: { gte: start, lte: end } },
      orderBy: { eatenAt: 'asc' },
      include: { ingredients: true },
    });
    const totals = meals.reduce(
      (a, m) => ({
        calories: a.calories + m.totalCalories,
        protein: a.protein + m.totalProtein,
        carbs: a.carbs + m.totalCarbs,
        fats: a.fats + m.totalFats,
        fiber: a.fiber + m.totalFiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );
    return NextResponse.json({ meals, totals });
  } catch (e) {
    return apiError(e);
  }
}

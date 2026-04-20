import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth/middleware-helper';
import { apiError } from '@/lib/api/errors';
import { startOfWeek } from '@/lib/utils';
import type { DietPlan } from '@/types';

export const runtime = 'nodejs';

const DAY_LABEL_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export async function GET(req: Request) {
  try {
    const session = await requireUser();
    const url = new URL(req.url);
    const weekStart = url.searchParams.get('weekStart')
      ? new Date(url.searchParams.get('weekStart')!)
      : startOfWeek(new Date());

    const start = new Date(weekStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const [user, meals] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        include: { activeDiet: true },
      }),
      prisma.meal.findMany({
        where: { userId: session.userId, eatenAt: { gte: start, lt: end } },
        orderBy: { eatenAt: 'asc' },
      }),
    ]);

    const diet = (user?.activeDiet?.parsed ?? null) as unknown as DietPlan | null;
    const tgt = diet?.dailyTargets ?? { calories: 2000, protein_g: 120, carbs_g: 220, fats_g: 65, fiber_g: 25 };

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dayMeals = meals.filter(
        (m) => m.eatenAt.getFullYear() === d.getFullYear() && m.eatenAt.getMonth() === d.getMonth() && m.eatenAt.getDate() === d.getDate()
      );
      const totals = dayMeals.reduce(
        (a, m) => ({
          calories: a.calories + m.totalCalories,
          protein: a.protein + m.totalProtein,
          carbs: a.carbs + m.totalCarbs,
          fats: a.fats + m.totalFats,
          fiber: a.fiber + m.totalFiber,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
      );
      const scoreSum = dayMeals.reduce((s, m) => s + (m.score ?? 0), 0);
      const scoreCount = dayMeals.filter((m) => m.score != null).length;
      return {
        date: DAY_LABEL_IT[i],
        iso: d.toISOString(),
        calories: Math.round(totals.calories),
        calories_t: Math.round(tgt.calories),
        protein: +totals.protein.toFixed(1),
        protein_t: tgt.protein_g,
        carbs: +totals.carbs.toFixed(1),
        carbs_t: tgt.carbs_g,
        fats: +totals.fats.toFixed(1),
        fats_t: tgt.fats_g,
        fiber: +totals.fiber.toFixed(1),
        fiber_t: tgt.fiber_g,
        score: scoreCount ? +(scoreSum / scoreCount).toFixed(1) : null,
        meals: dayMeals.length,
      };
    });

    return NextResponse.json({ weekStart: start.toISOString(), days, targets: tgt });
  } catch (e) {
    return apiError(e);
  }
}

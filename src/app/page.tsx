import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getSessionUser } from '@/lib/auth/middleware-helper';
import { AppHeader } from '@/components/feature/app-header';
import { BottomNav } from '@/components/feature/bottom-nav';
import { NutritionRing } from '@/components/feature/nutrition-ring';
import { MacroBars } from '@/components/feature/macro-bars';
import { MealGroup } from '@/components/feature/meal-group';
import { groupMeals, MEAL_TYPE_ORDER } from '@/lib/meal/grouping';
import { formatDate, formatISODate } from '@/lib/utils';
import type { DietPlan, MealType } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const [user, meals] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, include: { activeDiet: true } }),
    prisma.meal.findMany({
      where: { userId: session.userId, eatenAt: { gte: start, lte: end } },
      orderBy: { eatenAt: 'asc' },
      include: { ingredients: true },
    }),
  ]);
  if (!user) redirect('/login');

  const diet = (user.activeDiet?.parsed ?? null) as unknown as DietPlan | null;
  const targets = ((user.customTargets ?? null) as unknown as Partial<DietPlan['dailyTargets']> | null) ?? diet?.dailyTargets ?? {
    calories: 2000,
    protein_g: 120,
    carbs_g: 220,
    fats_g: 65,
    fiber_g: 25,
  };

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

  const groups = groupMeals(
    meals.map((m) => ({
      id: m.id,
      eatenAt: m.eatenAt,
      mealType: m.mealType as MealType,
      imageFilename: m.imageFilename,
      name: m.ingredients[0]?.name ?? 'Pasto',
      calories: m.totalCalories,
      protein: m.totalProtein,
      carbs: m.totalCarbs,
      fats: m.totalFats,
      score: m.score,
    }))
  ).sort(
    (a, b) =>
      MEAL_TYPE_ORDER.indexOf(a.mealType) - MEAL_TYPE_ORDER.indexOf(b.mealType) ||
      a.earliestAt.getTime() - b.earliestAt.getTime()
  );

  return (
    <>
      <AppHeader title="Oggi" subtitle={formatDate(now)} userName={user.name} />
      <main className="page pt-4 pb-nav space-y-6">
        <section className="flex items-center gap-4">
          <NutritionRing
            current={totals.calories}
            target={(targets.calories ?? 2000) as number}
            label="kcal"
            unit="kcal"
            size={168}
          />
          <div className="flex-1">
            <MacroBars
              protein={{ current: totals.protein, target: (targets.protein_g ?? 120) as number }}
              carbs={{ current: totals.carbs, target: (targets.carbs_g ?? 220) as number }}
              fats={{ current: totals.fats, target: (targets.fats_g ?? 65) as number }}
              fiber={{ current: totals.fiber, target: (targets.fiber_g ?? 25) as number }}
            />
          </div>
        </section>

        {groups.length === 0 ? (
          <EmptyToday />
        ) : (
          <div className="space-y-6">
            {groups.map((g, i) => (
              <MealGroup
                key={`${g.mealType}-${i}`}
                mealType={g.mealType}
                meals={g.items.map((m) => ({
                  id: m.id,
                  imageFilename: m.imageFilename,
                  name: m.name,
                  eatenAt: m.eatenAt,
                  calories: m.calories,
                  protein: m.protein,
                  carbs: m.carbs,
                  fats: m.fats,
                  score: m.score,
                }))}
              />
            ))}
          </div>
        )}

        <div className="text-[11px] text-fg-subtle text-center">
          {formatISODate(now)}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

function EmptyToday() {
  return (
    <Card className="p-6 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-brand/15 flex items-center justify-center">
        <Camera className="h-6 w-6 text-brand" />
      </div>
      <div className="mt-3 font-semibold">Nessun pasto oggi</div>
      <div className="mt-1 text-sm text-fg-muted">
        Scatta una foto del tuo pasto e Foodiy lo analizza.
      </div>
      <Link href="/snap" className="inline-block mt-4">
        <Button>Scatta la prima foto</Button>
      </Link>
    </Card>
  );
}

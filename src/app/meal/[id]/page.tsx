import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getSessionUser } from '@/lib/auth/middleware-helper';
import { AppHeader } from '@/components/feature/app-header';
import { BottomNav } from '@/components/feature/bottom-nav';
import { DietScoreBreakdown } from '@/components/feature/diet-score-breakdown';
import { formatTime, formatDate, round1 } from '@/lib/utils';
import { MEAL_TYPE_IT } from '@/lib/meal/grouping';
import type { MealType, ScoreBreakdown } from '@/types';
import { MealDetailActions } from './actions-client';

export const dynamic = 'force-dynamic';

export default async function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) redirect('/login');
  const { id } = await params;
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: { ingredients: true },
  });
  if (!meal || meal.userId !== session.userId) notFound();

  const breakdown = meal.scoreBreakdown as unknown as ScoreBreakdown | null;

  return (
    <>
      <AppHeader
        title="Dettaglio pasto"
        subtitle={`${MEAL_TYPE_IT[meal.mealType as MealType]} · ${formatDate(meal.eatenAt)} · ${formatTime(meal.eatenAt)}`}
      />
      <main className="page pt-4 pb-nav space-y-4">
        <div className="rounded-xl2 overflow-hidden border border-border">
          <img
            src={`/api/images/${meal.imageFilename}`}
            alt="pasto"
            className="w-full aspect-[4/5] object-cover"
          />
        </div>

        <div className="grid grid-cols-4 gap-2 text-center rounded-xl2 border border-border bg-bg-elev p-3">
          <Stat label="kcal" value={Math.round(meal.totalCalories)} />
          <Stat label="P (g)" value={round1(meal.totalProtein)} />
          <Stat label="C (g)" value={round1(meal.totalCarbs)} />
          <Stat label="G (g)" value={round1(meal.totalFats)} />
        </div>

        <DietScoreBreakdown breakdown={breakdown} />

        <section>
          <h2 className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-2">Ingredienti</h2>
          <div className="space-y-2">
            {meal.ingredients.map((i) => (
              <div key={i.id} className="rounded-xl2 border border-border bg-bg-elev p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{i.name}</div>
                  <div className="text-sm tabular-nums text-fg-muted">{Math.round(i.grams)}g</div>
                </div>
                {i.cookingMethod && (
                  <div className="text-xs text-fg-muted mt-0.5">{i.cookingMethod}</div>
                )}
                <div className="mt-2 grid grid-cols-4 gap-2 text-[11px] text-fg-muted">
                  <div><span className="text-fg">{Math.round(i.calories)}</span> kcal</div>
                  <div><span className="text-fg">{round1(i.protein)}</span>g P</div>
                  <div><span className="text-fg">{round1(i.carbs)}</span>g C</div>
                  <div><span className="text-fg">{round1(i.fats)}</span>g G</div>
                </div>
                {i.sourceRef && (
                  <div className="mt-1 text-[10px] text-fg-subtle uppercase tracking-wider">{i.sourceRef}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {meal.notes && (
          <div className="rounded-xl2 border border-border bg-bg-elev p-3 text-sm">
            <div className="text-xs text-fg-muted uppercase tracking-wider mb-1">Note</div>
            {meal.notes}
          </div>
        )}

        <MealDetailActions mealId={meal.id} imageFilename={meal.imageFilename} />
      </main>
      <BottomNav />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-fg-muted">{label}</div>
    </div>
  );
}

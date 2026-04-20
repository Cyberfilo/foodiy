import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getSessionUser } from '@/lib/auth/middleware-helper';
import { AppHeader } from '@/components/feature/app-header';
import { BottomNav } from '@/components/feature/bottom-nav';
import { WeeklyChart, type WeeklyDatum } from '@/components/feature/weekly-chart';
import { Card, CardContent } from '@/components/ui/card';
import { startOfWeek, round1 } from '@/lib/utils';
import type { DietPlan } from '@/types';

export const dynamic = 'force-dynamic';

const DAY_LABEL_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export default async function WeekPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const start = startOfWeek(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const [user, meals] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, include: { activeDiet: true } }),
    prisma.meal.findMany({
      where: { userId: session.userId, eatenAt: { gte: start, lt: end } },
      orderBy: { eatenAt: 'asc' },
    }),
  ]);
  if (!user) redirect('/login');
  const diet = (user.activeDiet?.parsed ?? null) as unknown as DietPlan | null;
  const tgt = diet?.dailyTargets ?? { calories: 2000, protein_g: 120, carbs_g: 220, fats_g: 65, fiber_g: 25 };

  const data: WeeklyDatum[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dayMeals = meals.filter((m) =>
      m.eatenAt.getFullYear() === d.getFullYear() && m.eatenAt.getMonth() === d.getMonth() && m.eatenAt.getDate() === d.getDate()
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
    const scoreList = dayMeals.map((m) => m.score).filter((s): s is number => s != null);
    const score = scoreList.length ? +(scoreList.reduce((a, b) => a + b, 0) / scoreList.length).toFixed(1) : null;
    return {
      date: DAY_LABEL_IT[i],
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
      score,
    };
  });

  const weekTotals = data.reduce(
    (a, d) => ({
      calories: a.calories + d.calories,
      meals: a.meals + 0,
    }),
    { calories: 0, meals: 0 }
  );
  weekTotals.meals = meals.length;

  return (
    <>
      <AppHeader title="Settimana" subtitle={weekRangeLabel(start)} userName={user.name} />
      <main className="page pt-4 pb-nav space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <KPI label="Pasti" value={weekTotals.meals} />
          <KPI label="kcal tot" value={weekTotals.calories} />
          <KPI label="Media gg" value={Math.round(weekTotals.calories / 7)} />
        </div>
        <WeeklyChart data={data} />
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-fg-muted mb-2 uppercase tracking-wider">Dettaglio giornaliero</div>
            <div className="space-y-1.5 text-sm">
              {data.map((d) => (
                <div key={d.date} className="flex items-center justify-between">
                  <div className="w-10 text-fg-muted">{d.date}</div>
                  <div className="flex-1 tabular-nums">
                    {d.calories} kcal · P {round1(d.protein)}g · C {round1(d.carbs)}g · G {round1(d.fats)}g
                  </div>
                  <div className="tabular-nums text-fg-muted">{d.score != null ? `★ ${d.score}` : '—'}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </>
  );
}

function KPI({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl2 border border-border bg-bg-elev p-3 text-center">
      <div className="text-xl font-semibold tabular-nums">{value.toLocaleString('it-IT')}</div>
      <div className="text-[10px] uppercase tracking-wider text-fg-muted">{label}</div>
    </div>
  );
}

function weekRangeLabel(start: Date) {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

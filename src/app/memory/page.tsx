import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getSessionUser } from '@/lib/auth/middleware-helper';
import { AppHeader } from '@/components/feature/app-header';
import { BottomNav } from '@/components/feature/bottom-nav';
import { formatDate, formatTime } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Book } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MemoryPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const meals = await prisma.meal.findMany({
    where: { userId: session.userId },
    orderBy: { eatenAt: 'desc' },
    take: 300,
    select: {
      id: true,
      eatenAt: true,
      imageFilename: true,
      totalCalories: true,
      ingredients: { select: { name: true }, take: 2 },
    },
  });

  const buckets = bucketByDay(meals);

  return (
    <>
      <AppHeader title="Memory book" subtitle={`${meals.length} pasti archiviati`} />
      <main className="page pt-4 pb-nav space-y-6">
        {meals.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-brand/15 flex items-center justify-center">
              <Book className="h-6 w-6 text-brand" />
            </div>
            <div className="mt-3 font-semibold">Nessun ricordo ancora</div>
            <div className="mt-1 text-sm text-fg-muted">
              Ogni pasto che salvi apparirà qui, in ordine cronologico.
            </div>
          </Card>
        ) : (
          buckets.map(([dateLabel, items]) => (
            <section key={dateLabel}>
              <h2 className="sticky top-[74px] z-10 bg-bg/80 backdrop-blur px-1 py-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">
                {dateLabel}
              </h2>
              <div className="grid grid-cols-3 gap-1.5">
                {items.map((m) => (
                  <Link
                    key={m.id}
                    href={`/meal/${m.id}`}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-bg-elev-2"
                  >
                    <img
                      src={`/api/images/${m.imageFilename}`}
                      alt={m.ingredients[0]?.name ?? 'pasto'}
                      className="h-full w-full object-cover transition-transform group-active:scale-95"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/70 to-transparent text-[10px] text-white tabular-nums flex items-end justify-between">
                      <span>{formatTime(m.eatenAt)}</span>
                      <span>{Math.round(m.totalCalories)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
      <BottomNav />
    </>
  );
}

function bucketByDay(
  meals: {
    id: string;
    eatenAt: Date;
    imageFilename: string;
    totalCalories: number;
    ingredients: { name: string }[];
  }[]
) {
  const m = new Map<string, typeof meals>();
  for (const meal of meals) {
    const key = formatDate(meal.eatenAt);
    const arr = m.get(key) ?? [];
    arr.push(meal);
    m.set(key, arr);
  }
  return Array.from(m.entries());
}

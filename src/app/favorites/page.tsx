'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/feature/app-header';
import { BottomNav } from '@/components/feature/bottom-nav';
import { FavoriteTile } from '@/components/feature/favorite-tile';
import { Card } from '@/components/ui/card';
import { pushToast } from '@/components/ui/toast';
import { Heart } from 'lucide-react';

interface FavoriteDTO {
  id: string;
  name: string;
  thumbnailFilename: string | null;
  totalCalories: number;
  useCount: number;
  lastUsedAt: string | null;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [list, setList] = React.useState<FavoriteDTO[] | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    const res = await fetch('/api/favorites', { cache: 'no-store' });
    const data = await res.json();
    setList(data.favorites ?? []);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function relog(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/favorites/${id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'errore');
      const data = await res.json();
      pushToast('Pasto rilogato', 'success');
      router.push(`/meal/${data.meal.id}`);
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Errore', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('errore');
      pushToast('Rimosso', 'success');
      await load();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Errore', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AppHeader title="Preferiti" subtitle={list ? `${list.length} voci` : '…'} />
      <main className="page pt-4 pb-nav">
        {list === null ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skel aspect-square rounded-xl2" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <Card className="p-6 text-center mt-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-brand/15 flex items-center justify-center">
              <Heart className="h-6 w-6 text-brand" />
            </div>
            <div className="mt-3 font-semibold">Nessun preferito ancora</div>
            <div className="mt-1 text-sm text-fg-muted">
              Su ogni pasto: &quot;Aggiungi ai preferiti&quot; per riusarlo con un tap.
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {list.map((f) => (
              <FavoriteTile
                key={f.id}
                id={f.id}
                name={f.name}
                thumbnailFilename={f.thumbnailFilename}
                calories={f.totalCalories}
                useCount={f.useCount}
                onRelog={relog}
                onDelete={remove}
                busy={busy}
              />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

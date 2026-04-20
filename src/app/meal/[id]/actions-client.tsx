'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { pushToast } from '@/components/ui/toast';
import { Heart, Trash2 } from 'lucide-react';

export function MealDetailActions({ mealId }: { mealId: string; imageFilename: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  async function addFavorite() {
    setBusy(true);
    try {
      const res = await fetch(`/api/meals/${mealId}/favorite`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'errore');
      pushToast('Salvato nei preferiti', 'success');
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Errore', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/meals/${mealId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'errore');
      pushToast('Pasto eliminato', 'success');
      router.push('/');
      router.refresh();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Errore', 'error');
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={addFavorite} disabled={busy}>
          <Heart className="h-4 w-4" />
          Aggiungi ai preferiti
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(true)} disabled={busy}>
          <Trash2 className="h-4 w-4 text-danger" />
          Elimina
        </Button>
      </div>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogHeader>
          <DialogTitle>Eliminare questo pasto?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-fg-muted">L&apos;azione è irreversibile.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={busy}>
            Annulla
          </Button>
          <Button variant="destructive" onClick={remove} disabled={busy}>
            Elimina
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

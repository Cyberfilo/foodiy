'use client';

import * as React from 'react';
import { AppHeader } from '@/components/feature/app-header';
import { BottomNav } from '@/components/feature/bottom-nav';
import { DietUploader } from '@/components/feature/diet-uploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pushToast } from '@/components/ui/toast';
import type { DietPlan } from '@/types';
import { CheckCircle2, Trash2 } from 'lucide-react';

interface DietDTO {
  id: string;
  name: string;
  parsed: DietPlan;
  createdAt: string;
}

export default function DietPage() {
  const [diets, setDiets] = React.useState<DietDTO[] | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    const res = await fetch('/api/diets', { cache: 'no-store' });
    const data = await res.json();
    setDiets(data.diets ?? []);
    setActiveId(data.activeDietId ?? null);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function submit({ name, text, file }: { name: string; text?: string; file?: File }) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      if (text) fd.append('text', text);
      if (file) fd.append('file', file);
      const res = await fetch('/api/diets', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'errore');
      pushToast('Dieta salvata', 'success');
      await load();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Errore', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function activate(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/diets/${id}/activate`, { method: 'POST' });
      if (!res.ok) throw new Error('errore');
      pushToast('Dieta attivata', 'success');
      await load();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Errore', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/diets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('errore');
      pushToast('Dieta eliminata', 'success');
      await load();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Errore', 'error');
    } finally {
      setBusy(false);
    }
  }

  const active = diets?.find((d) => d.id === activeId) ?? null;

  return (
    <>
      <AppHeader title="Dieta" subtitle={active ? `Attiva: ${active.name}` : 'Nessuna dieta attiva'} />
      <main className="page pt-4 pb-nav space-y-5">
        {active && <ActiveDietCard diet={active} />}

        <Card>
          <CardHeader>
            <CardTitle>Aggiungi dieta</CardTitle>
          </CardHeader>
          <CardContent>
            <DietUploader onSubmit={submit} busy={busy} />
          </CardContent>
        </Card>

        {diets && diets.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-fg-muted uppercase tracking-wider">Storico diete</h2>
            {diets.map((d) => (
              <div key={d.id} className="rounded-xl2 border border-border bg-bg-elev p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate flex items-center gap-2">
                    {d.name}
                    {d.id === activeId && (
                      <Badge variant="success">
                        <CheckCircle2 className="h-3 w-3" /> Attiva
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-fg-muted">
                    {d.parsed.dailyTargets.calories} kcal · P {d.parsed.dailyTargets.protein_g}g ·
                    C {d.parsed.dailyTargets.carbs_g}g · G {d.parsed.dailyTargets.fats_g}g
                  </div>
                </div>
                {d.id !== activeId && (
                  <Button size="sm" variant="outline" onClick={() => activate(d.id)} disabled={busy}>
                    Attiva
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => remove(d.id)} disabled={busy} aria-label="Elimina">
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            ))}
          </section>
        )}
      </main>
      <BottomNav />
    </>
  );
}

function ActiveDietCard({ diet }: { diet: DietDTO }) {
  const t = diet.parsed.dailyTargets;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{diet.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-5 gap-2 text-center">
          <Mini label="kcal" value={Math.round(t.calories)} />
          <Mini label="P" value={`${Math.round(t.protein_g)}g`} />
          <Mini label="C" value={`${Math.round(t.carbs_g)}g`} />
          <Mini label="G" value={`${Math.round(t.fats_g)}g`} />
          <Mini label="F" value={`${Math.round(t.fiber_g)}g`} />
        </div>
        {diet.parsed.rules.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-fg-muted mb-1">Regole</div>
            <div className="flex flex-wrap gap-1.5">
              {diet.parsed.rules.map((r, i) => (
                <Badge key={i} variant="secondary">{r}</Badge>
              ))}
            </div>
          </div>
        )}
        {diet.parsed.forbidden.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-fg-muted mb-1">Vietati</div>
            <div className="flex flex-wrap gap-1.5">
              {diet.parsed.forbidden.map((r, i) => (
                <Badge key={i} variant="danger">{r}</Badge>
              ))}
            </div>
          </div>
        )}
        {diet.parsed.encouraged.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-fg-muted mb-1">Incoraggiati</div>
            <div className="flex flex-wrap gap-1.5">
              {diet.parsed.encouraged.map((r, i) => (
                <Badge key={i} variant="success">{r}</Badge>
              ))}
            </div>
          </div>
        )}
        {diet.parsed.notes && <div className="text-sm text-fg-muted">{diet.parsed.notes}</div>}
      </CardContent>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-bg-elev-2 p-2">
      <div className="text-sm font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-fg-muted">{label}</div>
    </div>
  );
}

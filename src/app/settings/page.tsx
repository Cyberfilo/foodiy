'use client';

import * as React from 'react';
import { AppHeader } from '@/components/feature/app-header';
import { BottomNav } from '@/components/feature/bottom-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pushToast } from '@/components/ui/toast';

interface MeDTO {
  id: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
  customTargets: { calories?: number; protein_g?: number; carbs_g?: number; fats_g?: number; fiber_g?: number } | null;
}

export default function SettingsPage() {
  const [me, setMe] = React.useState<MeDTO | null>(null);
  const [t, setT] = React.useState({ calories: '', protein_g: '', carbs_g: '', fats_g: '', fiber_g: '' });
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then((d) => {
      setMe(d);
      if (d.customTargets) {
        setT({
          calories: String(d.customTargets.calories ?? ''),
          protein_g: String(d.customTargets.protein_g ?? ''),
          carbs_g: String(d.customTargets.carbs_g ?? ''),
          fats_g: String(d.customTargets.fats_g ?? ''),
          fiber_g: String(d.customTargets.fiber_g ?? ''),
        });
      }
    });
  }, []);

  async function save() {
    setBusy(true);
    try {
      const body: Record<string, unknown> = {};
      const parsed = {
        calories: numOrNull(t.calories),
        protein_g: numOrNull(t.protein_g),
        carbs_g: numOrNull(t.carbs_g),
        fats_g: numOrNull(t.fats_g),
        fiber_g: numOrNull(t.fiber_g),
      };
      const any = Object.values(parsed).some((v) => v !== null);
      body.customTargets = any ? parsed : null;
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('errore');
      pushToast('Salvato', 'success');
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Errore', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AppHeader title="Impostazioni" />
      <main className="page pt-4 pb-nav space-y-4">
        {me && (
          <Card>
            <CardHeader>
              <CardTitle>Profilo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-bg-elev-2 flex items-center justify-center text-lg font-semibold">
                  {me.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{me.name}</div>
                  <Badge variant={me.role === 'ADMIN' ? 'default' : 'secondary'}>{me.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Obiettivi custom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-fg-muted">
              Se compili questi valori, hanno priorità sui target della dieta attiva. Lascia vuoto per usare la dieta.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="kcal/giorno" value={t.calories} onChange={(v) => setT({ ...t, calories: v })} />
              <Field label="Proteine (g)" value={t.protein_g} onChange={(v) => setT({ ...t, protein_g: v })} />
              <Field label="Carbo (g)" value={t.carbs_g} onChange={(v) => setT({ ...t, carbs_g: v })} />
              <Field label="Grassi (g)" value={t.fats_g} onChange={(v) => setT({ ...t, fats_g: v })} />
              <Field label="Fibre (g)" value={t.fiber_g} onChange={(v) => setT({ ...t, fiber_g: v })} />
            </div>
            <Button className="w-full" onClick={save} disabled={busy}>
              Salva
            </Button>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </>
  );
}

function numOrNull(s: string): number | null {
  const n = Number(s);
  if (!s || Number.isNaN(n) || n < 0) return null;
  return n;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ''))}
        className="mt-1"
      />
    </div>
  );
}

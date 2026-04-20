'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/feature/app-header';
import { BottomNav } from '@/components/feature/bottom-nav';
import { SnapCamera } from '@/components/feature/snap-camera';
import { IngredientEditor } from '@/components/feature/ingredient-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { pushToast } from '@/components/ui/toast';
import type { AnalyzedIngredient, MealType, StructuredMeal } from '@/types';
import { MEAL_TYPE_IT } from '@/lib/meal/grouping';
import { round1 } from '@/lib/utils';

type Stage = 'capture' | 'analyzing' | 'clarify' | 'review' | 'saving';

export default function SnapPage() {
  const router = useRouter();
  const [stage, setStage] = React.useState<Stage>('capture');
  const [file, setFile] = React.useState<File | null>(null);
  const [note, setNote] = React.useState('');
  const [imageFilename, setImageFilename] = React.useState<string | null>(null);
  const [structured, setStructured] = React.useState<StructuredMeal | null>(null);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [mealType, setMealType] = React.useState<MealType>('LUNCH');

  const totals = React.useMemo(() => {
    if (!structured) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    return structured.ingredients.reduce(
      (a, i) => ({
        calories: a.calories + i.nutrition.calories,
        protein: a.protein + i.nutrition.protein,
        carbs: a.carbs + i.nutrition.carbs,
        fats: a.fats + i.nutrition.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [structured]);

  async function runAnalyze() {
    if (!file) return;
    setStage('analyzing');
    try {
      const fd = new FormData();
      fd.append('image', file);
      if (note.trim()) fd.append('note', note.trim());
      const res = await fetch('/api/meals/analyze', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'analisi fallita');
      const data = await res.json();
      setImageFilename(data.imageFilename);
      setStructured(data.structured);
      setMealType(data.structured.mealTypeGuess || 'LUNCH');
      if (Array.isArray(data.structured.clarifyingQuestions) && data.structured.clarifyingQuestions.length > 0) {
        setStage('clarify');
      } else {
        setStage('review');
      }
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Errore', 'error');
      setStage('capture');
    }
  }

  async function sendClarifications() {
    if (!imageFilename || !structured) return;
    const qas = structured.clarifyingQuestions
      .map((q) => ({ question: q, answer: (answers[q] || '').trim() }))
      .filter((qa) => qa.answer);
    if (qas.length === 0) {
      setStage('review');
      return;
    }
    setStage('analyzing');
    try {
      const res = await fetch('/api/meals/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          imageFilename,
          previousStructured: structured,
          answers: qas,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'analisi fallita');
      const data = await res.json();
      setStructured(data.structured);
      setStage('review');
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Errore', 'error');
      setStage('review');
    }
  }

  async function save() {
    if (!imageFilename || !structured) return;
    setStage('saving');
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          imageFilename,
          ingredients: structured.ingredients,
          mealType,
          cookingMethod: structured.cookingMethod ?? null,
          notes: note.trim() || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'salvataggio fallito');
      const data = await res.json();
      pushToast('Pasto salvato', 'success');
      router.push(`/meal/${data.meal.id}`);
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Errore', 'error');
      setStage('review');
    }
  }

  return (
    <>
      <AppHeader title="Scatta & analizza" />
      <main className="page pt-4 pb-nav space-y-5">
        {stage === 'capture' && (
          <>
            <SnapCamera onCapture={(f) => setFile(f)} />
            <div>
              <Label htmlFor="note">Nota (opzionale)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="es. pasta 80g al pomodoro + olio evo"
                className="mt-1"
              />
            </div>
            <Button disabled={!file} className="w-full" onClick={runAnalyze}>
              Analizza foto
            </Button>
          </>
        )}

        {stage === 'analyzing' && (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="h-12 w-12 rounded-full border-2 border-brand border-r-transparent animate-spin" />
            <div className="text-sm text-fg-muted">Foodiy sta analizzando il pasto…</div>
          </div>
        )}

        {stage === 'clarify' && structured && (
          <Card>
            <CardContent className="space-y-4 pt-4">
              <div className="text-sm text-fg-muted">Qualche domanda per essere preciso:</div>
              {structured.clarifyingQuestions.map((q) => (
                <div key={q}>
                  <Label>{q}</Label>
                  <Textarea
                    className="mt-1"
                    value={answers[q] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                    placeholder="Rispondi brevemente…"
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStage('review')}>
                  Salta
                </Button>
                <Button className="flex-1" onClick={sendClarifications}>
                  Invia risposte
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {stage === 'review' && structured && (
          <>
            {imageFilename && (
              <div className="rounded-xl2 overflow-hidden border border-border">
                <img src={`/api/images/${imageFilename}`} alt="foto" className="w-full aspect-[4/5] object-cover" />
              </div>
            )}
            <div className="rounded-xl2 border border-border bg-bg-elev p-3">
              <div className="text-xs text-fg-muted mb-2">Tipo pasto</div>
              <Tabs value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                <TabsList className="w-full justify-between">
                  <TabsTrigger value="BREAKFAST">{MEAL_TYPE_IT.BREAKFAST}</TabsTrigger>
                  <TabsTrigger value="LUNCH">{MEAL_TYPE_IT.LUNCH}</TabsTrigger>
                  <TabsTrigger value="SNACK">{MEAL_TYPE_IT.SNACK}</TabsTrigger>
                  <TabsTrigger value="DINNER">{MEAL_TYPE_IT.DINNER}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <IngredientEditor
              ingredients={structured.ingredients}
              onChange={(ings: AnalyzedIngredient[]) =>
                setStructured((s) => (s ? { ...s, ingredients: ings } : s))
              }
            />
            <Card>
              <CardContent className="pt-4 grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-lg font-semibold tabular-nums">{Math.round(totals.calories)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-fg-muted">kcal</div>
                </div>
                <div>
                  <div className="text-lg font-semibold tabular-nums">{round1(totals.protein)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-fg-muted">P (g)</div>
                </div>
                <div>
                  <div className="text-lg font-semibold tabular-nums">{round1(totals.carbs)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-fg-muted">C (g)</div>
                </div>
                <div>
                  <div className="text-lg font-semibold tabular-nums">{round1(totals.fats)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-fg-muted">G (g)</div>
                </div>
              </CardContent>
            </Card>
            <Button className="w-full" size="lg" onClick={save} disabled={structured.ingredients.length === 0}>
              Salva pasto
            </Button>
          </>
        )}

        {stage === 'saving' && (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="h-12 w-12 rounded-full border-2 border-brand border-r-transparent animate-spin" />
            <div className="text-sm text-fg-muted">Salvataggio…</div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

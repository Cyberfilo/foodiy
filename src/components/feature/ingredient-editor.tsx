'use client';

import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import type { AnalyzedIngredient } from '@/types';

interface IngredientEditorProps {
  ingredients: AnalyzedIngredient[];
  onChange: (ings: AnalyzedIngredient[]) => void;
  readOnly?: boolean;
}

/** Local scaling of nutrition as grams change. */
function rescale(base: AnalyzedIngredient, newGrams: number): AnalyzedIngredient {
  if (base.grams <= 0 || newGrams === base.grams) return { ...base, grams: newGrams };
  const factor = newGrams / base.grams;
  return {
    ...base,
    grams: newGrams,
    nutrition: {
      calories: +(base.nutrition.calories * factor).toFixed(1),
      protein: +(base.nutrition.protein * factor).toFixed(1),
      carbs: +(base.nutrition.carbs * factor).toFixed(1),
      fats: +(base.nutrition.fats * factor).toFixed(1),
      fiber: +(base.nutrition.fiber * factor).toFixed(1),
      sodium: base.nutrition.sodium != null ? +(base.nutrition.sodium * factor).toFixed(1) : undefined,
    },
  };
}

export function IngredientEditor({ ingredients, onChange, readOnly }: IngredientEditorProps) {
  function updateAt(idx: number, next: AnalyzedIngredient) {
    const out = [...ingredients];
    out[idx] = next;
    onChange(out);
  }
  function removeAt(idx: number) {
    onChange(ingredients.filter((_, i) => i !== idx));
  }
  function addBlank() {
    onChange([
      ...ingredients,
      {
        name: '',
        grams: 100,
        cookingMethod: null,
        confidence: 1,
        nutrition: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
      },
    ]);
  }
  return (
    <div className="space-y-3">
      {ingredients.map((ing, i) => (
        <div key={i} className="rounded-xl2 border border-border bg-bg-elev p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={ing.name}
              onChange={(e) => updateAt(i, { ...ing, name: e.target.value })}
              placeholder="ingrediente"
              disabled={readOnly}
              className="flex-1"
            />
            {!readOnly && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Rimuovi"
                onClick={() => removeAt(i)}
              >
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Slider
              value={ing.grams}
              min={0}
              max={Math.max(600, Math.ceil(ing.grams * 1.5))}
              step={5}
              onChange={(v) => updateAt(i, rescale(ing, v))}
              ariaLabel={`grammi ${ing.name}`}
            />
            <div className="w-20 text-right tabular-nums font-medium">{Math.round(ing.grams)}g</div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={ing.cookingMethod ?? ''}
              onChange={(e) =>
                updateAt(i, { ...ing, cookingMethod: e.target.value || null })
              }
              placeholder="cottura (grigliato, al forno, fritto…)"
              disabled={readOnly}
              className="flex-1 h-9 text-sm"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 text-[11px] text-fg-muted">
            <div><span className="text-fg">{Math.round(ing.nutrition.calories)}</span> kcal</div>
            <div><span className="text-fg">{ing.nutrition.protein.toFixed(1)}</span>g P</div>
            <div><span className="text-fg">{ing.nutrition.carbs.toFixed(1)}</span>g C</div>
            <div><span className="text-fg">{ing.nutrition.fats.toFixed(1)}</span>g G</div>
          </div>
        </div>
      ))}
      {!readOnly && (
        <Button type="button" variant="outline" onClick={addBlank} className="w-full">
          <Plus className="h-4 w-4" />
          Aggiungi ingrediente
        </Button>
      )}
    </div>
  );
}

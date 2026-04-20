import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/middleware-helper';
import { saveImage, readImage, imageAsBase64DataUrl } from '@/lib/storage/volume';
import { getAI } from '@/lib/ai/adapter';
import { findCreaMatch, creaNutritionFor } from '@/lib/nutrition/crea-lookup';
import { apiError } from '@/lib/api/errors';
import type { AnalyzedIngredient, StructuredMeal } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const clarifyInput = z.object({
  imageFilename: z.string().min(1),
  previousStructured: z.any(),
  answers: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
});

function enrichIngredients(ings: AnalyzedIngredient[]): AnalyzedIngredient[] {
  return ings.map((ing) => {
    const match = findCreaMatch(ing.name);
    if (!match) return { ...ing, sourceRef: 'LLM' };
    // Blend: if LLM confidence is high, keep its numbers; else use CREA.
    const useCrea = ing.confidence < 0.7;
    const nutrition = useCrea ? creaNutritionFor(match.entry, ing.grams) : ing.nutrition;
    return {
      ...ing,
      nutrition,
      sourceRef: useCrea ? `CREA:${match.entry.key}` : `LLM+CREA:${match.entry.key}`,
    };
  });
}

/**
 * Two modes:
 *  - Initial analyze: multipart form with `image` (File) and optional `note` (string).
 *  - Clarify: JSON with { imageFilename, previousStructured, answers[] }.
 */
export async function POST(req: Request) {
  try {
    await requireUser();
    const ctype = req.headers.get('content-type') || '';

    if (ctype.includes('application/json')) {
      const body = await req.json();
      const parsed = clarifyInput.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'invalid clarify payload' }, { status: 400 });
      }
      const buf = await readImage(parsed.data.imageFilename);
      const dataUrl = await imageAsBase64DataUrl(buf);
      const { analyzer } = getAI();
      const structured = await analyzer.clarify({
        imageBase64DataUrl: dataUrl,
        previousJson: parsed.data.previousStructured as StructuredMeal,
        userAnswers: parsed.data.answers,
      });
      structured.ingredients = enrichIngredients(structured.ingredients);
      return NextResponse.json({ imageFilename: parsed.data.imageFilename, structured });
    }

    // multipart
    const form = await req.formData();
    const imageField = form.get('image');
    const note = typeof form.get('note') === 'string' ? (form.get('note') as string) : undefined;
    if (!(imageField instanceof File)) {
      return NextResponse.json({ error: 'image required' }, { status: 400 });
    }
    const raw = Buffer.from(await imageField.arrayBuffer());
    const saved = await saveImage(raw);
    const dataUrl = await imageAsBase64DataUrl(raw);
    const { analyzer } = getAI();
    const structured = await analyzer.analyze({ imageBase64DataUrl: dataUrl, userNote: note });
    structured.ingredients = enrichIngredients(structured.ingredients);
    return NextResponse.json({ imageFilename: saved.filename, structured });
  } catch (e) {
    return apiError(e);
  }
}

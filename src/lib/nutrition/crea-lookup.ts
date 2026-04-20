import { CREA_DATA, type CreaEntry } from './crea-data';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s).split(' ').filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) m[i][0] = i;
  for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + c);
    }
  }
  return m[a.length][b.length];
}

interface ScoredEntry {
  entry: CreaEntry;
  score: number;
}

function scoreMatch(query: string, entry: CreaEntry): number {
  const qnorm = normalize(query);
  const qtokens = tokens(query);
  const candidates = [entry.name, ...entry.aliases].map(normalize);
  let best = 0;
  for (const cand of candidates) {
    if (cand === qnorm) return 1;
    if (cand.includes(qnorm) || qnorm.includes(cand)) {
      best = Math.max(best, 0.9);
      continue;
    }
    const ctokens = tokens(cand);
    const overlap = qtokens.filter((t) => ctokens.some((c) => c.includes(t) || t.includes(c))).length;
    if (overlap > 0) {
      best = Math.max(best, 0.55 + 0.15 * overlap);
    }
    const d = levenshtein(qnorm, cand);
    const sim = 1 - d / Math.max(qnorm.length, cand.length, 1);
    if (sim >= 0.82) best = Math.max(best, sim);
  }
  return best;
}

/**
 * Returns the best CREA entry for an ingredient name, with a confidence.
 * Returns null if nothing matches above threshold.
 */
export function findCreaMatch(name: string, threshold = 0.7): { entry: CreaEntry; confidence: number } | null {
  if (!name || !name.trim()) return null;
  const scored: ScoredEntry[] = CREA_DATA.map((e) => ({ entry: e, score: scoreMatch(name, e) }))
    .filter((s) => s.score >= threshold)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return null;
  return { entry: scored[0].entry, confidence: scored[0].score };
}

/** Computes absolute nutrition for `grams` of a CREA entry. */
export function creaNutritionFor(entry: CreaEntry, grams: number) {
  const f = grams / 100;
  return {
    calories: +(entry.per100g.calories * f).toFixed(1),
    protein: +(entry.per100g.protein * f).toFixed(1),
    carbs: +(entry.per100g.carbs * f).toFixed(1),
    fats: +(entry.per100g.fats * f).toFixed(1),
    fiber: +(entry.per100g.fiber * f).toFixed(1),
    sodium: +(entry.per100g.sodium * f).toFixed(1),
  };
}

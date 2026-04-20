import * as React from 'react';
import { cn } from '@/lib/utils';

interface MacroBarsProps {
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fats: { current: number; target: number };
  fiber?: { current: number; target: number };
  className?: string;
}

interface Row {
  label: string;
  current: number;
  target: number;
  color: string;
}

function pct(a: number, t: number) {
  if (!t) return 0;
  return Math.min(1, a / t);
}

export function MacroBars({ protein, carbs, fats, fiber, className }: MacroBarsProps) {
  const rows: Row[] = [
    { label: 'Proteine', current: protein.current, target: protein.target, color: 'rgb(59 130 246)' },
    { label: 'Carbo', current: carbs.current, target: carbs.target, color: 'rgb(245 158 11)' },
    { label: 'Grassi', current: fats.current, target: fats.target, color: 'rgb(168 85 247)' },
    ...(fiber ? [{ label: 'Fibre', current: fiber.current, target: fiber.target, color: 'rgb(34 197 94)' }] : []),
  ];
  return (
    <div className={cn('grid gap-3', className)}>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-fg-muted">{r.label}</span>
            <span className="tabular-nums">
              <span className="text-fg">{r.current.toFixed(1)}g</span>
              <span className="text-fg-subtle"> / {r.target.toFixed(0)}g</span>
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-bg-elev-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct(r.current, r.target) * 100}%`, backgroundColor: r.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

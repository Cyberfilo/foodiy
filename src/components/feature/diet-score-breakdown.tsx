import { cn, round1 } from '@/lib/utils';
import type { ScoreBreakdown, ScoreReason } from '@/types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface Props {
  breakdown: ScoreBreakdown | null;
  fallbackNote?: string;
}

function iconFor(sev: ScoreReason['severity']) {
  if (sev === 'good') return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (sev === 'warn') return <AlertTriangle className="h-4 w-4 text-warn" />;
  return <XCircle className="h-4 w-4 text-danger" />;
}

function scoreColor(s: number) {
  if (s >= 8) return 'text-success';
  if (s >= 5.5) return 'text-warn';
  return 'text-danger';
}

export function DietScoreBreakdown({ breakdown, fallbackNote }: Props) {
  if (!breakdown) {
    return (
      <div className="rounded-xl2 border border-border bg-bg-elev p-4 text-sm text-fg-muted">
        {fallbackNote ?? 'Nessuna dieta attiva — seleziona una dieta per ottenere un punteggio.'}
      </div>
    );
  }
  return (
    <div className="rounded-xl2 border border-border bg-bg-elev p-4 space-y-3">
      <div className="flex items-baseline gap-2">
        <div className={cn('text-4xl font-semibold tabular-nums', scoreColor(breakdown.score))}>
          {round1(breakdown.score)}
        </div>
        <div className="text-sm text-fg-muted">/ 10</div>
        <div className="ml-auto text-[11px] uppercase tracking-wider text-fg-subtle">Score dieta</div>
      </div>
      <ul className="space-y-1.5">
        {breakdown.reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5">{iconFor(r.severity)}</span>
            <div className="flex-1">
              <div className="text-fg">{r.label}</div>
              {r.detail && <div className="text-xs text-fg-muted">{r.detail}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

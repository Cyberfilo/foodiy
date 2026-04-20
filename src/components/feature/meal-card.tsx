import Link from 'next/link';
import { cn, formatTime, round1 } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MealCardProps {
  id: string;
  imageFilename: string;
  name: string;
  eatenAt: Date | string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  score?: number | null;
  className?: string;
}

function scoreTone(score: number): 'default' | 'warn' | 'danger' {
  if (score >= 8) return 'default';
  if (score >= 5.5) return 'warn';
  return 'danger';
}

export function MealCard({
  id,
  imageFilename,
  name,
  eatenAt,
  calories,
  protein,
  carbs,
  fats,
  score,
  className,
}: MealCardProps) {
  const time = typeof eatenAt === 'string' ? new Date(eatenAt) : eatenAt;
  return (
    <Link
      href={`/meal/${id}`}
      className={cn(
        'group flex items-center gap-3 p-2 pr-3 rounded-xl2 border border-border bg-bg-elev hover:bg-bg-elev-2 transition-colors',
        className
      )}
    >
      <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-none bg-bg-elev-2">
        <img
          src={`/api/images/${imageFilename}`}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="truncate font-medium">{name}</div>
          {typeof score === 'number' && (
            <Badge variant={scoreTone(score)} className="ml-auto">
              {round1(score)}
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-fg-muted tabular-nums">
          <span>{formatTime(time)}</span>
          <span>{Math.round(calories)} kcal</span>
          <span className="truncate">
            P {round1(protein)}g · C {round1(carbs)}g · G {round1(fats)}g
          </span>
        </div>
      </div>
    </Link>
  );
}

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface NutritionRingProps {
  current: number;
  target: number;
  label?: string;
  unit?: string;
  size?: number;
  thickness?: number;
  className?: string;
}

export function NutritionRing({
  current,
  target,
  label = 'kcal',
  unit = 'kcal',
  size = 200,
  thickness = 14,
  className,
}: NutritionRingProps) {
  const pct = target > 0 ? Math.min(1.2, current / target) : 0;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.min(1, pct);
  const over = pct > 1;

  const ringColor = over ? 'rgb(239 68 68)' : pct >= 0.95 ? 'rgb(34 197 94)' : 'rgb(245 158 11)';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--bg-elev-2))"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-semibold tabular-nums">{Math.round(current)}</div>
        <div className="text-xs text-fg-muted">
          / {Math.round(target)} {unit}
        </div>
        {label && label !== unit && (
          <div className="mt-1 text-[10px] uppercase tracking-wider text-fg-subtle">{label}</div>
        )}
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface WeeklyDatum {
  date: string;            // 'Mon', 'Tue', ...
  calories: number;
  calories_t: number;
  protein: number;
  protein_t: number;
  carbs: number;
  carbs_t: number;
  fats: number;
  fats_t: number;
  fiber: number;
  fiber_t: number;
  score: number | null;
}

type Metric = 'calories' | 'protein' | 'carbs' | 'fats' | 'fiber' | 'score';

const METRICS: { value: Metric; label: string; unit: string }[] = [
  { value: 'calories', label: 'kcal', unit: 'kcal' },
  { value: 'protein', label: 'Proteine', unit: 'g' },
  { value: 'carbs', label: 'Carbo', unit: 'g' },
  { value: 'fats', label: 'Grassi', unit: 'g' },
  { value: 'fiber', label: 'Fibre', unit: 'g' },
  { value: 'score', label: 'Score', unit: '/10' },
];

export function WeeklyChart({ data }: { data: WeeklyDatum[] }) {
  const [metric, setMetric] = React.useState<Metric>('calories');

  const actualKey = metric;
  const targetKey = metric === 'score' ? null : (`${metric}_t` as keyof WeeklyDatum);
  const unit = METRICS.find((m) => m.value === metric)?.unit ?? '';

  return (
    <div className="space-y-3">
      <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
        <TabsList className="flex-wrap">
          {METRICS.map((m) => (
            <TabsTrigger key={m.value} value={m.value}>
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="h-64 rounded-xl2 border border-border bg-bg-elev p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="rgb(var(--fg-subtle))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="rgb(var(--fg-subtle))" fontSize={11} tickLine={false} axisLine={false} domain={metric === 'score' ? [0, 10] : ['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                background: 'rgb(var(--bg-elev-2))',
                border: '1px solid rgb(var(--border))',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: 'rgb(var(--fg))', fontWeight: 600 }}
              formatter={(val: number) => `${val?.toFixed?.(1) ?? val}${unit ? ` ${unit}` : ''}`}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: 'rgb(var(--fg-muted))' }} />
            <Line
              type="monotone"
              dataKey={actualKey}
              stroke="rgb(var(--brand))"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              name="Attuale"
              isAnimationActive
            />
            {targetKey && (
              <Line
                type="monotone"
                dataKey={targetKey as string}
                stroke="rgb(var(--fg-muted))"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                name="Target"
                isAnimationActive
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

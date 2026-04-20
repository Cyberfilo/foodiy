'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Repeat } from 'lucide-react';

interface FavoriteTileProps {
  id: string;
  name: string;
  thumbnailFilename: string | null;
  calories: number;
  useCount: number;
  onRelog: (id: string) => void;
  onDelete: (id: string) => void;
  busy?: boolean;
}

export function FavoriteTile({
  id,
  name,
  thumbnailFilename,
  calories,
  useCount,
  onRelog,
  onDelete,
  busy,
}: FavoriteTileProps) {
  return (
    <div className="group relative rounded-xl2 border border-border bg-bg-elev overflow-hidden">
      <div className="aspect-square bg-bg-elev-2">
        {thumbnailFilename ? (
          <img
            src={`/api/images/${thumbnailFilename}`}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-3xl">🍽️</div>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <div className="truncate font-medium text-sm">{name}</div>
        <div className="flex items-center justify-between text-xs text-fg-muted tabular-nums">
          <span>{Math.round(calories)} kcal</span>
          <Badge variant="secondary">×{useCount}</Badge>
        </div>
        <div className="flex gap-1.5 pt-1">
          <Button
            type="button"
            size="sm"
            variant="default"
            className="flex-1"
            onClick={() => onRelog(id)}
            disabled={busy}
          >
            <Repeat className="h-3.5 w-3.5" />
            Rilogga
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Elimina"
            onClick={() => onDelete(id)}
            disabled={busy}
          >
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      </div>
    </div>
  );
}

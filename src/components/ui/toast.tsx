'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ToastKind = 'info' | 'success' | 'error';
interface Toast {
  id: string;
  text: string;
  kind: ToastKind;
}

type ToastListener = (list: Toast[]) => void;

class ToastBus {
  private list: Toast[] = [];
  private listeners = new Set<ToastListener>();

  subscribe(fn: ToastListener): () => void {
    this.listeners.add(fn);
    fn(this.list);
    return () => {
      this.listeners.delete(fn);
    };
  }

  push(text: string, kind: ToastKind = 'info') {
    const id = Math.random().toString(36).slice(2);
    this.list = [...this.list, { id, text, kind }];
    this.emit();
    setTimeout(() => {
      this.list = this.list.filter((t) => t.id !== id);
      this.emit();
    }, 3200);
  }

  private emit() {
    for (const fn of this.listeners) fn(this.list);
  }
}

export const toast = new ToastBus();
export const pushToast = (text: string, kind: ToastKind = 'info') => toast.push(text, kind);

export function Toaster() {
  const [list, setList] = React.useState<Toast[]>([]);
  React.useEffect(() => toast.subscribe(setList), []);
  return (
    <div className="fixed bottom-4 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pb-safe pointer-events-none">
      {list.map((t) => (
        <div
          key={t.id}
          className={cn(
            'glass max-w-sm w-full text-sm px-4 py-3 rounded-xl border shadow-lg animate-slide-up pointer-events-auto',
            t.kind === 'success' && 'border-success/40',
            t.kind === 'error' && 'border-danger/40',
            t.kind === 'info' && 'border-border'
          )}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

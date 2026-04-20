'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}
const TabsCtx = React.createContext<TabsContextValue | null>(null);

export function Tabs({
  value,
  onValueChange,
  defaultValue,
  children,
  className,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? '');
  const v = value ?? internal;
  const setV = (next: string) => {
    if (onValueChange) onValueChange(next);
    if (value === undefined) setInternal(next);
  };
  return (
    <TabsCtx.Provider value={{ value: v, setValue: setV }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-bg-elev p-1 border border-border',
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: { value: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(TabsCtx);
  if (!ctx) throw new Error('TabsTrigger outside Tabs');
  const active = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'px-3 h-8 text-xs font-medium rounded-full transition-colors',
        active ? 'bg-brand text-brand-fg' : 'text-fg-muted hover:text-fg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  ...props
}: { value: string } & React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(TabsCtx);
  if (!ctx) return null;
  if (ctx.value !== value) return null;
  return <div role="tabpanel" className={cn('animate-fade-in', className)} {...props} />;
}

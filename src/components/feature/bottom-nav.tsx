'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Camera, BarChart3, Heart, Book } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/', label: 'Oggi', icon: Home },
  { href: '/week', label: 'Settimana', icon: BarChart3 },
  { href: '/snap', label: 'Scatta', icon: Camera, big: true },
  { href: '/favorites', label: 'Preferiti', icon: Heart },
  { href: '/memory', label: 'Memory', icon: Book },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-40 border-t border-border glass pb-safe"
      aria-label="Navigazione principale"
    >
      <ul className="flex items-stretch justify-around h-16 px-2">
        {TABS.map((t) => {
          const active = pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href));
          const Icon = t.icon;
          if (t.big) {
            return (
              <li key={t.href} className="-mt-5">
                <Link
                  href={t.href}
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-fg shadow-lg transition-transform active:scale-95',
                    active && 'ring-4 ring-brand/30'
                  )}
                  aria-label={t.label}
                >
                  <Icon className="h-6 w-6" />
                </Link>
              </li>
            );
          }
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={cn(
                  'h-full flex flex-col items-center justify-center gap-0.5 text-[11px]',
                  active ? 'text-brand' : 'text-fg-muted'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'text-brand')} />
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

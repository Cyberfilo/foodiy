'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, Utensils } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { pushToast } from '@/components/ui/toast';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  right?: React.ReactNode;
}

export function AppHeader({ title, subtitle, userName, right }: AppHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      pushToast('Logout fallito', 'error');
    }
  }

  return (
    <header className="sticky top-0 z-30 pt-safe bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="page flex items-center justify-between py-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-semibold tracking-tight truncate">{title}</h1>
          </div>
          {subtitle && <p className="text-xs text-fg-muted truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {right}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Account"
            className="h-10 w-10 rounded-full bg-bg-elev border border-border flex items-center justify-center"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>{userName ?? 'Account'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Link
            href="/diet"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl p-3 border border-border bg-bg-elev-2"
          >
            <Utensils className="h-4 w-4" />
            Dieta attiva
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl p-3 border border-border bg-bg-elev-2"
          >
            <Settings className="h-4 w-4" />
            Impostazioni
          </Link>
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Esci
          </Button>
        </div>
      </Dialog>
    </header>
  );
}

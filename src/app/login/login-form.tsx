'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { pushToast } from '@/components/ui/toast';

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextHref = search.get('next') || '/';

  const [firstRun, setFirstRun] = React.useState<boolean | null>(null);
  const [name, setName] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [setupToken, setSetupToken] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/auth/setup')
      .then((r) => r.json())
      .then((d) => setFirstRun(Boolean(d?.firstRun)))
      .catch(() => setFirstRun(false));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), pin: pin.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'login failed');
      }
      router.replace(nextHref);
      router.refresh();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Errore login', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), pin: pin.trim(), setupToken: setupToken.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'setup failed');
      }
      router.replace(nextHref);
      router.refresh();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Errore setup', 'error');
    } finally {
      setBusy(false);
    }
  }

  if (firstRun === null) {
    return (
      <main className="min-h-screen flex items-center justify-center page">
        <div className="h-24 w-24 skel rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center page pt-safe pb-safe">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-6">
          <img src="/icon.svg" alt="Foodiy" width={64} height={64} className="rounded-2xl" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{firstRun ? 'Configura Foodiy' : 'Accedi'}</CardTitle>
            <CardDescription>
              {firstRun
                ? 'Primo utente: diventerai amministratore.'
                : 'Nome e PIN — nient\'altro.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={firstRun ? handleSetup : handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="username"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="pin">PIN (4-8 cifre)</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  autoComplete={firstRun ? 'new-password' : 'current-password'}
                  minLength={4}
                  maxLength={8}
                  className="mt-1 tracking-widest"
                  required
                />
              </div>
              {firstRun && (
                <div>
                  <Label htmlFor="token">Setup token</Label>
                  <Input
                    id="token"
                    value={setupToken}
                    onChange={(e) => setSetupToken(e.target.value)}
                    className="mt-1"
                    required
                  />
                  <p className="mt-1 text-[11px] text-fg-subtle">
                    Trovi il valore nella variabile ADMIN_SETUP_TOKEN su Railway.
                  </p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? '…' : firstRun ? 'Configura e accedi' : 'Accedi'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

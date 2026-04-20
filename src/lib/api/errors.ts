import { NextResponse } from 'next/server';
import { ForbiddenError, UnauthorizedError } from '@/lib/auth/middleware-helper';

export function apiError(err: unknown) {
  if (err instanceof UnauthorizedError) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const message = err instanceof Error ? err.message : 'internal error';
  console.error('[api] ', err);
  return NextResponse.json({ error: message }, { status: 500 });
}

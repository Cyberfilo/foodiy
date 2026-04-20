import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { SESSION_COOKIE, verifySessionToken } from './session';
import type { SessionPayload } from '@/types';

export async function getSessionUser(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireUser(): Promise<SessionPayload> {
  const u = await getSessionUser();
  if (!u) throw new UnauthorizedError();
  return u;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const u = await requireUser();
  if (u.role !== 'ADMIN') throw new ForbiddenError();
  return u;
}

export async function loadUserRecord(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export class UnauthorizedError extends Error {
  status = 401 as const;
  constructor() {
    super('unauthorized');
  }
}

export class ForbiddenError extends Error {
  status = 403 as const;
  constructor() {
    super('forbidden');
  }
}

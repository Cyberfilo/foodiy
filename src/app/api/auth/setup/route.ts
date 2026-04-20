import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { hashPin } from '@/lib/auth/password';
import { createSessionToken, cookieOptions } from '@/lib/auth/session';
import { getSessionUser } from '@/lib/auth/middleware-helper';
import { apiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

/**
 * Used both to bootstrap the very first user (requires ADMIN_SETUP_TOKEN
 * from env) and for an authenticated admin to add family members (requires
 * admin session).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? '').trim();
    const pin = String(body?.pin ?? '').trim();
    const setupToken = String(body?.setupToken ?? '').trim();
    if (!name || !pin) {
      return NextResponse.json({ error: 'name and pin required' }, { status: 400 });
    }
    if (!/^\d{4,8}$/.test(pin)) {
      return NextResponse.json({ error: 'pin must be 4-8 digits' }, { status: 400 });
    }

    const count = await prisma.user.count();
    const existing = await prisma.user.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: 'name already taken' }, { status: 409 });
    }

    const isFirstRun = count === 0;
    let role: 'ADMIN' | 'MEMBER' = 'MEMBER';

    if (isFirstRun) {
      const expected = process.env.ADMIN_SETUP_TOKEN;
      if (!expected || setupToken !== expected) {
        return NextResponse.json({ error: 'invalid setup token' }, { status: 403 });
      }
      role = 'ADMIN';
    } else {
      const session = await getSessionUser();
      if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'admin required' }, { status: 403 });
      }
    }

    const pinHash = await hashPin(pin);
    const user = await prisma.user.create({
      data: { name, pinHash, role },
    });

    if (isFirstRun) {
      const token = await createSessionToken({ userId: user.id, name: user.name, role: user.role });
      const store = await cookies();
      const opt = cookieOptions();
      store.set({ ...opt, value: token });
    }

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, role: user.role },
      firstRun: isFirstRun,
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function GET() {
  const count = await prisma.user.count();
  return NextResponse.json({ firstRun: count === 0 });
}

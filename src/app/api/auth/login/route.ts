import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { verifyPin } from '@/lib/auth/password';
import { createSessionToken, cookieOptions } from '@/lib/auth/session';
import { apiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? '').trim();
    const pin = String(body?.pin ?? '').trim();
    if (!name || !pin) {
      return NextResponse.json({ error: 'name and pin required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { name } });
    if (!user || !(await verifyPin(pin, user.pinHash))) {
      return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });
    }
    const token = await createSessionToken({ userId: user.id, name: user.name, role: user.role });
    const store = await cookies();
    const opt = cookieOptions();
    store.set({ ...opt, value: token });
    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
  } catch (e) {
    return apiError(e);
  }
}

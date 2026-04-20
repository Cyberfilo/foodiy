import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth/middleware-helper';
import { apiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await ctx.params;
    const diet = await prisma.diet.findUnique({ where: { id } });
    if (!diet || diet.userId !== session.userId) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    await prisma.user.update({ where: { id: session.userId }, data: { activeDietId: id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

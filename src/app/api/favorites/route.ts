import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth/middleware-helper';
import { apiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await requireUser();
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.userId },
      orderBy: [{ useCount: 'desc' }, { lastUsedAt: 'desc' }, { createdAt: 'desc' }],
      take: 200,
    });
    return NextResponse.json({ favorites });
  } catch (e) {
    return apiError(e);
  }
}

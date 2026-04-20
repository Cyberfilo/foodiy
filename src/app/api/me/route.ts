import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth/middleware-helper';
import { apiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await requireUser();
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { activeDiet: true },
    });
    if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({
      id: user.id,
      name: user.name,
      role: user.role,
      customTargets: user.customTargets,
      mealWindows: user.mealWindows,
      activeDiet: user.activeDiet
        ? { id: user.activeDiet.id, name: user.activeDiet.name, parsed: user.activeDiet.parsed }
        : null,
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireUser();
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.customTargets !== undefined) data.customTargets = body.customTargets;
    if (body.mealWindows !== undefined) data.mealWindows = body.mealWindows;
    if (body.activeDietId !== undefined) data.activeDietId = body.activeDietId;
    const user = await prisma.user.update({
      where: { id: session.userId },
      data,
    });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return apiError(e);
  }
}

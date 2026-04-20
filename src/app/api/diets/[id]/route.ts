import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth/middleware-helper';
import { dietPlanSchema } from '@/lib/ai/schemas';
import { apiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

async function loadOwned(id: string, userId: string) {
  const diet = await prisma.diet.findUnique({ where: { id } });
  if (!diet || diet.userId !== userId) return null;
  return diet;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await ctx.params;
    const diet = await loadOwned(id, session.userId);
    if (!diet) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ diet });
  } catch (e) {
    return apiError(e);
  }
}

const patchInput = z.object({
  name: z.string().min(1).max(120).optional(),
  parsed: dietPlanSchema.optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await ctx.params;
    const diet = await loadOwned(id, session.userId);
    if (!diet) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const body = await req.json();
    const parsed = patchInput.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    const updated = await prisma.diet.update({
      where: { id },
      data: {
        ...(parsed.data.name ? { name: parsed.data.name } : {}),
        ...(parsed.data.parsed ? { parsed: parsed.data.parsed as unknown as Prisma.InputJsonValue } : {}),
      },
    });
    return NextResponse.json({ diet: updated });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await ctx.params;
    const diet = await loadOwned(id, session.userId);
    if (!diet) return NextResponse.json({ error: 'not found' }, { status: 404 });
    // Unlink user if this was active
    await prisma.user.updateMany({
      where: { activeDietId: id },
      data: { activeDietId: null },
    });
    await prisma.diet.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

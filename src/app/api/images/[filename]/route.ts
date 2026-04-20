import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth/middleware-helper';
import { readImage } from '@/lib/storage/volume';
import { apiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

/** Authenticated image stream. Owner-only to keep users siloed. */
export async function GET(_req: Request, ctx: { params: Promise<{ filename: string }> }) {
  try {
    const session = await requireUser();
    const { filename } = await ctx.params;
    if (!filename || filename.includes('/') || filename.includes('..')) {
      return NextResponse.json({ error: 'bad filename' }, { status: 400 });
    }

    // Ensure the image belongs to this user (via a meal or favorite record).
    const owner =
      (await prisma.meal.findFirst({
        where: { imageFilename: filename, userId: session.userId },
        select: { id: true },
      })) ||
      (await prisma.favorite.findFirst({
        where: { thumbnailFilename: filename, userId: session.userId },
        select: { id: true },
      }));

    if (!owner) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    const buf = await readImage(filename);
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'private, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    return apiError(e);
  }
}

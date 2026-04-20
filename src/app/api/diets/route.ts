import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { requireUser } from '@/lib/auth/middleware-helper';
import { getAI } from '@/lib/ai/adapter';
import { apiError } from '@/lib/api/errors';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function extractTextFromFile(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    const parsed = await pdfParse(buf);
    return parsed.text;
  }
  if (name.endsWith('.docx') || file.type.includes('officedocument.wordprocessingml')) {
    const out = await mammoth.extractRawText({ buffer: buf });
    return out.value;
  }
  return buf.toString('utf8');
}

export async function GET() {
  try {
    const session = await requireUser();
    const diets = await prisma.diet.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { activeDietId: true } });
    return NextResponse.json({ diets, activeDietId: user?.activeDietId ?? null });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    const ctype = req.headers.get('content-type') || '';

    let name = '';
    let sourceText = '';
    let sourceFile: string | null = null;

    if (ctype.includes('multipart/form-data')) {
      const form = await req.formData();
      name = String(form.get('name') ?? '').trim();
      const text = String(form.get('text') ?? '').trim();
      const file = form.get('file');
      if (text) sourceText = text;
      if (file instanceof File && file.size > 0) {
        const extracted = await extractTextFromFile(file);
        sourceText = (sourceText + '\n\n' + extracted).trim();
        sourceFile = file.name;
      }
    } else {
      const body = await req.json();
      name = String(body?.name ?? '').trim();
      sourceText = String(body?.text ?? '').trim();
    }

    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
    if (!sourceText) return NextResponse.json({ error: 'text or file required' }, { status: 400 });

    const { parser } = getAI();
    const parsed = await parser.parse({ text: sourceText });

    const diet = await prisma.diet.create({
      data: {
        userId: session.userId,
        name: name.slice(0, 120),
        sourceText: sourceText.slice(0, 40_000),
        sourceFile,
        parsed: parsed as unknown as Prisma.InputJsonValue,
      },
    });

    // Auto-activate if user has no active diet
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { activeDietId: true } });
    if (!user?.activeDietId) {
      await prisma.user.update({ where: { id: session.userId }, data: { activeDietId: diet.id } });
    }

    return NextResponse.json({ ok: true, diet });
  } catch (e) {
    return apiError(e);
  }
}

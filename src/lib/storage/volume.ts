import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';

function uploadsDir(): string {
  const dir = process.env.UPLOADS_DIR || './uploads';
  return path.resolve(dir);
}

async function ensureDir(): Promise<string> {
  const dir = uploadsDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export interface SaveImageResult {
  filename: string;
  absolutePath: string;
  bytes: number;
  width: number;
  height: number;
}

/**
 * Saves an image as a JPEG under UPLOADS_DIR, normalising orientation and
 * re-encoding at up to 1600px longest edge to keep storage bounded.
 */
export async function saveImage(input: Buffer): Promise<SaveImageResult> {
  const dir = await ensureDir();
  const filename = `${Date.now()}-${nanoid(8)}.jpg`;
  const absolutePath = path.join(dir, filename);

  const pipeline = sharp(input, { failOn: 'truncated' })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  await fs.writeFile(absolutePath, data);

  return {
    filename,
    absolutePath,
    bytes: info.size,
    width: info.width,
    height: info.height,
  };
}

export async function readImage(filename: string): Promise<Buffer> {
  if (filename.includes('/') || filename.includes('..')) {
    throw new Error('invalid filename');
  }
  const dir = uploadsDir();
  const p = path.join(dir, filename);
  return fs.readFile(p);
}

export async function deleteImage(filename: string): Promise<void> {
  if (!filename || filename.includes('/') || filename.includes('..')) return;
  const dir = uploadsDir();
  const p = path.join(dir, filename);
  try {
    await fs.unlink(p);
  } catch {
    /* ignore */
  }
}

export async function imageAsBase64DataUrl(input: Buffer): Promise<string> {
  const meta = await sharp(input).metadata();
  const mime = meta.format === 'png' ? 'image/png' : 'image/jpeg';
  const normalized = await sharp(input)
    .rotate()
    .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();
  return `data:${mime};base64,${normalized.toString('base64')}`;
}

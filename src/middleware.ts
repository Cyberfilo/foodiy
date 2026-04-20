import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

const PUBLIC_PATHS = new Set<string>([
  '/login',
  '/api/auth/login',
  '/api/auth/setup',
  '/api/auth/logout',
  '/api/health',
  '/manifest.webmanifest',
  '/icon.svg',
  '/favicon.ico',
  '/robots.txt',
]);

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/icon')) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set('x-user-id', session.userId);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icon.svg|favicon.ico|manifest.webmanifest).*)'],
};

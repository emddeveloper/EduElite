import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_ONLY_PREFIXES = ['/admin'];
const AUTH_PAGES = ['/login'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow next internal, static, api auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = Boolean(token?.user);

  // Redirect authenticated users away from /login
  if (AUTH_PAGES.includes(pathname)) {
    if (isAuthenticated) {
      // Role-based landing
      const role = (token as any).user?.role as string | undefined;
      const url = req.nextUrl.clone();
      if (role === 'admin') url.pathname = '/admin/dashboard';
      else url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    const role = (token as any).user?.role;
    if (role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // For all other app pages, require auth by default
  if (!isAuthenticated) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

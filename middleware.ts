import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight token check directly in middleware.
// Note: Decrypt session requires TextDecoder which is fully supported on Next.js Edge runtime.
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Path bypass for login
  if (pathname.startsWith('/login')) {
    if (session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Require session for all app screens
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo/images assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

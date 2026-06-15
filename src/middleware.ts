import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_TOKEN_COOKIE, hasValidAdminToken } from '@/lib/admin-auth'
 
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const hasValidSession = await hasValidAdminToken(token);

  // Check if the request is for the admin area
  if (path.startsWith('/admin')) {
    // Logic for login page
    if (path === '/admin/login') {
      if (hasValidSession) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Logic for protected admin pages
    if (!hasValidSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};

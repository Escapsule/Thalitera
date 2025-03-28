import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for authentication
 * 
 * Authentication Flow:
 * 1. Middleware checks for session cookies server-side
 * 2. If cookies are missing, user is redirected to login
 * 3. Client-side auth-helper.js runs on every page
 * 4. auth-helper checks localStorage and creates cookies if needed
 * 5. auth-helper also sets localStorage from cookies for state consistency
 * 
 * This multi-layered approach ensures authentication persists across
 * different scenarios and browser configurations.
 */

const THALITERA_SESSION_COOKIE_NAMES = [
  "THALITERA_SESSION_ID",
  "thalitera_session",
  "thalitera_auth",
  "thalitera-session-id"
];

export function middleware(request: NextRequest) {
  // Skip routes that should be accessible without authentication
  const { pathname } = request.nextUrl;
  
  // Log request path for debugging
  console.log(`Middleware processing: ${pathname}`);
  
  // Exclude debug and login routes from authentication check
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('/debug-dashboard') ||
    pathname.includes('/auth-debug') ||
    pathname.includes('/images/') ||
    pathname.includes('/fonts/') ||
    pathname.includes('/assets/') ||
    pathname.includes('.js') ||
    pathname.includes('.css')
  ) {
    console.log(`Skipping middleware for ${pathname}`);
    return NextResponse.next();
  }

  // Log all cookies for debugging
  const allCookies = request.cookies.getAll();
  console.log("All cookies in middleware:", allCookies.map(c => `${c.name}=${c.value}`).join('; ') || 'none');

  // Check for any of the session cookies
  const hasSessionCookie = THALITERA_SESSION_COOKIE_NAMES.some(name => 
    request.cookies.has(name)
  );

  // Get the bypass parameter (used in debugging)
  const bypassAuth = request.nextUrl.searchParams.get('bypassAuth') === 'true';
  
  console.log("Auth check:", { 
    path: pathname, 
    hasSessionCookie, 
    bypassAuth,
    cookieCount: allCookies.length
  });

  if (!hasSessionCookie && !bypassAuth) {
    console.log("No session cookie found and no bypass - redirecting to login");
    
    // Create a new URL to redirect to login
    const loginUrl = new URL('/login', request.url);
    
    // Add current path as a redirect parameter
    loginUrl.searchParams.set('redirect', pathname);
    
    // Add a timestamp to prevent caching
    loginUrl.searchParams.set('ts', Date.now().toString());
    
    return NextResponse.redirect(loginUrl);
  }

  console.log("Authentication passed - allowing access to protected route");
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except those starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public directory
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}; 
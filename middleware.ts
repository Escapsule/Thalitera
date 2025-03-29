import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for authentication
 * 
 * Authentication Flow:
 * 1. Middleware checks for session cookies server-side
 * 2. If cookies are missing, user is redirected to login
 * 3. Client-side auth logic creates cookies if needed
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
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/debug-dashboard',
    '/auth-debug',
    '/images/',
    '/fonts/',
    '/assets/',
    '.js',
    '.css'
  ];
  
  // If route is public, allow access without authentication
  if (publicRoutes.some(route => pathname.includes(route) || pathname.startsWith(route))) {
    console.log(`Skipping middleware for public route: ${pathname}`);
    return NextResponse.next();
  }

  // Log all cookies for debugging
  const allCookies = request.cookies.getAll();
  console.log("All cookies in middleware:", allCookies.map(c => `${c.name}=${c.value}`).join('; ') || 'none');

  // Check for any of the session cookies
  const hasSessionCookie = THALITERA_SESSION_COOKIE_NAMES.some(name => 
    request.cookies.has(name)
  );

  // Get forceBreak parameter (used only for breaking infinite redirect loops in debugging)
  const forceBreak = request.nextUrl.searchParams.get('forceBreak') === 'true';
  
  console.log("Auth check:", { 
    path: pathname, 
    hasSessionCookie, 
    forceBreak,
    cookieCount: allCookies.length
  });

  // If we have session cookies, allow access
  if (hasSessionCookie) {
    console.log("Authentication passed - allowing access to protected route");
    return NextResponse.next();
  }
  
  // If we get here, the user is not authenticated and trying to access a protected route
  console.log("No session cookie found - redirecting to login");
  
  // Create a new URL to redirect to login
  const loginUrl = new URL('/login', request.url);
  
  // Add current path as a redirect parameter
  loginUrl.searchParams.set('redirect', pathname);
  
  // Add a timestamp to prevent caching
  loginUrl.searchParams.set('ts', Date.now().toString());
  
  // Add a flag to indicate this came from middleware redirect
  loginUrl.searchParams.set('from', 'middleware');
  
  return NextResponse.redirect(loginUrl);
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
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the path is a protected route (dashboard or admin)
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  
  // Get the session cookie - session cookie might be named differently based on backend
  // Common names include 'session', 'JSESSIONID', 'connect.sid', etc.
  const session = request.cookies.get('session') || 
                 request.cookies.get('JSESSIONID') || 
                 request.cookies.get('connect.sid');
  
  // If it's a protected route and there's no session cookie, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}; 
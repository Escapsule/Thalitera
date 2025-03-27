import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the path is a protected route (dashboard or admin)
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  const isApiRoute = pathname.startsWith('/api');
  
  // For API routes, add CORS headers
  if (isApiRoute) {
    const response = NextResponse.next();
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    // Instead of wildcard, set the origin to the frontend URL to allow credentials
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    response.headers.set('Access-Control-Allow-Origin', origin);
    
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    
    return response;
  }
  
  // For protected routes, check authentication
  if (isProtectedRoute) {
    // Check for the THALITERA_SESSION_ID cookie specifically, which is set on login
    const sessionCookie = request.cookies.get('THALITERA_SESSION_ID') || 
                          request.cookies.get('session') || 
                          request.cookies.get('JSESSIONID') || 
                          request.cookies.get('connect.sid');
    
    // If it's a protected route and there's no session cookie, redirect to login
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // For all other routes, continue as normal
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/admin/:path*'],
}; 
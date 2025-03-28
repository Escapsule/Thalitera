import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for retrieving comprehensive authentication debug information
 */
export async function GET(request: NextRequest) {
  // Get cookies from request
  const cookies = request.cookies.getAll();
  const cookieStrings = cookies.map(c => `${c.name}=${c.value}`);
  
  // Get redirect count from request URL
  const { searchParams } = request.nextUrl;
  const redirectCount = parseInt(searchParams.get('redirectCount') || '0', 10);
  
  // Check if we have any session cookies
  const sessionCookieNames = [
    'THALITERA_SESSION_ID',
    'thalitera_session',
    'thalitera_auth',
    'thalitera-session-id',
    'alt_session',
    'fallback_session'
  ];
  
  const hasSessionCookie = sessionCookieNames.some(name => 
    cookies.some(c => c.name === name)
  );
  
  // Get user agent
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  
  // Build the debug response
  const debugInfo = {
    timestamp: new Date().toISOString(),
    cookies: cookieStrings,
    hasSessionCookie,
    userAgent,
    redirectCount,
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
  };
  
  // Return debug info
  return NextResponse.json(debugInfo, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json',
    },
  });
} 
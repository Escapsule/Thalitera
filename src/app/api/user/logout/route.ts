import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    // Forward all cookies from the client request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Get all cookies from the request and forward them
    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers['cookie'] = cookie;
    }

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/user/logout`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    // Get the response data
    const data = await response.json();

    // Create a new response with the data
    const nextResponse = NextResponse.json(data);

    // Forward any cookies from the backend response
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        nextResponse.headers.set(key, value);
      }
    });

    // Add clear cookie headers to ensure all session cookies are removed
    const clearCookies = [
      'THALITERA_SESSION_ID=; Path=/; HttpOnly; Max-Age=0',
      'THALITERA_SESSION_ID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'THALITERA_SESSION_ID=; Path=/; Domain=localhost; Max-Age=0',
      'thalitera_session=; Path=/; Max-Age=0',
      'thalitera_auth=; Path=/; Max-Age=0',
      'thalitera_session_marker=; Path=/; Max-Age=0'
    ];
    
    clearCookies.forEach(cookie => {
      nextResponse.headers.append('Set-Cookie', cookie);
    });

    return nextResponse;
  } catch (error) {
    console.error('API route error:', error);
    
    const errorResponse = NextResponse.json(
      {
        code: 500,
        message: 'An error occurred during logout',
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
    
    // Clear cookies even on error
    const clearCookies = [
      'THALITERA_SESSION_ID=; Path=/; HttpOnly; Max-Age=0',
      'THALITERA_SESSION_ID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'THALITERA_SESSION_ID=; Path=/; Domain=localhost; Max-Age=0',
      'thalitera_session=; Path=/; Max-Age=0',
      'thalitera_auth=; Path=/; Max-Age=0',
      'thalitera_session_marker=; Path=/; Max-Age=0'
    ];
    
    clearCookies.forEach(cookie => {
      errorResponse.headers.append('Set-Cookie', cookie);
    });
    
    return errorResponse;
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 
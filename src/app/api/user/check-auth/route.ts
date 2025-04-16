import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log('Backend URL:', backendUrl);
    
    // Forward all cookies from the client request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Get all cookies from the request
    const cookie = request.headers.get('cookie') || '';
    
    // Extract the THALITERA_SESSION_ID cookie specifically
    const sessionId = cookie.split(';')
      .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
      ?.split('=')[1] || '';
    
    console.log('Session ID from request:', sessionId ? 'Found' : 'Not found');
    
    if (cookie) {
      // Send the cookie header as-is
      headers['cookie'] = cookie;
      
      // Also send the specific session ID cookie for redundancy
      if (sessionId) {
        headers['Cookie'] = `THALITERA_SESSION_ID=${sessionId}`;
      }
    }

    console.log('Sending request to backend with cookies');
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/user/check-auth`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);
    
    // Get the response data
    const data = await response.json();

    // Create a new response with the data
    const nextResponse = NextResponse.json(data);

    // Forward any cookies from the backend response
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        console.log('Forwarding cookie from backend response');
        nextResponse.headers.set(key, value);
      }
    });

    return nextResponse;
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'An error occurred during auth check',
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
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
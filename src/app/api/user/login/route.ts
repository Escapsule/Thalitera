import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'localhost:8080';
    const body = await request.json();

    console.log(body);

    // Forward the request to the backend
    const response = await fetch(`http://${backendUrl}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Get the response data
    const data = await response.json();

    console.log(data);

    // Create a new response with the data
    const nextResponse = NextResponse.json(data);

    // Forward all headers for debugging
    console.log('All response headers:');
    response.headers.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    // Check for cookies in the response headers
    let cookiesFound = false;
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        // Parse the cookie to make sure SameSite and other attributes are set correctly
        console.log('Original cookie from backend:', value);
        
        // Forward the cookie as-is first
        nextResponse.headers.append('Set-Cookie', value);
        cookiesFound = true;
        
        // Parse the Set-Cookie value to extract the session ID for our own record
        const sessionIdMatch = value.match(/THALITERA_SESSION_ID=([^;]+)/);
        if (sessionIdMatch && sessionIdMatch[1]) {
          console.log(`Extracted session ID: ${sessionIdMatch[1].substring(0, 10)}...`);
          
          // Also set a backup cookie with explicit attributes for safety
          const secureCookie = `THALITERA_SESSION_ID=${sessionIdMatch[1]}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
          nextResponse.headers.append('Set-Cookie', secureCookie);
          console.log('Added backup cookie with explicit attributes');
        }
      }
    });

    // If no cookies were found but authentication was successful, set a fallback cookie
    if (!cookiesFound) {
      console.warn('No cookies received from backend response');
      
      // If backend doesn't set cookies but authentication was successful,
      // generate a temporary session ID as fallback
      if (data.code === 200) {
        const tempSessionId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const sessionCookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
        nextResponse.headers.set('Set-Cookie', sessionCookie);
        console.log('Manually set temporary session cookie as fallback');
      }
    }
    
    // Add a special header to make session visible to client-side JS for debugging
    if (data.code === 200) {
      nextResponse.headers.set('X-Session-Debug', 'session-active');
    }

    return nextResponse;
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'An error occurred during login',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 
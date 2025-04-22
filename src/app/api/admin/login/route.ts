import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const body = await request.json();

    console.log(body);

    // Create headers object for the backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward fingerprint if present in the request headers
    const fingerprint = request.headers.get('THALITERA_FINGERPRINT');
    if (fingerprint) {
      headers['THALITERA_FINGERPRINT'] = fingerprint;
      console.log('Forwarding fingerprint to backend:', fingerprint);
    }

    console.log(headers);

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/admin/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // Get the response data
    const data = await response.json();

    console.log('Backend response:', data);

    // Create a new response with the data
    // For non-200 codes, use an appropriate HTTP status
    const httpStatus = data.code === 200 ? 200 : 401;
    const nextResponse = NextResponse.json(data, { status: httpStatus });

    // Log all headers for debugging
    console.log('All response headers:');
    response.headers.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    // CRITICAL: For non-200 status codes, explicitly clear any session cookies
    // before forwarding anything from the backend
    if (data.code !== 200) {
      console.log(`Non-success status code ${data.code} - FORCIBLY clearing session cookies`);
      
      // First, clear any existing cookies multiple ways to ensure they're gone
      const clearCookies = [
        'THALITERA_SESSION_ID=; Path=/; HttpOnly; Max-Age=0',
        'THALITERA_SESSION_ID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'THALITERA_SESSION_ID=; Path=/; Domain=localhost; Max-Age=0',
        'thalitera_session=; Path=/; Max-Age=0',
        'thalitera_auth=; Path=/; Max-Age=0'
      ];
      
      clearCookies.forEach(cookie => {
        nextResponse.headers.set('Set-Cookie', cookie);
      });
      
      // Don't forward any Set-Cookie headers from the backend for non-success response.
      console.log('Intercepted and blocked backend cookies for non-success response.');
      
      return nextResponse;
    }
    
    // Only for status code 200, forward backend cookies:
    console.log('Success login with code 200 - forwarding session cookies');
    
    // Check for cookies in the response headers
    let hasForwardedCookies = false;
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        // Log the cookie we received
        console.log('Original cookie from backend:', value);
        
        // Forward the cookie as-is
        nextResponse.headers.append('Set-Cookie', value);
        hasForwardedCookies = true;
      }
    });

    // Log whether cookies were found and forwarded
    if (hasForwardedCookies) {
      console.log('Successfully forwarded cookies from backend');
    } else {
      console.log('No cookies found in backend response to forward');
    }

    // Add a special header to make session visible to client-side JS for debugging
    nextResponse.headers.set('X-Session-Debug', 'session-active');
    
    return nextResponse;
  } catch (error) {
    console.error('API route error:', error);
    
    // On error, make sure to clear any session cookies
    const errorResponse = NextResponse.json(
      {
        code: 500,
        message: 'An error occurred during login',
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
    
    // Clear all possible cookies
    const clearCookies = [
      'THALITERA_SESSION_ID=; Path=/; HttpOnly; Max-Age=0',
      'THALITERA_SESSION_ID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'thalitera_session=; Path=/; Max-Age=0',
      'thalitera_auth=; Path=/; Max-Age=0'
    ];
    
    clearCookies.forEach(cookie => {
      errorResponse.headers.set('Set-Cookie', cookie);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, THALITERA_FINGERPRINT',
      'Access-Control-Max-Age': '86400',
    },
  });
}
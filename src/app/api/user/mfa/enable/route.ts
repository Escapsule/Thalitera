import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const body = await request.json();
    
    // Validate request body
    if (!body.email || !body.totp_code) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Email and totp_code are required',
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log('MFA enable request body:', body);

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
    
    // Forward cookies if present
    const cookies = request.cookies.getAll();
    if (cookies.length > 0) {
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      headers['Cookie'] = cookieHeader;
    }
    
    // Forward request to the backend
    const response = await fetch(`${backendUrl}/user/mfa/enable`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });
    
    // Get the response data
    const data = await response.json();
    
    console.log('MFA enable response:', {
      code: data.code,
      message: data.message,
    });
    
    // Create a new response with the data
    const nextResponse = NextResponse.json(data);
    
    // Forward any cookies from the backend response
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        nextResponse.headers.append('Set-Cookie', value);
      }
    });
    
    return nextResponse;
  } catch (error) {
    console.error('MFA enable API route error:', error);
    
    return NextResponse.json(
      {
        code: 500,
        message: 'An error occurred during MFA enablement',
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, THALITERA_FINGERPRINT',
      'Access-Control-Max-Age': '86400',
    },
  });
} 
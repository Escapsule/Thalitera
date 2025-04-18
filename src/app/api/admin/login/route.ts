import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const body = await request.json();
    const fingerprint = request.headers.get('THALITERA_FINGERPRINT');

    // Transform the body to use 'email' instead of 'email_address'
    const transformedBody = {
      ...body,
      email: body.email_address,
    };
    delete transformedBody.email_address;

    console.log(transformedBody);
    
    // Create headers object for the backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward fingerprint if present
    if (fingerprint) {
      headers['THALITERA_FINGERPRINT'] = fingerprint;
    }

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/admin/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(transformedBody),
    });

    // Get the response data
    const data = await response.json();

    // Create a response with the data from backend
    const nextResponse = NextResponse.json(data, { status: data.code === 200 ? 200 : 401 });

    // If login was successful, set the session cookie
    if (data.code === 200) {
      // Forward cookies from backend if present
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          nextResponse.headers.append('Set-Cookie', value);
        }
      });

      // Always set our own session cookie regardless of backend cookies
      const sessionId = `${Date.now()}_${fingerprint || 'unknown'}`;
      nextResponse.headers.set(
        'Set-Cookie',
        `THALITERA_SESSION_ID=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
      );
      
      console.log("Admin cookie set:", sessionId);
    }

    return nextResponse;
  } catch (error) {
    console.error('Admin login error:', error);
    
    return NextResponse.json(
      {
        code: 500,
        message: "An error occurred during admin login",
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
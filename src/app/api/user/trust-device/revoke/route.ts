import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL);
    
    // Get the session ID cookie from the request
    const cookie = request.headers.get('cookie') || '';
    const sessionId = cookie.split(';')
      .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
      ?.split('=')[1] || '';
    
    // Get fingerprint to revoke from request body
    const body = await request.json();
    const { fingerprint } = body;
    
    if (!fingerprint) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Device fingerprint is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Send revoke request to backend
    const response = await fetch(`${backendUrl}/user/trust-device/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      body: JSON.stringify({ fingerprint }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to revoke trusted device:', errorText);
      
      return NextResponse.json(
        {
          code: response.status,
          message: `Failed to revoke trusted device: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 
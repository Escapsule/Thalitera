import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL);
    
    // Get the session ID cookie from the request
    const cookie = request.headers.get('cookie') || '';
    const sessionId = cookie.split(';')
      .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
      ?.split('=')[1] || '';

    // Get the fingerprint from query parameters
    const { searchParams } = new URL(request.url);
    const fingerprint = searchParams.get('fingerprint');

    // Get fingerprint from request header if available, otherwise use the query parameter
    const fingerprintHeader = request.headers.get('THALITERA_FINGERPRINT') || fingerprint;

    if (!fingerprint) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Fingerprint parameter is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Delete trusted device from backend
    const response = await fetch(`${backendUrl}/user/trust-device/delete?fingerprint=${fingerprint}`, {
      method: 'GET',
      headers: {
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
        'THALITERA_FINGERPRINT': fingerprintHeader || ''
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete trusted device:', errorText);
      
      return NextResponse.json(
        {
          code: response.status,
          message: `Failed to delete trusted device: ${response.statusText}`,
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

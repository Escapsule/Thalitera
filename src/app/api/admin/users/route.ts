import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log('Backend URL:', backendUrl);
    
    // Get the session ID cookie from the request
    const cookie = request.headers.get('cookie') || '';
    const sessionId = cookie.split(';')
      .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
      ?.split('=')[1] || '';
    
    console.log('Session ID from request:', sessionId ? 'Found' : 'Not found');
    
    if (!sessionId) {
      console.warn('No session ID found in request cookies');
      return NextResponse.json(
        {
          code: 401,
          message: 'Unauthorized: No session ID found',
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Make the request to the backend
    const response = await fetch(`${backendUrl}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('Error response body:', text);
      
      // Return appropriate status code
      return NextResponse.json(
        {
          code: response.status,
          message: `Backend error: ${response.statusText}`,
          data: null,
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
        message: 'Failed to obtain user information',
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 
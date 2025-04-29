import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    // Get the session ID cookie from the request
    const cookie = request.headers.get('cookie') || '';
    const sessionId = cookie.split(';')
      .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
      ?.split('=')[1] || '';
    
    if (!sessionId) {
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

    // Get request body
    const body = await request.json();
    const { user_id, status } = body;

    // Make the request to the backend
    const response = await fetch(`${backendUrl}/admin/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      body: JSON.stringify({ user_id, status }),
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Error response body:', text);
      
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
        message: 'Failed to update user status',
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

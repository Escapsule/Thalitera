import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// Update user information
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(body);

    // Get the session ID cookie from the request
    const cookie = request.headers.get('cookie') || '';
    const sessionId = cookie.split(';')
      .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
      ?.split('=')[1] || '';
    
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

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/user/profile/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
        },
        body: JSON.stringify(body),
        credentials: 'include',
    });
  
    // Get the response data
    const data = await response.json();
    console.log(data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Failed to update user information',
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    // Get the username from the request URL
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Bad Request: Username is required',
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Validate username format
    if (!/^[\w\u4e00-\u9fa5]{2,24}$/.test(username)) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Bad Request: Username must be 2-24 characters and can only contain letters, numbers, underscores, or Chinese characters',
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
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

    // Make the request to the backend
    const response = await fetch(`${backendUrl}/user/update-info?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
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
    
    // Normalize the data structure to ensure both username and user_name are available
    if (data.data) {
      // Make sure user_name is available if username exists
      if (data.data.username && !data.data.user_name) {
        data.data.user_name = data.data.username;
      }
      // Make sure username is available if user_name exists
      else if (data.data.user_name && !data.data.username) {
        data.data.username = data.data.user_name;
      }
    }
    
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

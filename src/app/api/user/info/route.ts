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
    const response = await fetch(`${backendUrl}/user/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      credentials: 'include',
    });


    console.log('Response status:', response.status);
    console.log('Response:', response);

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
      
      // Ensure avatar is properly handled
      // If avatar is null, set it to an empty string to avoid issues in the frontend
      if (data.data.avatar === null) {
        data.data.avatar = '';
      }
    }
    
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
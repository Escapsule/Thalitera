import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log('Backend URL:', backendUrl);
    
    // Forward all cookies from the client request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Get all cookies from the request
    const cookie = request.headers.get('cookie') || '';
    
    // Extract the THALITERA_SESSION_ID cookie specifically
    const sessionId = cookie.split(';')
      .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
      ?.split('=')[1] || '';
    
    console.log('Session ID from request:', sessionId ? 'Found' : 'Not found');
    
    if (cookie) {
      // Send the cookie header as-is
      headers['cookie'] = cookie;
      
      // Also send the specific session ID cookie for redundancy
      if (sessionId) {
        headers['Cookie'] = `THALITERA_SESSION_ID=${sessionId}`;
      }
    }

    console.log('Sending request to backend with cookies');
    

    const response = await fetch(`${backendUrl}/user/info`, {
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
      throw new Error(`HTTP error! status: ${response.status}`);
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
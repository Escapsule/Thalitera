import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

    // 获取 UUID 字符串
    const uuid = await request.json();

    // 直接 POST 到后端
    const response = await fetch(`${backendUrl}/admin/reservation/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      body: JSON.stringify(uuid),
      credentials: 'include',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Failed to cancel reservation',
        data: null,
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
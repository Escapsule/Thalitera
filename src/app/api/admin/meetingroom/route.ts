import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL);
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const sessionId = cookie.split(';')
      .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
      ?.split('=')[1] || '';

    console.log('Backend URL:', backendUrl);
    console.log('Session ID:', sessionId);

    const response = await fetch(`${backendUrl}/admin/meetingroom/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      credentials: 'include',
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const text = await response.text();
      console.error('Error response body:', text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Unexpected content type:', contentType);
      console.error('Response body:', text);
      throw new Error('Expected JSON response but got: ' + contentType);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
        data: [],
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
} 
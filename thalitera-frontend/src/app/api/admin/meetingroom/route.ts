import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL);
    const headers = req.headers;
    
    console.log('Backend URL in API route:', backendUrl);

    if (!backendUrl) {
      return NextResponse.json(
        {
          code: 500,
          message: 'Backend URL is not defined',
          data: [],
          timestamp: Date.now(),
        },
        { status: 500 }
      );
    }

    const baseUrl = backendUrl.startsWith('http://') || backendUrl.startsWith('https://') 
      ? backendUrl 
      : `http://${backendUrl}`;

    console.log('Fetching from:', `${baseUrl}/admin/meetingroom/all`);

    const response = await fetch(`${baseUrl}/admin/meetingroom/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        cookie: headers.get('cookie') || '', 
      },
      credentials: 'include',
      cache: 'no-store',
    });

    console.log('API route response status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.log('Error response body:', text);
      return NextResponse.json(
        {
          code: response.status,
          message: `Backend server error: ${response.statusText}`,
          data: [],
          timestamp: Date.now(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.log('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: `Internal server error: ${error instanceof Error ? error.message : String(error)}`,
        data: [],
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

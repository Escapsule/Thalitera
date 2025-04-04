import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'k1ng.tech:8080';

    // Forward the request to the backend
    const response = await fetch(`http://${backendUrl}/meetingroom/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Get the response data
    const data = await response.json();
    console.log('Backend response:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Failed to get meeting room data',
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

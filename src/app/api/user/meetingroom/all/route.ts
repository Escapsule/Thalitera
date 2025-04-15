import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'k1ng.tech:8080';
    // TODO: Replace with actual API call to your backend
    const response = await fetch(`http://${backendUrl}/meetingroom/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// Get user information
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(body)

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/user/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  
    // Get the response data
    const data = await response.json();
    console.log(data)

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
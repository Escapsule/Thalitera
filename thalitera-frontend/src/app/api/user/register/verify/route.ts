import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    // Get token and email from URL params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (!token || !email) {
      return NextResponse.json({
        code: 400,
        message: 'Missing token or email parameters',
        data: null,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }
    
    console.log('Verification request:', { token, email });

    // Forward the verification request to the backend
    const response = await fetch(`${backendUrl}/user/verify?token=${token}&email=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Get the response data
    const data = await response.json();
    console.log('Backend verification response:', data);

    return NextResponse.json(data, { 
      status: data.code === 200 ? 200 : 400 
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'An error occurred during email verification',
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
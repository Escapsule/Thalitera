import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    // Get email from URL params
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Email parameter is required',
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Create headers object for the backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Forward request to the backend
    const response = await fetch(`${backendUrl}/user/mfa/setup?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    
    // Get the response data
    const data = await response.json();
    
    console.log('MFA setup response:', {
      code: data.code,
      message: data.message,
      hasQrCode: !!data.data?.qrCode,
      hasRecoveryCodes: Array.isArray(data.data?.recoveryCodes),
    });
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('MFA setup API route error:', error);
    
    return NextResponse.json(
      {
        code: 500,
        message: 'An error occurred during MFA setup',
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
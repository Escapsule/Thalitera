import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface LoginHistoryRequest {
  start_time?: string;
  end_time?: string;
  success?: boolean;
}

export async function POST(request: Request) {
  try {
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL);
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const sessionId = cookie.split(';')
      .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
      ?.split('=')[1] || '';

    // Get query parameters from request body (all optional)
    const body = await request.json().catch(() => ({}));
    
    console.log("Login history request body:", body);
    
    // Prepare the request body with optional parameters
    const requestBody: LoginHistoryRequest = {};
    
    if (body.start_time) {
      requestBody.start_time = body.start_time;
    }
    
    if (body.end_time) {
      requestBody.end_time = body.end_time;
    }
    
    if (body.success !== undefined) {
      requestBody.success = body.success;
      console.log("Setting success filter:", body.success);
    }
    
    console.log("Request body being sent to backend:", requestBody);
    
    // Send the request to the backend
    const response = await fetch(`${backendUrl}/user/login-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      body: JSON.stringify(requestBody),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login history retrieval error:', errorText);
      
      return NextResponse.json(
        {
          code: response.status,
          message: `Failed to retrieve login history: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // console.log("Login history response from backend:", JSON.stringify(data));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

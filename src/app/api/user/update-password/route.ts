import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL);
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const sessionId = cookie.split(';')
      .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
      ?.split('=')[1] || '';

    // Get password data from request body
    const passwordData = await request.json();
    
    // Validate request body
    if (!passwordData.old_password || !passwordData.new_password) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Old password and new password are required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Send the password change request to the backend
    const response = await fetch(`${backendUrl}/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      body: JSON.stringify({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Password update error:', errorText);
      
      return NextResponse.json(
        {
          code: response.status,
          message: `Password update failed: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();
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

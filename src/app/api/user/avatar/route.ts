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

    // Get the form data from the request
    const formData = await request.formData();
    
    // Ensure action is set to avatar (lowercase)
    formData.set('action', 'avatar');
    
    console.log('Form data:', formData);
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/files/upload`, {
      method: 'POST',
      headers: {
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
        // Don't set Content-Type header, let the browser set it with the correct boundary
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Avatar upload error:', errorText);
      
      return NextResponse.json(
        {
          code: response.status,
          message: `Avatar upload failed: ${response.statusText}`,
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

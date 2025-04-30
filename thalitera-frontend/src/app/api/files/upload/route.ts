import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL);
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const sessionId = cookie.split(';')
      .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
      ?.split('=')[1] || '';

    // Get form data from request
    const formData = await request.formData();
    
    console.log('Uploading file with form data:', {
      action: formData.get('action'),
      roomId: formData.get('roomId'),
      file: formData.get('file') ? 'File present' : 'No file'
    });

    const response = await fetch(`${backendUrl}/files/upload`, {
      method: 'POST',
      headers: {
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      body: formData,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('Error response body:', text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Failed to upload file',
        data: null,
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

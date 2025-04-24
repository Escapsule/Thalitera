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

    // Get query parameters from request body (all optional)
    const body = await request.json().catch(() => ({}));
    
    console.log("delete meeting room request:", body);
    console.log('Forwarding request to backend:', `${backendUrl}/admin/meetingroom/delete`);

    // Verify password
    if (body.adminPassword) {
      console.log('Verifying admin password');
      
      const verifyResponse = await fetch(`${backendUrl}/admin/operation-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
        },
        body: body.adminPassword,
        credentials: 'include',
      });
      
      if (!verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        return NextResponse.json(verifyData);
      }

      const verifyData = await verifyResponse.json();
      if (verifyData.code !== 200) {
        return NextResponse.json(verifyData);
      }
    }
    
    // Delete meeting room
    console.log('Forwarding delete request to backend:', `${backendUrl}/admin/meetingroom/delete`);
    
    const roomIds = body.room_ids || [];
    console.log('Room IDs to delete:', roomIds);

    const response = await fetch(`${backendUrl}/admin/meetingroom/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      body: JSON.stringify(roomIds),
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
        message: 'Failed to delete meeting room',
        data: null,
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
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

    // Get reservation ID from request body
    const { reservationId } = await request.json();
    
    console.log('Cancel reservation request received for ID:', reservationId);
    
    if (!reservationId) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Reservation ID must be provided',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Send the cancellation request to the backend
    const response = await fetch(`${backendUrl}/user/meetingroom/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      body: JSON.stringify(reservationId),
      credentials: 'include',
    });

    console.log('Backend response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cancellation error:', errorText);
      
      return NextResponse.json(
        {
          code: response.status,
          message: `Cancellation failed: ${response.statusText}`,
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
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

    // Get booking data from request body
    const bookingData = await request.json();
    
    // Send the booking request to the backend
    const response = await fetch(`${backendUrl}/user/meetingroom/booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      body: JSON.stringify({
        room_id: bookingData.room_id,
        attendees: bookingData.attendees || [],
        purpose: bookingData.purpose || '',
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Booking error:', errorText);
      
      return NextResponse.json(
        {
          code: response.status,
          message: `Booking failed: ${response.statusText}`,
          timestamp: Date.now(),
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
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

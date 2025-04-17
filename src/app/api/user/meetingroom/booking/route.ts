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
    
    console.log('Booking data received:', bookingData);
    
    // Verify the timestamps are in correct format (ISO 8601 with timezone offset)
    // The format should be like: 2025-04-16T09:13:18.123-07:00
    const startTime = bookingData.start_time;
    const endTime = bookingData.end_time;
    
    // Make sure the timestamp strings are properly formatted
    if (typeof startTime !== 'string' || typeof endTime !== 'string') {
      return NextResponse.json(
        {
          code: 400,
          message: 'Start time and end time must be provided as ISO strings with timezone offset',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
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
        start_time: startTime,
        end_time: endTime,
      }),
      credentials: 'include',
    });

    console.log('Backend response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Booking error:', errorText);
      
      return NextResponse.json(
        {
          code: response.status,
          message: `Booking failed: ${response.statusText}`,
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

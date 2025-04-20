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

    // Get update data from request body
    const updateData = await request.json();
    
    console.log('Update data received:', updateData);
    
    // Validate required fields
    if (!updateData.reservation_id) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Reservation ID is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Verify timestamps if provided
    if (updateData.start_time && typeof updateData.start_time !== 'string') {
      return NextResponse.json(
        {
          code: 400,
          message: 'Start time must be provided as ISO string with timezone offset',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    if (updateData.end_time && typeof updateData.end_time !== 'string') {
      return NextResponse.json(
        {
          code: 400,
          message: 'End time must be provided as ISO string with timezone offset',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Send the update request to the backend
    const response = await fetch(`${backendUrl}/user/meetingroom/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      body: JSON.stringify({
        reservation_id: updateData.reservation_id,
        room_id: updateData.room_id,
        attendees: updateData.attendees || [],
        purpose: updateData.purpose || '',
        start_time: updateData.start_time,
        end_time: updateData.end_time,
      }),
      credentials: 'include',
    });

    console.log('Backend response:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update error:', errorData);
      
      // Handle specific error for unfound email
      if (errorData.code === 2001) {
        return NextResponse.json(
          {
            code: 2001,
            message: errorData.message || `${errorData.data} not found`,
            data: null,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        {
          code: response.status,
          message: errorData.message || `Update failed: ${response.statusText}`,
          data: null,
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
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

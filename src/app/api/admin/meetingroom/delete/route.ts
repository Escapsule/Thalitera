import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL);
    const { room_id, admin_password } = await request.json();

    console.log('Forwarding delete request to backend:', `http://${backendUrl}/admin/meetingroom/delete`);

    const response = await fetch(`http://${backendUrl}/admin/meetingroom/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room_id, admin_password }),
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
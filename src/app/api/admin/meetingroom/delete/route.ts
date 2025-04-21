import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL);
    const requestData = await request.json();
    
    const room_id = Array.isArray(requestData) ? requestData[0] : requestData.room_id;
    const password = requestData.password;
    // Verify password
    const confirmResponse = await fetch(`http://${backendUrl}/admin/operation-confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: password,
      credentials: 'include',
    });

    const confirmData = await confirmResponse.json();

    if (confirmData.code !== 200) {
      return NextResponse.json(
        {
          code: 401,
          message: 'Password verification failed',
          data: null,
          timestamp: Date.now(),
        },
        { status: 401 }
      );
    }

    // Delete meeting room
    const deleteResponse = await fetch(`http://${backendUrl}/admin/meetingroom/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([room_id]),
      credentials: 'include',
    });

    const deleteData = await deleteResponse.json();
    return NextResponse.json(deleteData);
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

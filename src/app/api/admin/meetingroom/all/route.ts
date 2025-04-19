import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL);
    
    // 确保 backendUrl 格式正确
    const baseUrl = backendUrl.startsWith('http://') || backendUrl.startsWith('https://') 
      ? backendUrl 
      : `http://${backendUrl}`;
    
    console.log('Forwarding GET request to backend:', `${baseUrl}/admin/meetingroom/all`);

    const response = await fetch(`${baseUrl}/admin/meetingroom/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('Error response body:', text);
      return NextResponse.json(
        {
          code: response.status,
          message: `Backend server error: ${response.status}`,
          data: null,
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
        message: '获取会议室列表失败',
        data: null,
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
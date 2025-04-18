import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Define interfaces for the backend response
interface MeetingRoom {
  reservation_id: string;
  room_id: string;
  image: string | null;
  name: string;
  capacity_min: number;
  capacity_max: number;
  building: string;
  floor: string;
  status: string;
  facilities: {
    projector: boolean;
    whiteboard: number;
    [key: string]: boolean | number | string;
  };
}

interface CalendarItem {
  reservation_id: string;
  start_time: string;
  end_time: string;
  meeting_room: MeetingRoom;
  status?: string;
}

// 修正异常日期的函数
function normalizeDate(dateString: string): string {
  // 检查日期是否包含异常年份格式(+57xxx)
  if (dateString.startsWith('+')) {
    try {
      // 提取日期的月、日、时间部分
      const parts = dateString.split('T');
      if (parts.length !== 2) return dateString;
      
      const datePart = parts[0];
      const timePart = parts[1];
      
      // 提取月和日
      const dateComponents = datePart.split('-');
      if (dateComponents.length !== 3) return dateString;
      
      // 用当前年份+10年替换异常年份，保持月日和时间不变
      const currentYear = new Date().getFullYear() + 10;
      const month = dateComponents[1];
      const day = dateComponents[2];
      
      return `${currentYear}-${month}-${day}T${timePart}`;
    } catch (error) {
      console.error('Error normalizing date:', error);
      return dateString;
    }
  }
  return dateString;
}

export async function GET() {
  try {
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL);
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const sessionId = cookie.split(';')
      .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
      ?.split('=')[1] || '';

    if (!sessionId) {
      return NextResponse.json(
        {
          code: 401,
          message: 'Authentication required',
          data: [],
          timestamp: Date.now(),
        },
        { status: 401 }
      );
    }

    const response = await fetch(`${backendUrl}/user/meetingroom/reservations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
      },
      credentials: 'include',
    });



    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Calendar API error (${response.status}):`, errorText);
      
      return NextResponse.json(
        {
          code: response.status,
          message: response.statusText || 'Failed to fetch calendar data',
          data: [],
          timestamp: Date.now(),
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Unexpected content type:', contentType);
      return NextResponse.json(
        {
          code: 500,
          message: 'Invalid response format from server',
          data: [],
          timestamp: Date.now(),
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Transform the data to match the frontend expected format
    // The frontend expects a specific format for reservations
    if (data && data.data && Array.isArray(data.data)) {
      const transformedData = {
        ...data,
        data: data.data.map((item: CalendarItem) => {
          // 修正日期
          const normalizedStartTime = normalizeDate(item.start_time);
          const normalizedEndTime = normalizeDate(item.end_time);
          
          return {
            reservation_id: item.reservation_id,
            room_id: item.meeting_room?.room_id,
            room_name: item.meeting_room?.name,
            user_id: '', // Backend doesn't provide this directly
            start_time: normalizedStartTime,
            end_time: normalizedEndTime,
            created_at: '', // Backend doesn't provide this
            updated_at: '', // Backend doesn't provide this
            attendees: [], // Backend doesn't provide this
            purpose: '', // Backend doesn't provide this
            status: item.status, // Use the original status if available
          };
        })
      };

      // console.log('Transformed data:', transformedData);
      
      return NextResponse.json(transformedData);
    }

    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Calendar API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
        data: [],
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

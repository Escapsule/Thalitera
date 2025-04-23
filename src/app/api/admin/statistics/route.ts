import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log('Backend URL:', backendUrl);
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Received dates:', { startDate, endDate });

    // Verify required parameters and format
    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Missing required parameters: startDate and endDate',
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate date values and format
    try {
      // Clean up spaces in the date string to ensure proper formatting
      const cleanDate = (dateStr: string) => {
        // Replace spaces with T
        return dateStr.replace(/\s+/, 'T');
      };

      const cleanStartDate = cleanDate(startDate);
      const cleanEndDate = cleanDate(endDate);

      const start = new Date(cleanStartDate);
      const end = new Date(cleanEndDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json(
          {
            code: 400,
            message: 'Invalid date format. Please provide dates in ISO 8601 format',
            data: null,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // Format dates to ISO 8601 with timezone
      const formatDateToISO = (date: Date) => {
        // Get time zone offset (in minutes)
        const tzOffset = -date.getTimezoneOffset();
        const diff = tzOffset >= 0 ? '+' : '-';
        const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
        const hours = pad(tzOffset / 60);
        const minutes = pad(tzOffset % 60);
        
        // Build a date string in ISO 8601 format
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hour = pad(date.getHours());
        const minute = pad(date.getMinutes());
        const second = pad(date.getSeconds());
        
        return `${year}-${month}-${day}T${hour}:${minute}:${second}${diff}${hours}:${minutes}`;
      };

      const formattedStartDate = formatDateToISO(start);
      const formattedEndDate = formatDateToISO(end);

      console.log('Formatted dates:', { formattedStartDate, formattedEndDate });

      // Get session ID
      const cookie = request.headers.get('cookie') || '';
      const sessionId = cookie.split(';')
        .find((c: string) => c.trim().startsWith('THALITERA_SESSION_ID='))
        ?.split('=')[1] || '';
      
      console.log('Session ID from request:', sessionId ? 'Found' : 'Not found');

      if (!sessionId) {
        console.warn('No session ID found in request cookies');
        return NextResponse.json(
          {
            code: 401,
            message: 'Unauthorized: No session ID found',
            data: null,
            timestamp: new Date().toISOString(),
          },
          { status: 401 }
        );
      }

      // Call backend API with formatted dates
      const response = await fetch(
        `${backendUrl}/admin/statistics/meeting-room-utilization?startDate=${encodeURIComponent(formattedStartDate)}&endDate=${encodeURIComponent(formattedEndDate)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `THALITERA_SESSION_ID=${sessionId}`,
          },
          credentials: 'include',
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response body:', text);
        return NextResponse.json(
          {
            code: response.status,
            message: `Backend server error: ${response.status} ${response.statusText}`,
            data: null,
            timestamp: new Date().toISOString(),
          },
          { status: response.status }
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error('Failed to parse backend response:', error);
        return NextResponse.json(
          {
            code: 500,
            message: 'Failed to parse backend response',
            data: null,
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }

      if (!data) {
        console.error('Backend returned empty response');
        return NextResponse.json(
          {
            code: 500,
            message: 'Backend returned empty response',
            data: null,
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }

      // Ensure a response in standard format is returned
      return NextResponse.json({
        code: 200,
        message: 'Success',
        data: Array.isArray(data) ? data : (data.data || []),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('API route error:', error);
      return NextResponse.json(
        {
          code: 500,
          message: error instanceof Error ? error.message : 'Failed to retrieve meeting room utilization statistics',
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: error instanceof Error ? error.message : 'Failed to retrieve meeting room utilization statistics',
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

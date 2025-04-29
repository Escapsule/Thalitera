/**
 * Get booking statistics
 * @returns an object containing the number of bookings for today
 */
export const getBookingStats = async (): Promise<{ bookingsToday: number }> => {
  try {
    const response = await fetch(`/api/admin/reservations`, {
      method: 'GET',
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Calculate the number of bookings for today
      let bookingsToday = 0;
      
      data.data.forEach((booking: any) => {
        // Process start time
        let startTime: Date;
        if (booking.start_time.toString().startsWith('+')) {
          const [year, month, day, hour, minute, second] = booking.start_time.toString()
            .match(/\+(\d{5})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/)!
            .slice(1)
            .map(Number);
          startTime = new Date(year, month - 1, day, hour, minute, second);
        } else {
          startTime = new Date(booking.start_time);
        }

        // Process end time
        let endTime: Date;
        if (booking.end_time.toString().startsWith('+')) {
          const [year, month, day, hour, minute, second] = booking.end_time.toString()
            .match(/\+(\d{5})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/)!
            .slice(1)
            .map(Number);
          endTime = new Date(year, month - 1, day, hour, minute, second);
        } else {
          endTime = new Date(booking.end_time);
        }
        
        // Calculate the number of bookings for today
        if (
          booking.status !== 'canceled' && // The status is not canceled
          (
            // The booking start time is today
            (startTime >= today && startTime < tomorrow) ||
            // The booking end time is today
            (endTime >= today && endTime < tomorrow) ||
            // The booking spans today
            (startTime < today && endTime >= tomorrow)
          )
        ) {
          bookingsToday++;
        }
      });
      
      return {
        bookingsToday
      };
    } else {
      console.error(data.message || 'Failed to retrieve booking records');
      return { bookingsToday: 0 };
    }
  } catch (error) {
    console.error('Failed to retrieve booking statistics:', error);
    return { bookingsToday: 0 };
  }
};

/**
 * Get meeting room statistics
 * @param startDate start date
 * @param endDate end date
 * @param roomId room ID (optional)
 * @returns meeting room statistics data array
 */
export const getRoomUtilizationStats = async (
  startDate: string,
  endDate: string,
  roomId?: string
): Promise<{
  room_id: string;
  room_name: string;
  booked_hours: number;
  available_hours: number;
  utilization_rate: number;
}[]> => {
  try {
    // Verify date format
    if (!startDate || !endDate) {
      throw new Error('The start date and end date cannot be empty');
    }

    // Clean up spaces in the date string to ensure proper formatting
    const cleanDate = (dateStr: string) => {
      // Replace spaces with T
      return dateStr.replace(/\s+/, 'T');
    };

    const cleanStartDate = cleanDate(startDate);
    const cleanEndDate = cleanDate(endDate);

    // Verification date range
    const start = new Date(cleanStartDate);
    const end = new Date(cleanEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }

    // Ensure that the date range is reasonable
    if (start > end) {
      throw new Error('The start date cannot be later than the end date');
    }

    // Limit query scope (e.g. maximum query for one year)
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() > oneYearInMs) {
      throw new Error('The query time range cannot exceed one year');
    }

    console.log('Fetching room utilization stats:', {
      startDate: cleanStartDate,
      endDate: cleanEndDate,
      roomId
    });

    // Build API parameters
    let url = `/api/admin/statistics?startDate=${encodeURIComponent(cleanStartDate)}&endDate=${encodeURIComponent(cleanEndDate)}`;
    if (roomId) {
      url += `&roomId=${encodeURIComponent(roomId)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch statistics:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to get statistics: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse response as JSON:', error);
      throw new Error('Invalid response format from server');
    }
    
    if (!data) {
      console.error('API returned empty response');
      throw new Error('API returned empty response');
    }

    // Check response format
    if (typeof data !== 'object') {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from server');
    }

    // If the backend returns an array of data directly, wrap it in a standard format
    if (Array.isArray(data)) {
      return data;
    }

    // Check standard response format
    if (data.code === undefined || data.message === undefined) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response structure from server');
    }

    if (data.code !== 200) {
      console.error('API returned error:', {
        code: data.code,
        message: data.message,
        data: data.data
      });
      throw new Error(data.message || `API error: ${data.code}`);
    }

    // Ensure that the returned data is an array
    if (!Array.isArray(data.data)) {
      console.error('Invalid data format:', data.data);
      throw new Error('Invalid data format from server');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching room utilization statistics:', error);
    throw error;
  }
};

/**
 * Get booking statistics
 * @returns an object containing the number of bookings for today
 */
export const getBookingStats = async (): Promise<{ bookingsToday: number }> => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backendUrl}/admin/reservations`, {
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
 * @returns meeting room statistics data array
 */
export const getRoomUtilizationStats = async (
  startDate: string,
  endDate: string
): Promise<{
  room_id: string;
  room_name: string;
  booked_hours: number;
  available_hours: number;
  utilization_rate: number;
}[]> => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log('Fetching room utilization stats:', {
      url: `${backendUrl}/admin/statistics/meeting-room-utilization`,
      params: { startDate, endDate }
    });

    const response = await fetch(
      `${backendUrl}/admin/statistics/meeting-room-utilization?startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Room utilization stats response:', data);

    // If the return is an array, return it directly
    if (Array.isArray(data)) {
      return data;
    }

    // If the return is a wrapped object, check the code
    if (data.code === 200) {
      return data.data;
    }

    console.error('Unexpected response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching room utilization statistics:', {
      error,
      startDate,
      endDate
    });
    return [];
  }
};

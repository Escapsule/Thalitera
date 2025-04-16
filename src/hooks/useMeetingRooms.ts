import { useState, useEffect } from 'react';
import { MeetingRoom, MeetingRoomResponse } from '@/types/meeting-room';

export const useMeetingRooms = () => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/user/meetingroom/all');
        const data: MeetingRoomResponse = await response.json();

        if (data.code === 200) {
          setRooms(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch meeting rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return { rooms, loading, error };
}; 
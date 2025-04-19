import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, Mail, UserRound, MapPin, Clock3 } from 'lucide-react'

type Reservation = {
  reservation_id: string;
  room_id: string;
  room_name: string;
  building: string;
  floor: number;
  user_id: string;
  user_name: string;
  start_time: number;
  end_time: number;
  created_at: number;
  updated_at: number;
  attendees: Array<{
    user_id: string;
    avatar: string;
    username: string;
    email: string;
    status: string;
    created_at: number;
    updated_at: number;
  }>;
  purpose: string;
  status: string;
}

type UserDetailProps = {
  user: {
    user_id: string
    avatar?: string
    username: string
    email: string
    status: string // active, locked, disabled, admin, pending
    created_at?: string
    update_at?: string
  }
  isOpen: boolean
  onClose: () => void
}

const UserDetail = ({ user, isOpen, onClose }: UserDetailProps) => {
  const [nextReservation, setNextReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNextReservation();
    }
  }, [isOpen, user.user_id]);

  const fetchNextReservation = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${backendUrl}/admin/reservations`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      console.log('All reservations:', data);
      
      if (data.code === 200) {
        const now = Math.floor(Date.now() / 1000);
        console.log('Current timestamp:', now);
        console.log('User ID:', user.user_id);
        
        // Find all valid bookings for this user
        const userReservations = data.data.filter((reservation: Reservation) => {
          // Handle time format
          let startTime: number;
          let endTime: number;
          
          if (reservation.start_time.toString().startsWith('+')) {
            const [year, month, day, hour, minute, second] = reservation.start_time.toString()
              .match(/\+(\d{5})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/)!
              .slice(1)
              .map(Number);
            const date = new Date(year, month - 1, day, hour, minute, second);
            startTime = Math.floor(date.getTime() / 1000);
          } else {
            startTime = Math.floor(new Date(reservation.start_time).getTime() / 1000);
          }

          if (reservation.end_time.toString().startsWith('+')) {
            const [year, month, day, hour, minute, second] = reservation.end_time.toString()
              .match(/\+(\d{5})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/)!
              .slice(1)
              .map(Number);
            const date = new Date(year, month - 1, day, hour, minute, second);
            endTime = Math.floor(date.getTime() / 1000);
          } else {
            endTime = Math.floor(new Date(reservation.end_time).getTime() / 1000);
          }

          const isCurrentUser = reservation.user_id === user.user_id;
          const isConfirmed = reservation.status === 'confirmed';
          const isCurrentBooking = startTime <= now && endTime > now;
          const isFutureBooking = startTime > now;

          console.log('Checking reservation:', {
            reservation_user_id: reservation.user_id,
            current_user_id: user.user_id,
            status: reservation.status,
            start_time: reservation.start_time,
            start_time_timestamp: startTime,
            end_time: reservation.end_time,
            end_time_timestamp: endTime,
            now: now,
            isCurrentUser,
            isConfirmed,
            isCurrentBooking,
            isFutureBooking,
            shouldShow: isCurrentUser && isConfirmed && (isCurrentBooking || isFutureBooking)
          });

          return isCurrentUser && isConfirmed && (isCurrentBooking || isFutureBooking);
        });
        
        console.log('Filtered reservations:', userReservations);
        
        // Sort by start time to find the most recent booking
        const nextReservation = userReservations
          .sort((a: Reservation, b: Reservation) => {
            const getTimestamp = (time: string | number) => {
              if (time.toString().startsWith('+')) {
                const [year, month, day, hour, minute, second] = time.toString()
                  .match(/\+(\d{5})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/)!
                  .slice(1)
                  .map(Number);
                const date = new Date(year, month - 1, day, hour, minute, second);
                return Math.floor(date.getTime() / 1000);
              }
              return Math.floor(new Date(time).getTime() / 1000);
            };
            return getTimestamp(a.start_time) - getTimestamp(b.start_time);
          })[0];
        
        console.log('Next reservation:', nextReservation);
        setNextReservation(nextReservation || null);
      }
    } catch (error) {
      console.error('Failed to fetch next reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (time: string | number): string => {
    try {
      let date: Date;
      if (typeof time === 'string') {
        if (time.startsWith('+')) {
          // Handle extended ISO format
          const [year, month, day, hour, minute, second] = time
            .match(/\+(\d{5})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/)!
            .slice(1)
            .map(Number);
          date = new Date(year, month - 1, day, hour, minute, second);
        } else {
          // Processing standard ISO format
          date = new Date(time);
        }
      } else {
        // Handle timestamp
        date = new Date(time * 1000);
      }
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date format:', time);
        return "Invalid date format";
      }
      
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Invalid date format";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
              ) : (
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                user.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : user.status === 'locked'
                ? 'bg-red-100 text-red-800'
                : user.status === 'disabled'
                ? 'bg-gray-100 text-gray-800'
                : user.status === 'admin'
                ? 'bg-blue-100 text-blue-800'
                : user.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Basic information */}
          <div className="grid gap-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-[lch(17_23_133)]" />
                <div className="text-sm">
                  <span>Username: {user.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[lch(17_23_133)]" />
                <div className="text-sm">
                  <span>Email: {user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Reservation */}
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Current or Next Reservation</h3>
            {loading ? (
              <div className="border rounded-lg p-4 text-center">
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : nextReservation ? (
              <div className="border rounded-lg p-4">
                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Room: </span>
                      {nextReservation.room_name} ({nextReservation.building}, Floor {nextReservation.floor})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Time: </span>
                      {formatDate(nextReservation.start_time)} - {formatDate(nextReservation.end_time)}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Purpose: </span>
                    {nextReservation.purpose}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Status: </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      nextReservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      nextReservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      nextReservation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {nextReservation.status.charAt(0).toUpperCase() + nextReservation.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4 text-center">
                <p className="text-gray-600">No current or upcoming reservation</p>
              </div>
            )}
          </div>

          {/* Account Information */}
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Account Information</h3>
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                {user.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span>Created: {formatDate(user.created_at)}</span>
                    </div>
                  </div>
                )}
                {user.update_at && (
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span>Last Updated: {formatDate(user.update_at)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserDetail 
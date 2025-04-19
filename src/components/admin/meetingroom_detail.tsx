"use client"

import { MapPin, Users, CheckCircle2, CalendarCheck, Clock, BarChart2, User2, Clock3 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState, useEffect } from 'react';
import { getRoomUtilizationStats } from '@/lib/admin/statistic';

// Define the type for the room data
type Room = {
  // Fields returned by API
  room_id: string
  image: string
  name: string
  status: string // 'active' | 'maintenance' | 'using' | 'booked' | 'deleted'
  capacity_min: number
  capacity_max: number
  building: string
  floor: string
  facilities: {
    projector: boolean | null
    whiteboard: number | null
    power_sockets: number | null
    coffee_break: boolean | null
    special_notes: string[] | null
  }
}

// 添加预订类型定义
type Reservation = {
  reservation_id: string;
  room_id: string;
  room_name: string;
  building: string;
  floor: number;
  user_id: string;
  user_name: string;
  start_time: string | number;
  end_time: string | number;
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

interface RoomDetailProps {
  room: {
    room_id: string;
    name: string;
    status: string;
    capacity_min: number;
    capacity_max: number;
    building: string;
    floor: string;
    image?: string;
    facilities: {
      projector: boolean | null;
      whiteboard: number | null;
      power_sockets: number | null;
      coffee_break: boolean | null;
      special_notes: string[] | null;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

interface RoomStats {
  room_id: string;
  room_name: string;
  booked_hours: number;
  available_hours: number;
  utilization_rate: number;
}

export function RoomDetail({ room, isOpen, onClose }: RoomDetailProps) {
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
  const [nextReservation, setNextReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    if (isOpen && room) {
      console.log('Opening room detail for:', room);
      fetchRoomStats();
      fetchReservations();
    }
  }, [isOpen, room]);

  const fetchRoomStats = async () => {
    setLoading(true);
    try {
      // 计算最近七天的日期范围
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      console.log('Fetching stats for room:', room.room_id);
      const allStats = await getRoomUtilizationStats(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      console.log('All stats:', allStats);
      // 找到当前会议室的统计数据
      const roomStats = allStats.find(stat => stat.room_id === room.room_id);
      console.log('Found room stats:', roomStats);
      setStats(roomStats || null);
    } catch (error) {
      console.error('Failed to fetch room stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimestamp = (time: string | number): number => {
    try {
      if (time.toString().startsWith('+')) {
        // 处理扩展ISO格式（如 +57267-09-26T08:00:00Z）
        const [year, month, day, hour, minute, second] = time.toString()
          .match(/\+(\d{5})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/)!
          .slice(1)
          .map(Number);
        const date = new Date(year, month - 1, day, hour, minute, second);
        const timestamp = Math.floor(date.getTime() / 1000);
        console.log('Extended ISO format:', {
          original: time,
          parsed: { year, month, day, hour, minute, second },
          timestamp
        });
        return timestamp;
      } else {
        // 处理标准ISO格式（如 2025-04-18T12:00:00Z）
        const date = new Date(time);
        const timestamp = Math.floor(date.getTime() / 1000);
        console.log('Standard ISO format:', {
          original: time,
          timestamp
        });
        return timestamp;
      }
    } catch (error) {
      console.error('Error converting timestamp:', error, 'for time:', time);
      return 0;
    }
  };

  const fetchReservations = async () => {
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
        
        // 找到该会议室的所有有效预订
        const roomReservations = data.data
          .filter((reservation: Reservation) => {
            const isMatch = reservation.room_id === room.room_id && 
                          reservation.status !== 'canceled';
            console.log('Checking reservation:', {
              room_id: reservation.room_id,
              status: reservation.status,
              start_time: reservation.start_time,
              end_time: reservation.end_time,
              isMatch
            });
            return isMatch;
          });

        console.log('Filtered room reservations:', roomReservations);

        // 计算每个预订与当前时间的距离，只考虑当前和未来的预订
        const reservationsWithDistance = roomReservations
          .map((reservation: Reservation) => {
            const startTime = getTimestamp(reservation.start_time);
            const endTime = getTimestamp(reservation.end_time);
            let distance: number;

            if (startTime <= now && endTime > now) {
              // 当前正在进行的预订，距离为0
              distance = 0;
            } else if (startTime > now) {
              // 未来的预订，距离为开始时间与当前时间的差值
              distance = startTime - now;
            } else {
              // 过去的预订，距离设为无穷大，这样会被排序到最后
              distance = Infinity;
            }

            console.log('Reservation distance calculation:', {
              startTime,
              endTime,
              now,
              distance
            });

            return {
              ...reservation,
              distance
            };
          })
          // 过滤掉过去的预订（距离为无穷大的预订）
          .filter((reservation: any) => reservation.distance !== Infinity);

        console.log('Reservations with distance:', reservationsWithDistance);

        // 按距离排序，找到最近的预订
        const nearestReservation = reservationsWithDistance
          .sort((a: any, b: any) => a.distance - b.distance)[0];

        console.log('Nearest reservation:', nearestReservation);

        if (nearestReservation) {
          // 根据预订时间判断是当前预订还是下一个预订
          const startTime = getTimestamp(nearestReservation.start_time);
          const endTime = getTimestamp(nearestReservation.end_time);

          if (startTime <= now && endTime > now) {
            console.log('Setting current reservation');
            setCurrentReservation(nearestReservation);
            setNextReservation(null);
          } else {
            console.log('Setting next reservation');
            setCurrentReservation(null);
            setNextReservation(nearestReservation);
          }
        } else {
          console.log('No current or future reservation found');
          setCurrentReservation(null);
          setNextReservation(null);
        }
      } else {
        console.error('Failed to fetch reservations:', data);
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const formatDate = (time: string | number): string => {
    try {
      let date: Date;
      if (time.toString().startsWith('+')) {
        // 处理扩展ISO格式（如 +57267-09-26T08:00:00Z）
        const [year, month, day, hour, minute, second] = time.toString()
          .match(/\+(\d{5})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/)!
          .slice(1)
          .map(Number);
        date = new Date(year, month - 1, day, hour, minute, second);
      } else {
        // 处理标准ISO格式（如 2025-04-18T12:00:00Z）
        date = new Date(time);
      }
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date format:', time);
        return "Invalid date format";
      }
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Invalid date format";
    }
  };

  if (!room) return null

  const roomData = {
    name: room.name,
    building: room.building,
    floor: room.floor,
    capacity_min: room.capacity_min,
    capacity_max: room.capacity_max,
    status: room.status,
    facilities: room.facilities,
    image: room.image
  }

  // Get status badge color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', text: 'Available' }
      case 'maintenance':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Maintenance' }
      case 'using':
        return { color: 'bg-blue-100 text-blue-800', text: 'In Use' }
      case 'booked':
        return { color: 'bg-purple-100 text-purple-800', text: 'Booked' }
      case 'deleted':
        return { color: 'bg-red-100 text-red-800', text: 'Deleted' }
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Unknown' }
    }
  }

  const statusInfo = getStatusInfo(roomData.status)

  // Generate facility list
  const generateFacilitiesList = () => {
    const facilitiesList = [];
    
    // Add facilities of boolean type
    if (roomData.facilities.projector) {
      facilitiesList.push("Projector");
    }
    if (roomData.facilities.coffee_break) {
      facilitiesList.push("Coffee Break");
    }
    
    // Add facilities of numerical type
    if (roomData.facilities.whiteboard && roomData.facilities.whiteboard > 0) {
      facilitiesList.push(`${roomData.facilities.whiteboard} Whiteboard${roomData.facilities.whiteboard > 1 ? 's' : ''}`);
    }
    if (roomData.facilities.power_sockets && roomData.facilities.power_sockets > 0) {
      facilitiesList.push(`${roomData.facilities.power_sockets} Power Socket${roomData.facilities.power_sockets > 1 ? 's' : ''}`);
    }
    
    // Add special notes
    if (roomData.facilities.special_notes && roomData.facilities.special_notes.length > 0) {
      facilitiesList.push(...roomData.facilities.special_notes);
    }
    
    return facilitiesList;
  }

  const facilitiesList = generateFacilitiesList();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[lch(17_23_133)]">{roomData.name}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex justify-between items-start">
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {roomData.image && (
          <div className="w-full h-48 overflow-hidden rounded-md mb-4">
            <img 
              src={roomData.image} 
              alt={roomData.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/400x200?text=No+Image";
              }}
            />
          </div>
        )}

        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[lch(17_23_133)]" />
              <div className="text-sm">
                <span className="font-medium">Location: </span>
                {roomData.building}, Floor {roomData.floor}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[lch(17_23_133)]" />
              <div className="text-sm">
                <span className="font-medium">Capacity: </span>
                {roomData.capacity_min} - {roomData.capacity_max} people
              </div>
            </div>
          </div>
          
          {/* Facilities */}
          {facilitiesList.length > 0 && (
            <div className="rounded-md border p-3">
              <h4 className="text-sm font-medium mb-2">Facilities</h4>
              <div className="grid grid-cols-2 gap-2">
                {facilitiesList.map((facility, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[lch(83_56_130)]" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics for the past seven days */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Last 7 Days Usage</h3>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : stats ? (
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-gray-500" />
                    <h4 className="text-sm text-gray-500">Booked hours</h4>
                  </div>
                  <p className="text-lg font-medium text-gray-900">{stats.booked_hours.toFixed(1)} hours</p>
                </div>
                <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-gray-500" />
                    <h4 className="text-sm text-gray-500">Available hours</h4>
                  </div>
                  <p className="text-lg font-medium text-gray-900">{stats.available_hours.toFixed(1)} hours</p>
                </div>
                <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-gray-500" />
                    <h4 className="text-sm text-gray-500">Utilization rate</h4>
                  </div>
                  <p className="text-lg font-medium text-gray-900">{(stats.utilization_rate * 100).toFixed(1)}%</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600">No data</p>
              </div>
            )}
          </div>

          {/* Current/Next Reservation */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Reservation Status</h3>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : currentReservation ? (
              <div className="border rounded-lg p-4">
                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <User2 className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Booked by: </span>
                      {currentReservation.user_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Time: </span>
                      {formatDate(currentReservation.start_time)} - {formatDate(currentReservation.end_time)}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Purpose: </span>
                    {currentReservation.purpose}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Status: </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      currentReservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      currentReservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      currentReservation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentReservation.status.charAt(0).toUpperCase() + currentReservation.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ) : nextReservation ? (
              <div className="border rounded-lg p-4">
                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Next booking by: </span>
                      {nextReservation.user_name}
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
        </div>
      </DialogContent>
    </Dialog>
  )
} 
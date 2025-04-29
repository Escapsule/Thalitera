"use client"
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DoorClosed, Calendar, BarChart2, Users2, UserRound, CalendarCheck, Users, Search } from 'lucide-react'
import { RoomDetail } from "@/components/admin/meetingroom_detail"
import RoomCharts from "@/components/admin/RoomCharts"
import UserDetail from "@/components/admin/user_detail"
import { getBookingStats } from '@/lib/admin/statistic'

// Define types for room data
type Room = {
  room_id: string
  image: string
  name: string
  status: 'active' | 'maintenance' | 'using' | 'booked' | 'deleted'
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
  currentReservation?: {
    user_id: string
    username: string
    start_time: string
    end_time: string
    purpose: string
    status: string
  }
}

// Define types for user data
type User = {
  user_id: string
  avatar?: string
  username: string
  email: string
  status: string // active, locked, disabled, admin, pending
  created_at?: string
  update_at?: string
  currentReservation?: {
    room_name: string
    building: string
    floor: number
    start_time: string
    end_time: string
    purpose: string
    status: string
  }
}

// Pagination props
type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Statistical card component
 */
interface StatCardProps {
  title: string
  value: number
  suffix?: string
  icon?: React.ReactNode
  className?: string
}

/**
 * Card container component
 */
interface CardProps {
  children: React.ReactNode
  title: string
}

const Card = ({ children, title }: CardProps) => (
  <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="flex-1 flex flex-col min-h-0">
      {children}
    </div>
  </div>
)

const StatCard = ({ title, value, suffix = '', icon, className }: StatCardProps) => (
  <div className="bg-white p-3 rounded-lg shadow-md h-full">
    <div className="flex items-start justify-between mb-1 h-[32px]">
      <h3 className={`text-gray-500 ${className || 'text-sm'} break-words max-w-[70%] line-clamp-2`}>{title}</h3>
      {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
    </div>
    <div className="h-[32px] flex items-center">
      <p className="text-lg sm:text-xl font-semibold break-all">
        {value.toLocaleString()}{suffix}
      </p>
    </div>
  </div>
)

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const [inputPage, setInputPage] = useState(currentPage.toString())

  // Sync input value with current page
  useEffect(() => {
    setInputPage(currentPage.toString())
  }, [currentPage])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setInputPage(value)
    }
  }

  // Handle input submit
  const handleInputSubmit = () => {
    const page = parseInt(inputPage)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    } else {
      // Reset to current page if invalid
      setInputPage(currentPage.toString())
    }
  }

  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit()
    }
  }

  return (
    <div className="flex justify-center items-center gap-1 text-sm">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-0.5 text-xs rounded border disabled:opacity-50"
      >
        Previous
      </button>
      <div className="flex items-center gap-1">
        <span className="text-xs">Page</span>
        <input
          title="Page Number"
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onBlur={handleInputSubmit}
          className="w-8 px-1 py-0.5 text-xs text-center border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-xs"> of {totalPages} </span>
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-0.5 text-xs rounded border disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )
}

// Define the types of user statistical data
type UserStats = {
  totalUsers: number
  activeUsers: number
  bookingsToday: number
}

// Get the color and text of the meeting room status
const getRoomStatusInfo = (status: string) => {
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

// Helper function to format dates
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "Unknown";
  }
  
  try {
    let date: Date;
    
    // Processing+YYYY-MM-DDTHH: mm: ssZ format
    if (dateString.toString().startsWith('+')) {
      const [year, month, day, hour, minute, second] = dateString.toString()
        .match(/\+(\d{5})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/)!
        .slice(1)
        .map(Number);
      date = new Date(year, month - 1, day, hour, minute, second);
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return "Unknown";
    }
    
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error("Date formatting error:", error, "for date:", dateString);
    return "Unknown";
  }
};

/**
 * Skeleton Screen Component - Meeting Room List
 */
const RoomSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="border rounded-lg p-4 animate-pulse">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </div>
    ))}
  </div>
)

/**
 * Skeleton Screen Component - User List
 */
const UserSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="border rounded-lg p-4 animate-pulse">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    ))}
  </div>
)

/**
 * Admin dashboard page component
 */
const DashboardPage = () => {
  // State definition
  const [roomStats, setRoomStats] = useState({
    totalRooms: 0,
    activeBookings: 0,
    utilizationRate: 0
  })

  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    bookingsToday: 0
  })

  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  // Meeting room pagination status
  const [roomCurrentPage, setRoomCurrentPage] = useState(1)

  // User status
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false)
  const [userCurrentPage, setUserCurrentPage] = useState(1)

  const [roomSearchQuery, setRoomSearchQuery] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')

  const roomItemsPerPage = 4;
  const userItemsPerPage = 5; 

  // Meeting room pagination calculation
  const filteredRooms = rooms
    .filter(room => room.status !== 'deleted')
    .filter(room => room.name.toLowerCase().includes(roomSearchQuery.toLowerCase()))
  const roomTotalPages = Math.ceil(filteredRooms.length / roomItemsPerPage);
  const currentRooms = filteredRooms.slice(
    (roomCurrentPage - 1) * roomItemsPerPage,
    roomCurrentPage * roomItemsPerPage
  );

  // User pagination calculation
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(userSearchQuery.toLowerCase())
  )
  const userTotalPages = Math.ceil(filteredUsers.length / userItemsPerPage);
  const currentUsers = filteredUsers.slice(
    (userCurrentPage - 1) * userItemsPerPage,
    userCurrentPage * userItemsPerPage
  );

  // Meeting room pagination handling function
  const handleRoomPageChange = (page: number) => {
    setRoomCurrentPage(page)
  }

  // User pagination handling function
  const handleUserPageChange = (page: number) => {
    setUserCurrentPage(page)
  }

  const [userReservations, setUserReservations] = useState<{[key: string]: any}>({});
  const [roomReservations, setRoomReservations] = useState<{[key: string]: any}>({});

  /**
   * Get meeting room statistics data
   */
  const fetchRoomStats = async () => {
    // Only set loading state on initial load
    if (rooms.length === 0) {
      setIsLoadingRooms(true)
    }
    
    try {
      // Call API to retrieve conference room data
      const response = await fetch(`/api/admin/meetingroom/all`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.code === 200) {
        const newRooms = data.data;
        
        // Only update if data has changed
        if (JSON.stringify(rooms) !== JSON.stringify(newRooms)) {
          setRooms(newRooms);
          
          // Only calculate conference rooms whose status is not deleted
          const activeRooms = newRooms.filter((room: Room) => room.status !== 'deleted');
          
          // Count the number of meeting rooms in use
          const activeBookings = activeRooms.filter((room: Room) => room.status === 'using').length;
          
          // Calculate utilization rate: current number of meeting rooms in use divided by total number of active meeting rooms
          const utilizationRate = (activeBookings / activeRooms.length) * 100;
          
          setRoomStats({
            totalRooms: activeRooms.length,
            activeBookings: activeBookings,
            utilizationRate: utilizationRate
          });
        }
      } else {
        console.error(data.message || 'Failed to get meeting room list');
        useFallbackData();
      }
    } catch (error) {
      console.error('Failed to get meeting room statistics data:', error);
      useFallbackData();
    } finally {
      setIsLoadingRooms(false)
    }
  }

  // Function to use fallback data
  const useFallbackData = () => {
    const fallbackRooms: Room[] = [
      {
        room_id: "room-1",
        name: "Conference Room A",
        image: "",
        status: "active",
        capacity_min: 4,
        capacity_max: 12,
        building: "Building A",
        floor: "2",
        facilities: {
          projector: true,
          whiteboard: 2,
          power_sockets: 8,
          coffee_break: true,
          special_notes: ["Large conference room with projector"]
        }
      },
      {
        room_id: "room-2",
        name: "Meeting Room B",
        image: "",
        status: "maintenance",
        capacity_min: 2,
        capacity_max: 6,
        building: "Building A",
        floor: "1",
        facilities: {
          projector: false,
          whiteboard: 1,
          power_sockets: 4,
          coffee_break: false,
          special_notes: ["Medium-sized meeting room"]
        }
      }
    ];
    setRooms(fallbackRooms);
    setRoomStats({
      totalRooms: fallbackRooms.length,
      activeBookings: 0,
      utilizationRate: 0
    });
  }

  const fetchUserStats = async () => {
    // Only set loading state on initial load
    if (users.length === 0) {
      setIsLoadingUsers(true)
    }
    
    try {
      // Call API to retrieve user data
      const response = await fetch(`/api/admin/users`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.code === 200) {
        const formattedUsers = data.data.map((user: any) => ({
          user_id: user.user_id,
          avatar: user.avatar || "",
          username: user.username,
          email: user.email,
          status: user.status,
          created_at: user.created_at,
          update_at: user.updated_at
        }));
        
        // Only update if data has changed
        if (JSON.stringify(users) !== JSON.stringify(formattedUsers)) {
          const { bookingsToday } = await getBookingStats();
          
          setUsers(formattedUsers);
          setUserStats({
            totalUsers: formattedUsers.length,
            activeUsers: formattedUsers.filter((user: User) => user.status === 'active').length,
            bookingsToday: bookingsToday
          });
        }
      } else {
        console.error(data.message || 'Failed to get user list');
        useFallbackUserData();
      }
    } catch (error) {
      console.error('Failed to get user statistics data:', error);
      useFallbackUserData();
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Function to use fallback user data
  const useFallbackUserData = () => {
    const fallbackUsers = [
      {
        user_id: "1",
        username: "John",
        email: "john@example.com",
        status: "active",
        avatar: "",
        created_at: new Date().toISOString(),
        update_at: new Date().toISOString()
      }
    ];
    setUsers(fallbackUsers as User[]);
    setUserStats({
      totalUsers: fallbackUsers.length,
      activeUsers: 0,
      bookingsToday: 0
    });
  }

  const fetchUserReservations = async () => {
    try {
      const response = await fetch(`/api/admin/reservations`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.code === 200) {
        const now = Math.floor(Date.now() / 1000);
        const reservationsMap: {[key: string]: any} = {};
        
        data.data.forEach((reservation: any) => {
          const userId = reservation.user_id;
          if (!reservationsMap[userId]) {
            reservationsMap[userId] = null;
          }

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

          const isConfirmed = reservation.status === 'confirmed';
          const isCurrentBooking = startTime <= now && endTime > now;
          const isFutureBooking = startTime > now;

          if (isConfirmed && (isCurrentBooking || isFutureBooking)) {
            const currentReservation = reservationsMap[userId];
            if (!currentReservation || startTime < new Date(currentReservation.start_time).getTime() / 1000) {
              reservationsMap[userId] = reservation;
            }
          }
        });
        
        setUserReservations(reservationsMap);
      }
    } catch (error) {
      console.error('Failed to fetch user reservations:', error);
    }
  };

  const fetchRoomReservations = async () => {
    try {
      const response = await fetch(`/api/admin/reservations`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.code === 200) {
        const now = Math.floor(Date.now() / 1000);
        const reservationsMap: {[key: string]: any} = {};
        
        data.data.forEach((reservation: any) => {
          const roomId = reservation.room_id;
          if (!reservationsMap[roomId]) {
            reservationsMap[roomId] = null;
          }

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

          const isConfirmed = reservation.status === 'confirmed';
          const isCurrentBooking = startTime <= now && endTime > now;
          const isFutureBooking = startTime > now;

          if (isConfirmed && (isCurrentBooking || isFutureBooking)) {
            const currentReservation = reservationsMap[roomId];
            if (!currentReservation || startTime < new Date(currentReservation.start_time).getTime() / 1000) {
              reservationsMap[roomId] = {
                user_id: reservation.user_id,
                username: reservation.username,
                start_time: reservation.start_time,
                end_time: reservation.end_time,
                purpose: reservation.purpose,
                status: reservation.status
              };
            }
          }
        });
        
        setRoomReservations(reservationsMap);
      }
    } catch (error) {
      console.error('Failed to fetch room reservations:', error);
    }
  };

  // When the component is loaded, get the data
  useEffect(() => {
    fetchRoomStats()
    fetchUserStats()
    fetchUserReservations()
    fetchRoomReservations()
    
    // Set a timer to refresh every 5 minutes
    const timer = setInterval(() => {
      fetchRoomStats()
      fetchUserStats()
      fetchUserReservations()
      fetchRoomReservations()
    }, 300000) // Refresh every 5 minutes

    return () => clearInterval(timer)
  }, [])

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room)
    setIsDetailOpen(true)
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsUserDetailOpen(true)
  }

  return (
    <div className="flex min-h-[95cvh] flex-col py-6 ml-12">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="ml-auto flex items-center gap-4">
          <Avatar>
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>TH</AvatarFallback>
          </Avatar>
        </div>
      </header>
      
      <div className="flex flex-1 justify-center">
        <main className="flex-1 p-4 md:p-6 min-w-[80vw] max-w-[80vw] mx-auto">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="w-full min-w-0">
                <Card title="Meeting Room Usage">
                  <div className="flex flex-col h-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <StatCard
                        title="Total Rooms"
                        value={roomStats.totalRooms}
                        icon={<DoorClosed className="w-4 h-4 sm:w-5 sm:h-5" />}
                        className="text-xs"
                      />
                      <StatCard
                        title="Currently in Use"
                        value={roomStats.activeBookings}
                        icon={<CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />}
                        className="text-xs"
                      />
                      <StatCard
                        title="Utilization Rate"
                        value={roomStats.utilizationRate}
                        suffix="%"
                        icon={<BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                        className="text-xs"
                      />
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                        <h3 className="text-lg font-medium">Meeting Rooms</h3>
                        <div className="relative w-full sm:w-64">
                          <input
                            type="text"
                            placeholder="Search Room..."
                            value={roomSearchQuery}
                            onChange={(e) => {
                              setRoomSearchQuery(e.target.value)
                              setRoomCurrentPage(1)
                            }}
                            className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto mb-1">
                        <div className="space-y-4">
                          {isLoadingRooms ? (
                            <RoomSkeleton />
                          ) : (
                            currentRooms.map((room) => (
                              <div
                                key={room.room_id}
                                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleViewRoom(room)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-medium">{room.name}</h4>
                                    <p className="text-sm text-gray-500">{room.building}, Floor {room.floor}</p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    getRoomStatusInfo(room.status).color
                                  }`}>
                                    {getRoomStatusInfo(room.status).text}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    <span>Capacity: {room.capacity_min} - {room.capacity_max} people</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="sticky bottom-0 bg-white border-t">
                        <div className="py-1">
                          <Pagination
                            currentPage={roomCurrentPage}
                            totalPages={roomTotalPages}
                            onPageChange={handleRoomPageChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right - User Statistics Card */}
              <div className="w-full min-w-0">
                <Card title="User Usage">
                  <div className="flex flex-col h-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <StatCard
                        title="Total Users"
                        value={userStats.totalUsers}
                        icon={<Users2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                        className="text-xs"
                      />
                      <StatCard
                        title="Active Users"
                        value={userStats.activeUsers}
                        icon={<UserRound className="w-4 h-4 sm:w-5 sm:h-5" />}
                        className="text-xs"
                      />
                      <StatCard
                        title="Bookings Today"
                        value={userStats.bookingsToday}
                        icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
                        className="text-xs"
                      />
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                        <h3 className="text-lg font-medium">Users</h3>
                        <div className="relative w-full sm:w-64">
                          <input
                            type="text"
                            placeholder="Search User Name..."
                            value={userSearchQuery}
                            onChange={(e) => {
                              setUserSearchQuery(e.target.value)
                              setUserCurrentPage(1)
                            }}
                            className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto mb-1">
                        <div className="space-y-4">
                          {isLoadingUsers ? (
                            <UserSkeleton />
                          ) : (
                            currentUsers.map((user) => (
                              <div
                                key={user.user_id}
                                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleViewUser(user)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                          {user.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                                        user.status === 'active' 
                                          ? 'bg-green-500' 
                                          : user.status === 'locked'
                                          ? 'bg-red-500'
                                          : user.status === 'disabled'
                                          ? 'bg-gray-500'
                                          : user.status === 'admin'
                                          ? 'bg-blue-500'
                                          : user.status === 'pending'
                                          ? 'bg-yellow-500'
                                          : 'bg-gray-500'
                                      }`} />
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{user.username}</span>
                                      </div>
                                      <span className="text-xs text-gray-500">Last Active: {user.update_at ? formatDate(user.update_at) : "Unknown"}</span>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                                {userReservations[user.user_id] && (
                                  <div className="mt-2 text-xs pl-10">
                                    <span className="text-gray-500">Current/Next Booking: </span>
                                    <span className="font-medium">{userReservations[user.user_id].meeting_room.name}</span>
                                    <span className="text-gray-500"> ({formatDate(userReservations[user.user_id].start_time)})</span>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="sticky bottom-0 bg-white border-t">
                        <div className="py-1">
                          <Pagination
                            currentPage={userCurrentPage}
                            totalPages={userTotalPages}
                            onPageChange={handleUserPageChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Statistics Chart Area */}
            <div className="w-full min-w-0">
              <Card title="Meeting Room Booking Preference Analysis">
                <div className="w-full overflow-x-auto">
                  <RoomCharts rooms={rooms} />
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Room Detail Dialog */}
      {selectedRoom && (
        <RoomDetail
          room={selectedRoom}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}

      {/* User Detail Dialog */}
      {selectedUser && (
        <UserDetail
          user={selectedUser}
          isOpen={isUserDetailOpen}
          onClose={() => setIsUserDetailOpen(false)}
        />
      )}
    </div>
  )
}

export default DashboardPage
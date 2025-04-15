"use client"
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DoorClosed, Calendar, BarChart2, Users2, UserRound, CalendarCheck, Users, Search } from 'lucide-react'
import { RoomDetail } from "@/components/admin/meetingroom_detail"
import RoomCharts from "@/components/admin/RoomCharts"
import UserDetail from "@/components/admin/user_detail"

// Define types for room data
type Room = {
  id: number
  name: string
  capacity: number
  location: string
  description: string
  facilities: {
    projecter: boolean | null
    whiteboard: number | null
    power_sockets: number | null
    coffee_break: boolean | null
    special_notes: string[] | null
  }
  status: 'available' | 'booked' | 'in_use' | 'maintenance'
  utilizationRate: number
  currentBookings: {
    id: number
    startTime: string
    endTime: string
    userName: string
    purpose: string
  }[]
  weeklyStats: {
    totalHours: number
    averageUtilization: number
    peakHours: string[]
  }
}

// Define types for user data
type User = {
  id: number
  name: string
  email: string
  status: 'online' | 'offline'
  lastLogin: string
  totalBookings: number
  currentBookings: {
    id: number
    roomName: string
    startTime: string
    endTime: string
    purpose: string
  }[]
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
      <h3 className={`text-gray-500 ${className || 'text-xs'} break-words max-w-[70%] line-clamp-2`}>{title}</h3>
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
        previous page
      </button>
      <div className="flex items-center gap-1">
        <span className="text-xs">page</span>
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onBlur={handleInputSubmit}
          className="w-8 px-1 py-0.5 text-xs text-center border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-xs">, total {totalPages} pages</span>
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-0.5 text-xs rounded border disabled:opacity-50"
      >
        next page
      </button>
    </div>
  )
}

// 首先定义用户统计数据的类型
type UserStats = {
  totalUsers: number
  activeUsers: number
  bookingsToday: number
}

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
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(roomSearchQuery.toLowerCase())
  )
  const roomTotalPages = Math.ceil(filteredRooms.length / roomItemsPerPage);
  const currentRooms = filteredRooms.slice(
    (roomCurrentPage - 1) * roomItemsPerPage,
    roomCurrentPage * roomItemsPerPage
  );

  // User pagination calculation
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    user.id.toString().includes(userSearchQuery)
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

  /**
   * Get meeting room statistics data
   */
  const fetchRoomStats = async () => {
    try {
      // Import mock data
      const { rooms: mockRooms } = await import('@/lib/admin/mock_data')
      
      // Format room data
      const formattedRooms = mockRooms.map((room) => ({
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        location: room.location,
        description: room.description,
        facilities: room.facilities,
        status: room.status as 'available' | 'booked' | 'in_use' | 'maintenance',
        utilizationRate: room.utilizationRate,
        currentBookings: room.currentBookings || [],
        weeklyStats: room.weeklyStats
      }))
      
      console.log('Formatted rooms:', formattedRooms)
      setRooms(formattedRooms)
      setRoomStats({
        totalRooms: formattedRooms.length,
        activeBookings: formattedRooms.filter((room: Room) => 
          room.status === 'booked' || room.status === 'in_use'
        ).length,
        utilizationRate: (formattedRooms.filter((room: Room) => 
          room.status === 'booked' || room.status === 'in_use'
        ).length / formattedRooms.length) * 100
      })
    } catch (error) {
      console.error('Failed to get meeting room statistics:', error)
      // If import fails, use hardcoded mock data
      const fallbackRooms: Room[] = [
        {
          id: 1,
          name: "Conference Room A",
          capacity: 12,
          location: "Building A, Floor 2",
          description: "Large conference room with projector",
          facilities: {
            projecter: true,
            whiteboard: 2,
            power_sockets: 8,
            coffee_break: true,
            special_notes: []
          },
          status: "available",
          utilizationRate: 60,
          currentBookings: [],
          weeklyStats: {
            totalHours: 40,
            averageUtilization: 65,
            peakHours: ["09:00-10:00", "14:00-15:00"]
          }
        },
        {
          id: 2,
          name: "Meeting Room B",
          capacity: 6,
          location: "Building A, Floor 1",
          description: "Medium-sized meeting room",
          facilities: {
            projecter: false,
            whiteboard: 1,
            power_sockets: 4,
            coffee_break: false,
            special_notes: []
          },
          status: "in_use",
          utilizationRate: 80,
          currentBookings: [{
            id: 1,
            startTime: "09:00",
            endTime: "10:00",
            userName: "John",
            purpose: "Team Meeting"
          }],
          weeklyStats: {
            totalHours: 35,
            averageUtilization: 70,
            peakHours: ["10:00-11:00", "15:00-16:00"]
          }
        }
      ]
      setRooms(fallbackRooms)
      setRoomStats({
        totalRooms: fallbackRooms.length,
        activeBookings: fallbackRooms.filter(room => 
          room.status === 'booked' || room.status === 'in_use'
        ).length,
        utilizationRate: (fallbackRooms.filter(room => 
          room.status === 'booked' || room.status === 'in_use'
        ).length / fallbackRooms.length) * 100
      })
    }
  }

  const fetchUserStats = async () => {
    try {
      // Import mock data
      const { users: mockUsers } = await import('@/lib/admin/userMock_data')
      
      // Format user data
      const formattedUsers = mockUsers.map((user) => ({
        id: user.id,
        name: user.name.trim(),
        email: user.email,
        status: user.status as 'online' | 'offline',
        lastLogin: user.lastLogin,
        totalBookings: user.totalBookings,
        currentBookings: user.currentBookings || []
      }))
      
      // Get today's date
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      setUsers(formattedUsers)
      setUserStats({
        totalUsers: formattedUsers.length,
        activeUsers: formattedUsers.filter(user => {
          // Check if user has bookings today
          const hasBookingsToday = user.currentBookings?.some(booking => {
            // Process time format
            const [hours, minutes] = booking.startTime.split(':')
            const bookingDate = new Date()
            bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
            return bookingDate.toDateString() === today.toDateString()
          }) || false

          // Check user last login time
          try {
            const lastLoginDate = new Date(user.lastLogin)
            const isLoginToday = lastLoginDate.toDateString() === today.toDateString()
            return hasBookingsToday || isLoginToday
          } catch {
            return false
          }
        }).length,
        bookingsToday: formattedUsers.reduce((sum, user) => 
          sum + (user.currentBookings?.length || 0), 0
        )
      })

      console.log('Formatted users:', formattedUsers) // Add log
    } catch (error) {
      console.error('Failed to get user statistics:', error)
      // If import fails, use hardcoded mock data
      const fallbackUsers = [
        {
          id: 1,
          name: "John",
          email: "john@example.com",
          status: "online",
          lastLogin: "2024-03-07 09:30",
          totalBookings: 0,
          currentBookings: []
        }
      ]
      setUsers(fallbackUsers as User[])
      setUserStats({
        totalUsers: fallbackUsers.length,
        activeUsers: 0,
        bookingsToday: 0
      })
    }
  }

  // When the component is loaded, get the data
  useEffect(() => {
    fetchRoomStats()
    fetchUserStats()
    
    // Set the timer to refresh every minute
    const timer = setInterval(() => {
      fetchRoomStats()
      fetchUserStats()
    }, 60000) // Refresh every minute

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
                            placeholder="Search Rooms..."
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
                          {currentRooms.map((room) => (
                            <div 
                              key={room.id}
                              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleViewRoom(room)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{room.name}</h4>
                                  <p className="text-sm text-gray-500">{room.location}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  room.status === 'available' ? 'bg-green-100 text-green-800' :
                                  room.status === 'booked' ? 'bg-yellow-100 text-yellow-800' :
                                  room.status === 'in_use' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {room.status === 'available' ? 'Available' :
                                   room.status === 'booked' ? 'Booked' :
                                   room.status === 'in_use' ? 'In Use' :
                                   'Maintenance'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span>{room.capacity} people</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <BarChart2 className="h-4 w-4 text-gray-400" />
                                  <span>Utilization: {room.utilizationRate}%</span>
                                </div>
                              </div>
                              {room.currentBookings && room.currentBookings.length > 0 && (
                                <div className="mt-2 text-sm text-gray-500">
                                  <span>Current: {room.currentBookings[0].userName} ({room.currentBookings[0].startTime} - {room.currentBookings[0].endTime})</span>
                                </div>
                              )}
                            </div>
                          ))}
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
                        title="Active Users Today"
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
                            placeholder="Search User Name/ID..."
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
                          {currentUsers.map((user) => (
                            <div
                              key={user.id}
                              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleViewUser(user)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-primary text-primary-foreground">
                                        {user.name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                                      user.status === 'online' 
                                        ? 'bg-green-500' 
                                        : 'bg-gray-400'
                                    }`} />
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{user.name}</span>
                                      <span className="text-sm text-gray-500">ID: {user.id}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">Last Login: {user.lastLogin}</span>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.status === 'online'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.status === 'online' ? 'Online' : 'Offline'}
                                </span>
                              </div>
                              {user.currentBookings && user.currentBookings.length > 0 && (
                                <div className="mt-2 text-sm text-gray-500">
                                  <span>Current Booking: {user.currentBookings[0].roomName} ({user.currentBookings[0].startTime} - {user.currentBookings[0].endTime})</span>
                                </div>
                              )}
                            </div>
                          ))}
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
          booking={{
            id: selectedRoom.id,
            roomName: selectedRoom.name,
            roomId: selectedRoom.id,
            date: new Date(),
            startTime: selectedRoom.currentBookings?.[0]?.startTime || "00:00",
            endTime: selectedRoom.currentBookings?.[0]?.endTime || "00:00",
            status: selectedRoom.status,
            utilizationRate: selectedRoom.utilizationRate,
            currentBookings: selectedRoom.currentBookings,
            weeklyStats: selectedRoom.weeklyStats
          }}
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
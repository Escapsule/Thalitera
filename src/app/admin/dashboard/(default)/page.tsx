"use client"
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DoorClosed, Calendar, BarChart2, Users2, UserRound, CalendarCheck, Clock, MapPin, Users, Info, CheckCircle2 } from 'lucide-react'
import { RoomDetail } from "@/components/admin/meetingroom_detail"
import RoomCharts from "@/components/admin/RoomCharts"

// Define types for room data
type Room = {
  id: number
  name: string
  capacity: number
  location: string
  description: string
  amenities: string[]
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
}

/**
 * Card container component
 */
interface CardProps {
  children: React.ReactNode
  title: string
}

const Card = ({ children, title }: CardProps) => (
  <div className="bg-white rounded-lg shadow-md p-6 h-full">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
)

const StatCard = ({ title, value, suffix = '', icon }: StatCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-md h-full">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      {icon && <span className="text-gray-400">{icon}</span>}
    </div>
    <p className="text-2xl font-semibold">
      {value.toLocaleString()}{suffix}
    </p>
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
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border disabled:opacity-50"
      >
        previous page
      </button>
      <div className="flex items-center gap-2">
        <span className="text-sm">page</span>
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onBlur={handleInputSubmit}
          className="w-12 px-2 py-1 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm">, total {totalPages} pages</span>
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border disabled:opacity-50"
      >
        next page
      </button>
    </div>
  )
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
  
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bookingsToday: 0
  })

  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Calculate total pages
  const totalPages = Math.ceil(rooms.length / itemsPerPage)

  // Get current page rooms
  const currentRooms = rooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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
        amenities: room.amenities,
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
          amenities: ["Projector", "Whiteboard"],
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
          amenities: ["TV Screen", "Whiteboard"],
          status: "in_use",
          utilizationRate: 80,
          currentBookings: [{
            id: 1,
            startTime: "09:00",
            endTime: "10:00",
            userName: "John Doe",
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



  // When the component is loaded, get the data
  useEffect(() => {
    fetchRoomStats()
    
    // Set the timer to refresh every minute
    const timer = setInterval(() => {
      fetchRoomStats()
    }, 60000) // Refresh every minute

    return () => clearInterval(timer)
  }, [])

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room)
    setIsDetailOpen(true)
  }

  return (
    <div className="p-6">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="ml-auto flex items-center gap-4">
          <Avatar>
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>TH</AvatarFallback>
          </Avatar>
        </div>
      </header>
      
      {/* Use grid layout to create two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Meeting room statistics card */}
        <div className="w-full">
          <Card title="Meeting Room Usage">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Total Rooms"
                value={roomStats.totalRooms}
                icon={<DoorClosed className="w-6 h-6" />}
              />
              <StatCard
                title="Currently in Use"
                value={roomStats.activeBookings}
                icon={<Calendar className="w-6 h-6" />}
              />
              <StatCard
                title="Utilization Rate"
                value={roomStats.utilizationRate}
                suffix="%"
                icon={<BarChart2 className="w-6 h-6" />}
              />
            </div>

            {/* Room Usage List */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Metting Rooms</h3>
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
              {/* Add pagination component */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>

            {/* Add Chart */}
            <RoomCharts rooms={rooms} />
          </Card>
        </div>

        {/* Right - User statistics card */}
        <div className="w-full">
          <Card title="User Usage">
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                title="Total Users"
                value={userStats.totalUsers}
                icon={<Users2 className="w-6 h-6" />}
              />
              <StatCard
                title="Active Users Today"
                value={userStats.activeUsers}
                icon={<UserRound className="w-6 h-6" />}
              />
              <StatCard
                title="Bookings Today"
                value={userStats.bookingsToday}
                icon={<CalendarCheck className="w-6 h-6" />}
              />
            </div>
          </Card>
        </div>
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
    </div>
  )
}

export default DashboardPage
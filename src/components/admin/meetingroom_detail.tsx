"use client"

import { format } from "date-fns"
import { Clock, MapPin, Users, Calendar as CalendarIcon, Info, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { rooms } from "@/lib/admin/mock_data"

// Define the type for the booking data
type Booking = {
  id: number
  roomName: string
  roomId: number
  date: Date
  startTime: string
  endTime: string
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

type RoomDetailProps = {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
}

export function RoomDetail({ booking, isOpen, onClose }: RoomDetailProps) {
  if (!booking) return null

  // Find the corresponding room data
  const roomData = rooms.find(room => room.id === booking.roomId) || {
    name: booking.roomName,
    capacity: 8,
    location: "Building A, Floor 2",
    description: "Conference room with standard amenities.",
    amenities: ["Whiteboard", "Projector"]
  }

  // Get status badge color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return { color: 'bg-green-100 text-green-800', text: 'Available' }
      case 'booked':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Booked' }
      case 'in_use':
        return { color: 'bg-red-100 text-red-800', text: 'In Use' }
      case 'maintenance':
        return { color: 'bg-gray-100 text-gray-800', text: 'Maintenance' }
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Unknown' }
    }
  }

  const statusInfo = getStatusInfo(booking.status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[lch(17_23_133)]">{booking.roomName}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
              <span className="text-sm text-muted-foreground">
                Utilization Rate: {booking.utilizationRate}%
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-[lch(17_23_133)]" />
              <div className="text-sm">
                <span className="font-medium">Date: </span>
                {format(booking.date, "EEEE, MMMM d, yyyy")}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[lch(17_23_133)]" />
              <div className="text-sm">
                <span className="font-medium">Time: </span>
                {booking.startTime} - {booking.endTime}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[lch(17_23_133)]" />
              <div className="text-sm">
                <span className="font-medium">Location: </span>
                {roomData.location}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[lch(17_23_133)]" />
              <div className="text-sm">
                <span className="font-medium">Capacity: </span>
                {roomData.capacity} people
              </div>
            </div>
          </div>

          {/* Current Bookings */}
          {booking.currentBookings && booking.currentBookings.length > 0 && (
            <div className="rounded-md border p-4">
              <h4 className="text-sm font-medium mb-3">Current Bookings</h4>
              <div className="space-y-3">
                {booking.currentBookings.map((booking, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">{booking.userName}</span>
                      <span className="text-muted-foreground block">{booking.purpose}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Usage Statistics */}
          <div className="rounded-md border p-4">
            <h4 className="text-sm font-medium mb-3">Weekly Usage Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold">{booking.weeklyStats.totalHours}</div>
                <div className="text-sm text-muted-foreground">Total Usage Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{booking.weeklyStats.averageUtilization}%</div>
                <div className="text-sm text-muted-foreground">Average Utilization Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{booking.weeklyStats.peakHours.length}</div>
                <div className="text-sm text-muted-foreground">Peak Hours</div>
              </div>
            </div>
          </div>
          
          {/* Room Description and Amenities */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-[lch(17_23_133)] mt-0.5" />
              <div>
                <div className="font-medium text-sm mb-1">Room Description</div>
                <div className="text-sm text-muted-foreground">{roomData.description}</div>
              </div>
            </div>
            
            {roomData.amenities && roomData.amenities.length > 0 && (
              <div className="rounded-md border p-3">
                <h4 className="text-sm font-medium mb-2">Amenities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {roomData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-[lch(83_56_130)]" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
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
import { rooms } from "@/lib/fake_data"

// Define the type for the booking data
type Booking = {
  id: number
  roomName: string
  roomId: number
  date: Date
  startTime: string
  endTime: string
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#163300]">{booking.roomName}</DialogTitle>
          <DialogDescription>
            Booking details for your meeting
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-[#163300]" />
              <div className="text-sm">
                <span className="font-medium">Date: </span>
                {format(booking.date, "EEEE, MMMM d, yyyy")}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#163300]" />
              <div className="text-sm">
                <span className="font-medium">Time: </span>
                {booking.startTime} - {booking.endTime}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[#163300]" />
              <div className="text-sm">
                <span className="font-medium">Location: </span>
                {roomData.location}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#163300]" />
              <div className="text-sm">
                <span className="font-medium">Capacity: </span>
                {roomData.capacity} people
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-[#163300] mt-0.5" />
              <div>
                <div className="font-medium text-sm mb-1">Room Description</div>
                <p className="text-sm text-muted-foreground">{roomData.description}</p>
              </div>
            </div>
            
            {roomData.amenities && roomData.amenities.length > 0 && (
              <div className="rounded-md border p-3">
                <h4 className="text-sm font-medium mb-2">Amenities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {roomData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-[#9FE870]" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <p className="text-xs text-muted-foreground">
              If you need to cancel this booking, please do so at least 2 hours in advance.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
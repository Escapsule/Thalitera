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

// Define the type for the booking data
type Booking = {
  id: number
  roomName: string
  roomId: string | number
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
  const roomData = {
    name: booking.roomName,
    capacity_min: 8,
    capacity_max: 12,
    building: "Building A",
    floor: "2",
    facilities: {
      whiteboard: 1,
      projecter: true,
      power_sockets: 4,
      coffee_break: true,
      special_notes: ["Standard amenities"]
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[lch(17_23_133)]">{booking.roomName}</DialogTitle>
          <DialogDescription>
            Booking details for your meeting
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
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
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-[lch(17_23_133)] mt-0.5" />
              <div>
                <div className="font-medium text-sm mb-1">Room Description</div>
                <p className="text-sm text-muted-foreground">Conference room with standard amenities.</p>
              </div>
            </div>
            
            {roomData.facilities && Object.entries(roomData.facilities).length > 0 && (
              <div className="rounded-md border p-3">
                <h4 className="text-sm font-medium mb-2">Amenities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(roomData.facilities)
                    .filter(([, value]) => value !== null && value !== undefined)
                    .map(([key], index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-[lch(83_56_130)]" />
                        <span>{key}</span>
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
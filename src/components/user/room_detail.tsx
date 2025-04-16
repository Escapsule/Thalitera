"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Clock, MapPin, Users, Calendar as CalendarIcon, Info, CheckCircle2, Plus, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Define the type for the booking data
type Booking = {
  id: number
  roomName: string
  roomId: string | number
  date: Date
  startTime: string
  endTime: string
}

// New type for reservation data from API
interface Attendee {
  user_id: string;
  avatar: string;
  username: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Reservation {
  reservation_id: string;
  room_id: string;
  room_name: string;
  user_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  attendees: Attendee[];
  purpose: string;
  status: string; // pending, confirmed, canceled, completed
}

type RoomDetailProps = {
  booking: Booking | Reservation | null
  isOpen: boolean
  onClose: () => void
}

export function RoomDetail({ booking, isOpen, onClose }: RoomDetailProps) {
  const [coBookers, setCoBookers] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [purpose, setPurpose] = useState("")
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  if (!booking) return null

  // Check if booking is a Reservation type (from API) or Booking type (legacy)
  const isReservationType = 'reservation_id' in booking;

  // Find the corresponding room data
  const roomData = {
    name: isReservationType ? booking.room_name : booking.roomName,
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

  // Format the date and time based on booking type
  const bookingDate = isReservationType 
    ? new Date(booking.start_time) 
    : booking.date;
  
  const startTimeFormatted = isReservationType 
    ? format(new Date(booking.start_time), "h:mm a")
    : booking.startTime;
    
  const endTimeFormatted = isReservationType 
    ? format(new Date(booking.end_time), "h:mm a") 
    : booking.endTime;
    
  // Set purpose if available from reservation
  useEffect(() => {
    if (isReservationType && booking.purpose) {
      setPurpose(booking.purpose);
    }
  }, [booking]);
  
  // Set attendees if available from reservation
  useEffect(() => {
    if (isReservationType && booking.attendees) {
      setCoBookers(booking.attendees.map(attendee => attendee.email));
    }
  }, [booking]);

  const handleAddCoBooker = () => {
    if (emailInput && emailInput.includes('@') && !coBookers.includes(emailInput)) {
      setCoBookers([...coBookers, emailInput])
      setEmailInput("")
    }
  }

  const handleRemoveCoBooker = (email: string) => {
    setCoBookers(coBookers.filter(item => item !== email))
  }

  const handleBookRoom = async () => {
    setIsBooking(true)
    setBookingError(null)
    
    try {
      // Convert date and time strings to timestamps based on booking type
      let startTimestamp, endTimestamp, roomId;
      
      if (isReservationType) {
        roomId = booking.room_id;
        startTimestamp = new Date(booking.start_time).getTime();
        endTimestamp = new Date(booking.end_time).getTime();
      } else {
        const startDate = new Date(booking.date);
        const [startHour, startMinute] = booking.startTime.split(':').map(Number);
        startDate.setHours(startHour, startMinute, 0);
        startTimestamp = startDate.getTime();
        
        const endDate = new Date(booking.date);
        const [endHour, endMinute] = booking.endTime.split(':').map(Number);
        endDate.setHours(endHour, endMinute, 0);
        endTimestamp = endDate.getTime();
        
        roomId = booking.roomId.toString();
      }
      
      const response = await fetch('/api/user/meetingroom/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
          attendees: coBookers,
          purpose: purpose,
          start_time: startTimestamp,
          end_time: endTimestamp,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to book the meeting room')
      }
      
      setBookingSuccess(true)
      // Close modal after successful booking with a small delay
      setTimeout(() => {
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Booking error:', error)
      setBookingError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] animate-scaleCenter">
        <DialogHeader>
          <DialogTitle className="text-xl text-[lch(17_23_133)]">{roomData.name}</DialogTitle>
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
                {format(bookingDate, "EEEE, MMMM d, yyyy")}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[lch(17_23_133)]" />
              <div className="text-sm">
                <span className="font-medium">Time: </span>
                {startTimeFormatted} - {endTimeFormatted}
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
          
          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-sm font-medium">Meeting Purpose</Label>
            <Input
              id="purpose"
              placeholder="Enter purpose of meeting"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="co-booker" className="text-sm font-medium">Add Co-Bookers</Label>
            <div className="flex mt-1 mb-2 gap-2">
              <Input 
                id="co-booker"
                type="email" 
                placeholder="Enter email address" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <Button size="sm" variant="outline" onClick={handleAddCoBooker}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {coBookers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {coBookers.map((email, index) => (
                  <div key={index} className="flex items-center gap-1 bg-[lch(94_5_133)] rounded-full px-2 py-1 text-xs">
                    <span>{email}</span>
                    <button 
                      onClick={() => handleRemoveCoBooker(email)}
                      className="hover:text-[lch(17_23_133)]"
                      aria-label={`Remove ${email}`}
                      title={`Remove ${email}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Show error message if booking failed */}
          {bookingError && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {bookingError}
            </div>
          )}
          
          {/* Success message */}
          {bookingSuccess && (
            <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm">
              Meeting room booked successfully!
            </div>
          )}
          
          <div className="bg-muted p-3 rounded-md">
            <p className="text-xs text-muted-foreground">
              If you need to cancel this booking, please do so at least 2 hours in advance.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleBookRoom} 
            className="w-full bg-[lch(37_82_296)]" 
            disabled={isBooking || bookingSuccess}
          >
            {isBooking ? "Booking..." : bookingSuccess ? "Booked!" : "Book Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
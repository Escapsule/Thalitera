"use client"

import { useState, useEffect } from "react"
import { format, isSameDay } from "date-fns"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MeetingRoom } from '@/types/meeting-room'

// Define the type for the booking data
type Booking = {
  id: number
  roomName: string
  roomId: string | number
  date: Date
  startTime: string
  endTime: string
  roomData?: MeetingRoom | null
}

// Simplified room details component for booking creation only
type RoomDetailProps = {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
}

export function RoomDetail({ booking, isOpen, onClose }: RoomDetailProps) {
  const [coBookers, setCoBookers] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [purpose, setPurpose] = useState("")
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [selectedStartTime, setSelectedStartTime] = useState<string>("")
  const [selectedEndTime, setSelectedEndTime] = useState<string>("")
  const [showCapacityWarning, setShowCapacityWarning] = useState(false)
  const [bookButtonShake, setBookButtonShake] = useState(false)
  
  // Get current date and time
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  // Round current time to next 30-minute increment
  const roundedMinute = currentMinute < 30 ? 30 : 0
  const roundedHour = currentMinute < 30 ? currentHour : currentHour + 1
  
  // Format current time to HH:MM format
  const formatTimeToString = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }
  
  // Calculate default end time (1 hour after start time)
  const getDefaultEndTime = (startTimeStr: string) => {
    const [hours, minutes] = startTimeStr.split(':').map(Number)
    const endHour = hours + 1 > 20 ? 20 : hours + 1
    return formatTimeToString(endHour, minutes)
  }
  
  // Generate available times from 8:00 to 20:00
  const timeOptions = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8
    const minute = (i % 2) * 30
    return formatTimeToString(hour, minute)
  })
  
  // Filter out past time slots if booking is for today
  const getAvailableTimeOptions = (bookingDate: Date) => {
    if (isSameDay(bookingDate, now)) {
      return timeOptions.filter(time => {
        const [hours, minutes] = time.split(':').map(Number)
        return (hours > roundedHour) || (hours === roundedHour && minutes >= roundedMinute)
      })
    }
    return timeOptions
  }

  useEffect(() => {
    if (booking) {
      // If it's after 8 PM, we'll use booking's date (which should be tomorrow)
      // Otherwise use booking's original times or defaults based on current time
      const availableOptions = getAvailableTimeOptions(booking.date)
      
      if (availableOptions.length > 0) {
        // Set default start time (either from booking or first available)
        const newStartTime = booking.startTime && availableOptions.includes(booking.startTime)
          ? booking.startTime
          : availableOptions[0];
        
        setSelectedStartTime(newStartTime);
        
        // Set default end time (either from booking or 1 hour after start time)
        if (booking.endTime && booking.endTime > newStartTime && availableOptions.includes(booking.endTime)) {
          setSelectedEndTime(booking.endTime);
        } else {
          setSelectedEndTime(getDefaultEndTime(newStartTime));
        }
      }
    }
  }, [booking, isOpen])

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setCoBookers([])
      setEmailInput("")
      setEmailError(null)
      setPurpose("")
      setBookingError(null)
      setBookingSuccess(false)
      setShowCapacityWarning(false)
      setBookButtonShake(false)
    }
  }, [isOpen])

  if (!booking) return null

  const bookingDate = booking.date
  const availableTimeOptions = getAvailableTimeOptions(bookingDate)
  const roomData = booking.roomData
  
  // Check if attendees count (including booker) is within room capacity
  const isAttendeeCountValid = () => {
    if (!roomData) return true;
    
    // Count includes the booker (1) + all co-bookers
    const totalAttendees = 1 + coBookers.length;
    
    return totalAttendees >= roomData.capacity_min && totalAttendees <= roomData.capacity_max;
  }
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const handleAddCoBooker = () => {
    setEmailError(null);
    
    if (!emailInput.trim()) {
      setEmailError("Please enter an email address");
      return;
    }
    
    if (!validateEmail(emailInput)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    if (coBookers.includes(emailInput)) {
      setEmailError("Email already added");
      return;
    }
    
    setCoBookers([...coBookers, emailInput]);
    setEmailInput("");
    
    // Show capacity warning after successfully adding an attendee
    setShowCapacityWarning(true);
  }

  const handleRemoveCoBooker = (email: string) => {
    setCoBookers(coBookers.filter(item => item !== email))
  }

  const handleBookRoom = async () => {
    // Check if attendee count is valid before booking
    if (!isAttendeeCountValid()) {
      setShowCapacityWarning(true);
      // Add shake animation to highlight the warning
      setBookButtonShake(true);
      setTimeout(() => setBookButtonShake(false), 500);
      return;
    }
    
    setIsBooking(true);
    setBookingError(null);
    
    try {
      // Convert date and time strings to ISO format with timezone offset
      const startDate = new Date(booking.date);
      const endDate = new Date(booking.date);
      
      // Parse the time string correctly
      const parseTimeString = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return [hours, minutes];
      };
      
      const [startHour, startMinute] = parseTimeString(selectedStartTime);
      startDate.setHours(startHour, startMinute, 0, 0);
      
      const [endHour, endMinute] = parseTimeString(selectedEndTime);
      endDate.setHours(endHour, endMinute, 0, 0);
      
      // Format dates with timezone offset in ISO 8601 format
      // Example: 2025-04-16T09:13:18.000-07:00
      const formatDateWithOffset = (date: Date) => {
        // Get timezone offset in minutes and convert to hours and minutes
        const tzOffset = date.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(tzOffset) / 60).toString().padStart(2, '0');
        const offsetMinutes = (Math.abs(tzOffset) % 60).toString().padStart(2, '0');
        const offsetSign = tzOffset <= 0 ? '+' : '-'; // Note: getTimezoneOffset returns negative for positive offsets
        
        // Format the date
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
      };
      
      const startTimeWithOffset = formatDateWithOffset(startDate);
      const endTimeWithOffset = formatDateWithOffset(endDate);
      
      const roomId = booking.roomId.toString();
      
      const response = await fetch('/api/user/meetingroom/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
          attendees: coBookers,
          purpose: purpose,
          start_time: startTimeWithOffset,
          end_time: endTimeWithOffset,
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
          <DialogTitle className="text-xl text-[lch(17_23_133)]">
            {roomData?.name || booking.roomName}
          </DialogTitle>
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
              <div className="grid grid-cols-2 gap-2 w-full">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select value={selectedStartTime} onValueChange={(value) => {
                    setSelectedStartTime(value);
                    // Always set end time to be 1 hour after start time
                    setSelectedEndTime(getDefaultEndTime(value));
                  }}>
                    <SelectTrigger id="startTime">
                      <SelectValue placeholder="Start Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeOptions.slice(0, -1).map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Select 
                    value={selectedEndTime} 
                    onValueChange={setSelectedEndTime}
                    disabled={!selectedStartTime}
                  >
                    <SelectTrigger id="endTime">
                      <SelectValue placeholder="End Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeOptions
                        .filter(time => time > selectedStartTime)
                        .map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[lch(17_23_133)]" />
              <div className="text-sm">
                <span className="font-medium">Location: </span>
                {roomData?.building || "Unknown"}, Floor {roomData?.floor || "Unknown"}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[lch(17_23_133)]" />
              <div className="text-sm">
                <span className="font-medium">Capacity: </span>
                {roomData?.capacity_min || "?"} - {roomData?.capacity_max || "?"} people
              </div>
            </div>

            <div>
              <Label htmlFor="co-booker" className="text-sm font-medium">Add Co-Bookers</Label>
              <div className="flex mt-1 mb-2 gap-2">
                <div className="flex-1">
                  <Input 
                    id="co-booker"
                    type="email" 
                    placeholder="Enter email address" 
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setEmailError(null);
                    }}
                    className={emailError ? "border-destructive" : ""}
                  />
                  {emailError && (
                    <p className="text-xs text-destructive mt-1">{emailError}</p>
                  )}
                </div>
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
              
              {showCapacityWarning && !isAttendeeCountValid() && roomData && (
                <div className="flex items-start gap-1.5 text-xs text-destructive mt-1.5 bg-red-50 p-2 rounded-sm">
                  <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  {1 + coBookers.length < roomData.capacity_min ? (
                    <div>
                      <p className="font-medium">Not enough attendees</p>
                      <p>Add {roomData.capacity_min - (1 + coBookers.length)} more to meet minimum capacity of {roomData.capacity_min}.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">Too many attendees</p>
                      <p>Remove {(1 + coBookers.length) - roomData.capacity_max} to stay within maximum capacity of {roomData.capacity_max}.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-[lch(17_23_133)] mt-0.5" />
              <div>
                <div className="font-medium text-sm mb-1">Room Description</div>
                <p className="text-sm text-muted-foreground">
                  {roomData?.name || booking.roomName} - Conference room with standard amenities.
                </p>
              </div>
            </div>
            
            {roomData?.facilities && Object.entries(roomData.facilities).length > 0 && (
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
            className={`w-full bg-[lch(37_82_296)] ${bookButtonShake ? 'animate-shake' : ''}`}
            disabled={
              isBooking || 
              bookingSuccess || 
              !selectedStartTime || 
              !selectedEndTime || 
              selectedStartTime >= selectedEndTime
            }
          >
            {isBooking ? "Booking..." : bookingSuccess ? "Booked!" : "Book Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
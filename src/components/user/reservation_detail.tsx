"use client"

import { format } from "date-fns"
import { Clock, MapPin, Users, Calendar as CalendarIcon, Info, AlertTriangle, Edit } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useUserInfo } from "@/hooks/useUserInfo"

// Type for reservation data from API
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
  user_name: string;
  building: string;
  floor: string | number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  attendees: Attendee[];
  purpose: string;
  status: string; // pending, confirmed, canceled, completed
}

type ReservationDetailProps = {
  reservation: Reservation | null
  isOpen: boolean
  onClose: () => void
  onCancel: (reservationId: string) => Promise<void>
  canCancel?: boolean
  onDataChange?: () => void
}

// API response interface
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
  timestamp: string;
}

export function ReservationDetail({ reservation, isOpen, onClose, onCancel, canCancel = true, onDataChange }: ReservationDetailProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [attendeeEmail, setAttendeeEmail] = useState("")
  const [attendees, setAttendees] = useState<string[]>([])
  const [purpose, setPurpose] = useState("")
  const [selectedStartTime, setSelectedStartTime] = useState("")
  const [selectedEndTime, setSelectedEndTime] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [localReservation, setLocalReservation] = useState<Reservation | null>(null)
  const [reservationDate, setReservationDate] = useState("")
  
  // Get current user info from the hook
  const { data: userInfo } = useUserInfo()
  
  // Check if current user is the creator of the reservation
  const isReservationCreator = (): boolean => {
    if (!localReservation || !userInfo) return false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (userInfo as any)?.user_id === localReservation.user_id
  }
  
  // Determine if the user can edit/cancel this reservation
  // Uses both the prop (for backward compatibility) and the user check
  const userCanModify = canCancel || isReservationCreator()

  // Update local state when reservation changes
  useEffect(() => {
    if (reservation) {
      setLocalReservation(reservation);
      
      // Set reservation date
      try {
        const date = new Date(reservation.start_time);
        setReservationDate(format(date, "EEEE, MMMM d, yyyy"));
      } catch (error) {
        console.error("Error formatting reservation date:", error);
        setReservationDate("Unknown date");
      }
    }
  }, [reservation]);

  if (!localReservation) return null;

  // Generate available time options (8:00 AM to 8:00 PM)
  const generateTimeOptions = () => {
    const options = [];
    const now = new Date();
    const reservationDate = new Date(localReservation.start_time);
    const isCurrentDay = now.toDateString() === reservationDate.toDateString();
    
    // For current day, start from next half hour or hour
    // For other days, show all time slots starting from 8 AM
    if (isCurrentDay) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Start from next half hour or hour
      let startHour = currentHour;
      let startMinute = currentMinute <= 30 ? 30 : 0;
      
      if (currentMinute > 30) {
        startHour += 1;
        startMinute = 0;
      }
      
      // Generate options from current time to 8 PM
      for (let hour = 8; hour <= 20; hour++) {
        // Skip times in the past
        if (hour < startHour || (hour === startHour && startMinute > 0 && startMinute > 30)) {
          continue;
        }
        
        // Add hour option
        options.push({
          value: `${hour}:00`,
          label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
        });
        
        // Add half hour option if not 8 PM
        if (hour < 20) {
          options.push({
            value: `${hour}:30`,
            label: `${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}`
          });
        }
      }
    } else {
      // For non-current day, show all time slots from 8 AM to 8 PM
      for (let hour = 8; hour <= 20; hour++) {
        // Add hour option
        options.push({
          value: `${hour}:00`,
          label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
        });
        
        // Add half hour option if not 8 PM
        if (hour < 20) {
          options.push({
            value: `${hour}:30`,
            label: `${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}`
          });
        }
      }
    }
    
    return options;
  };

  // 计算默认结束时间（比开始时间晚1小时）
  const getDefaultEndTime = (startTimeStr: string) => {
    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const endHour = hours + 1 > 20 ? 20 : hours + 1;
    return `${endHour}:${minutes === 30 ? '30' : '00'}`;
  };

  // Initialize edit form when entering edit mode
  const handleEditClick = () => {
    // Check if user is authorized to edit
    if (!userCanModify) {
      toast.error("You can only edit meetings that you've created")
      return
    }
    
    setAttendees(localReservation.attendees.map(a => a.email));
    setPurpose(localReservation.purpose);
    
    // Parse current reservation time for default values
    try {
      const start = new Date(localReservation.start_time);
      const end = new Date(localReservation.end_time);
      
      // Set default values
      setSelectedStartTime(`${start.getHours()}:${start.getMinutes() === 30 ? '30' : '00'}`);
      setSelectedEndTime(`${end.getHours()}:${end.getMinutes() === 30 ? '30' : '00'}`);
    } catch (error) {
      console.error("Error parsing reservation times:", error);
      
      // For non-current day reservations, set default start time to 8 AM
      setSelectedStartTime(`8:00`);
      setSelectedEndTime(`9:00`);
    }
    
    setIsEditMode(true);
  };

  const handleCancel = () => {
    // Check if user is authorized to cancel
    if (!userCanModify) {
      toast.error("You can only cancel meetings that you've created")
      return
    }
    
    setIsConfirmDialogOpen(true)
  };

  const handleConfirmCancel = async () => {
    setIsLoading(true)
    try {
      await onCancel(localReservation.reservation_id)
      toast.success("Reservation cancelled successfully")
      if (onDataChange) onDataChange() // Trigger data refresh
    } catch (err) {
      console.error("Error cancelling reservation:", err)
      toast.error("Failed to cancel reservation")
    } finally {
      setIsLoading(false)
      setIsConfirmDialogOpen(false)
    }
  }

  // Add attendee to the list
  const handleAddAttendee = () => {
    if (!attendeeEmail) return;
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(attendeeEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!attendees.includes(attendeeEmail)) {
      setAttendees([...attendees, attendeeEmail]);
    }
    setAttendeeEmail("");
  };

  // Remove attendee from the list
  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a !== email));
  };

  // Update reservation
  const handleUpdateReservation = async () => {
    if (!selectedStartTime || !selectedEndTime) {
      toast.error("Please select start and end times");
      return;
    }
    
    try {
      // Parse selected times
      const [startHours, startMinutes] = selectedStartTime.split(':').map(Number);
      const [endHours, endMinutes] = selectedEndTime.split(':').map(Number);
      
      // Create dates based on the original reservation date, not today
      const originalDate = new Date(localReservation.start_time);
      
      // Create new Date objects with the original date but updated hours/minutes
      const startDate = new Date(originalDate);
      startDate.setHours(startHours, startMinutes, 0, 0);
      
      const endDate = new Date(originalDate);
      endDate.setHours(endHours, endMinutes, 0, 0);
      
      // Validate times
      if (startHours < 8 || startHours > 20 || endHours < 8 || endHours > 20) {
        toast.error("Reservations must be between 8 AM and 8 PM");
        return;
      }
      
      if (startDate >= endDate) {
        toast.error("End time must be after start time");
        return;
      }
      
      setIsUpdating(true);
      
      console.log("Updating reservation with dates:", {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        originalDate: originalDate.toISOString()
      });
      
      const response = await fetch('/api/user/meetingroom/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservation_id: localReservation.reservation_id,
          room_id: localReservation.room_id,
          attendees: attendees,
          purpose: purpose,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
        }),
      });
      
      const data = await response.json() as ApiResponse<string>;
      
      if (data.code !== 200) {
        // Handle specific error cases
        if (data.code === 2001) {
          toast.error(`${data.message || "One or more attendees not found"}`);
        } else {
          toast.error(data.message || "Failed to update reservation");
        }
        return;
      }
      
      toast.success("Reservation updated successfully");
      if (onDataChange) onDataChange(); // Trigger data refresh
      setIsEditMode(false);
      onClose(); // Close the dialog to trigger a refresh of the reservations
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error("Failed to update reservation. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  // 安全的format函数，处理可能的日期解析错误
  const safeFormat = (dateString: string, formatStr: string, fallback: string = "Invalid date") => {
    try {
      const date = new Date(dateString);
      return format(date, formatStr);
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return fallback;
    }
  };

  // Handle dialog close with clean state reset
  const handleDialogClose = () => {
    // Allow time for dialog close animation
    setTimeout(() => {
      setIsEditMode(false);
      setAttendeeEmail("");
      setAttendees([]);
      setPurpose("");
      setSelectedStartTime("");
      setSelectedEndTime("");
    }, 200);
    
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px] animate-scaleCenter transition-all duration-200">
          <DialogHeader>
            <DialogTitle className="text-xl text-[lch(17_23_133)]">{localReservation.room_name}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Edit reservation details" : "Reservation details"}
            </DialogDescription>
          </DialogHeader>

          {!isEditMode ? (
            // View mode
            <div className="grid gap-6 py-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-[lch(17_23_133)]" />
                  <div className="text-sm">
                    <span className="font-medium">Date: </span>
                    {safeFormat(localReservation.start_time, "EEEE, MMMM d, yyyy")}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[lch(17_23_133)]" />
                  <div className="text-sm">
                    <span className="font-medium">Time: </span>
                    {safeFormat(localReservation.start_time, "h:mm a")} - {safeFormat(localReservation.end_time, "h:mm a")}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[lch(17_23_133)]" />
                  <div className="text-sm">
                    <span className="font-medium">Location: </span>
                    {localReservation.building}, Floor {localReservation.floor}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[lch(17_23_133)]" />
                  <div className="text-sm">
                    <span className="font-medium">Reserved by: </span>
                    {localReservation.user_name}
                  </div>
                </div>
                
                {localReservation.purpose && (
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Purpose: </span>
                      {localReservation.purpose}
                    </div>
                  </div>
                )}
              </div>
              
              {localReservation.attendees && localReservation.attendees.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium text-sm">Attendees</div>
                  <div className="flex flex-wrap gap-2">
                    {localReservation.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center gap-1 bg-[lch(94_5_133)] rounded-full px-2 py-1 text-xs">
                        <span>{attendee.email || attendee.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground">
                  Reservation status: <span className="font-medium capitalize">{localReservation.status}</span>
                </p>
              </div>
            </div>
          ) : (
            // Edit mode
            <div className="grid gap-6 py-4">
              <div className="text-base font-medium mb-2">
                {reservationDate}
              </div>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Select value={selectedStartTime} onValueChange={(value) => {
                      setSelectedStartTime(value);
                      // Always set end time to be 1 hour after start time
                      setSelectedEndTime(getDefaultEndTime(value));
                    }}>
                      <SelectTrigger id="startTime">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Select value={selectedEndTime} onValueChange={setSelectedEndTime}>
                      <SelectTrigger id="endTime">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea 
                    id="purpose" 
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Meeting purpose"
                    className="min-h-[120px] resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Attendees</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add attendee email" 
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAttendee();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleAddAttendee}
                      variant="outline"
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {attendees.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {attendees.map((email, index) => (
                        <div key={index} className="flex items-center gap-1 bg-[lch(94_5_133)] rounded-full px-2 py-1 text-xs">
                          <span>{email}</span>
                          <button 
                            onClick={() => handleRemoveAttendee(email)}
                            className="ml-1 text-[lch(17_23_133)] hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {!isEditMode ? (
              // View mode buttons
              <>
                {localReservation.status !== 'canceled' && localReservation.status !== 'completed' && userCanModify && (
                  <div className="flex w-full gap-2">
                    <Button 
                      onClick={handleEditClick} 
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Reservation
                    </Button>
                    <Button 
                      onClick={handleCancel} 
                      variant="default"
                      className="flex-1"
                    >
                      Cancel Reservation
                    </Button>
                  </div>
                )}
                {localReservation.status !== 'canceled' && localReservation.status !== 'completed' && !userCanModify && (
                  <div className="text-xs text-muted-foreground text-center w-full">
                    Only the creator of this reservation can modify or cancel it.
                  </div>
                )}
              </>
            ) : (
              // Edit mode buttons
              <div className="flex w-full gap-2">
                <Button 
                  onClick={handleCancelEdit} 
                  variant="outline"
                  className="flex-1"
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateReservation} 
                  variant="default"
                  className="flex-1"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Reservation"}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
          <div className="bg-destructive/10 p-6 flex items-center gap-4">
            <div className="rounded-full bg-destructive/20 p-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-semibold">Cancel Reservation</DialogTitle>
          </div>
          
          <div className="p-6">
            <DialogDescription className="text-base mb-4">
              Are you sure you want to cancel your reservation for <span className="font-medium">{localReservation.room_name}</span> on {safeFormat(localReservation.start_time, "MMMM d")} at {safeFormat(localReservation.start_time, "h:mm a")}?
            </DialogDescription>
            
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={isLoading}
              >
                No, Keep It
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleConfirmCancel}
                disabled={isLoading}
              >
                {isLoading ? "Cancelling..." : "Yes, Cancel"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 
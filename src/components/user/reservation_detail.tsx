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
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
}

// API response interface
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
  timestamp: string;
}

export function ReservationDetail({ reservation, isOpen, onClose, onCancel, canCancel = true }: ReservationDetailProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [attendeeEmail, setAttendeeEmail] = useState("")
  const [attendees, setAttendees] = useState<string[]>([])
  const [purpose, setPurpose] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  if (!reservation) return null

  // Initialize edit form when entering edit mode
  const handleEditClick = () => {
    setAttendees(reservation.attendees.map(a => a.email));
    setPurpose(reservation.purpose);
    
    // Format date and time for input fields
    try {
      const start = new Date(reservation.start_time);
      const end = new Date(reservation.end_time);
      
      // Format as YYYY-MM-DDThh:mm (format required by time input)
      setStartTime(format(start, "yyyy-MM-dd'T'HH:mm"));
      setEndTime(format(end, "yyyy-MM-dd'T'HH:mm"));
    } catch (error) {
      console.error("Error formatting dates for edit:", error);
      toast.error("Could not prepare the form. Please try again.");
      return;
    }
    
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsConfirmDialogOpen(true)
  };

  const handleConfirmCancel = async () => {
    setIsLoading(true)
    try {
      await onCancel(reservation.reservation_id)
      toast.success("Reservation cancelled successfully")
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
    if (!startTime || !endTime) {
      toast.error("Please select start and end times");
      return;
    }
    
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    if (startDate >= endDate) {
      toast.error("End time must be after start time");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const response = await fetch('/api/user/meetingroom/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservation_id: reservation.reservation_id,
          room_id: reservation.room_id,
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] animate-scaleCenter">
          <DialogHeader>
            <DialogTitle className="text-xl text-[lch(17_23_133)]">{reservation.room_name}</DialogTitle>
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
                    {safeFormat(reservation.start_time, "EEEE, MMMM d, yyyy")}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[lch(17_23_133)]" />
                  <div className="text-sm">
                    <span className="font-medium">Time: </span>
                    {safeFormat(reservation.start_time, "h:mm a")} - {safeFormat(reservation.end_time, "h:mm a")}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[lch(17_23_133)]" />
                  <div className="text-sm">
                    <span className="font-medium">Location: </span>
                    {reservation.building}, Floor {reservation.floor}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[lch(17_23_133)]" />
                  <div className="text-sm">
                    <span className="font-medium">Reserved by: </span>
                    {reservation.user_name}
                  </div>
                </div>
                
                {reservation.purpose && (
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Purpose: </span>
                      {reservation.purpose}
                    </div>
                  </div>
                )}
              </div>
              
              {reservation.attendees && reservation.attendees.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium text-sm">Attendees</div>
                  <div className="flex flex-wrap gap-2">
                    {reservation.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center gap-1 bg-[lch(94_5_133)] rounded-full px-2 py-1 text-xs">
                        <span>{attendee.email || attendee.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground">
                  Reservation status: <span className="font-medium capitalize">{reservation.status}</span>
                </p>
              </div>
            </div>
          ) : (
            // Edit mode
            <div className="grid gap-6 py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input 
                      id="startTime" 
                      type="datetime-local" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input 
                      id="endTime" 
                      type="datetime-local" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input 
                    id="purpose" 
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Meeting purpose"
                    className="min-h-[80px]"
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
                {reservation.status !== 'canceled' && reservation.status !== 'completed' && canCancel && (
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
                {reservation.status !== 'canceled' && reservation.status !== 'completed' && !canCancel && (
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
              Are you sure you want to cancel your reservation for <span className="font-medium">{reservation.room_name}</span> on {safeFormat(reservation.start_time, "MMMM d")} at {safeFormat(reservation.start_time, "h:mm a")}?
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
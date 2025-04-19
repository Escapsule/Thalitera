"use client"

import { format } from "date-fns"
import { Clock, MapPin, Users, Calendar as CalendarIcon, Info, AlertTriangle } from "lucide-react"
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

export function ReservationDetail({ reservation, isOpen, onClose, onCancel, canCancel = true }: ReservationDetailProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!reservation) return null

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
              Reservation details
            </DialogDescription>
          </DialogHeader>

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

          <DialogFooter>
            {reservation.status !== 'canceled' && reservation.status !== 'completed' && canCancel && (
              <Button 
                onClick={handleCancel} 
                variant="destructive"
                className="w-full"
              >
                Cancel Reservation
              </Button>
            )}
            {reservation.status !== 'canceled' && reservation.status !== 'completed' && !canCancel && (
              <div className="text-xs text-muted-foreground text-center w-full">
                Only the creator of this reservation can cancel it.
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
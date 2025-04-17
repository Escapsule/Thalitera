"use client"

import { format } from "date-fns"
import { Clock, MapPin, Users, Calendar as CalendarIcon, Info, CheckCircle2 } from "lucide-react"
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
}

export function ReservationDetail({ reservation, isOpen, onClose, onCancel }: ReservationDetailProps) {
  if (!reservation) return null

  // Hardcoded room data - in a real app, you would fetch this from API
  const roomData = {
    name: reservation.room_name,
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

  const handleCancel = () => {
    // Create a styled confirmation dialog in the center of the screen
    toast(
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-lg font-medium">Cancel Reservation</h3>
        <p>Are you sure you want to cancel this reservation?</p>
        <div className="flex gap-3 mt-2 w-full">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => toast.dismiss()}
          >
            No, Keep It
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1"
            onClick={async () => {
              toast.dismiss();
              try {
                await onCancel(reservation.reservation_id);
                toast.success("Reservation cancelled successfully");
              } catch (err) {
                console.error("Error cancelling reservation:", err);
                toast.error("Failed to cancel reservation");
              }
            }}
          >
            Yes, Cancel
          </Button>
        </div>
      </div>,
      {
        duration: 100000, // Keep it open until user interaction
        className: "custom-confirmation-toast",
        unstyled: true,
        style: {
          maxWidth: "400px",
          padding: "20px",
          backgroundColor: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          position: "fixed",
          top: "50%", 
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
        },
      }
    );
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] animate-scaleCenter">
        <DialogHeader>
          <DialogTitle className="text-xl text-[lch(17_23_133)]">{roomData.name}</DialogTitle>
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
          
          {reservation.attendees && reservation.attendees.length > 0 && (
            <div className="space-y-2">
              <div className="font-medium text-sm">Attendees</div>
              <div className="flex flex-wrap gap-2">
                {reservation.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center gap-1 bg-[lch(94_5_133)] rounded-full px-2 py-1 text-xs">
                    <span>{attendee.email}</span>
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
          {reservation.status !== 'canceled' && reservation.status !== 'completed' && (
            <Button 
              onClick={handleCancel} 
              variant="destructive"
              className="w-full"
            >
              Cancel Reservation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
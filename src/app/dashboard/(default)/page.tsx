"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Clock } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ReservationDetail } from "@/components/user/reservation_detail"
import Link from "next/link"
import { toast } from "sonner"

// Reservation type definition based on API response
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

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showAllBookings, setShowAllBookings] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/calendar')
        if (!response.ok) {
          throw new Error('Failed to fetch calendar')
        }
        const data = await response.json()
        
        // Check if data is in the expected format
        if (data && data.data && Array.isArray(data.data)) {
          console.log('获取到的预订数据:', data.data.length, '条');
          console.log('预订数据示例:', data.data[0]);
          setReservations(data.data)
        } else {
          setReservations([])
        }
      } catch (error) {
        console.error('Error fetching calendar:', error)
        setReservations([])
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [])

  // Calculate statistics - include today's bookings in the count
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const futureReservations = reservations.filter((reservation) => {
    try {
      const startTime = new Date(reservation.start_time)
      return startTime >= today && reservation.status !== 'canceled'
    } catch (error) {
      console.error(`Invalid date format for future filtering: ${reservation.start_time}`, error);
      return false
    }
  }).length

  // Get bookings for selected date or all future bookings (including today)
  const reservationsToDisplay = showAllBookings 
    ? reservations.filter((reservation) => {
        try {
          const startTime = new Date(reservation.start_time)
          return startTime >= today && reservation.status !== 'canceled'
        } catch (error) {
          console.error(`Invalid date format for all bookings: ${reservation.start_time}`, error);
          return false
        }
      })
    : reservations.filter((reservation) => {
        if (!date) return false
        try {
          const startTime = new Date(reservation.start_time)
          return startTime.toDateString() === date.toDateString() && reservation.status !== 'canceled'
        } catch (error) {
          console.error(`Invalid date format for date filtering: ${reservation.start_time}`, error);
          return false
        }
      })

  // Handle opening the detail modal
  const handleOpenDetail = (reservation: Reservation) => {
    setSelectedBooking(reservation)
    setIsDetailOpen(true)
  }

  // Format time string from API timestamp
  const formatTimeString = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return format(date, "h:mm a")
    } catch (error) {
      console.error(`Invalid time format: ${timestamp}`, error);
      return "Invalid time"
    }
  }

  // Cancel reservation handler with optimistic updates
  const handleCancelReservation = async (reservationId: string) => {
    try {
      // Make the actual API call
      const response = await fetch('/api/user/meetingroom/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: reservationId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel reservation');
      }
      
      // On success, update the UI
      const updatedReservations = reservations.map(reservation => 
        reservation.reservation_id === reservationId 
          ? { ...reservation, status: 'canceled' } 
          : reservation
      );
      
      setReservations(updatedReservations);
      
      // If selected booking is being canceled, update it too
      if (selectedBooking && selectedBooking.reservation_id === reservationId) {
        setSelectedBooking({ ...selectedBooking, status: 'canceled' });
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast.error('Failed to cancel reservation. Please try again.');
      return Promise.reject(error);
    }
  };

  return (
    <div className="flex min-h-[95cvh] flex-col py-6 ml-12">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="ml-auto flex items-center gap-4">
          <Avatar>
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>TH</AvatarFallback>
          </Avatar>
        </div>
      </header>
      
      <div className="flex flex-1 justify-center">
        <main className="flex-1 p-4 md:p-6 min-w-[80vw]">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-[lch(17_23_133)]">Future Bookings</CardDescription>
                <CardTitle className="text-4xl text-[lch(17_23_133)]">{futureReservations}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
            <Card>
              <CardHeader>
                <CardTitle className="text-[lch(17_23_133)]">Your Schedule</CardTitle>
                <CardDescription className="text-[lch(0_0_0)]">View and manage your upcoming room bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex h-[200px] items-center justify-center">
                      <div className="text-center">
                        <h3 className="font-medium">Loading your reservations...</h3>
                      </div>
                    </div>
                  ) : reservationsToDisplay.length > 0 ? (
                    reservationsToDisplay.map((reservation) => (
                      <div 
                        key={reservation.reservation_id + reservation.start_time} 
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-[lch(97_0_0)] cursor-pointer transition-colors"
                        onClick={() => handleOpenDetail(reservation)}
                      >
                        <div className="space-y-1">
                          <h3 className="font-medium">{reservation.room_name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            {formatTimeString(reservation.start_time)} - {formatTimeString(reservation.end_time)}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {format(new Date(reservation.start_time), "MMM d")}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                      <div className="text-center">
                        <h3 className="font-medium">No bookings for this date</h3>
                        <p className="text-sm text-muted-foreground">Select another date or <Link href="/dashboard/search" className="text-[lch(17_23_133)] underline">book a room</Link></p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view your bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setShowAllBookings(false)}
                      className={`py-2 px-4 rounded-md text-sm font-medium ${
                        !showAllBookings 
                          ? 'bg-[lch(17_23_133)] text-[lch(100_0_0)]' 
                          : 'bg-[lch(95_0_0)] text-[lch(32_0_0)] hover:bg-[lch(92_0_0)]'
                      }`}
                    >
                      Date
                    </button>
                    <button 
                      onClick={() => {
                        setShowAllBookings(true);
                        setDate(new Date()); // Reset to today when showing all
                      }}
                      className={`py-2 px-4 rounded-md text-sm font-medium ${
                        showAllBookings 
                          ? 'bg-[lch(17_23_133)] text-[lch(100_0_0)]' 
                          : 'bg-[lch(95_0_0)] text-[lch(32_0_0)] hover:bg-[lch(92_0_0)]'
                      }`}
                    >
                      All
                    </button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      setShowAllBookings(false);
                    }}
                    className="rounded-md border shadow-sm"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    components={{
                      DayContent: (props) => {
                        const date = props.date
                        const hasBooking = reservations.some((reservation) => {
                          try {
                            const startTime = new Date(reservation.start_time)
                            return startTime.toDateString() === date.toDateString() && reservation.status !== 'canceled'
                          } catch (error) {
                            console.error(`Invalid date in calendar: ${reservation.start_time}`, error);
                            return false
                          }
                        })

                        return (
                          <div className="relative flex h-10 w-10 items-center justify-center p-0">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${date.toDateString() === new Date().toDateString() ? 'bg-[lch(17_23_133)] text-primary-foreground' : ''}`}>
                              {format(date, "d")}
                            </div>
                            {hasBooking && (
                              <div className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[lch(83_56_130)]" />
                            )}
                          </div>
                        )
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      {/* Room Detail Modal */}
      <ReservationDetail 
        reservation={selectedBooking} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)}
        onCancel={handleCancelReservation}
      />
    </div>
  )
}


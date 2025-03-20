"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Clock } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { bookings } from "@/lib/fake_data"
import { RoomDetail } from "@/components/room_detail"
import Link from "next/link"

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showAllBookings, setShowAllBookings] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<typeof bookings[0] | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Calculate statistics - include today's bookings in the count
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const futureBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date)
    bookingDate.setHours(0, 0, 0, 0)
    return bookingDate >= today
  }).length

  // Get bookings for selected date or all future bookings (including today)
  const bookingsToDisplay = showAllBookings 
    ? bookings.filter((booking) => {
        const bookingDate = new Date(booking.date)
        bookingDate.setHours(0, 0, 0, 0)
        return bookingDate >= today
      })
    : bookings.filter((booking) => date && booking.date.toDateString() === date.toDateString())

  // Handle opening the detail modal
  const handleOpenDetail = (booking: typeof bookings[0]) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  return (
    <div className="flex min-h-[95cvh] flex-col">
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
                <CardDescription className="text-[#163300]">Future Bookings</CardDescription>
                <CardTitle className="text-4xl text-[#163300]">{futureBookings}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#163300]">Your Schedule</CardTitle>
                <CardDescription className="text-[hsl(0_0_0%)]">View and manage your upcoming room bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookingsToDisplay.length > 0 ? (
                    bookingsToDisplay.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleOpenDetail(booking)}
                      >
                        <div className="space-y-1">
                          <h3 className="font-medium">{booking.roomName}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            {booking.startTime} - {booking.endTime}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {format(booking.date, "MMM d")}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                      <div className="text-center">
                        <h3 className="font-medium">No bookings for this date</h3>
                        <p className="text-sm text-muted-foreground">Select another date or <Link href="/dashboard/search" className="text-[#163300] underline">book a room</Link></p>
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
                          ? 'bg-[#163300] text-white' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
                          ? 'bg-[#163300] text-white' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
                        const hasBooking = bookings.some((booking) => booking.date.toDateString() === date.toDateString())

                        return (
                          <div className="relative flex h-10 w-10 items-center justify-center p-0">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${date.toDateString() === new Date().toDateString() ? 'bg-[#163300] text-primary-foreground' : ''}`}>
                              {format(date, "d")}
                            </div>
                            {hasBooking && (
                              <div className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#9FE870]" />
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
      <RoomDetail 
        booking={selectedBooking} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
    </div>
  )
}


"use client"

import { useState } from "react"
import {  Clock } from "lucide-react"
import { addDays, format, startOfToday } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Mock data for bookings
const bookings = [
  {
    id: 1,
    roomName: "Conference Room A",
    date: addDays(startOfToday(), 1),
    startTime: "09:00",
    endTime: "10:00",
  },
  {
    id: 2,
    roomName: "Meeting Room B",
    date: addDays(startOfToday(), 1),
    startTime: "14:00",
    endTime: "15:30",
  },
  {
    id: 3,
    roomName: "Board Room",
    date: addDays(startOfToday(), 3),
    startTime: "11:00",
    endTime: "12:00",
  },
  {
    id: 4,
    roomName: "Conference Room C",
    date: addDays(startOfToday(), 5),
    startTime: "13:00",
    endTime: "14:00",
  },
]

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Calculate statistics
  const futureBookings = bookings.filter((booking) => booking.date > new Date()).length

  // Get bookings for selected date
  const selectedDateBookings = bookings.filter((booking) => date && booking.date.toDateString() === date.toDateString())

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
                <CardDescription>Future Bookings</CardDescription>
                <CardTitle className="text-4xl">{futureBookings}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
            <Card>
              <CardHeader>
                <CardTitle>Your Schedule</CardTitle>
                <CardDescription>View and manage your upcoming room bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedDateBookings.length > 0 ? (
                    selectedDateBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between rounded-lg border p-4">
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
                        <p className="text-sm text-muted-foreground">Select another date or book a room</p>
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
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
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
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}


"use client"

import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Search, Calendar, ArrowUpDown } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Definition of booking record types
interface Attendee {
  user_id: string
  avatar: string
  username: string
  email: string
  status: string
  created_at: string // Timestamp
  updated_at: string // Timestamp
}

interface Booking {
  reservation_id: string
  room_id: string
  room_name: string
  building: string
  floor: number
  user_id: string 
  user_name: string 
  start_time: string // Timestamp
  end_time: string // Timestamp
  created_at: string // Timestamp
  updated_at: string // Timestamp
  attendees: Attendee[]
  purpose: string
  status: 'pending' | 'confirmed' | 'canceled' | 'completed'
}

// status
const statusMap = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  canceled: { label: 'Canceled', color: 'bg-red-100 text-red-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' }
}

const formatDate = (timestamp: string): string => {
  try {
    // Processing ISO format time with a+sign
      if (timestamp.startsWith('+')) {
        // Remove the+sign and parse the year
      const year = parseInt(timestamp.substring(1, 6));
      const rest = timestamp.substring(6);
      
      // Adjust the year to the acceptable range (current year)
      const currentYear = new Date().getFullYear();
      const adjustedYear = year % 10000 + currentYear - (currentYear % 10000);
      
      const date = new Date(`${adjustedYear}${rest}`);
      if (isNaN(date.getTime())) {
        console.error('Invalid extended ISO date:', timestamp);
        return "Invalid Date";
      }
      
      // Format the date but keep the original year
      const formattedDate = date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      return `${year}-${formattedDate}`;
    }

    // Check if it is a standard ISO format time string
    if (timestamp.includes('T')) {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.error('Invalid ISO date:', timestamp);
        return "Invalid Date";
      }
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    // Process timestamp format
    const timestampNum = parseInt(timestamp);
    if (isNaN(timestampNum)) {
      console.error('Invalid timestamp:', timestamp);
      return "Invalid Date";
    }

    const date = new Date(timestampNum * 1000);
    if (isNaN(date.getTime())) {
      console.error('Invalid date from timestamp:', timestampNum);
      return "Invalid Date";
    }

    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error("Date formatting error:", error, "for timestamp:", timestamp);
    return "Invalid Date";
  }
};

const ManageBookingPage = () => {
  // State Definition
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  
  // Filter Criteria
  const [filters, setFilters] = useState({
    date: '',
    startTime: '',
    endTime: '',
    roomName: '',
    status: 'all',
    search: '',
    reservationId: ''
  })

  // Detail Dialog
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Sorting
  const [sortByStatus, setSortByStatus] = useState(false)
  const [sortByReservationId, setSortByReservationId] = useState(false)

  // Cancel Dialog
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Add pagination calculation logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)

  // Add page change handler
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Get a list of booking records
  const fetchBookings = async () => {
    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${backendUrl}/admin/reservations`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      console.log('Fetched bookings:', data.data);
      
      if (data.code === 200) {
        setBookings(data.data);
        setFilteredBookings(data.data);
      } else {
        console.error(data.message || 'Failed to retrieve booking records');
        setBookings([]);
        setFilteredBookings([]);
      }
    } catch (error) {
      console.error('Failed to retrieve booking records:', error);
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  }

  // Apply filter
  const applyFilters = () => {
    let result = [...bookings]
    
    if (filters.reservationId) {
      result = result.filter(booking => 
        booking.reservation_id.toLowerCase().includes(filters.reservationId.toLowerCase())
      )
    }
    
    if (filters.date) {
      console.log('Selected date:', filters.date);
      result = result.filter(booking => {
        try {
          let startTime: Date;
          
          // Process extended ISO format with a+sign
          if (booking.start_time.startsWith('+')) {
            // Remove the+sign and parse the year
            const year = parseInt(booking.start_time.substring(1, 6));
            const rest = booking.start_time.substring(6);
            
            // Adjust the year to the acceptable range (current year)
            const currentYear = new Date().getFullYear();
            const adjustedYear = year % 10000 + currentYear - (currentYear % 10000);
            
            startTime = new Date(`${adjustedYear}${rest}`);
          } 
          // Process standard ISO format
          else {
            startTime = new Date(booking.start_time);
          }

          if (isNaN(startTime.getTime())) {
            console.error('Invalid start_time:', booking.start_time);
            return false;
          }

          console.log('Original timestamp:', booking.start_time, 'Parsed date:', startTime.toISOString());

          // Convert the selected date to the start of the same day
          const selectedDate = new Date(filters.date);
          selectedDate.setHours(0, 0, 0, 0);
          
          // Set the booking start time to the start of the same day
          const bookingDate = new Date(startTime);
          bookingDate.setHours(0, 0, 0, 0);
          
          console.log('Booking date:', bookingDate.toISOString(), 'Selected date:', selectedDate.toISOString());
          
          // Compare dates to see if they are the same
          const isMatch = bookingDate.getTime() === selectedDate.getTime();
          console.log('Date match:', isMatch, 'for booking:', booking.reservation_id);
          return isMatch;
        } catch (error) {
          console.error('Error processing date:', error, 'for booking:', booking.reservation_id);
          return false;
        }
      });
    }
    
    if (filters.startTime && filters.endTime) {
      const [startHour, startMinute] = filters.startTime.split(':').map(Number)
      const [endHour, endMinute] = filters.endTime.split(':').map(Number)
      
      result = result.filter(booking => {
        try {
          let bookingStart: Date;
          let bookingEnd: Date;
          
          // Process extended ISO format with a+sign
          if (booking.start_time.startsWith('+')) {
            // Process start time
            const startYear = parseInt(booking.start_time.substring(1, 6));
            const startRest = booking.start_time.substring(6);
            const currentYear = new Date().getFullYear();
            const adjustedStartYear = startYear % 10000 + currentYear - (currentYear % 10000);
            bookingStart = new Date(`${adjustedStartYear}${startRest}`);
            
            // Process end time
            const endYear = parseInt(booking.end_time.substring(1, 6));
            const endRest = booking.end_time.substring(6);
            const adjustedEndYear = endYear % 10000 + currentYear - (currentYear % 10000);
            bookingEnd = new Date(`${adjustedEndYear}${endRest}`);
          } 
          // Process standard ISO format
          else {
            bookingStart = new Date(booking.start_time);
            bookingEnd = new Date(booking.end_time);
          }
          
          if (isNaN(bookingStart.getTime()) || isNaN(bookingEnd.getTime())) {
            console.error('Invalid time values:', booking.start_time, booking.end_time);
            return false;
          }
          
          const bookingStartHour = bookingStart.getHours()
          const bookingStartMinute = bookingStart.getMinutes()
          const bookingEndHour = bookingEnd.getHours()
          const bookingEndMinute = bookingEnd.getMinutes()
          
          // Convert to minutes for comparison
          const bookingStartMinutes = bookingStartHour * 60 + bookingStartMinute
          const bookingEndMinutes = bookingEndHour * 60 + bookingEndMinute
          const filterStartMinutes = startHour * 60 + startMinute
          const filterEndMinutes = endHour * 60 + endMinute
          
          // Check if the filter time range is completely included in the booking time range
          const isWithinRange = (
            filterStartMinutes >= bookingStartMinutes && // Filter start time is later than or equal to booking start time
            filterEndMinutes <= bookingEndMinutes       // Filter end time is earlier than or equal to booking end time
          )
          
          console.log('Time range check:', {
            booking: {
              start: `${bookingStartHour}:${bookingStartMinute}`,
              end: `${bookingEndHour}:${bookingEndMinute}`,
              startMinutes: bookingStartMinutes,
              endMinutes: bookingEndMinutes
            },
            filter: {
              start: `${startHour}:${startMinute}`,
              end: `${endHour}:${endMinute}`,
              startMinutes: filterStartMinutes,
              endMinutes: filterEndMinutes
            },
            isWithinRange
          });
          
          return isWithinRange;
        } catch (error) {
          console.error('Error processing time range:', error, 'for booking:', booking.reservation_id);
          return false;
        }
      })
    }
    
    if (filters.roomName) {
      result = result.filter(booking => 
        booking.room_name.toLowerCase().includes(filters.roomName.toLowerCase())
      )
    }
    
    if (filters.status && filters.status !== 'all') {
      result = result.filter(booking => booking.status === filters.status)
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(booking => 
        booking.user_name.toLowerCase().includes(searchLower)
      )
    }
    
    // Booking ID sorting
    if (sortByReservationId) {
      result = sortByBookingId(result)
    }
    
    // Status sorting
    if (sortByStatus) {
      result = sortByOperationStatus(result)
    }
    
    console.log('Filtered results:', result.length);
    setFilteredBookings(result)
  }

  // Reset filter
  const resetFilters = () => {
    setFilters({
      date: '',
      startTime: '',
      endTime: '',
      roomName: '',
      status: 'all',
      search: '',
      reservationId: ''
    })
    setFilteredBookings(bookings)
  }

  // Handling changes in filtering criteria
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Sort bookings
  const sortByOperationStatus = (bookings: Booking[]) => {
    if (sortByStatus) {
      return [...bookings].sort((a, b) => {
        // Define status sorting priority
        const statusPriority = {
          'pending': 1,
          'confirmed': 2,
          'completed': 3,
          'canceled': 4
        }
        return statusPriority[a.status] - statusPriority[b.status]
      })
    }
    return bookings
  }

  // Booking ID sorting
  const sortByBookingId = (bookings: Booking[]) => {
    if (sortByReservationId) {
      return [...bookings].sort((a, b) => 
        b.reservation_id.localeCompare(a.reservation_id) // Descending order
      )
    }
    return bookings
  }

  // Load data
  useEffect(() => {
    fetchBookings()
  }, [])

  // Apply filter
  useEffect(() => {
    applyFilters()
  }, [filters, bookings, sortByStatus, sortByReservationId])

  // Add cancel booking function
  const handleCancelBooking = async () => {
    if (!selectedBooking) return
    
    try {
      // TODO: Actual cancellation API call
      
      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.reservation_id === selectedBooking.reservation_id
            ? { ...booking, status: 'canceled' }
            : booking
        )
      )
      
      // Reset state
      setIsCancelDialogOpen(false)
      setAdminPassword('')
      setSelectedBooking(null)
    } catch (error) {
      console.error('Failed to cancel booking:', error)
    }
  }

  return (
    <div className="flex min-h-[95cvh] flex-col py-6 ml-12">
      <div className="flex flex-1 justify-center">
        <main className="flex-1 p-4 md:p-6 min-w-[80vw]">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Booking Management</h1>
            </div>

            {/* filter */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-lg font-semibold">Filter Bookings</h2>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-date">Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <DatePicker
                      selected={filters.date ? new Date(filters.date) : null}
                      onChange={(date: Date | null) => handleFilterChange('date', date ? format(date, 'yyyy-MM-dd') : '')}
                      dateFormat="yyyy-MM-dd"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholderText="Select date"
                      isClearable
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-start-time">Start Time</Label>
                  <Input
                    id="filter-start-time"
                    type="time"
                    value={filters.startTime}
                    onChange={(e) => handleFilterChange('startTime', e.target.value)}
                    className="w-[120px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-end-time">End Time</Label>
                  <Input
                    id="filter-end-time"
                    type="time"
                    value={filters.endTime}
                    onChange={(e) => handleFilterChange('endTime', e.target.value)}
                    className="w-[120px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-status">Status</Label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-room">Meeting Room</Label>
                  <Input
                    id="filter-room"
                    placeholder="Search room"
                    value={filters.roomName}
                    onChange={(e) => handleFilterChange('roomName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-search">User</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="filter-search"
                      placeholder="Search user name"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* data table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[20%]">Meeting Room</TableHead>
                        <TableHead className="w-[15%]">User</TableHead>
                        <TableHead className="w-[20%]">Booking Time</TableHead>
                        <TableHead className="w-[15%]">Status</TableHead>
                        <TableHead className="w-[15%]">
                          <div className="flex items-center justify-between">
                            Operation
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 ml-2"
                              onClick={() => setSortByStatus(!sortByStatus)}
                            >
                              <ArrowUpDown 
                                className={`h-4 w-4 ${sortByStatus ? 'text-primary' : 'text-gray-400'}`}
                              />
                              <span className="sr-only">
                                Sort by status
                              </span>
                            </Button>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentBookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No booking records
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentBookings.map((booking) => (
                          <TableRow key={booking.reservation_id}>
                            <TableCell>{booking.room_name}</TableCell>
                            <TableCell>
                              <span className="font-medium">{booking.user_name}</span>
                            </TableCell>
                            <TableCell>
                              {formatDate(booking.start_time)} - {formatDate(booking.end_time)}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusMap[booking.status]?.color || ''}>
                                {statusMap[booking.status]?.label || booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-start gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBooking(booking)
                                    setIsDetailDialogOpen(true)
                                  }}
                                >
                                  Details
                                </Button>
                                {booking.status === 'pending' && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBooking(booking)
                                      setIsCancelDialogOpen(true)
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Add pagination component */}
                {filteredBookings.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="text-sm text-gray-500">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBookings.length)} of {filteredBookings.length} records
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 ${
                            pageNum === currentPage ? 'bg-primary text-primary-foreground' : ''
                          }`}
                        >
                          {pageNum}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Booking Details Dialogue Box*/}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Booking Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Meeting Room</label>
                      <p className="font-medium">{selectedBooking.room_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Booking User</label>
                      <p className="font-medium">{selectedBooking.user_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Booking Time</label>
                      <p className="font-medium">
                        {formatDate(selectedBooking.start_time)} - {formatDate(selectedBooking.end_time)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Created Time</label>
                      <p className="font-medium">{formatDate(selectedBooking.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Updated Time</label>
                      <p className="font-medium">{formatDate(selectedBooking.updated_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Purpose</label>
                      <p className="font-medium">{selectedBooking.purpose}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Status</label>
                      <Badge className={`mt-1 ${statusMap[selectedBooking.status]?.color || ''}`}>
                        {statusMap[selectedBooking.status]?.label || selectedBooking.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Attendees</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedBooking?.attendees && selectedBooking.attendees.length > 0 ? (
                          selectedBooking.attendees.map((attendee, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="px-2 py-1"
                            >
                              {attendee?.username || 'Unknown User'}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No attendees</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Confirmation Dialogue Box */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p><strong>Meeting Room:</strong> {selectedBooking?.room_name}</p>
              <p><strong>Booking Time:</strong> {selectedBooking && 
                `${formatDate(selectedBooking.start_time)} - ${formatDate(selectedBooking.end_time)}`}</p>
            </div>
            <div className="mt-4">
              <Label htmlFor="adminPassword">Please enter the admin password to confirm</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCancelDialogOpen(false)
              setAdminPassword('')
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking}
              disabled={!adminPassword}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ManageBookingPage

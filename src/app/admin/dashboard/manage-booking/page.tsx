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
import { Loader2, Search, Calendar, ArrowUpDown, DoorClosed, MapPin, User, UserPlus, Clock, CalendarDays, Target } from 'lucide-react'
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

interface Booking {
  reservation_id: string
  meeting_room: {
    room_id: string
    image: string
    name: string
    status: string // 'active' | 'maintenance' | 'using' | 'booked' | 'deleted'
    capacity_min: number
    capacity_max: number
    building: string
    floor: string
    facilities: {
      projector: boolean | null
      whiteboard: number | null
      power_sockets: number | null
      coffee_break: boolean | null
      special_notes: string[] | null
      [key: string]: boolean | number | string[] | null
    }
    [key: string]: string | number | {
      projector: boolean | null
      whiteboard: number | null
      power_sockets: number | null
      coffee_break: boolean | null
      special_notes: string[] | null
      [key: string]: boolean | number | string[] | null
    }
  }
  user_id: string
  user_name: string
  start_time: number
  end_time: number
  created_at: number
  updated_at: number
  attendees: Array<{
    user_id: string
    avatar: string
    username: string
    email: string
    status: string
    created_at: number
    updated_at: number
    [key: string]: string | number
  }>
  purpose: string
  status: 'pending' | 'confirmed' | 'canceled' | 'completed'
  [key: string]: string | number | {
    room_id: string
    image: string
    name: string
    status: string
    capacity_min: number
    capacity_max: number
    building: string
    floor: string
    facilities: {
      projector: boolean | null
      whiteboard: number | null
      power_sockets: number | null
      coffee_break: boolean | null
      special_notes: string[] | null
      [key: string]: boolean | number | string[] | null
    }
    [key: string]: string | number | {
      projector: boolean | null
      whiteboard: number | null
      power_sockets: number | null
      coffee_break: boolean | null
      special_notes: string[] | null
      [key: string]: boolean | number | string[] | null
    }
  } | Array<{
    user_id: string
    avatar: string
    username: string
    email: string
    status: string
    created_at: number
    updated_at: number
    [key: string]: string | number
  }>
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
  const [sortByTime, setSortByTime] = useState<'asc' | 'desc' | null>(null)
  const [sortByCreatedTime, setSortByCreatedTime] = useState<'asc' | 'desc' | null>('desc')

  // Cancel Dialog
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [pageInput, setPageInput] = useState<string>('1');

  // Add pagination calculation logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)

  // Add page change handler
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setPageInput(pageNumber.toString());
  }

  // Get a list of booking records
  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/reservations`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      console.log('Fetched bookings:', data.data);
      
      if (data.code === 200) {
        // De duplication processing: Use Map to ensure that each reservation_id only retains one record
        const uniqueBookings = Array.from(
          new Map(data.data.map((booking: Booking) => [booking.reservation_id, booking])).values()
        ) as Booking[];
        
        setBookings(uniqueBookings);
        setFilteredBookings(uniqueBookings);
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
          if (booking.start_time.toString().startsWith('+')) {
            // Remove the+sign and parse the year
            const year = parseInt(booking.start_time.toString().substring(1, 6));
            const rest = booking.start_time.toString().substring(6);
            
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
          if (booking.start_time.toString().startsWith('+')) {
            // Process start time
            const startYear = parseInt(booking.start_time.toString().substring(1, 6));
            const startRest = booking.start_time.toString().substring(6);
            const currentYear = new Date().getFullYear();
            const adjustedStartYear = startYear % 10000 + currentYear - (currentYear % 10000);
            bookingStart = new Date(`${adjustedStartYear}${startRest}`);
            
            // Process end time
            const endYear = parseInt(booking.end_time.toString().substring(1, 6));
            const endRest = booking.end_time.toString().substring(6);
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
        booking.meeting_room.name.toLowerCase().includes(filters.roomName.toLowerCase())
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
    
    // Apply sorting
    if (sortByStatus) {
      result = sortByOperationStatus(result);
    }
    if (sortByTime) {
      result = sortByBookingTime(result);
    }
    if (sortByCreatedTime) {
      result = sortByCreatedTimeFunc(result);
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

  // Sort by booking time
  const sortByBookingTime = (bookings: Booking[]) => {
    if (!sortByTime) return bookings;
    
    return [...bookings].sort((a, b) => {
      const timeA = new Date(a.start_time).getTime();
      const timeB = new Date(b.start_time).getTime();
      return sortByTime === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }

  // Sort by created time
  const sortByCreatedTimeFunc = (bookings: Booking[]) => {
    if (!sortByCreatedTime) return bookings;
    
    return [...bookings].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortByCreatedTime === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }

  // Load data
  useEffect(() => {
    fetchBookings()
  }, [])

  // Apply filter
  useEffect(() => {
    applyFilters()
  }, [filters, bookings, sortByStatus, sortByTime, sortByCreatedTime])

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

  // Modify time option generation function
  const generateTimeOptions = () => {
    return Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2)
      const minute = (i % 2) * 30
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    })
  }

  // Add time option status
  const timeOptions = generateTimeOptions()

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
                  <Select 
                    value={filters.startTime} 
                    onValueChange={(value) => handleFilterChange('startTime', value)}
                  >
                    <SelectTrigger id="filter-start-time" className="h-9">
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.slice(0, -1).map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-end-time">End Time</Label>
                  <Select 
                    value={filters.endTime} 
                    onValueChange={(value) => handleFilterChange('endTime', value)}
                  >
                    <SelectTrigger id="filter-end-time" className="h-9">
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.filter(time => time > filters.startTime).map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="filter-room"
                      placeholder="Search room"
                      value={filters.roomName}
                      onChange={(e) => handleFilterChange('roomName', e.target.value)}
                      className="pl-8"
                    />
                  </div>
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
                <div className="h-[700px] overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[12%]">Meeting Room</TableHead>
                        <TableHead className="w-[13%]">User</TableHead>
                        <TableHead className="w-[25%]">
                          <div className="flex items-center justify-between">
                            Booking Time
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 ml-2"
                              onClick={() => {
                                if (sortByTime === 'asc') {
                                  setSortByTime('desc');
                                } else if (sortByTime === 'desc') {
                                  setSortByTime(null);
                                } else {
                                  setSortByTime('asc');
                                }
                                setSortByStatus(false);
                                setSortByCreatedTime(null);
                              }}
                            >
                              <ArrowUpDown 
                                className={`h-4 w-4 ${sortByTime ? 'text-primary' : 'text-gray-400'}`}
                              />
                              <span className="sr-only">
                                Sort by booking time
                              </span>
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="w-[15%]">
                          <div className="flex items-center justify-between">
                            Created Time
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 ml-2"
                              onClick={() => {
                                if (sortByCreatedTime === 'asc') {
                                  setSortByCreatedTime('desc');
                                } else if (sortByCreatedTime === 'desc') {
                                  setSortByCreatedTime(null);
                                } else {
                                  setSortByCreatedTime('asc');
                                }
                                setSortByStatus(false);
                                setSortByTime(null);
                              }}
                            >
                              <ArrowUpDown 
                                className={`h-4 w-4 ${sortByCreatedTime ? 'text-primary' : 'text-gray-400'}`}
                              />
                              <span className="sr-only">
                                Sort by created time
                              </span>
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="w-[10%]">Status</TableHead>
                        <TableHead className="w-[15%]">
                          <div className="flex items-center justify-between">
                            Operation
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 ml-2"
                              onClick={() => {
                                setSortByStatus(!sortByStatus);
                                setSortByTime(null);
                                setSortByCreatedTime(null);
                              }}
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
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No booking records
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {currentBookings.map((booking, index) => (
                            <TableRow key={`${booking.reservation_id}-${index}`}>
                              <TableCell>{booking.meeting_room.name}</TableCell>
                              <TableCell>
                                <span className="font-medium">{booking.user_name}</span>
                              </TableCell>
                              <TableCell>
                                {formatDate(booking.start_time.toString())} - {formatDate(booking.end_time.toString())}
                              </TableCell>
                              <TableCell>
                                {formatDate(booking.created_at.toString())}
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
                          ))}
                          {/* Add blank lines*/}
                          {currentBookings.length < 10 && Array(10 - currentBookings.length).fill(0).map((_, index) => (
                            <TableRow key={`empty-${index}`} className="h-[64px]">
                              <TableCell colSpan={6}></TableCell>
                            </TableRow>
                          ))}
                        </>
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
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={pageInput}
                          onChange={(e) => {
                            setPageInput(e.target.value);
                            const page = parseInt(e.target.value);
                            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                              handlePageChange(page);
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value === '' || parseInt(value) < 1) {
                              handlePageChange(1);
                            } else if (parseInt(value) > totalPages) {
                              handlePageChange(totalPages);
                            }
                          }}
                          className="w-16 h-8 text-center"
                        />
                        <span className="text-sm text-gray-500">/ {totalPages}</span>
                      </div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl font-bold">Booking Details</DialogTitle>
              {selectedBooking && (
                <Badge className={`${
                  selectedBooking.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : selectedBooking.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : selectedBooking.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : selectedBooking.status === 'canceled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                </Badge>
              )}
            </div>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Meeting Room Information */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Meeting Room Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DoorClosed className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Name: </span>
                      {selectedBooking.meeting_room.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Location: </span>
                      {selectedBooking.meeting_room.building}, Floor {selectedBooking.meeting_room.floor}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking User Information */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Booking User Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm flex items-center gap-2">
                      <span className="font-medium">Booking User:</span>
                      <Badge 
                        variant="outline" 
                        className="px-2 py-1"
                      >
                        {selectedBooking.user_name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Attendees: </span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedBooking.attendees && selectedBooking.attendees.length > 0 ? (
                          selectedBooking.attendees.map((attendee, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="px-2 py-1"
                            >
                              {attendee?.username || 'Unknown'}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No Attendees</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Booking Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Booking Time: </span>
                      {formatDate(selectedBooking.start_time.toString())} - {formatDate(selectedBooking.end_time.toString())}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Created Time: </span>
                      {formatDate(selectedBooking.created_at.toString())}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Update Time: </span>
                      {formatDate(selectedBooking.updated_at.toString())}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span className="font-medium">Purpose: </span>
                      {selectedBooking.purpose}
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
              <p><strong>Meeting Room:</strong> {selectedBooking?.meeting_room.name}</p>
              <p><strong>Booking Time:</strong> {selectedBooking && 
                `${formatDate(selectedBooking.start_time.toString())} - ${formatDate(selectedBooking.end_time.toString())}`}</p>
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

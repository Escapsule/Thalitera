"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Clock, ArrowUp, ArrowDown, Search } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReservationDetail } from "@/components/user/reservation_detail"
import Link from "next/link"
import { toast } from "sonner"
import { useUserInfo } from "@/hooks/useUserInfo"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// API response interface based on documentation
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
  timestamp: string;
}

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

interface MeetingRoom {
  room_id?: string;
  room_name?: string;
  building?: string;
  floor?: string | number;
  capacity?: number;
  status?: string;
}

interface Reservation {
  reservation_id: string;
  room_id: string;
  room_name?: string;
  meeting_room?: MeetingRoom;
  user_id: string;
  user_name: string;
  building?: string;
  floor?: string | number;
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
  const [showAllBookings, setShowAllBookings] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [needsRefresh, setNeedsRefresh] = useState(false)
  
  // New state for sorting and filtering
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [attendeeInput, setAttendeeInput] = useState("")
  const [filterBuilding, setFilterBuilding] = useState("_all")
  const [filteredBuildings, setFilteredBuildings] = useState<string[]>([])
  const [filteredAttendees, setFilteredAttendees] = useState<string[]>([])
  
  // Active filters as state
  const [activeAttendees, setActiveAttendees] = useState<string[]>([])
  const [activeBuildings, setActiveBuildings] = useState<string[]>([])
  
  // View mode: upcoming or history
  const [viewMode, setViewMode] = useState<"upcoming" | "history">("upcoming")
  
  // Get user info using the hook
  const { data: userInfo } = useUserInfo()
  
  // Add type guard for userInfo
  const getUserEmail = (): string | null => {
    if (userInfo && typeof userInfo === 'object' && 'email' in userInfo && typeof userInfo.email === 'string') {
      return userInfo.email;
    }
    return null;
  }

  // Function to get username
  const getUserName = (): string => {
    if (userInfo && typeof userInfo === 'object' && 'user_name' in userInfo && typeof userInfo.user_name === 'string') {
      return userInfo.user_name;
    }
    return '';
  }

  // Function to get time-based greeting
  const getGreeting = (): string => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 5 && currentHour < 12) {
      return 'Good morning';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  }

  // Add state to track if a date has been selected
  const [dateFilterActive, setDateFilterActive] = useState(false)

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/calendar')
        
        const data = await response.json() as ApiResponse<Reservation[]>
        
        if (data.code !== 200) {
          // Handle specific error codes based on API documentation
          switch (data.code) {
            case 2001:
              toast.error('User not found. Please log in again.');
              break;
            case 2011:
              toast.error('You are not logged in. Please log in first.');
              break;
            case 2203:
              toast.warning('No reservation records found.');
              break;
            default:
              toast.error(data.message || 'Failed to fetch your reservations');
          }
          setReservations([]);
          return;
        }
        
        // Check if data is in the expected format
        if (data && data.data && Array.isArray(data.data)) {
          // Sort reservations by start_time in ascending order by default
          const sortedReservations = [...data.data].sort((a, b) => 
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
          
          setReservations(sortedReservations)
        } else {
          setReservations([])
        }
      } catch (error) {
        console.error('Error fetching calendar:', error)
        toast.error('Failed to load your reservations. Please try again later.')
        setReservations([])
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [])

  // Effect to update filtered buildings and attendees based on date selection
  useEffect(() => {
    // Get relevant reservations based on date selection
    const relevantReservations = showAllBookings 
      ? reservations.filter((reservation) => {
          try {
            const startTime = new Date(reservation.start_time)
            return startTime >= today && reservation.status !== 'canceled' && reservation.status !== 'completed'
          } catch (error) {
            console.error(`Invalid date format for all bookings: ${reservation.start_time}`, error);
            return false
          }
        })
      : reservations.filter((reservation) => {
          if (!date) return false
          try {
            const startTime = new Date(reservation.start_time)
            return startTime.toDateString() === date.toDateString() && reservation.status !== 'canceled' && reservation.status !== 'completed'
          } catch (error) {
            console.error(`Invalid date format for date filtering: ${reservation.start_time}`, error);
            return false
          }
        });
    
    // Extract unique buildings from filtered reservations
    const buildings = Array.from(new Set(relevantReservations.map(r => 
      r.meeting_room?.building || r.building || 'Unknown'
    )))
    setFilteredBuildings(buildings)
    
    // Extract unique attendee emails from filtered reservations
    const allAttendees = relevantReservations.flatMap(r => r.attendees.map(a => a.email))
    const uniqueEmails = Array.from(new Set(allAttendees))
    setFilteredAttendees(uniqueEmails)
    
    // Reset filters when changing date view if the current filter values aren't in the new set
    if (activeBuildings.length > 0) {
      setActiveBuildings(prev => prev.filter(building => buildings.includes(building)))
    }
    
    if (activeAttendees.length > 0) {
      setActiveAttendees(prev => prev.filter(email => uniqueEmails.includes(email)))
    }
    
  }, [date, showAllBookings, reservations]);

  // Check if current user is the creator of the reservation
  const isReservationCreator = (reservation: Reservation): boolean => {
    if (!userInfo) return false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (userInfo as any)?.user_id === reservation.user_id;
  }

  // Calculate statistics - include today's bookings in the count
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Current time for checking if a meeting is over
  const currentTime = new Date()
  
  const futureReservations = reservations.filter((reservation) => {
    try {
      const startTime = new Date(reservation.start_time)
      return startTime >= today && reservation.status !== 'canceled' && reservation.status !== 'completed'
    } catch (error) {
      console.error(`Invalid date format for future filtering: ${reservation.start_time}`, error);
      return false
    }
  }).length

  // Count past reservations (meetings that have ended)
  const pastReservations = reservations.filter((reservation) => {
    try {
      // Consider a reservation as "past" if its end time is before current time
      // or if it's marked as completed (but not canceled)
      const endTime = new Date(reservation.end_time)
      return (endTime < currentTime || reservation.status === 'completed') && reservation.status !== 'canceled'
    } catch (error) {
      console.error(`Invalid date format for past filtering: ${reservation.end_time}`, error);
      return false
    }
  }).length

  // Calculate unique contacts (excluding user's own email)
  const uniqueContacts = (() => {
    // Get current user's email - handle the type safely
    const userEmail = getUserEmail() || '';
    
    // Collect all attendee emails from all reservations and deduplicate
    const allUniqueEmails = new Set<string>();
    
    // Process each reservation
    reservations.forEach(reservation => {
      // Add each attendee's email, skipping the current user's email
      reservation.attendees.forEach(attendee => {
        if (attendee.email && attendee.email !== userEmail) {
          allUniqueEmails.add(attendee.email.toLowerCase()); // Convert to lowercase for case-insensitive deduplication
        }
      });
    });
    
    // Log the unique emails to console
    console.log("Unique contact attendees:", Array.from(allUniqueEmails));
    
    // Return the count of unique emails
    return allUniqueEmails.size;
  })();

  // Function to check if a meeting is over (past end time)
  const isMeetingOver = (reservation: Reservation): boolean => {
    try {
      const endTime = new Date(reservation.end_time)
      return endTime < currentTime && reservation.status !== 'canceled' && reservation.status !== 'completed'
    } catch (error) {
      console.error(`Invalid date format for end time check: ${reservation.end_time}`, error);
      return false
    }
  }

  // Get bookings for selected date or all future bookings (including today)
  // Apply filters and sorting
  const reservationsToDisplay = (() => {
    // First filter by date and view mode
    let filtered = (() => {
      // Show past or upcoming meetings based on viewMode
      if (viewMode === "history") {
        // For history view, show ONLY meetings that have ended (end_time < currentTime) or are completed
        if (showAllBookings) {
          return reservations.filter((reservation) => {
            try {
              const endTime = new Date(reservation.end_time)
              // Include meetings that have ended or are marked as completed
              return (endTime < currentTime || reservation.status === 'completed') && reservation.status !== 'canceled'
            } catch (error) {
              console.error(`Invalid date format for history all view: ${reservation.end_time}`, error);
              return false
            }
          });
        } else {
          return reservations.filter((reservation) => {
            if (!date) return false
            try {
              const startTime = new Date(reservation.start_time)
              const endTime = new Date(reservation.end_time)
              // For a specific date, show meetings that have ended or are completed
              return startTime.toDateString() === date.toDateString() && 
                    (endTime < currentTime || reservation.status === 'completed') && 
                    reservation.status !== 'canceled'
            } catch (error) {
              console.error(`Invalid date format for history date filtering: ${reservation.start_time}`, error);
              return false
            }
          });
        }
      } else {
        // For upcoming view - EXCLUDE meetings that are over
        if (showAllBookings) {
          return reservations.filter((reservation) => {
            try {
              const startTime = new Date(reservation.start_time)
              const endTime = new Date(reservation.end_time)
              // Only include meetings that haven't ended yet
              return startTime >= today && 
                    endTime >= currentTime && 
                    reservation.status !== 'canceled' && 
                    reservation.status !== 'completed'
            } catch (error) {
              console.error(`Invalid date format for all bookings: ${reservation.start_time}`, error);
              return false
            }
          });
        } else {
          return reservations.filter((reservation) => {
            if (!date) return false
            try {
              const startTime = new Date(reservation.start_time)
              const endTime = new Date(reservation.end_time)
              // For selected date, only include meetings that haven't ended yet
              return startTime.toDateString() === date.toDateString() && 
                    endTime >= currentTime && 
                    reservation.status !== 'canceled' && 
                    reservation.status !== 'completed'
            } catch (error) {
              console.error(`Invalid date format for date filtering: ${reservation.start_time}`, error);
              return false
            }
          });
        }
      }
    })();
        
    // Filter by buildings if any are active
    if (activeBuildings.length > 0) {
      filtered = filtered.filter(reservation => {
        const building = reservation.meeting_room?.building || reservation.building;
        return building && activeBuildings.includes(building);
      });
    }
    
    // Filter by attendee email if any are active
    if (activeAttendees.length > 0) {
      filtered = filtered.filter(reservation => 
        reservation.attendees.some(attendee => 
          activeAttendees.includes(attendee.email)
        )
      );
    }
    
    // Apply sorting by start_time
    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.start_time).getTime();
      const timeB = new Date(b.start_time).getTime();
      return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
    });
  })();

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
      console.error(`Invalid date format: ${timestamp}`, error);
      return "Invalid time"
    }
  }

  // Truncate email to specified length
  const truncateEmail = (email: string, maxLength: number = 20): string => {
    if (email.length <= maxLength) return email;
    const atIndex = email.indexOf('@');
    
    if (atIndex <= maxLength - 3) {
      // Try to keep the domain part visible
      const username = email.substring(0, atIndex);
      const domain = email.substring(atIndex);
      
      if (username.length > maxLength - domain.length - 3) {
        // Truncate username part if needed
        return username.substring(0, maxLength - domain.length - 3) + '...' + domain;
      }
      return email; // No truncation needed
    }
    
    // Simple truncation if @ is too far
    return email.substring(0, maxLength - 3) + '...';
  }

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  // Add an attendee filter
  const addAttendeeFilter = (email: string) => {
    if (!activeAttendees.includes(email)) {
      setActiveAttendees(prev => [...prev, email]);
    }
    setAttendeeInput("");
  };

  // Add a building filter
  const addBuildingFilter = (building: string) => {
    if (building === "_all") {
      // Clear building selection
      setActiveBuildings([]);
    } else {
      // Replace any existing building with the new one (only one building can be selected)
      setActiveBuildings([building]);
    }
    
    // Reset the dropdown to show "Select Building" after selection
    setFilterBuilding("_all");
  };

  // Remove a specific filter
  const removeFilter = (type: 'building' | 'attendee', value: string) => {
    if (type === 'building') {
      setActiveBuildings(prev => prev.filter(b => b !== value));
    } else {
      setActiveAttendees(prev => prev.filter(a => a !== value));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveAttendees([]);
    setActiveBuildings([]);
    setAttendeeInput("");
    setFilterBuilding("_all");
  };

  // Cancel reservation handler with optimistic updates
  const handleCancelReservation = async (reservationId: string) => {
    try {
      // Find the reservation
      const reservation = reservations.find(r => r.reservation_id === reservationId);
      
      // Check if user is the creator of this reservation
      if (reservation && !isReservationCreator(reservation)) {
        toast.error("You can only cancel meetings that you've created.");
        return Promise.reject(new Error("Unauthorized: Not the meeting creator"));
      }
      
      // Optimistic UI update first for better UX
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
      
      // Make the actual API call
      const response = await fetch('/api/user/meetingroom/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationId),
      });
      
      const data = await response.json() as ApiResponse<string>;
      
      if (data.code !== 200) {
        // Revert optimistic update if API call fails
        const originalReservations = [...reservations];
        setReservations(originalReservations);
        
        if (selectedBooking) {
          setSelectedBooking({ ...selectedBooking });
        }
        
        // Handle specific error codes
        switch (data.code) {
          case 2011:
            toast.error('You are not logged in. Please log in first.');
            break;
          case 2203:
            toast.error('Reservation not found. It may have been deleted.');
            break;
          case 2207:
            toast.error('Missing reservation ID. Please try again.');
            break;
          default:
            toast.error(data.message || 'Failed to cancel reservation');
        }
        
        return Promise.reject(new Error(data.message || 'Failed to cancel reservation'));
      }
      
      // Set flag for refreshing data
      setNeedsRefresh(true);
      
      toast.success('Reservation successfully canceled');
      return Promise.resolve();
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      
      // Revert optimistic update if there's an exception
      const originalReservations = [...reservations];
      setReservations(originalReservations);
      
      if (selectedBooking) {
        setSelectedBooking({ ...selectedBooking });
      }
      
      toast.error('Failed to cancel reservation. Please try again.');
      return Promise.reject(error);
    }
  };

  // Handle the closing of detail dialog and refresh data if needed
  const handleDetailClose = () => {
    setIsDetailOpen(false);
    
    // Only refresh if changes were made (reservation was modified or canceled)
    if (needsRefresh) {
      // Set refresh flag to avoid loader
      setIsRefreshing(true);
      
      // Refresh reservations to get the latest data
      const fetchReservations = async () => {
        try {
          const response = await fetch('/api/user/calendar');
          const data = await response.json() as ApiResponse<Reservation[]>;
          
          if (data.code === 200 && data.data && Array.isArray(data.data)) {
            // Sort by start_time in current sort direction
            const sortedReservations = [...data.data].sort((a, b) => {
              const timeA = new Date(a.start_time).getTime();
              const timeB = new Date(b.start_time).getTime();
              return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
            });
            
            setReservations(sortedReservations);
          }
        } catch (error) {
          console.error('Error refreshing reservations:', error);
        } finally {
          setIsRefreshing(false);
          setNeedsRefresh(false);
        }
      };

      fetchReservations();
    }
  };

  return (
    <div className="flex h-screen flex-col py-6 ml-12 overflow-hidden">
      <header className="sticky top-0 z-10 flex h-12 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="mr-auto flex items-center gap-4">
          <h2 className="text-2xl font-medium">{getGreeting()}, {getUserName()}</h2>
        </div>
      </header>
      
      <div className="flex flex-1 justify-center overflow-hidden">
        <main className="flex-1 p-4 md:p-6 min-w-[80vw] overflow-hidden">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-[lch(17_23_133)]">Future Bookings</CardDescription>
                <CardTitle className="text-4xl text-[lch(17_23_133)]">{futureReservations}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-[lch(17_23_133)]">History Bookings</CardDescription>
                <CardTitle className="text-4xl text-[lch(17_23_133)]">{pastReservations}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-[lch(17_23_133)]">Contact Attendees</CardDescription>
                <CardTitle className="text-4xl text-[lch(17_23_133)]">{uniqueContacts}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px] h-[calc(100vh-200px)] overflow-hidden">
            <Card className="flex flex-col overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[lch(17_23_133)]">Your Schedule</CardTitle>
                    <CardDescription className="text-[lch(0_0_0)]">View and manage your room bookings</CardDescription>
                  </div>
                  <div className="flex bg-muted rounded-md">
                    <button 
                      onClick={() => {
                        setViewMode("upcoming");
                        // Clear date filter when changing view modes
                        setShowAllBookings(true);
                        setDateFilterActive(false);
                        setDate(new Date());
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        viewMode === "upcoming" 
                          ? 'bg-[lch(17_23_133)] text-white' 
                          : 'hover:bg-[lch(95_0_0)]'
                      }`}
                    >
                      Upcoming
                    </button>
                    <button 
                      onClick={() => {
                        setViewMode("history");
                        // Clear date filter when changing view modes
                        setShowAllBookings(true);
                        setDateFilterActive(false);
                        setDate(new Date());
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        viewMode === "history" 
                          ? 'bg-[lch(17_23_133)] text-white' 
                          : 'hover:bg-[lch(95_0_0)]'
                      }`}
                    >
                      History
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col">
                {/* Sort and filter controls */}
                <div className="flex flex-col gap-4 mb-4 flex-shrink-0">
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleSortDirection}
                      className="flex items-center gap-1"
                    >
                      {sortDirection === "asc" ? (
                        <>
                          <ArrowUp className="h-4 w-4" 
                            style={{ fill: 'currentColor', color: 'black', stroke: 'currentColor' }} 
                          />
                          <span>Timeline</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="h-4 w-4" 
                            style={{ fill: 'currentColor', color: 'black', stroke: 'currentColor' }} 
                          />
                          <span>Timeline</span>
                        </>
                      )}
                    </Button>
                    
                    <div className="flex gap-2">
                      <Select value={filterBuilding} onValueChange={(value) => {
                        addBuildingFilter(value);
                      }}>
                        <SelectTrigger className="w-[160px] h-9 text-xs">
                          <SelectValue placeholder="Filter by building" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_all">Select Building</SelectItem>
                          {filteredBuildings.map(building => (
                            <SelectItem key={building} value={building}>{building}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9">
                            <Search className="h-4 w-4 mr-1" />
                            Attendee
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64">
                          <DropdownMenuLabel>Search Attendee</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <div className="p-2">
                            <div className="flex gap-2 mb-2">
                              <Input
                                placeholder="Enter email"
                                value={attendeeInput}
                                onChange={(e) => setAttendeeInput(e.target.value)}
                                className="flex-1"
                                title={attendeeInput.length > 20 ? attendeeInput : undefined}
                              />
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => attendeeInput && addAttendeeFilter(attendeeInput)}
                                disabled={!attendeeInput}
                              >
                                +
                              </Button>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mb-2">
                              {attendeeInput.length > 0 && (
                                <span>
                                  Adding: {truncateEmail(attendeeInput, 25)}
                                </span>
                              )}
                            </div>
                            {filteredAttendees.length > 0 ? (
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-xs">Suggestions</DropdownMenuLabel>
                                {/* Add current user's email at the top with "Me" badge */}
                                {getUserEmail() && (
                                  <DropdownMenuItem 
                                    key="current-user" 
                                    onClick={() => addAttendeeFilter(getUserEmail() as string)}
                                    className="flex justify-between items-center"
                                  >
                                    <div className="flex items-center">
                                      <span>{truncateEmail(getUserEmail() as string, 30)}</span>
                                      <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0">Me</Badge>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addAttendeeFilter(getUserEmail() as string);
                                      }}
                                    >
                                      +
                                    </Button>
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                {filteredAttendees
                                  .filter(email => 
                                    (!attendeeInput || email.toLowerCase().includes(attendeeInput.toLowerCase())) && 
                                    (!getUserEmail() || email !== getUserEmail()) // Exclude current user's email since it's shown separately
                                  )
                                  .slice(0, 5)
                                  .map(email => (
                                    <DropdownMenuItem 
                                      key={email} 
                                      onClick={() => addAttendeeFilter(email)}
                                      className="flex justify-between"
                                    >
                                      <span>{truncateEmail(email, 30)}</span>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addAttendeeFilter(email);
                                        }}
                                      >
                                        +
                                      </Button>
                                    </DropdownMenuItem>
                                  ))
                                }
                              </DropdownMenuGroup>
                            ) : (
                              <div className="text-xs text-center text-muted-foreground py-2">
                                No attendees found in current view
                              </div>
                            )}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Active filters display */}
                  {(activeBuildings.length > 0 || activeAttendees.length > 0 || dateFilterActive) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button variant="secondary" size="sm" onClick={() => {
                        clearFilters();
                        setShowAllBookings(true); // Reset to all bookings
                        setDateFilterActive(false); // Clear date filter
                        setDate(new Date()); // Reset date to current date
                
                      }} className="h-7 hover:bg-[lch(17_23_133)] hover:text-white">
                        Clear All
                      </Button>
                      
                      {activeBuildings.map(building => (
                        <Badge 
                          key={`building-${building}`} 
                          variant="outline"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          <span>Building: {building}</span>
                          <button 
                            onClick={() => removeFilter('building', building)}
                            className="ml-1 h-4 w-4 rounded-full text-xs flex items-center justify-center hover:bg-muted"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                      
                      {activeAttendees.map(email => (
                        <Badge 
                          key={`attendee-${email}`} 
                          variant="outline"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          <span>Attendee: {truncateEmail(email)}</span>
                          <button 
                            onClick={() => removeFilter('attendee', email)}
                            className="ml-1 h-4 w-4 rounded-full text-xs flex items-center justify-center hover:bg-muted"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                      
                      {dateFilterActive && (
                        <Badge 
                          variant="outline"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          <span>Date: {format(date!, "MMM d, yyyy")}</span>
                          <button 
                            onClick={() => {
                              setShowAllBookings(true);
                              setDateFilterActive(false);
                              setDate(new Date()); // Reset date to current date
                            }}
                            className="ml-1 h-4 w-4 rounded-full text-xs flex items-center justify-center hover:bg-muted"
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 flex-1 overflow-hidden">
                  {loading ? (
                    <div className="flex h-[200px] items-center justify-center">
                      <div className="text-center">
                        <h3 className="font-medium">Loading your reservations...</h3>
                      </div>
                    </div>
                  ) : reservationsToDisplay.length > 0 ? (
                    <div className={`h-full overflow-y-auto pr-2 ${isRefreshing ? "opacity-70 transition-opacity duration-200" : ""}`}>
                      {reservationsToDisplay.map((reservation) => (
                        <div 
                          key={reservation.reservation_id + reservation.start_time} 
                          className="flex items-center justify-between rounded-lg border p-4 hover:bg-[lch(97_0_0)] cursor-pointer transition-colors mb-3"
                          onClick={() => handleOpenDetail(reservation)}
                        >
                          <div className="space-y-1">
                            <h3 className="font-medium">{reservation.meeting_room?.room_name || reservation.room_name || "Meeting Room"}</h3>
                            <div className="text-xs text-muted-foreground">
                              {reservation.meeting_room ? 
                                `${reservation.meeting_room.building || 'Unknown'}, Floor ${reservation.meeting_room.floor || 'Unknown'}` :
                                `${reservation.building || 'Unknown'}, Floor ${reservation.floor || 'Unknown'}`
                              }
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-4 w-4" />
                              {formatTimeString(reservation.start_time)} - {formatTimeString(reservation.end_time)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              <span className="font-medium">Reserved by:</span> {reservation.user_name}
                            </div>
                            {reservation.purpose && (
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Purpose:</span> {reservation.purpose}
                              </div>
                            )}
                            {reservation.attendees && reservation.attendees.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Attendees:</span> {reservation.attendees.length}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="ml-auto">
                              {format(new Date(reservation.start_time), "MMM d")}
                            </Badge>
                            <Badge 
                              variant={
                                reservation.status === 'canceled' ? 'destructive' : 
                                reservation.status === 'completed' ? 'secondary' : 
                                reservation.status === 'pending' ? 'outline' :
                                isMeetingOver(reservation) ? 'secondary' :
                                'default'
                              }
                              className="text-xs"
                            >
                              {isMeetingOver(reservation) ? 'Over' : reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                      <div className="text-center">
                        <h3 className="font-medium">No bookings found</h3>
                        <p className="text-sm text-muted-foreground">
                          {filterBuilding !== "_all" || activeAttendees.length > 0 ? 
                            "Try adjusting your filters or " : 
                            viewMode === "history" ?
                              "You don't have any past bookings for this date" :
                              "Select another date or "}
                          {viewMode === "upcoming" && (
                            <Link href="/dashboard/search" className="text-[lch(17_23_133)] underline">book a room</Link>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="flex flex-col h-full overflow-hidden">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view your bookings</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div className="flex flex-col gap-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      if (newDate) {
                        setDate(newDate);
                        setShowAllBookings(false);
                        setDateFilterActive(true); // Mark date filter as active
                      }
                    }}
                    className="rounded-md border shadow-sm"
                    disabled={(date) => {
                      // In "history" mode, disable future dates (after today)
                      // In "upcoming" mode, disable past dates (before today)
                      const today = new Date(new Date().setHours(0, 0, 0, 0));
                      return viewMode === "history" 
                        ? date > today 
                        : date < today;
                    }}
                    initialFocus
                    components={{
                      DayContent: (props) => {
                        const date = props.date
                        const hasBooking = reservations.some((reservation) => {
                          try {
                            const startTime = new Date(reservation.start_time)
                            return startTime.toDateString() === date.toDateString() && 
                                  reservation.status !== 'canceled' && 
                                  reservation.status !== 'completed'
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
        onClose={handleDetailClose}
        onCancel={handleCancelReservation}
        canCancel={selectedBooking ? isReservationCreator(selectedBooking) : false}
        onDataChange={() => setNeedsRefresh(true)}
      />
    </div>
  )
}


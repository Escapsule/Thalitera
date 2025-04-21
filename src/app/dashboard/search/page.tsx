"use client";

import React, { useState, useEffect, Suspense } from 'react'
import { format, addDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, Users, Search, Filter } from "lucide-react"
import { RoomDetail } from "@/components/user/room_detail"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { useMeetingRooms } from '@/hooks/useMeetingRooms'
import { MeetingRoom } from '@/types/meeting-room'

// Define the booking type to match what RoomDetail expects
type Booking = {
  id: number
  roomName: string
  roomId: string | number
  date: Date
  startTime: string
  endTime: string
  roomData: MeetingRoom | null
}

// Main search page component
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container min-w-[80vw] py-6 ml-12">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}

// Content component that uses useSearchParams
function SearchPageContent() {
  // Get current date and time
  const now = new Date()
  const currentHour = now.getHours()
  
  // Check if current time is after 8 PM
  const isAfter8PM = currentHour >= 20
  
  // Set initial date to tomorrow if after 8 PM, otherwise today
  const initialDate = isAfter8PM ? addDays(now, 1) : now
  
  // Round current time to next 30-minute increment
  const currentMinute = now.getMinutes()
  const roundedMinute = currentMinute < 30 ? 30 : 0
  const roundedHour = currentMinute < 30 ? currentHour : currentHour + 1
  
  // Format time to HH:MM
  const formatTimeToString = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }
  
  // Set default start time to current rounded time or 08:00 if after 8 PM or if it's too late
  const defaultStartTime = isAfter8PM || roundedHour >= 20 ? "08:00" : formatTimeToString(roundedHour, roundedMinute)
  
  // Calculate default end time (1 hour after start time)
  const getDefaultEndTime = (startTimeStr: string) => {
    const [hours, minutes] = startTimeStr.split(':').map(Number)
    const endHour = hours + 1 > 20 ? 20 : hours + 1
    return formatTimeToString(endHour, minutes)
  }
  
  // Set default end time to 1 hour after start time
  const defaultEndTime = getDefaultEndTime(defaultStartTime)
  
  // State for filters
  const [date, setDate] = useState<Date>(initialDate)
  const [startTime, setStartTime] = useState<string>(defaultStartTime)
  const [endTime, setEndTime] = useState<string>(defaultEndTime)
  const [capacityMin, setCapacityMin] = useState<string>("")
  const [capacityMax, setCapacityMax] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  
  // State for room detail modal
  const [selectedRoom, setSelectedRoom] = useState<Booking | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  // Fetch rooms data
  const { rooms, loading, error } = useMeetingRooms()
  
  // Extract min and max capacity from rooms data
  useEffect(() => {
    if (rooms.length > 0) {
      // Find minimum capacity_min across all rooms
      const minCapacity = Math.min(...rooms.map(room => room.capacity_min))
      // Find maximum capacity_max across all rooms
      const maxCapacity = Math.max(...rooms.map(room => room.capacity_max))
      
      // Set capacity filters if they're not already set by user
      if (capacityMin === "") {
        setCapacityMin(minCapacity.toString())
      }
      if (capacityMax === "") {
        setCapacityMax(maxCapacity.toString())
      }
    }
  }, [rooms, capacityMin, capacityMax])
  
  // Get absolute min and max capacity from all rooms
  const absoluteMinCapacity = rooms.length > 0 ? Math.min(...rooms.map(room => room.capacity_min)) : 1
  const absoluteMaxCapacity = rooms.length > 0 ? Math.max(...rooms.map(room => room.capacity_max)) : 100
  
  // Increment or decrement capacity values
  const incrementCapacityMin = () => {
    const currentValue = parseInt(capacityMin)
    if (currentValue < parseInt(capacityMax)) {
      setCapacityMin((currentValue + 1).toString())
    }
  }
  
  const decrementCapacityMin = () => {
    const currentValue = parseInt(capacityMin)
    if (currentValue > absoluteMinCapacity) {
      setCapacityMin((currentValue - 1).toString())
    }
  }
  
  const incrementCapacityMax = () => {
    const currentValue = parseInt(capacityMax)
    if (currentValue < absoluteMaxCapacity) {
      setCapacityMax((currentValue + 1).toString())
    }
  }
  
  const decrementCapacityMax = () => {
    const currentValue = parseInt(capacityMax)
    if (currentValue > parseInt(capacityMin)) {
      setCapacityMax((currentValue - 1).toString())
    }
  }
  
  // Generate available times from 8:00 to 20:00
  const allTimeOptions = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8
    const minute = (i % 2) * 30
    return formatTimeToString(hour, minute)
  })
  
  // Filter time options based on current time (for today)
  const getAvailableTimeOptions = () => {
    const isSameDay = date.getDate() === now.getDate() && 
                      date.getMonth() === now.getMonth() && 
                      date.getFullYear() === now.getFullYear()
    
    if (isSameDay) {
      return allTimeOptions.filter(time => {
        const [hours, minutes] = time.split(':').map(Number)
        return (hours > roundedHour) || (hours === roundedHour && minutes >= roundedMinute)
      })
    }
    return allTimeOptions
  }
  
  const timeOptions = getAvailableTimeOptions()
  
  // Update time options when date changes
  useEffect(() => {
    const availableOptions = getAvailableTimeOptions()
    
    // If current start time is not available, set to first available
    if (availableOptions.length > 0 && !availableOptions.includes(startTime)) {
      const newStartTime = availableOptions[0];
      setStartTime(newStartTime);
      
      // Always update end time when start time changes
      setEndTime(getDefaultEndTime(newStartTime));
    } else if (startTime && (!endTime || endTime <= startTime)) {
      // If end time is missing or invalid (not after start time), reset it
      setEndTime(getDefaultEndTime(startTime));
    }
  }, [date, startTime])

  // Extract unique amenities and locations from rooms
  const allAmenities = Array.from(new Set(rooms.flatMap(room => 
    Object.entries(room.facilities)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key]) => key)
  )))

  const allLocations = Array.from(new Set(rooms.map(room => room.building)))

  // Filter rooms based on the selected criteria
  const filteredRooms = rooms.filter(room => {
    // Filter by search term
    if (searchTerm && !room.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Filter by capacity
    if (capacityMin && room.capacity_max < parseInt(capacityMin)) {
      return false
    }
    
    if (capacityMax && room.capacity_min > parseInt(capacityMax)) {
      return false
    }
    
    // Filter by selected amenities
    if (selectedAmenities.length > 0) {
      const hasAllAmenities = selectedAmenities.every(amenity => 
        room.facilities[amenity as keyof typeof room.facilities] !== null && 
        room.facilities[amenity as keyof typeof room.facilities] !== undefined
      )
      if (!hasAllAmenities) return false
    }
    
    // Filter by selected locations
    if (selectedLocations.length > 0 && !selectedLocations.includes(room.building)) {
      return false
    }
    
    return true
  })

  // Handle opening room detail with booking info and full room data
  const handleViewRoom = (room: MeetingRoom) => {
    const bookingWithRoomData: Booking = {
      id: 0,
      roomName: room.name,
      roomId: room.room_id,
      date: date,
      startTime: startTime,
      endTime: endTime,
      roomData: room
    }
    setSelectedRoom(bookingWithRoomData)
    setIsDetailOpen(true)
  }

  // Toggle amenity selection
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    )
  }

  // Toggle location selection
  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location) 
        : [...prev, location]
    )
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("")
    
    // Reset capacity to min/max values from rooms
    if (rooms.length > 0) {
      setCapacityMin(absoluteMinCapacity.toString())
      setCapacityMax(absoluteMaxCapacity.toString())
    } else {
      setCapacityMin("")
      setCapacityMax("")
    }
    
    setSelectedAmenities([])
    setSelectedLocations([])
    setDate(initialDate)
    setStartTime(defaultStartTime)
    setEndTime(defaultEndTime)
  }

  if (loading) {
    return <div className="container min-w-[80vw] py-6 ml-12">Loading...</div>
  }

  if (error) {
    return <div className="container min-w-[80vw] py-6 ml-12">Error: {error}</div>
  }

  return (
    <div className="container min-w-[80vw] py-4 ml-12 h-screen overflow-hidden">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-[lch(17_23_133)] mb-1">Find a Meeting Room</h1>
        <p className="text-muted-foreground">Search for available meeting rooms based on your criteria</p>
      </div>
      
      <div className="flex flex-col gap-3 md:flex-row h-[calc(100%-5rem)] overflow-hidden">
        {/* Filters for larger screens */}
        <div className="hidden md:flex flex-col gap-4 w-[280px] overflow-y-auto pr-2">
          <Card className="sticky top-0">
            <CardContent className="space-y-4 px-3">
              {/* Date & Time Filters */}
              <div className="space-y-2">
                <Label className="text-sm">Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border scale-90 origin-top transform -ml-3 -mt-2 -mb-3"
                />
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Select 
                      value={startTime} 
                      onValueChange={(value) => {
                        setStartTime(value);
                        // Always set the end time to 1 hour after start time
                        setEndTime(getDefaultEndTime(value));
                      }}
                    >
                      <SelectTrigger id="startTime" className="h-8 text-xs">
                        <SelectValue placeholder="Start Time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.slice(0, -1).map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="endTime">End Time</Label>
                    <Select 
                      value={endTime} 
                      onValueChange={setEndTime}
                      disabled={!startTime}
                    >
                      <SelectTrigger id="endTime" className="h-8 text-xs">
                        <SelectValue placeholder="End Time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.filter(time => time > startTime).map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              {/* Capacity Filter */}
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="capacityMin" className="text-xs text-muted-foreground">Min</Label>
                    <div className="flex">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="h-8 px-2 rounded-r-none border-r-0"
                        onClick={decrementCapacityMin}
                      >
                        -
                      </Button>
                      <Input
                        id="capacityMin"
                        type="text"
                        value={capacityMin}
                        className="h-8 text-xs rounded-none border-x-0 text-center"
                        readOnly
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="h-8 px-2 rounded-l-none border-l-0"
                        onClick={incrementCapacityMin}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="capacityMax" className="text-xs text-muted-foreground">Max</Label>
                    <div className="flex">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="h-8 px-2 rounded-r-none border-r-0"
                        onClick={decrementCapacityMax}
                      >
                        -
                      </Button>
                      <Input
                        id="capacityMax"
                        type="text"
                        value={capacityMax}
                        className="h-8 text-xs rounded-none border-x-0 text-center"
                        readOnly
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="h-8 px-2 rounded-l-none border-l-0"
                        onClick={incrementCapacityMax}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              {/* Amenities Filter */}
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto pr-2">
                  {allAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-1">
                      <Checkbox 
                        id={`amenity-${amenity}`} 
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                        className="h-3 w-3"
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="text-xs font-normal truncate">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-2" />
              
              {/* Location Filter */}
              <div className="space-y-2">
                <Label>Location</Label>
                <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto pr-2">
                  {allLocations.map((location) => (
                    <div key={location} className="flex items-center space-x-1">
                      <Checkbox 
                        id={`location-${location}`} 
                        checked={selectedLocations.includes(location)}
                        onCheckedChange={() => toggleLocation(location)}
                        className="h-3 w-3"
                      />
                      <Label htmlFor={`location-${location}`} className="text-xs font-normal truncate">
                        {location}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Mobile Filters */}
        <div className="md:hidden mb-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Adjust your search criteria
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-4 py-4 overflow-y-auto h-[calc(100%-10rem)]">
                {/* Date & Time Filters */}
                <div className="space-y-2">
                  <Label className="text-sm">Date</Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md border scale-90 origin-top transform -ml-3 -mt-2"
                  />
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="space-y-1">
                      <Label htmlFor="startTime-mobile">Start Time</Label>
                      <Select 
                        value={startTime} 
                        onValueChange={(value) => {
                          setStartTime(value);
                          // Always set the end time to 1 hour after start time
                          setEndTime(getDefaultEndTime(value));
                        }}
                      >
                        <SelectTrigger id="startTime-mobile">
                          <SelectValue placeholder="Start Time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.slice(0, -1).map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="endTime-mobile">End Time</Label>
                      <Select 
                        value={endTime} 
                        onValueChange={setEndTime}
                        disabled={!startTime}
                      >
                        <SelectTrigger id="endTime-mobile">
                          <SelectValue placeholder="End Time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.filter(time => time > startTime).map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Capacity Filter */}
                <div className="space-y-2">
                  <Label htmlFor="capacity-mobile">Capacity</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="capacityMin-mobile" className="text-xs text-muted-foreground">Min</Label>
                      <div className="flex">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="h-8 px-2 rounded-r-none border-r-0"
                          onClick={decrementCapacityMin}
                        >
                          -
                        </Button>
                        <Input
                          id="capacityMin-mobile"
                          type="text"
                          value={capacityMin}
                          className="h-8 text-xs rounded-none border-x-0 text-center"
                          readOnly
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="h-8 px-2 rounded-l-none border-l-0"
                          onClick={incrementCapacityMin}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="capacityMax-mobile" className="text-xs text-muted-foreground">Max</Label>
                      <div className="flex">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="h-8 px-2 rounded-r-none border-r-0"
                          onClick={decrementCapacityMax}
                        >
                          -
                        </Button>
                        <Input
                          id="capacityMax-mobile"
                          type="text"
                          value={capacityMax}
                          className="h-8 text-xs rounded-none border-x-0 text-center"
                          readOnly
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="h-8 px-2 rounded-l-none border-l-0"
                          onClick={incrementCapacityMax}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Amenities Filter */}
                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto pr-2">
                    {allAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-1">
                        <Checkbox 
                          id={`amenity-mobile-${amenity}`} 
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                          className="h-3 w-3"
                        />
                        <Label htmlFor={`amenity-mobile-${amenity}`} className="text-xs font-normal truncate">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Location Filter */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto pr-2">
                    {allLocations.map((location) => (
                      <div key={location} className="flex items-center space-x-1">
                        <Checkbox 
                          id={`location-mobile-${location}`} 
                          checked={selectedLocations.includes(location)}
                          onCheckedChange={() => toggleLocation(location)}
                          className="h-3 w-3"
                        />
                        <Label htmlFor={`location-mobile-${location}`} className="text-xs font-normal truncate">
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <SheetFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                >
                  Reset
                </Button>
                <SheetClose asChild>
                  <Button>Apply Filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Search Results */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search rooms..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <CardTitle>Available Rooms</CardTitle>
              </div>
              <CardDescription className="flex justify-end">
                  {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} available on {format(date, "EEEE, MMMM d")}
                </CardDescription>
            </CardHeader>
            
            <CardContent className="overflow-y-auto">
              <div className="space-y-3">
                {filteredRooms.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredRooms.map(room => (
                      <div 
                        key={room.room_id} 
                        className="rounded-lg border p-3 hover:bg-[lch(97_0_0)] cursor-pointer transition-colors"
                        onClick={() => handleViewRoom(room)}
                      >
                        <div className="flex justify-between mb-1">
                          <h3 className="font-medium text-lg">{room.name}</h3>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{room.capacity_min} - {room.capacity_max}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1 mb-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {room.building}, Floor {room.floor}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {startTime} - {endTime}
                          </div>
                        </div>
                        
                        {room.facilities && Object.entries(room.facilities).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(room.facilities)
                              .filter(([, value]) => value !== null && value !== undefined)
                              .slice(0, 3)
                              .map(([key], index) => (
                                <span key={index} className="inline-flex items-center rounded-full bg-[lch(94_5_133)] px-2 py-0.5 text-xs text-[lch(17_23_133)]">
                                  {key}
                                </span>
                              ))}
                            {Object.entries(room.facilities).filter(([, value]) => value !== null && value !== undefined).length > 3 && (
                              <span className="inline-flex items-center rounded-full bg-[lch(90_0_0)] px-2 py-0.5 text-xs text-muted-foreground">
                                +{Object.entries(room.facilities).filter(([, value]) => value !== null && value !== undefined).length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                      <h3 className="font-medium">No rooms available</h3>
                      <p className="text-sm text-muted-foreground mt-1">Try changing your search criteria</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Room Detail Modal */}
      <RoomDetail 
        booking={selectedRoom} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
    </div>
  )
}
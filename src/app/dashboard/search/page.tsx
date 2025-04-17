"use client";

import React, { useState, useEffect } from 'react'
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
  roomId: string | number  // Allow both string and number to match both types
  date: Date
  startTime: string
  endTime: string
}

export default function SearchPage() {
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
  
  // Set default start time to current rounded time or 08:00 if after 8 PM
  const defaultStartTime = isAfter8PM ? "08:00" : formatTimeToString(roundedHour, roundedMinute)
  // Set default end time to 8 PM
  const defaultEndTime = "20:00"
  
  // State for filters
  const [date, setDate] = useState<Date>(initialDate)
  const [startTime, setStartTime] = useState<string>(defaultStartTime)
  const [endTime, setEndTime] = useState<string>(defaultEndTime)
  const [capacity, setCapacity] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  
  // State for room detail modal
  const [selectedRoom, setSelectedRoom] = useState<Booking | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  // Fetch rooms data
  const { rooms, loading, error } = useMeetingRooms()
  
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
      setStartTime(availableOptions[0])
    }
    
    // If current end time is not valid, set to default end time
    if (!availableOptions.includes(endTime) || endTime <= startTime) {
      setEndTime(defaultEndTime)
    }
  }, [date])

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
    if (capacity && room.capacity_max < parseInt(capacity)) {
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

  // Handle opening room detail with a fake booking
  const handleViewRoom = (room: MeetingRoom) => {
    const fakeBooking: Booking = {
      id: 0,
      roomName: room.name,
      roomId: room.room_id,
      date: date,
      startTime: startTime,
      endTime: endTime
    }
    setSelectedRoom(fakeBooking)
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
    setCapacity("")
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
    <div className="container min-w-[80vw] py-6 ml-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[lch(17_23_133)] mb-2">Find a Meeting Room</h1>
        <p className="text-muted-foreground">Search for available meeting rooms based on your criteria</p>
      </div>
      
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Filters for larger screens */}
        <div className="hidden md:flex flex-col gap-6 w-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date & Time Filters */}
              <div className="space-y-3">
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Select 
                      value={startTime} 
                      onValueChange={(value) => {
                        setStartTime(value);
                        // If end time is before or equal to start time, reset it
                        if (endTime <= value) {
                          const startIndex = timeOptions.findIndex(t => t === value);
                          if (startIndex < timeOptions.length - 1) {
                            setEndTime(timeOptions[startIndex + 1]);
                          } else {
                            setEndTime(defaultEndTime);
                          }
                        }
                      }}
                    >
                      <SelectTrigger id="startTime">
                        <SelectValue placeholder="Start Time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.slice(0, -1).map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Select 
                      value={endTime} 
                      onValueChange={setEndTime}
                      disabled={!startTime}
                    >
                      <SelectTrigger id="endTime">
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
              <div className="space-y-3">
                <Label htmlFor="capacity">Minimum Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="Minimum people"
                />
              </div>
              
              <Separator />
              
              {/* Amenities Filter */}
              <div className="space-y-3">
                <Label>Amenities</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {allAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`amenity-${amenity}`} 
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Location Filter */}
              <div className="space-y-3">
                <Label>Location</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {allLocations.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`location-${location}`} 
                        checked={selectedLocations.includes(location)}
                        onCheckedChange={() => toggleLocation(location)}
                      />
                      <Label htmlFor={`location-${location}`} className="text-sm font-normal">
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
        <div className="md:hidden mb-4">
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
              
              <div className="space-y-6 py-6 overflow-y-auto h-[calc(100%-10rem)]">
                {/* Date & Time Filters */}
                <div className="space-y-3">
                  <Label>Date</Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md border mx-auto"
                  />
                  
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime-mobile">Start Time</Label>
                      <Select 
                        value={startTime} 
                        onValueChange={(value) => {
                          setStartTime(value);
                          // If end time is before or equal to start time, reset it
                          if (endTime <= value) {
                            const startIndex = timeOptions.findIndex(t => t === value);
                            if (startIndex < timeOptions.length - 1) {
                              setEndTime(timeOptions[startIndex + 1]);
                            } else {
                              setEndTime(defaultEndTime);
                            }
                          }
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
                    
                    <div className="space-y-2">
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
                <div className="space-y-3">
                  <Label htmlFor="capacity-mobile">Minimum Capacity</Label>
                  <Input
                    id="capacity-mobile"
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Minimum people"
                  />
                </div>
                
                <Separator />
                
                {/* Amenities Filter */}
                <div className="space-y-3">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {allAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`amenity-mobile-${amenity}`} 
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                        />
                        <Label htmlFor={`amenity-mobile-${amenity}`} className="text-sm font-normal">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Location Filter */}
                <div className="space-y-3">
                  <Label>Location</Label>
                  <div className="space-y-2">
                    {allLocations.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`location-mobile-${location}`} 
                          checked={selectedLocations.includes(location)}
                          onCheckedChange={() => toggleLocation(location)}
                        />
                        <Label htmlFor={`location-mobile-${location}`} className="text-sm font-normal">
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
        <div className="flex-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Available Rooms</CardTitle>
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
              </div>
              <CardDescription>
                {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} available on {format(date, "EEEE, MMMM d")} • {startTime} - {endTime}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <div 
                      key={room.room_id} 
                      className="rounded-lg border p-4 hover:bg-[lch(97_0_0)] cursor-pointer transition-colors"
                      onClick={() => handleViewRoom(room)}
                    >
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-lg">{room.name}</h3>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{room.capacity_min} - {room.capacity_max}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 mb-3">
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
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(room.facilities)
                            .filter(([, value]) => value !== null && value !== undefined)
                            .slice(0, 3)
                            .map(([key], index) => (
                              <span key={index} className="inline-flex items-center rounded-full bg-[lch(94_5_133)] px-2.5 py-0.5 text-xs text-[lch(17_23_133)]">
                                {key}
                              </span>
                            ))}
                          {Object.entries(room.facilities).filter(([, value]) => value !== null && value !== undefined).length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-[lch(90_0_0)] px-2.5 py-0.5 text-xs text-muted-foreground">
                              +{Object.entries(room.facilities).filter(([, value]) => value !== null && value !== undefined).length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
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
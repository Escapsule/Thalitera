"use client";

import React, { useState } from 'react'
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, Users, Search, Filter } from "lucide-react"
import { RoomDetail } from "@/components/room_detail"
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
import { 
  rooms, 
  allAmenities, 
  allLocations,
  isRoomAvailable 
} from "@/lib/fake_data"

// Define the booking type to match what RoomDetail expects
type Booking = {
  id: number
  roomName: string
  roomId: number
  date: Date
  startTime: string
  endTime: string
}

export default function SearchPage() {
  // State for filters
  const [date, setDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState<string>("09:00")
  const [endTime, setEndTime] = useState<string>("10:00")
  const [capacity, setCapacity] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  
  // State for room detail modal
  const [selectedRoom, setSelectedRoom] = useState<Booking | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  // Generate available times from 8:00 to 18:00
  const timeOptions = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8
    const minute = (i % 2) * 30
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  })

  // Filter rooms based on the selected criteria
  const filteredRooms = rooms.filter(room => {
    // Filter by search term
    if (searchTerm && !room.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !room.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Filter by capacity
    if (capacity && room.capacity < parseInt(capacity)) {
      return false
    }
    
    // Filter by selected amenities
    if (selectedAmenities.length > 0) {
      const hasAllAmenities = selectedAmenities.every(amenity => 
        room.amenities.includes(amenity)
      )
      if (!hasAllAmenities) return false
    }
    
    // Filter by selected locations
    if (selectedLocations.length > 0 && !selectedLocations.includes(room.location)) {
      return false
    }
    
    // Filter by availability at selected time
    return isRoomAvailable(room.id, date, startTime, endTime)
  })

  // Handle opening room detail with a fake booking
  const handleViewRoom = (room: typeof rooms[0]) => {
    const fakeBooking: Booking = {
      id: 0,
      roomName: room.name,
      roomId: room.id,
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
    setDate(new Date())
    setStartTime("09:00")
    setEndTime("10:00")
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
                    <Select value={startTime} onValueChange={setStartTime}>
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
                      <Select value={startTime} onValueChange={setStartTime}>
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
                      key={room.id} 
                      className="rounded-lg border p-4 hover:bg-[lch(97_0_0)] cursor-pointer transition-colors"
                      onClick={() => handleViewRoom(room)}
                    >
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-lg">{room.name}</h3>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{room.capacity}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {room.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {startTime} - {endTime}
                        </div>
                      </div>
                      
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {room.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="inline-flex items-center rounded-full bg-[lch(94_5_133)] px-2.5 py-0.5 text-xs text-[lch(17_23_133)]">
                              {amenity}
                            </span>
                          ))}
                          {room.amenities.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-[lch(90_0_0)] px-2.5 py-0.5 text-xs text-muted-foreground">
                              +{room.amenities.length - 3} more
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
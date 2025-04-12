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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Trash2, Edit } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import RoomForm from './RoomForm'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Meeting room type definition
interface MeetingRoom {
  room_id: string
  name: string
  capacity_min: number
  capacity_max: number
  building: string
  floor: number
  status: 'active' | 'maintenance' | 'using' | 'booked' | 'deleted'
  facilities: {
    projector: boolean
    whiteboard: number
    power_sockets: number
    coffee_break: boolean
    special_notes: string[]
  }
  image?: string
}

// Status mapping
const statusMap = {
  active: { label: 'Available', color: 'bg-green-100 text-green-800' },
  maintenance: { label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
  using: { label: 'Using', color: 'bg-red-100 text-red-800' },
  booked: { label: 'Booked', color: 'bg-blue-100 text-blue-800' },
  deleted: { label: 'Deleted', color: 'bg-gray-100 text-gray-800' }
}

// Mock data
const mockRooms: MeetingRoom[] = [
  {
    room_id: "room-001",
    name: "Main Conference Room",
    capacity_min: 10,
    capacity_max: 30,
    building: "Headquarters",
    floor: 3,
    status: "active",
    facilities: {
      projector: true,
      whiteboard: 2,
      power_sockets: 12,
      coffee_break: true,
      special_notes: ["HD Projection System", "Video Conference Equipment"]
    }
  },
  {
    room_id: "room-002",
    name: "Small Discussion Room A",
    capacity_min: 2,
    capacity_max: 8,
    building: "R&D Center",
    floor: 2,
    status: "active",
    facilities: {
      projector: false,
      whiteboard: 1,
      power_sockets: 6,
      coffee_break: false,
      special_notes: ["Suitable for small group discussions"]
    }
  },
  {
    room_id: "room-003",
    name: "Training Room",
    capacity_min: 15,
    capacity_max: 40,
    building: "Headquarters",
    floor: 5,
    status: "using",
    facilities: {
      projector: true,
      whiteboard: 3,
      power_sockets: 20,
      coffee_break: true,
      special_notes: ["Sound System", "Can accommodate 40 people for training"]
    }
  },
  {
    room_id: "room-004",
    name: "VIP Meeting Room",
    capacity_min: 5,
    capacity_max: 15,
    building: "Executive Building",
    floor: 8,
    status: "active",
    facilities: {
      projector: true,
      whiteboard: 1,
      power_sockets: 10,
      coffee_break: true,
      special_notes: ["Luxury decoration", "High-end meeting equipment"]
    }
  },
  {
    room_id: "room-005",
    name: "Remote Conference Room",
    capacity_min: 4,
    capacity_max: 12,
    building: "R&D Center",
    floor: 4,
    status: "active",
    facilities: {
      projector: true,
      whiteboard: 1,
      power_sockets: 8,
      coffee_break: false,
      special_notes: ["Video conferencing system", "High-speed network connection"]
    }
  }
];

const ManageRoomPage = () => {
  // State definitions
  const [rooms, setRooms] = useState<MeetingRoom[]>(mockRooms) // Initialize with mock data
  const [loading, setLoading] = useState(false) // Set to false because loading is not needed
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null)
  const [adminPassword, setAdminPassword] = useState('')
  
  // Add filtering states
  const [filteredRooms, setFilteredRooms] = useState<MeetingRoom[]>(mockRooms)
  const [filters, setFilters] = useState({
    name: '',
    building: '',
    status: 'all',
    capacity: '', // Single capacity field instead of min/max
    hasProjector: false,
    hasCoffeeBreak: false,
    minWhiteboard: '',
    minPowerSockets: '',
  })
  
  // New meeting room form state
  const [newRoom, setNewRoom] = useState<Partial<MeetingRoom>>({
    name: '',
    building: '',
    floor: 1,
    capacity_min: 1,
    capacity_max: 10,
    status: 'active',
    facilities: {
      projector: false,
      whiteboard: 0,
      power_sockets: 0,
      coffee_break: false,
      special_notes: []
    }
  })

  // Get meeting room list - modified to use mock data
  const fetchRooms = async () => {
    // Use mock data during development, comment out network request code
    /*
    setLoading(true)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'k1ng.tech:8080';
    try {
      const response = await fetch(`http://${backendUrl}/meetingroom/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json()
      if (data.code === 200) {
        setRooms(data.data || [])
      } else {
        console.error(data.message || 'Failed to get meeting room list')
      }
    } catch (error) {
      console.error('Failed to get meeting room list', error)
    } finally {
      setLoading(false)
    }
    */
    
    // Directly use mock data
    setRooms(mockRooms);
    setLoading(false);
  }

  // Add meeting room - modified to use local data
  // Validate room data before saving
  const validateRoomData = (room: Partial<MeetingRoom>) => {
    if (!room.name || !room.building || !room.capacity_min || !room.capacity_max) {
      alert('Please fill in all required information');
      return false;
    }
    
    if (room.capacity_min! > room.capacity_max!) {
      alert('Minimum capacity cannot be greater than maximum capacity');
      return false;
    }
    
    return true;
  }

  // Modified handleAddRoom function to use validation
  const handleAddRoom = async () => {
    try {
      // Form validation
      if (!validateRoomData(newRoom)) {
        return;
      }

      // Locally add meeting room
      const newRoomWithId = {
        ...newRoom,
        room_id: `room-${Date.now()}`, // Generate temporary ID
      } as MeetingRoom;
      
      setRooms([...rooms, newRoomWithId]);
      alert('Meeting room added successfully');
      setIsAddDialogOpen(false);
      
      // Reset form
      setNewRoom({
        name: '',
        building: '',
        floor: 1,
        capacity_min: 1,
        capacity_max: 10,
        status: 'active',
        facilities: {
          projector: false,
          whiteboard: 0,
          power_sockets: 0,
          coffee_break: false,
          special_notes: []
        }
      });
    } catch (error) {
      alert('Failed to add meeting room');
      console.error(error)
    }
  }

  // Add handleEditRoom function
  const handleEditRoom = async () => {
    if (!selectedRoom) return;
    
    try {
      // Form validation
      if (!validateRoomData(selectedRoom)) {
        return;
      }

      // Update room in local state
      const updatedRooms = rooms.map(room => 
        room.room_id === selectedRoom.room_id ? selectedRoom : room
      );
      
      setRooms(updatedRooms);
      setIsEditDialogOpen(false);
      alert('Meeting room updated successfully');
    } catch (error) {
      alert('Failed to update meeting room');
      console.error(error)
    }
  }

  // Delete meeting room - modified to use local data
  const handleDeleteRoom = async () => {
    if (!selectedRoom) return
    
    try {
      // Locally delete meeting room
      setRooms(rooms.filter(room => room.room_id !== selectedRoom.room_id));
      alert('Deleted successfully');
      setIsDeleteDialogOpen(false);
      setAdminPassword('');
    } catch (error) {
      alert('Failed to delete meeting room');
      console.error(error)
    }
  }

  // Apply filters function
  const applyFilters = () => {
    let result = [...rooms];
    
    // Filter by name
    if (filters.name) {
      result = result.filter(room => 
        room.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    // Filter by building
    if (filters.building) {
      result = result.filter(room => 
        room.building.toLowerCase().includes(filters.building.toLowerCase())
      );
    }
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      result = result.filter(room => room.status === filters.status);
    }
    
    // Filter by capacity - using single capacity field
    // This finds rooms that can accommodate the specified number of people
    if (filters.capacity) {
      const capacity = parseInt(filters.capacity);
      result = result.filter(room => 
        room.capacity_min <= capacity && room.capacity_max >= capacity
      );
    }
    
    // Filter by projector availability
    if (filters.hasProjector) {
      result = result.filter(room => room.facilities.projector);
    }
    
    // Filter by coffee break service
    if (filters.hasCoffeeBreak) {
      result = result.filter(room => room.facilities.coffee_break);
    }
    
    // Filter by minimum whiteboard count
    if (filters.minWhiteboard) {
      const minWhiteboard = parseInt(filters.minWhiteboard);
      result = result.filter(room => room.facilities.whiteboard >= minWhiteboard);
    }
    
    // Filter by minimum power sockets count
    if (filters.minPowerSockets) {
      const minPowerSockets = parseInt(filters.minPowerSockets);
      result = result.filter(room => room.facilities.power_sockets >= minPowerSockets);
    }
    
    setFilteredRooms(result);
  }
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      name: '',
      building: '',
      status: 'all',
      capacity: '',
      hasProjector: false,
      hasCoffeeBreak: false,
      minWhiteboard: '',
      minPowerSockets: '',
    });
    setFilteredRooms(rooms);
  }
  
  // Handle filter change
  const handleFilterChange = (field: string, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }

  // Load data when component mounts
  useEffect(() => {
    fetchRooms()
  }, [])
  
  // Update filtered results when rooms data changes
  useEffect(() => {
    setFilteredRooms(rooms);
  }, [rooms]);

  return (
    <div className="flex min-h-[95cvh] flex-col py-6 ml-12">
      
      <div className="flex flex-1 justify-center">
        <main className="flex-1 p-4 md:p-6 min-w-[80vw]">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Meeting Room Management</h1>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Meeting Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Meeting Room</DialogTitle>
                  </DialogHeader>
                  <RoomForm room={newRoom} setRoom={setNewRoom} />
                  <DialogFooter>
                    <Button onClick={handleAddRoom}>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filter panel */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-lg font-semibold">Filter Meeting Rooms</h2>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-name">Room Name</Label>
                  <Input
                    id="filter-name"
                    placeholder="Search by name"
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-building">Building</Label>
                  <Input
                    id="filter-building"
                    placeholder="Search by building"
                    value={filters.building}
                    onChange={(e) => handleFilterChange('building', e.target.value)}
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
                      <SelectItem value="active">Available</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="using">In Use</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-capacity">Capacity</Label>
                  <Input
                    id="filter-capacity"
                    type="number"
                    placeholder="Enter required capacity"
                    value={filters.capacity}
                    onChange={(e) => handleFilterChange('capacity', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-4 pt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-projector" 
                      checked={filters.hasProjector}
                      onCheckedChange={(checked) => handleFilterChange('hasProjector', !!checked)}
                    />
                    <Label htmlFor="filter-projector">Has Projector</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-coffee-break" 
                      checked={filters.hasCoffeeBreak}
                      onCheckedChange={(checked) => handleFilterChange('hasCoffeeBreak', !!checked)}
                    />
                    <Label htmlFor="filter-coffee-break">Has Coffee Break</Label>
                  </div>
                </div>
                
                <div className="flex items-end gap-4 col-span-3">
                  <div className="space-y-2 w-full md:w-1/3">
                    <Label htmlFor="filter-whiteboard">Min Whiteboards</Label>
                    <Input
                      id="filter-whiteboard"
                      type="number"
                      min="0"
                      max="20"
                      placeholder="Min whiteboards"
                      value={filters.minWhiteboard}
                      onChange={(e) => handleFilterChange('minWhiteboard', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 w-full md:w-1/3">
                    <Label htmlFor="filter-power-sockets">Min Power Sockets</Label>
                    <Input
                      id="filter-power-sockets"
                      type="number"
                      min="0"
                      max="20"
                      placeholder="Min power sockets"
                      value={filters.minPowerSockets}
                      onChange={(e) => handleFilterChange('minPowerSockets', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-end justify-end w-full md:w-1/3">
                    <Button onClick={applyFilters} className="h-10">Apply Filters</Button>
                  </div>
                </div>
              </div>
            </div>

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
                        <TableHead className="w-[15%]">Name</TableHead>
                        <TableHead className="w-[15%]">Location</TableHead>
                        <TableHead className="w-[10%]">Capacity</TableHead>
                        <TableHead className="w-[15%]">Status</TableHead>
                        <TableHead className="w-[25%]">Facilities</TableHead>
                        <TableHead className="w-[15%]">Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRooms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No meeting room data available
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRooms.map((room) => (
                          <TableRow key={room.room_id}>
                            <TableCell className="font-medium">{room.name}</TableCell>
                            <TableCell>{`${room.building} Floor ${room.floor}`}</TableCell>
                            <TableCell>{`${room.capacity_min}-${room.capacity_max} people`}</TableCell>
                            <TableCell>
                              <Badge className={statusMap[room.status]?.color || ''}>
                                {statusMap[room.status]?.label || room.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {room.facilities?.projector && (
                                  <Badge variant="outline">Projector</Badge>
                                )}
                                {room.facilities?.whiteboard > 0 && (
                                  <Badge variant="outline">Whiteboard x{room.facilities.whiteboard}</Badge>
                                )}
                                {room.facilities?.coffee_break && (
                                  <Badge variant="outline">Coffee Break</Badge>
                                )}
                                {room.facilities?.power_sockets > 0 && (
                                  <Badge variant="outline">Power Sockets x{room.facilities.power_sockets}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                                  View
                                </a>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedRoom(room)
                                    setIsEditDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedRoom(room)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete the meeting room "{selectedRoom?.name}"? This action cannot be undone.</p>
            <div className="mt-4">
              <Label htmlFor="adminPassword">Please enter admin password to confirm</Label>
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
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRoom}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit meeting room dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Meeting Room</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Room Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g.: Building A-301 Meeting Room"
                  value={selectedRoom?.name || ''}
                  onChange={(e) => setSelectedRoom(selectedRoom ? { ...selectedRoom, name: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-building">Building</Label>
                <Input
                  id="edit-building"
                  placeholder="e.g.: Tech Tower"
                  value={selectedRoom?.building || ''}
                  onChange={(e) => setSelectedRoom(selectedRoom ? { ...selectedRoom, building: e.target.value } : null)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-floor">Floor</Label>
                <Input
                  id="edit-floor"
                  type="number"
                  value={selectedRoom?.floor || 1}
                  onChange={(e) => setSelectedRoom(selectedRoom ? { ...selectedRoom, floor: parseInt(e.target.value) } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={selectedRoom?.status} 
                  onValueChange={(value: 'active' | 'maintenance' | 'using' | 'booked' | 'deleted') => 
                    setSelectedRoom(selectedRoom ? { ...selectedRoom, status: value } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="using">In Use</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-capacity_min">Minimum Capacity</Label>
                <Input
                  id="edit-capacity_min"
                  type="number"
                  value={selectedRoom?.capacity_min || 1}
                  onChange={(e) => setSelectedRoom(selectedRoom ? { ...selectedRoom, capacity_min: parseInt(e.target.value) } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacity_max">Maximum Capacity</Label>
                <Input
                  id="edit-capacity_max"
                  type="number"
                  value={selectedRoom?.capacity_max || 10}
                  onChange={(e) => setSelectedRoom(selectedRoom ? { ...selectedRoom, capacity_max: parseInt(e.target.value) } : null)}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex flex-col gap-4">
                <div className="border-t border-gray-200 my-2"></div>
                
                {/* Projector and Coffee break options */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit-projector" 
                      checked={selectedRoom?.facilities?.projector}
                      onCheckedChange={(checked) => 
                        setSelectedRoom(selectedRoom ? {
                          ...selectedRoom,
                          facilities: {
                            ...selectedRoom.facilities,
                            projector: checked as boolean
                          }
                        } : null)
                      }
                    />
                    <Label htmlFor="edit-projector">Projector</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit-coffee_break" 
                      checked={selectedRoom?.facilities?.coffee_break}
                      onCheckedChange={(checked) => 
                        setSelectedRoom(selectedRoom ? {
                          ...selectedRoom,
                          facilities: {
                            ...selectedRoom.facilities,
                            coffee_break: checked as boolean
                          }
                        } : null)
                      }
                    />
                    <Label htmlFor="edit-coffee_break">Coffee Break Service</Label>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-200 my-2"></div>
                
                {/* Whiteboard and Power sockets counts */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="edit-whiteboard" className="min-w-[100px]">Whiteboard:</Label>
                    <Input
                      id="edit-whiteboard"
                      type="number"
                      min="0"
                      max="20"
                      className="w-20 h-8"
                      value={selectedRoom?.facilities?.whiteboard || 0}
                      onChange={(e) => 
                        setSelectedRoom(selectedRoom ? {
                          ...selectedRoom,
                          facilities: {
                            ...selectedRoom.facilities,
                            whiteboard: parseInt(e.target.value) || 0
                          }
                        } : null)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="edit-power_sockets" className="min-w-[100px]">Power Sockets:</Label>
                    <Input
                      id="edit-power_sockets"
                      type="number"
                      min="0"
                      max="20"
                      className="w-20 h-8"
                      value={selectedRoom?.facilities?.power_sockets || 0}
                      onChange={(e) => 
                        setSelectedRoom(selectedRoom ? {
                          ...selectedRoom,
                          facilities: {
                            ...selectedRoom.facilities,
                            power_sockets: parseInt(e.target.value) || 0
                          }
                        } : null)
                      }
                    />
                  </div>
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-200 my-2"></div>
                
                {/* Special notes */}
                <div className="space-y-2">
                  <Label htmlFor="edit-special_notes">Special Notes</Label>
                  <Input
                    id="edit-special_notes"
                    placeholder="e.g.: No food and drinks, Equipment setup 30 minutes in advance"
                    value={selectedRoom?.facilities?.special_notes?.join(', ') || ''}
                    onChange={(e) => {
                      const notes = e.target.value ? e.target.value.split(',').map(note => note.trim()) : [];
                      setSelectedRoom(selectedRoom ? {
                        ...selectedRoom,
                        facilities: {
                          ...selectedRoom.facilities,
                          special_notes: notes
                        }
                      } : null);
                    }}
                  />
                  <p className="text-xs text-gray-500">Separate multiple notes with commas</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              if (!selectedRoom) return;
              
              // Update room information
              const updatedRooms = rooms.map(room => 
                room.room_id === selectedRoom.room_id ? selectedRoom : room
              );
              
              setRooms(updatedRooms);
              setIsEditDialogOpen(false);
              alert('Meeting room updated successfully');
            }}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ManageRoomPage
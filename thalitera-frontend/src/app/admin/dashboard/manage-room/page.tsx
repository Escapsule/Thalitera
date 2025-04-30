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
import { useToast } from "@/hooks/use-toast"
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
  created_by?: ''
  image?: string
}

const getBackendUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'localhost:8080';
  if (backendUrl.startsWith('http://') || backendUrl.startsWith('https://')) {
    return backendUrl;
  }
  return `http://${backendUrl}`;
};

// Status mapping
const statusMap = {
  active: { label: 'Available', color: 'bg-green-100 text-green-800' },
  maintenance: { label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
  using: { label: 'Using', color: 'bg-red-100 text-red-800' },
  booked: { label: 'Booked', color: 'bg-blue-100 text-blue-800' },
  deleted: { label: 'Deleted', color: 'bg-gray-100 text-gray-800' }
}

const ManageRoomPage = () => {
  // State definitions
  const [rooms, setRooms] = useState<MeetingRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false)

  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Add filtering states
  const [filteredRooms, setFilteredRooms] = useState<MeetingRoom[]>([])
  const [filters, setFilters] = useState({
    name: '',
    building: '',
    status: 'all',
    capacity: '',
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

  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Get meeting room list
  const fetchRooms = async () => {
    setLoading(true)
    try {
      console.log(`${localStorage.getItem('cookie')}`, `${localStorage.getItem('token')}`)
      const backendUrl = getBackendUrl();
      console.log('Request backend URL:', backendUrl);

      const response = await fetch(`/api/admin/meetingroom/all`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json()
      console.log(data)
      if (data.code === 200) {
        const processedRooms = (data.data || []).map((room: any) => {
          return {
            room_id: room.roomId || room.room_id,
            name: room.name,
            capacity_min: room.capacityMin || room.capacity_min,
            capacity_max: room.capacityMax || room.capacity_max,
            building: room.building,
            floor: room.floor,
            status: room.status,
            image: room.image,
            facilities: {
              projector: room.facilities?.projector || false,
              whiteboard: room.facilities?.whiteboard || room.facilities?.whiteBoard || 0,
              power_sockets: room.facilities?.powerSockets || room.facilities?.power_sockets || 0,
              coffee_break: room.facilities?.coffeeBreak || room.facilities?.coffee_break || false,
              special_notes: room.facilities?.specialNotes || room.facilities?.special_notes || [],
            },
            created_by: room.createdBy || room.created_by,
          };
        });
        const activeRooms = processedRooms.filter((room: MeetingRoom) => room.status !== 'deleted');
        setRooms(activeRooms)
        setFilteredRooms(activeRooms)
        console.log("get room list successfully!")
      } else {
        console.error(data.message || 'Failed to get meeting room list')
      }
    } catch (error) {
      console.error('Failed to get meeting room list', error)
    } finally {
      setLoading(false)
    }
  }

  const addRoom = async (roomData: Partial<MeetingRoom>) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/meetingroom/add`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });
      const data = await response.json();
      if (data.code === 200) {
        fetchRooms();
        toast({
          title: "Success",
          description: "Meeting room added successfully",
          variant: "success",
          duration: 3000,
        });
        return true;
      } else {
        console.error(data.message || 'Failed to add meeting room');
        toast({
          title: "Error",
          description: data.message || 'Failed to add meeting room',
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }
    } catch (error) {
      console.error('Failed to add meeting room:', error);
      toast({
        title: "Error",
        description: "Failed to add meeting room",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }

  const validateRoomData = (room: Partial<MeetingRoom>) => {
    if (!room.name || !room.building || !room.capacity_min || !room.capacity_max) {
      toast({
        title: "Error",
        description: "Please fill in all required information",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }

    if (room.capacity_min! > room.capacity_max!) {
      toast({
        title: "Error",
        description: "Minimum capacity cannot be greater than maximum capacity",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }

    if (room.name.length > 16) {
      toast({
        title: "Error",
        description: "Room name cannot exceed 16 characters",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    const isDuplicate = rooms.some(existingRoom =>
      existingRoom.name === room.name && existingRoom.room_id !== room.room_id
    );

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "Room name already exists. Please choose a different name",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }

    return true;
  }

  const handleAddRoom = async () => {
    try {
      if (!validateRoomData(newRoom)) {
        return;
      }

      const roomToAdd = {
        ...newRoom,
      };

      const success = await addRoom(roomToAdd);

      if (success) {
        setIsAddDialogOpen(false);
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
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add meeting room",
        variant: "destructive",
      });
      console.error(error);
    }
  }

  const modifyRoom = async (roomData: MeetingRoom) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/meetingroom/modify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomData.room_id,
          name: roomData.name,
          capacity_min: roomData.capacity_min,
          capacity_max: roomData.capacity_max,
          building: roomData.building,
          floor: roomData.floor,
          status: roomData.status,
          image: roomData.image,
          facilities: {
            projector: roomData.facilities.projector,
            whiteboard: roomData.facilities.whiteboard,
            power_sockets: roomData.facilities.power_sockets,
            coffee_break: roomData.facilities.coffee_break,
            special_notes: roomData.facilities.special_notes,
          },
        }),
      });
      const data = await response.json();
      if (data.code === 200) {
        fetchRooms();
        toast({
          title: "Success",
          description: "Meeting room modified successfully",
          variant: "success",
          duration: 3000,
        });
        return true;
      } else {
        console.error(data.message || 'Failed to modify meeting room');
        toast({
          title: "Error",
          description: data.message || 'Failed to modify meeting room',
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }
    } catch (error) {
      console.error('Failed to modify meeting room:', error);
      toast({
        title: "Error",
        description: "Failed to modify meeting room",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }

  const handleModifyRoom = async () => {
    if (!selectedRoom) return;

    try {
      if (!validateRoomData(selectedRoom)) {
        return;
      }

      const roomToUpdate = { ...selectedRoom };

      if (selectedRoom.image && selectedRoom.image.startsWith('data:')) {
        try {
          const response = await fetch(selectedRoom.image);
          const blob = await response.blob();
          const file = new File([blob], 'room-image.jpg', { type: blob.type });

          const imageUrl = await uploadFile(file, 'meeting_room', selectedRoom.room_id);
          roomToUpdate.image = imageUrl;
        } catch (error) {
          console.error('Failed to upload image:', error);
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      const success = await modifyRoom(roomToUpdate);

      if (success) {
        setIsModifyDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to modify meeting room",
        variant: "destructive",
      });
      console.error(error);
    }
  }

  const deleteRoom = async (roomId: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/meetingroom/delete`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_ids: [roomId],
          adminPassword: password
        }),
      });

      const data = await response.json();

      if (data.code === 200) {
        fetchRooms();
        toast({
          title: "Success",
          description: "Meeting room deleted successfully",
          variant: "success",
          duration: 3000,
        });
        return true;
      } else {
        if (data.message && data.message.includes('password')) {
          setPasswordError('Incorrect password. Please try again.');
          toast({
            title: "Warning",
            description: "Incorrect password. Please try again.",
            variant: "warning",
            duration: 3000,
          });
        } else {
          toast({
            title: "Error",
            description: data.message || 'Failed to delete meeting room',
            variant: "destructive",
            duration: 3000,
          });
        }
        return false;
      }
    } catch (error) {
      console.error('Delete room error:', error);
      toast({
        title: "Error",
        description: `Failed to delete meeting room: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
        duration: 3000,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    if (!adminPassword) {
      setPasswordError('Please enter admin password');
      return;
    }

    try {
      const success = await deleteRoom(selectedRoom.room_id, adminPassword);
      if (success) {
        setIsDeleteDialogOpen(false);
        setAdminPassword('');
        setPasswordError('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // About filters
  const applyFilters = () => {
    let result = [...rooms];

    // Do not display deleted meeting rooms
    result = result.filter(room => room.status !== 'deleted');

    if (filters.name) {
      result = result.filter(room =>
        room.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.building) {
      result = result.filter(room =>
        room.building.toLowerCase().includes(filters.building.toLowerCase())
      );
    }

    if (filters.status && filters.status !== 'all') {
      result = result.filter(room => room.status === filters.status);
    }

    if (filters.capacity) {
      const capacity = parseInt(filters.capacity);
      result = result.filter(room =>
        room.capacity_min <= capacity && room.capacity_max >= capacity
      );
    }

    if (filters.hasProjector) {
      result = result.filter(room => room.facilities.projector);
    }

    if (filters.hasCoffeeBreak) {
      result = result.filter(room => room.facilities.coffee_break);
    }

    if (filters.minWhiteboard) {
      const minWhiteboard = parseInt(filters.minWhiteboard);
      result = result.filter(room => room.facilities.whiteboard >= minWhiteboard);
    }

    if (filters.minPowerSockets) {
      const minPowerSockets = parseInt(filters.minPowerSockets);
      result = result.filter(room => room.facilities.power_sockets >= minPowerSockets);
    }

    setFilteredRooms(result);
  }

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

  const handleFilterChange = (field: string, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }

  const uploadFile = async (file: File, action: 'meeting_room', roomId?: string) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', action);
      if (roomId) {
        formData.append('roomId', roomId);
      }

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      if (data.code === 200) {
        return data.data.url;
      } else {
        throw new Error(data.message || 'Failed to upload file');
      }
    } finally {
      // Reset upload state after a short delay to show completion
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchRooms()
  }, [])

  // Update filtered results when rooms data changes
  useEffect(() => {
    const activeRooms = rooms.filter(room => room.status !== 'deleted');
    setFilteredRooms(activeRooms);
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
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Add New Meeting Room</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 overflow-y-auto pr-2">
                    <RoomForm room={newRoom} setRoom={setNewRoom} />

                    {/* upload pictures */}
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-room-image">Room Image</Label>
                        <div className="flex flex-col gap-4">
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            {isUploading ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : newRoom?.image ? (
                              <img
                                src={newRoom.image}
                                alt="Meeting room image"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://via.placeholder.com/600x400?text=No+Image";
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                  <div className="text-sm font-medium">No image selected</div>
                                  <div className="text-xs">Click to upload an image</div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Uploading...</span>
                                </div>
                              ) : (
                                'Upload Image'
                              )}
                            </Button>
                            <input
                              type="file"
                              id="new-room-image"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              disabled={isUploading}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const imageUrl = await uploadFile(file, 'meeting_room');
                                    setNewRoom({
                                      ...newRoom,
                                      image: imageUrl
                                    });
                                  } catch (error) {
                                    console.error('Failed to upload image:', error);
                                    toast({
                                      title: "Error",
                                      description: "Failed to upload image. Please try again.",
                                      variant: "destructive",
                                      duration: 3000,
                                    });
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

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
                        <TableHead className="w-[35%]">Facilities</TableHead>
                        <TableHead className="w-[10%]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRooms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
                                {room.facilities?.coffee_break && (
                                  <Badge variant="outline">Coffee Break</Badge>
                                )}
                                {room.facilities?.whiteboard > 0 && (
                                  <Badge variant="outline">Whiteboard x{room.facilities.whiteboard}</Badge>
                                )}
                                {room.facilities?.power_sockets > 0 && (
                                  <Badge variant="outline">Power Sockets x{room.facilities.power_sockets}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedRoom(room)
                                    setIsModifyDialogOpen(true)
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setAdminPassword('');
          setPasswordError('');
        }
      }}>
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
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
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
      <Dialog open={isModifyDialogOpen} onOpenChange={setIsModifyDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Meeting Room</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="edit-room_id">Room ID</Label>
              <Input
                id="edit-room_id"
                value={selectedRoom?.room_id || ''}
                disabled
                className="bg-gray-100"
              />
            </div>

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

                {/* Divider */}
                <div className="border-t border-gray-200 my-2"></div>

                {/* Upload meeting room pictures */}
                <div className="space-y-2">
                  <Label htmlFor="room-image">Room Image</Label>
                  <div className="flex flex-col gap-4">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      {isUploading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : selectedRoom?.image ? (
                        <img
                          src={selectedRoom.image}
                          alt="Meeting room image"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/600x400?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-sm font-medium">No image selected</div>
                            <div className="text-xs">Click to upload an image</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          'Upload Image'
                        )}
                      </Button>
                      <input
                        type="file"
                        id="room-image"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        disabled={isUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file && selectedRoom) {
                            try {
                              const imageUrl = await uploadFile(file, 'meeting_room', selectedRoom.room_id);
                              setSelectedRoom({
                                ...selectedRoom,
                                image: imageUrl
                              });
                            } catch (error) {
                              console.error('Failed to upload image:', error);
                              toast({
                                title: "Error",
                                description: "Failed to upload image. Please try again.",
                                variant: "destructive",
                                duration: 3000,
                              });
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
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
              handleModifyRoom();
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
"use client"

import { MapPin, Users, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

// Define the type for the room data
type Room = {
  // Fields returned by API
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
  }
}

type RoomDetailProps = {
  room: Room | null
  isOpen: boolean
  onClose: () => void
}

export function RoomDetail({ room, isOpen, onClose }: RoomDetailProps) {
  if (!room) return null

  const roomData = {
    name: room.name,
    building: room.building,
    floor: room.floor,
    capacity_min: room.capacity_min,
    capacity_max: room.capacity_max,
    status: room.status,
    facilities: room.facilities,
    image: room.image
  }

  // Get status badge color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', text: 'Available' }
      case 'maintenance':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Maintenance' }
      case 'using':
        return { color: 'bg-blue-100 text-blue-800', text: 'In Use' }
      case 'booked':
        return { color: 'bg-purple-100 text-purple-800', text: 'Booked' }
      case 'deleted':
        return { color: 'bg-red-100 text-red-800', text: 'Deleted' }
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Unknown' }
    }
  }

  const statusInfo = getStatusInfo(roomData.status)

  // Generate facility list
  const generateFacilitiesList = () => {
    const facilitiesList = [];
    
    // Add facilities of boolean type
    if (roomData.facilities.projector) {
      facilitiesList.push("Projector");
    }
    if (roomData.facilities.coffee_break) {
      facilitiesList.push("Coffee Break");
    }
    
    // Add facilities of numerical type
    if (roomData.facilities.whiteboard && roomData.facilities.whiteboard > 0) {
      facilitiesList.push(`${roomData.facilities.whiteboard} Whiteboard${roomData.facilities.whiteboard > 1 ? 's' : ''}`);
    }
    if (roomData.facilities.power_sockets && roomData.facilities.power_sockets > 0) {
      facilitiesList.push(`${roomData.facilities.power_sockets} Power Socket${roomData.facilities.power_sockets > 1 ? 's' : ''}`);
    }
    
    // Add special notes
    if (roomData.facilities.special_notes && roomData.facilities.special_notes.length > 0) {
      facilitiesList.push(...roomData.facilities.special_notes);
    }
    
    return facilitiesList;
  }

  const facilitiesList = generateFacilitiesList();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[lch(17_23_133)]">{roomData.name}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex justify-between items-start">
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {roomData.image && (
          <div className="w-full h-48 overflow-hidden rounded-md mb-4">
            <Image 
              src={roomData.image} 
              alt={roomData.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/400x200?text=No+Image";
              }}
            />
          </div>
        )}

        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[lch(17_23_133)]" />
              <div className="text-sm">
                <span className="font-medium">Location: </span>
                {roomData.building}, Floor {roomData.floor}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[lch(17_23_133)]" />
              <div className="text-sm">
                <span className="font-medium">Capacity: </span>
                {roomData.capacity_min} - {roomData.capacity_max} people
              </div>
            </div>
          </div>
          
          {/* Facilities */}
          {facilitiesList.length > 0 && (
            <div className="rounded-md border p-3">
              <h4 className="text-sm font-medium mb-2">Facilities</h4>
              <div className="grid grid-cols-2 gap-2">
                {facilitiesList.map((facility, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[lch(83_56_130)]" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 
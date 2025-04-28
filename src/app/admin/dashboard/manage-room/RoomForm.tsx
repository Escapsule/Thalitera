import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Meeting room type definition (可以考虑移到单独的types文件中)
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

interface RoomFormProps {
  room: Partial<MeetingRoom> | MeetingRoom
  setRoom: (room: any) => void
  isEdit?: boolean
}

const RoomForm: React.FC<RoomFormProps> = ({ room, setRoom, isEdit = false }) => {
  // 生成唯一ID前缀，用于区分添加和编辑表单的字段ID
  const idPrefix = isEdit ? 'edit-' : '';

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}name`}>Room Name</Label>
          <Input
            id={`${idPrefix}name`}
            placeholder="e.g.: Building A-301 Meeting Room"
            value={room.name || ''}
            onChange={(e) => setRoom({ ...room, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}building`}>Building</Label>
          <Input
            id={`${idPrefix}building`}
            placeholder="e.g.: Tech Tower"
            value={room.building || ''}
            onChange={(e) => setRoom({ ...room, building: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}floor`}>Floor</Label>
          <Input
            id={`${idPrefix}floor`}
            type="number"
            value={room.floor || 1}
            onChange={(e) => setRoom({ ...room, floor: parseInt(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}status`}>Status</Label>
          <Select
            value={room.status}
            onValueChange={(value: 'active' | 'maintenance' | 'using' | 'booked' | 'deleted') =>
              setRoom({ ...room, status: value })
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
          <Label htmlFor={`${idPrefix}capacity_min`}>Minimum Capacity</Label>
          <Input
            id={`${idPrefix}capacity_min`}
            type="number"
            value={room.capacity_min || 1}
            onChange={(e) => setRoom({ ...room, capacity_min: parseInt(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}capacity_max`}>Maximum Capacity</Label>
          <Input
            id={`${idPrefix}capacity_max`}
            type="number"
            value={room.capacity_max || 10}
            onChange={(e) => setRoom({ ...room, capacity_max: parseInt(e.target.value) })}
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
                id={`${idPrefix}projector`}
                checked={room.facilities?.projector}
                onCheckedChange={(checked) =>
                  setRoom({
                    ...room,
                    facilities: {
                      ...room.facilities,
                      projector: checked as boolean
                    }
                  })
                }
              />
              <Label htmlFor={`${idPrefix}projector`}>Projector</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${idPrefix}coffee_break`}
                checked={room.facilities?.coffee_break}
                onCheckedChange={(checked) =>
                  setRoom({
                    ...room,
                    facilities: {
                      ...room.facilities,
                      coffee_break: checked as boolean
                    }
                  })
                }
              />
              <Label htmlFor={`${idPrefix}coffee_break`}>Coffee Break Service</Label>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-2"></div>

          {/* Whiteboard and Power sockets counts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor={`${idPrefix}whiteboard`} className="min-w-[100px]">Whiteboard:</Label>
              <Input
                id={`${idPrefix}whiteboard`}
                type="number"
                min="0"
                max="20"
                className="w-20 h-8"
                value={room.facilities?.whiteboard || 0}
                onChange={(e) =>
                  setRoom({
                    ...room,
                    facilities: {
                      ...room.facilities,
                      whiteboard: parseInt(e.target.value) || 0
                    }
                  })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor={`${idPrefix}power_sockets`} className="min-w-[100px]">Power Sockets:</Label>
              <Input
                id={`${idPrefix}power_sockets`}
                type="number"
                min="0"
                max="20"
                className="w-20 h-8"
                value={room.facilities?.power_sockets || 0}
                onChange={(e) =>
                  setRoom({
                    ...room,
                    facilities: {
                      ...room.facilities,
                      power_sockets: parseInt(e.target.value) || 0
                    }
                  })
                }
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-2"></div>

          {/* Special notes */}
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}special_notes`}>Special Notes</Label>
            <Input
              id={`${idPrefix}special_notes`}
              placeholder="e.g.: No food and drinks, Equipment setup 30 minutes in advance"
              value={room.facilities?.special_notes?.join(', ') || ''}
              onChange={(e) => {
                const notes = e.target.value ? e.target.value.split(',').map(note => note.trim()) : [];
                setRoom({
                  ...room,
                  facilities: {
                    ...room.facilities,
                    special_notes: notes
                  }
                });
              }}
            />
            <p className="text-xs text-gray-500">Separate multiple notes with commas</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomForm
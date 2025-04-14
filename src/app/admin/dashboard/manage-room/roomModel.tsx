// Meeting room facilities interface definition
export interface RoomFacilities {
  projector?: boolean;       // Projector, nullable
  whiteboard?: number;       // Number of whiteboards, nullable
  power_sockets?: number;    // Number of power sockets, nullable
  coffee_break?: boolean;    // Coffee break service, nullable
  special_notes?: string[];  // Special notes, nullable
}

// Meeting room creation request interface definition
export interface CreateRoomRequest {
  name: string;              // Room name
  capacity_min: number;      // Minimum capacity
  capacity_max: number;      // Maximum capacity
  building: string;          // Building location
  floor: number;             // Floor number
  facilities: RoomFacilities; // Facilities information, not null
  create_by: string;         // Creator
}

// Meeting room response interface definition
export interface RoomResponse extends CreateRoomRequest {
  room_id: string;           // Room ID
  status: 'active' | 'maintenance' | 'using' | 'booked' | 'deleted'; // Room status
  created_at?: string;       // Creation time
  updated_at?: string;       // Update time
}

// Default values for creating a new meeting room
export const defaultRoomRequest: CreateRoomRequest = {
  name: '',
  capacity_min: 1,
  capacity_max: 10,
  building: '',
  floor: 1,
  facilities: {
    projector: false,
    whiteboard: 0,
    power_sockets: 0,
    coffee_break: false,
    special_notes: []
  },
  create_by: ''
};
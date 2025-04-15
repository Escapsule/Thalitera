export interface MeetingRoomFacilities {
  projecter?: boolean;
  whiteboard?: number;
  power_sockets?: number;
  coffee_break?: boolean;
  special_notes?: string[];
}

export interface MeetingRoom {
  room_id: string;
  image: string;
  name: string;
  capacity_min: number;
  capacity_max: number;
  building: string;
  floor: string;
  facilities: MeetingRoomFacilities;
}

export interface MeetingRoomResponse {
  code: number;
  message: string;
  data: MeetingRoom[];
  timestamp: number;
} 
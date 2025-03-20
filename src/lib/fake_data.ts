import { addDays, startOfToday } from "date-fns"

// Room information with extended details
export const rooms = [
  {
    id: 1,
    name: "Conference Room A",
    capacity: 12,
    location: "Building A, Floor 2",
    description: "Large conference room with projector, whiteboard, and video conferencing capabilities.",
    amenities: ["Projector", "Whiteboard", "Video Conference", "Air Conditioning"]
  },
  {
    id: 2,
    name: "Meeting Room B",
    capacity: 6,
    location: "Building A, Floor 1",
    description: "Medium-sized meeting room ideal for team discussions and presentations.",
    amenities: ["TV Screen", "Whiteboard", "Video Conference"]
  },
  {
    id: 3,
    name: "Board Room",
    capacity: 20,
    location: "Building B, Floor 3",
    description: "Executive board room with premium facilities and catering services available.",
    amenities: ["Projector", "Whiteboard", "Video Conference", "Catering Available", "Premium Audio"]
  },
  {
    id: 4,
    name: "Conference Room C",
    capacity: 8,
    location: "Building B, Floor 1",
    description: "Comfortable meeting space with modern amenities and natural lighting.",
    amenities: ["TV Screen", "Whiteboard", "Natural Lighting"]
  },
  {
    id: 5,
    name: "Huddle Space",
    capacity: 4,
    location: "Building A, Floor 2",
    description: "Small informal meeting space for quick discussions and brainstorming.",
    amenities: ["Whiteboard", "Comfortable Seating"]
  }
]

export const bookings = [
  {
    id: 1,
    roomName: "Conference Room A",
    roomId: 1,
    date: startOfToday(), // Booking for today
    startTime: "14:00",
    endTime: "15:00",
  },
  {
    id: 2,
    roomName: "Meeting Room B",
    roomId: 2,
    date: addDays(startOfToday(), 1),
    startTime: "09:00",
    endTime: "10:30",
  },
  {
    id: 3,
    roomName: "Board Room",
    roomId: 3,
    date: addDays(startOfToday(), 1),
    startTime: "14:00",
    endTime: "15:30",
  },
  {
    id: 4,
    roomName: "Board Room",
    roomId: 3,
    date: addDays(startOfToday(), 3),
    startTime: "11:00",
    endTime: "12:00",
  },
  {
    id: 5,
    roomName: "Conference Room C",
    roomId: 4,
    date: addDays(startOfToday(), 5),
    startTime: "13:00",
    endTime: "14:00",
  },
]
  
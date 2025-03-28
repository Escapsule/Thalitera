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
  },
  {
    id: 6,
    name: "Innovation Lab",
    capacity: 15,
    location: "Building C, Floor 1",
    description: "Creative space with modular furniture and tech equipment for innovation sessions.",
    amenities: ["Smart Displays", "Modular Furniture", "Video Conference", "Digital Whiteboards"]
  },
  {
    id: 7,
    name: "Focus Room",
    capacity: 2,
    location: "Building C, Floor 2",
    description: "Small private room for focused work or one-on-one meetings.",
    amenities: ["Phone", "Desk", "Sound Insulation"]
  }
]

// All possible room amenities for filtering
export const allAmenities = [
  "Projector",
  "Whiteboard", 
  "Video Conference", 
  "Air Conditioning",
  "TV Screen",
  "Catering Available",
  "Premium Audio", 
  "Natural Lighting",
  "Comfortable Seating",
  "Smart Displays",
  "Modular Furniture",
  "Digital Whiteboards",
  "Phone",
  "Desk",
  "Sound Insulation"
];

// All locations for filtering
export const allLocations = [
  "Building A, Floor 1",
  "Building A, Floor 2",
  "Building B, Floor 1",
  "Building B, Floor 3",
  "Building C, Floor 1",
  "Building C, Floor 2"
];

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
  {
    id: 6,
    roomName: "Innovation Lab",
    roomId: 6,
    date: startOfToday(),
    startTime: "10:00",
    endTime: "12:00",
  },
  {
    id: 7,
    roomName: "Meeting Room B",
    roomId: 2,
    date: addDays(startOfToday(), 2),
    startTime: "15:00",
    endTime: "16:00",
  }
]

// Function to check if a room is available at a specific time
export function isRoomAvailable(roomId: number, date: Date, startTime: string, endTime: string) {
  const dateString = date.toDateString();
  
  return !bookings.some(booking => {
    // Check if booking is for the same room and same day
    if (booking.roomId === roomId && booking.date.toDateString() === dateString) {
      // Convert times to numbers for easier comparison (e.g., "09:30" -> 9.5)
      const bookingStart = timeToNumber(booking.startTime);
      const bookingEnd = timeToNumber(booking.endTime);
      const requestStart = timeToNumber(startTime);
      const requestEnd = timeToNumber(endTime);
      
      // Check if times overlap
      return (requestStart < bookingEnd && requestEnd > bookingStart);
    }
    return false;
  });
}

// Helper to convert time string to number
function timeToNumber(timeStr: string) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + (minutes / 60);
}
  
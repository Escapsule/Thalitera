// Room information with extended details
export const rooms = [
    {
      id: 1,
      name: "Conference Room A",
      capacity: 12,
      location: "Building A, Floor 2",
      description: "Large conference room with projector",
      amenities: ["Projector", "Whiteboard"],
      status: "available",
      utilizationRate: 60,
      currentBookings: [],
      weeklyStats: {
        totalHours: 40,
        averageUtilization: 65,
        peakHours: ["09:00-10:00", "14:00-15:00"]
      }
    },
    {
      id: 2,
      name: "Meeting Room B",
      capacity: 6,
      location: "Building A, Floor 1",
      description: "Medium-sized meeting room",
      amenities: ["TV Screen", "Whiteboard"],
      status: "in_use",
      utilizationRate: 80,
      currentBookings: [{
        id: 1,
        startTime: "09:00",
        endTime: "10:00",
        userName: "John",
        purpose: "Team Meeting"
      }],
      weeklyStats: {
        totalHours: 35,
        averageUtilization: 70,
        peakHours: ["10:00-11:00", "15:00-16:00"]
      }
    },
    {
      id: 3,
      name: "Board Room",
      capacity: 20,
      location: "Building B, Floor 3",
      description: "Executive board room with premium facilities",
      amenities: ["Projector", "Whiteboard", "Video Conference", "Catering Available", "Premium Audio"],
      status: "in_use",
      utilizationRate: 50,
      currentBookings: [{
        id: 5,
        startTime: "09:00",
        endTime: "10:00",
        userName: "Bob",
        purpose: "Team Meeting"
      }],
      weeklyStats: {
        totalHours: 25,
        averageUtilization: 55,
        peakHours: ["11:00-12:00", "16:00-17:00"]
      }
    },
    {
      id: 4,
      name: "Conference Room C",
      capacity: 8,
      location: "Building B, Floor 1",
      description: "Comfortable meeting space with modern amenities",
      amenities: ["TV Screen", "Whiteboard", "Natural Lighting"],
      status: "available",
      utilizationRate: 40,
      currentBookings: [],
      weeklyStats: {
        totalHours: 30,
        averageUtilization: 60,
        peakHours: ["11:00-12:00", "16:00-17:00"]
      }
    },
    {
      id: 5,
      name: "Huddle Space",
      capacity: 4,
      location: "Building A, Floor 2",
      description: "Small informal meeting space",
      amenities: ["Whiteboard", "Comfortable Seating"],
      status: "available",
      utilizationRate: 30,
      currentBookings: [],
      weeklyStats: {
        totalHours: 20,
        averageUtilization: 50,
        peakHours: ["12:00-13:00", "17:00-18:00"]
      }
    },
    {
      id: 6,
      name: "Innovation Lab",
      capacity: 15,
      location: "Building C, Floor 1",
      description: "Creative space with modular furniture",
      amenities: ["Smart Displays", "Modular Furniture", "Video Conference", "Digital Whiteboards"],
      status: "available",
      utilizationRate: 20,
      currentBookings: [],
      weeklyStats: {
        totalHours: 15,
        averageUtilization: 40,
        peakHours: ["13:00-14:00", "18:00-19:00"]
      }
    },
    {
      id: 7,
      name: "Focus Room",
      capacity: 2,
      location: "Building C, Floor 2",
      description: "Small private room for focused work",
      amenities: ["Phone", "Desk", "Sound Insulation"],
      status: "in_use",
      utilizationRate: 80,
      currentBookings: [{
        id: 2,
        startTime: "09:00",
        endTime: "10:00",
        userName: "Sam",
        purpose: "Team Meeting"
      }],
      weeklyStats: {
        totalHours: 35,
        averageUtilization: 70,
        peakHours: ["10:00-11:00", "15:00-16:00"]
      }
    }
  ]
  
  // All available meeting room amenities
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
  ]
  
  // All available locations
  export const allLocations = [
    "Building A, Floor 1",
    "Building A, Floor 2",
    "Building B, Floor 1",
    "Building B, Floor 3",
    "Building C, Floor 1",
    "Building C, Floor 2"
  ]
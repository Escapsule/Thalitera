import { addDays, startOfToday } from "date-fns"

export const bookings = [
    {
      id: 1,
      roomName: "Conference Room A",
      date: addDays(startOfToday(), 1),
      startTime: "09:00",
      endTime: "10:00",
    },
    {
      id: 2,
      roomName: "Meeting Room B",
      date: addDays(startOfToday(), 1),
      startTime: "14:00",
      endTime: "15:30",
    },
    {
      id: 3,
      roomName: "Board Room",
      date: addDays(startOfToday(), 3),
      startTime: "11:00",
      endTime: "12:00",
    },
    {
      id: 4,
      roomName: "Conference Room C",
      date: addDays(startOfToday(), 5),
      startTime: "13:00",
      endTime: "14:00",
    },
  ]
  
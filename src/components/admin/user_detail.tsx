import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, Mail, MapPin, UserRound, IdCard } from 'lucide-react'

type UserDetailProps = {
  user: {
    id: number
    name: string
    email: string
    status: 'online' | 'offline'
    lastLogin: string
    totalBookings: number
    currentBookings: {
      id: number
      roomName: string
      startTime: string
      endTime: string
      purpose: string
    }[]
  }
  isOpen: boolean
  onClose: () => void
}


const UserDetail = ({ user, isOpen, onClose }: UserDetailProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                user.status === 'online' 
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
              }`} />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className={`text-xs ${
                user.status === 'online' 
                  ? 'text-green-600' 
                  : 'text-gray-500'
              }`}>
                {user.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Basic information */}
          <div className="grid gap-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <IdCard className="h-5 w-5 text-[lch(17_23_133)]" />
                <div className="text-sm">
                  <span>ID: {user.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-[lch(17_23_133)]" />
                <div className="text-sm">
                  <span>Name: {user.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[lch(17_23_133)]" />
                <div className="text-sm">
                  <span>Email: {user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Statistics */}
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Booking Statistics</h3>
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[lch(17_23_133)]" />
                  <div className="text-sm">
                    <span>Total Bookings: {user.totalBookings}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[lch(17_23_133)]" />
                  <div className="text-sm">
                    <span>Last Login: {user.lastLogin}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Bookings */}
          {user.currentBookings && user.currentBookings.length > 0 && (
            <div className="grid gap-4">
              <h3 className="text-lg font-medium">Current Booking</h3>
              <div className="space-y-4">
                {user.currentBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-[lch(17_23_133)]" />
                      <div className="text-sm">
                        <span className="font-medium">{booking.roomName}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-[lch(17_23_133)]">
                      <div>Start Time: {booking.startTime}</div>
                      <div>End Time: {booking.endTime}</div>
                      <div>Purpose: {booking.purpose}</div>
                    </div>
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

export default UserDetail 
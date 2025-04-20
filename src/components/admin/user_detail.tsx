import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, Mail, UserRound } from 'lucide-react'
import Image from 'next/image'

type UserDetailProps = {
  user: {
    user_id: string
    avatar?: string
    username: string
    email: string
    status: string // active, locked, disabled, admin, pending
    created_at?: string
    update_at?: string
  }
  isOpen: boolean
  onClose: () => void
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date format";
    }
    return date.toLocaleString();
  } catch (error: unknown) {
    console.error("Error formatting date:", error);
    return "Invalid date format";
  }
};

const UserDetail = ({ user, isOpen, onClose }: UserDetailProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
              ) : (
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                user.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : user.status === 'locked'
                ? 'bg-red-100 text-red-800'
                : user.status === 'disabled'
                ? 'bg-gray-100 text-gray-800'
                : user.status === 'admin'
                ? 'bg-blue-100 text-blue-800'
                : user.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Basic information */}
          <div className="grid gap-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-[lch(17_23_133)]" />
                <div className="text-sm">
                  <span>Username: {user.username}</span>
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

          {/* Account Information */}
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Account Information</h3>
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                {user.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span>Created: {formatDate(user.created_at)}</span>
                    </div>
                  </div>
                )}
                {user.update_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[lch(17_23_133)]" />
                    <div className="text-sm">
                      <span>Last Updated: {formatDate(user.update_at)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserDetail 
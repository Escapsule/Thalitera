"use client"

import React, { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ProfileSettings from './ProfileSettings'
import NotificationSettings from './NotificationSettings'
import SecuritySettings from './SecuritySettings'
import BookingRecords from './BookingRecords'
import {
    UserIcon,
    BellIcon,
    ShieldCheckIcon,
    CalendarDaysIcon,
  } from "lucide-react"

// Navigation item configuration
const navItems = [
    {
      title: "Profile Settings",
      icon: UserIcon,
      value: "profile"
    },
    {
      title: "Notification Settings",
      icon: BellIcon,
      value: "notifications"
    },
    {
      title: "Security Settings",
      icon: ShieldCheckIcon,
      value: "security"
    },
    {
      title: "Booking Records",
      icon: CalendarDaysIcon,
      value: "bookings"
    }
]
const page = () => {
    const [activeTab, setActiveTab] = useState("profile")

    return (
        <div className="container min-w-[80vw] py-6 ml-12">

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[lch(17_23_133)] mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Navigation */}
                <Card className="w-full md:w-64 p-2">
                    <nav className="space-y-3">
                        {navItems.map((item) => (
                            <Button
                                key={item.value}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-2",
                                    activeTab === item.value && "bg-muted"
                                )}
                                onClick={() => setActiveTab(item.value)}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Button>
                        ))}
                    </nav>
                </Card>

                {/* Right side content */}
                <Card className="flex-1 p-4 md:p-6">
                    {/* title */}
                    <div className="border-b pb-4 mb-6">
                        <h2 className="text-lg font-medium">
                            {navItems.find(item => item.value === activeTab)?.title}
                        </h2>
                    </div>
                    {/* content */}
                    <div className="min-h-[400px]">
                        {activeTab === "profile" && (
                            <ProfileSettings />
                        )}
                        {activeTab === "notifications" && (
                            <NotificationSettings />
                        )}
                        {activeTab === "security" && (
                            <SecuritySettings />
                        )}
                        {activeTab === "bookings" && (
                            <BookingRecords />
                        )}
                    </div>
                </Card>

            </div>

        </div>
    )
}
  
export default page
"use client"

import React, { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ProfileSettings from './ProfileSettings'
import SecuritySettings from './SecuritySettings'
import {
    UserIcon,
    ShieldCheckIcon,
  } from "lucide-react"

// Navigation item configuration
const navItems = [
    {
      title: "Profile Settings",
      icon: UserIcon,
      value: "profile"
    },
    {
      title: "Security Settings",
      icon: ShieldCheckIcon,
      value: "security"
    },
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
                <Card className="w-full md:w-64 p-2 flex flex-col">
                    <nav className="space-y-3 flex-grow">
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
                    
                    {/* Logout button*/}
                    <div className="pt-4 mt-auto border-t">
                        <Button 
                            variant="destructive" 
                            className="w-full justify-start gap-2"
                            onClick={() => {
                                // Add logout logic here
                                console.log("User logged out")
                                // Redirect to login page
                                // window.location.href = "/login"
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Log out
                        </Button>
                    </div>
                </Card>

                {/* Right side content */}
                <Card className="flex-1 p-4 md:p-6">
                    {/* title */}
                    <div className="border-b pb-4 mb-6">
                        <h2 className="text-xl font-medium">
                            {navItems.find(item => item.value === activeTab)?.title}
                        </h2>
                    </div>
                    {/* content */}
                    <div className="min-h-[400px]">
                        {activeTab === "profile" && (
                            <ProfileSettings />
                        )}
                        {activeTab === "security" && (
                            <SecuritySettings />
                        )}
                    </div>
                </Card>

            </div>

        </div>
    )
}
  
export default page
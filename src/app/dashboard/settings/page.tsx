"use client"

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileSettings from './ProfileSettings'
import SecuritySettings from './SecuritySettings'
import {
  UserIcon,
  ShieldCheckIcon,
} from "lucide-react"

const Page = () => {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="container min-w-[80vw] py-6 ml-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[lch(17_23_133)] mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and security settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 border-b pb-px w-full justify-start rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-[lch(17_23_133)] data-[state=active]:text-[lch(17_23_133)] rounded-none pb-3 pt-2 px-4 text-muted-foreground font-medium"
          >
            <UserIcon className="h-4 w-4 mr-2" />
            Profile Settings
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-[lch(17_23_133)] data-[state=active]:text-[lch(17_23_133)] rounded-none pb-3 pt-2 px-4 text-muted-foreground font-medium"
          >
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            Security Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-0">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="security" className="mt-0">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
  
export default Page
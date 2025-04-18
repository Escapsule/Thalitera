"use client";

import { LayoutDashboard, DoorOpen, Users, Calendar } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"

// Menu items.
const items = [
    {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    },
  {
    title: "Manage Room",
    url: "/admin/dashboard/manage-room",
    icon: DoorOpen,
  },    
  {
    title: "Manage User",
    url: "/admin/dashboard/manage-user",
    icon: Users,
  },
  {
    title: "Manage Booking",
    url: "/admin/dashboard/manage-booking",
    icon: Calendar,
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Image 
            src = "/icon.png?height=24&width=24"
            alt = "Thalitera"
            width = {24}
            height = {24}
            />
            <p className="text-lg font-bold pl-2">Thalitera</p>
            </SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`hover:bg-[lch(83_56_130)] ${isActive ? 'bg-[lch(83_56_130)]' : ''}`}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
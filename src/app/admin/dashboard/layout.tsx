'use client';

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main>
        <SidebarTrigger className="ml-2 fixed" />
          {children}
      </main>
    </SidebarProvider>
  )
}
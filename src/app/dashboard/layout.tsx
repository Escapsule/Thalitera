import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <main>
        <SidebarTrigger className="ml-2 fixed"/>
        {children}
      </main>
    </SidebarProvider>
  )
}

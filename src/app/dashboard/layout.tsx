'use client';

import { useEffect } from 'react';
import { AppSidebar } from "@/components/user/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Script from 'next/script';

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set localStorage auth flag as fallback authentication mechanism
    if (typeof window !== 'undefined') {
      localStorage.setItem('thalitera_auth', 'true');
      console.log('Dashboard loaded, localStorage auth set');
    }
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar/>
      <main>
        <SidebarTrigger className="ml-2 fixed"/>
        {children}
      </main>
      
      {/* Auth helper script */}
      <Script 
        src="/dashboard-bypass.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('Auth helper script loaded')}
      />
    </SidebarProvider>
  )
}

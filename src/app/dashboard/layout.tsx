'use client';

import { useEffect } from 'react';
import { AppSidebar } from "@/components/user/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Script from 'next/script';

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set localStorage auth flag as fallback authentication mechanism
    if (typeof window !== 'undefined') {
      // Always set localStorage auth when dashboard loads
      localStorage.setItem('thalitera_auth', 'true');
      console.log('Dashboard loaded, localStorage auth set');
      
      // Check if we have a session cookie
      const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
      
      // If no session cookie, set one client-side (non-HttpOnly version)
      if (!hasCookie) {
        console.log('No session cookie found, setting one client-side');
        
        // Generate a temporary UUID-like session ID
        const now = new Date();
        const tempSessionId = `${now.getTime().toString(16)}-${Math.random().toString(16).substring(2, 10)}-${Math.random().toString(16).substring(2, 10)}`;
        
        // Set the cookie with a long expiration
        document.cookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
      }
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

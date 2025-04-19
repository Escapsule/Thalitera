'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from "@/components/user/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';

export default function Layout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const forceBreak = searchParams.get('forceBreak') === 'true';
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  
  // Use the session monitor to automatically check auth status every 5 minutes
  const { sessionStatus } = useSessionMonitor();
  
  // Fetch user info and store in localStorage
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          // Store user info in localStorage
          localStorage.setItem('user_info', JSON.stringify({
            user_id: result.data.user_id || '',
            user_name: result.data.username || '',
            email: result.data.email || '',
            avatar: result.data.avatar || ''
          }));
          console.log('User info stored in localStorage');
        } else {
          console.error('Failed to get user info:', result.message);
        }
      } else {
        console.error('Failed to fetch user info:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setIsLoadingUserInfo(false);
    }
  };
  
  useEffect(() => {
    // Check authentication instead of automatically setting it
    if (typeof window !== 'undefined') {
      // Verify existing authentication - only check THALITERA_SESSION_ID cookie
      const hasLocalStorageAuth = localStorage.getItem('thalitera_auth') === 'true';
      const hasCookie = document.cookie.split(';').some(cookie => 
        cookie.trim().startsWith('THALITERA_SESSION_ID=') || cookie.trim().startsWith('thalitera_session_marker=')
      );
      
      // Log authentication state for debugging
      console.log('Auth state in dashboard layout:', {
        localStorage: localStorage.getItem('thalitera_auth'),
        hasCookie,
        forceBreak,
        sessionValid: sessionStatus.isValid,
        lastChecked: sessionStatus.lastChecked
      });
      
      // If we detect missing authentication and not forcing a break for a loop
      if (!hasLocalStorageAuth && !hasCookie && !forceBreak) {
        console.log('No authentication detected, redirecting to login');
        router.push('/login');
        return;
      }
      
      // If we have localStorage auth but no cookie, set cookie for middleware
      if (hasLocalStorageAuth && !hasCookie) {
        console.log('Has localStorage auth but no cookie, setting cookie for middleware');
        const tempSessionId = `dashboard_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        
        document.cookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
      }
      
      // Fetch user info if authenticated
      if ((hasLocalStorageAuth || hasCookie) && !localStorage.getItem('user_info')) {
        fetchUserInfo();
      } else {
        setIsLoadingUserInfo(false);
      }
      
      setIsCheckingAuth(false);
    }
  }, [router, forceBreak, sessionStatus]);

  // Show loading while checking auth or fetching user info
  if (isCheckingAuth || isLoadingUserInfo) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

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

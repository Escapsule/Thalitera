'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to clear invalid client-side created cookies
function clearInvalidCookies() {
  if (typeof window !== 'undefined') {
    // Clear any client-side created session cookies
    const invalidCookies = document.cookie.split(';')
      .map(c => c.trim())
      .filter(cookie => 
        cookie.startsWith('THALITERA_SESSION_ID=dashboard_') || 
        cookie.startsWith('thalitera_session=') ||
        cookie.startsWith('dashboard_')
      );
    
    if (invalidCookies.length > 0) {
      console.log('Found invalid client-created cookies in AuthProvider - clearing them');
      
      invalidCookies.forEach(cookie => {
        const name = cookie.split('=')[0];
        document.cookie = `${name}=; Path=/; Max-Age=0`;
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
      
      // Also clear these specific cookies
      document.cookie = 'THALITERA_SESSION_ID=; Path=/; Max-Age=0';
      document.cookie = 'thalitera_session=; Path=/; Max-Age=0';
      document.cookie = 'thalitera_auth=; Path=/; Max-Age=0';
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Use the session monitor
  const { sessionStatus } = useSessionMonitor();

  // Check authentication status on mount and route changes
  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        // Clear any client-side created cookies first
        clearInvalidCookies();
        
        // Check for valid THALITERA_SESSION_ID cookie (only valid if set by server)
        let authenticated = false;
        
        if (typeof window !== 'undefined') {
          // Check for server-set THALITERA_SESSION_ID cookie
          const hasCookie = document.cookie.split(';')
            .map(c => c.trim())
            .some(cookie => 
              cookie.startsWith('THALITERA_SESSION_ID=') && 
              !cookie.includes('dashboard_') && 
              !cookie.includes('authProvider_')
            );
          
          authenticated = hasCookie;
          
          // Synchronize localStorage with cookies
          if (hasCookie) {
            localStorage.setItem('thalitera_auth', 'true');
          } else {
            localStorage.removeItem('thalitera_auth');
          }
        }
        
        setAuthenticated(authenticated);
        
        // Redirect to login if not authenticated and trying to access protected routes
        if (!authenticated && (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin'))) {
          console.log('No authentication found, redirecting to login from path:', pathname);
          
          // Check if we're coming from a login redirect loop
          const fromLogin = sessionStorage.getItem('coming_from_login');
          const now = Date.now();
          const lastRedirect = parseInt(sessionStorage.getItem('last_redirect_time') || '0');
          
          // If we've redirected too recently, use the bypass to break potential loops
          if (fromLogin === 'true' && (now - lastRedirect < 2000)) {
            console.log('Detected potential redirect loop, adding forceBreak');
            window.location.href = `/dashboard?forceBreak=true&ts=${now}`;
            return;
          }
          
          // Standard redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setAuthenticated(false);
        
        // Redirect to login if error and trying to access protected routes
        if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
    
    // Set up interval to clear any client-side created cookies periodically
    const cookieCleanupInterval = setInterval(() => {
      clearInvalidCookies();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(cookieCleanupInterval);
  }, [pathname, router, sessionStatus]);

  const value = {
    isAuthenticated,
    isLoading,
    setAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 
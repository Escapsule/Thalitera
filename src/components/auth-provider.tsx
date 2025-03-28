'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status on mount and route changes
  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        // Direct check for localStorage auth to avoid API calls
        let authenticated = false;
        
        if (typeof window !== 'undefined') {
          // First check localStorage for auth state
          authenticated = localStorage.getItem('thalitera_auth') === 'true';
          
          // Then check for cookies if needed
          if (!authenticated) {
            const sessionCookieNames = [
              'THALITERA_SESSION_ID',
              'thalitera_session',
              'thalitera_auth',
              'thalitera-session-id'
            ];
            
            const hasCookie = sessionCookieNames.some(name => 
              document.cookie.split(';').map(c => c.trim()).some(cookie => cookie.startsWith(`${name}=`))
            );
            
            authenticated = hasCookie;
            
            // Synchronize localStorage with cookies if needed
            if (hasCookie && !localStorage.getItem('thalitera_auth')) {
              localStorage.setItem('thalitera_auth', 'true');
            }
          } else {
            // Create cookies for server-side checks if needed
            const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
            if (!hasCookie) {
              const tempSessionId = `authProvider_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
              document.cookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
            }
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
            console.log('Detected potential redirect loop, adding bypass');
            window.location.href = `/dashboard?bypassAuth=true&ts=${now}`;
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
  }, [pathname, router]);

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
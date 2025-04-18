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
        // Check if we have the admin flag in localStorage first
        const isAdmin = typeof window !== 'undefined' && localStorage.getItem('is_admin') === 'true';
        
        // If user is admin and trying to access admin routes, allow without further checks
        if (isAdmin && pathname?.startsWith('/admin')) {
          console.log('Admin access detected for admin route, skipping further checks');
          setAuthenticated(true);
          return;
        }
        
        // Use the API to check auth status instead of checking cookies directly
        const response = await fetch('/api/user/check-auth', {
          method: 'GET',
          credentials: 'include', // Important: include cookies in the request
          headers: isAdmin ? { 'admin-email': 'admin@xjtlu.edu.cn' } : {},
        });
        
        const data = await response.json();
        const authenticated = data.code === 200;
        
        console.log('Auth check response:', data.code, authenticated ? 'authenticated' : 'not authenticated');
        
        setAuthenticated(authenticated);
        
        // Synchronize localStorage with auth state
        if (authenticated) {
          localStorage.setItem('thalitera_auth', 'true');
        } else {
          localStorage.removeItem('thalitera_auth');
          // Don't remove is_admin here to prevent logout loops for admin users
        }
        
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
    
    // Set up interval to check auth status periodically
    const authCheckInterval = setInterval(() => {
      verifyAuth();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(authCheckInterval);
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
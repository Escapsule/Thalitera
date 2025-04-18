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
      // If it's an admin route, do nothing
      if (pathname?.startsWith('/admin')) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Use the API to check auth status instead of checking cookies directly
        const response = await fetch('/api/user/check-auth', {
          method: 'GET',
          credentials: 'include', // Important: include cookies in the request
        });
        
        const data = await response.json();
        const authenticated = data.code === 200;
        
        setAuthenticated(authenticated);
        
        // Synchronize localStorage with auth state
        if (authenticated) {
          localStorage.setItem('thalitera_auth', 'true');
        } else {
          localStorage.removeItem('thalitera_auth');
        }
        
        // Only check authentication for non-admin routes
        if (!authenticated && pathname?.startsWith('/dashboard')) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setAuthenticated(false);
        
        // Only check authentication for non-admin routes
        if (pathname?.startsWith('/dashboard')) {
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
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SessionStatus {
  isValid: boolean;
  lastChecked: Date | null;
}

/**
 * Hook to monitor session validity by checking authentication status every 5 minutes
 * Will clear cookies and redirect to login if session becomes invalid
 */
export function useSessionMonitor() {
  const router = useRouter();
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isValid: true,
    lastChecked: null
  });

  // Clear session cookie function
  const clearSessionCookie = () => {
    document.cookie = 'THALITERA_SESSION_ID=; Path=/; Max-Age=0';
    localStorage.removeItem('thalitera_auth');
    console.log('Session cookie cleared due to invalid auth status');
  };

  // Function to check auth status
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/check-auth', {
        method: 'GET',
        credentials: 'include',
      });

      console.log('Auth check response status:', response.status);
      
      // Update session status
      const isValid = response.status === 200;
      setSessionStatus({
        isValid,
        lastChecked: new Date()
      });

      // If not valid (not 200), clear cookie and redirect
      if (!isValid) {
        clearSessionCookie();
        router.push('/login');
      }
      
      return isValid;
    } catch (error) {
      console.error('Error checking auth status:', error);
      // On error, assume session is invalid
      setSessionStatus({
        isValid: false,
        lastChecked: new Date()
      });
      clearSessionCookie();
      router.push('/login');
      return false;
    }
  };

  // Set up interval for periodic checking
  useEffect(() => {
    // Check immediately on mount
    checkAuthStatus();
    
    // Then check every 5 minutes (300,000 ms)
    const intervalId = setInterval(() => {
      console.log('Running scheduled auth check');
      checkAuthStatus();
    }, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return {
    sessionStatus,
    checkAuthStatus,
    clearSessionCookie
  };
} 
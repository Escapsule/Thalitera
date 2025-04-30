'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  setAdminAuthenticated: (value: boolean) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

/**
 * Admin authentication provider component
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components
 */
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check admin authentication status
  useEffect(() => {
    const verifyAdminAuth = async () => {
      setIsLoading(true);
      try {
        // Check admin authentication cookie
        const adminAuth = document.cookie.includes('admin_auth=true');
        setAdminAuthenticated(adminAuth);

        // If not authenticated and not on the login page, redirect to the main login page
        if (!adminAuth && pathname?.startsWith('/admin') && pathname !== '/login') {
          router.push('/login');
          return;
        }

        // If authenticated and on the login page, redirect to the dashboard
        if (adminAuth && pathname === '/login') {
          router.push('/admin/dashboard');
          return;
        }
      } catch (error) {
        console.error('Admin auth verification error:', error);
        setAdminAuthenticated(false);
        
        // If an error occurs, redirect to the login page if not on the login page
        if (pathname?.startsWith('/admin') && pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminAuth();
    
    // Set a timer to check authentication status periodically
    const authCheckInterval = setInterval(() => {
      verifyAdminAuth();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(authCheckInterval);
  }, [pathname, router]);

  const value = {
    isAdminAuthenticated,
    isLoading,
    setAdminAuthenticated,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

/**
 * Use admin authentication context hook
 * @returns {AdminAuthContextType} Admin authentication context
 */
export function useAdminAuthContext() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuthContext must be used within an AdminAuthProvider');
  }
  return context;
} 
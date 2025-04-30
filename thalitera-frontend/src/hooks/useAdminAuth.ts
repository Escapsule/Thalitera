'use client';

import { useState, useEffect, useCallback } from 'react';
import { login as adminLoginApi, logout as adminLogoutApi } from '@/lib/admin/adminAuth';

interface UseAdminAuthReturn {
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
}

/**
 * Admin authentication hook
 * Handles admin login, logout, and authentication status management
 */
export function useAdminAuth(): UseAdminAuthReturn {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check admin authentication status in localStorage
   */
  const checkLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('thalitera_admin_auth') === 'true';
    }
    return false;
  }, []);
  
  /**
   * Set admin authentication status in localStorage
   */
  const setLocalStorageAuth = useCallback((value: boolean) => {
    if (typeof window !== 'undefined') {
      if (value) {
        localStorage.setItem('thalitera_admin_auth', 'true');
      } else {
        localStorage.removeItem('thalitera_admin_auth');
      }
    }
  }, []);

  /**
   * Create admin authentication cookie from localStorage
   */
  const createAdminCookiesFromLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('thalitera_admin_auth') === 'true') {
      const tempSessionId = localStorage.getItem('thalitera_session_id') || 
                           `admin_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Create admin-specific cookie
      document.cookie = `THALITERA_ADMIN_SESSION_ID=${tempSessionId}; Path=/admin; SameSite=Lax; Max-Age=86400`;
      
      return true;
    }
    return false;
  }, []);

  /**
   * Check admin authentication status
   */
  useEffect(() => {
    const verifyAdminAuth = async () => {
      setIsLoading(true);
      try {
        // Check localStorage and cookies
        const hasCookie = typeof window !== 'undefined' && 
          document.cookie.split(';').map(c => c.trim()).some(cookie => 
            cookie.startsWith('THALITERA_ADMIN_SESSION_ID=')
          );
        
        const hasLocalStorage = checkLocalStorage();
        
        // Synchronize status
        if (hasCookie && !hasLocalStorage) {
          setLocalStorageAuth(true);
        } else if (hasLocalStorage && !hasCookie) {
          createAdminCookiesFromLocalStorage();
        }
        
        setIsAdminAuthenticated(hasLocalStorage || hasCookie);
        
      } catch (error) {
        console.error('Admin auth verification error:', error);
        const localAuth = checkLocalStorage();
        setIsAdminAuthenticated(localAuth);
        if (localAuth) {
          createAdminCookiesFromLocalStorage();
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminAuth();
  }, [checkLocalStorage, setLocalStorageAuth, createAdminCookiesFromLocalStorage]);

  /**
   * Admin login
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminLoginApi(email, password);
      
      if (response.code === 200) {
        setLocalStorageAuth(true);
        setIsAdminAuthenticated(true);
        
        // Create admin cookie
        const hasCookie = document.cookie.includes('THALITERA_ADMIN_SESSION_ID=');
        if (!hasCookie) {
          createAdminCookiesFromLocalStorage();
        }
        
        return true;
      } else {
        setError(response.message || 'Admin login failed');
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Login process error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setLocalStorageAuth, createAdminCookiesFromLocalStorage]);

  /**
   * Admin logout
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await adminLogoutApi();
      
      setIsAdminAuthenticated(false);
      setLocalStorageAuth(false);
      
      // Clear admin authentication data
      localStorage.removeItem('thalitera_admin_auth');
      localStorage.removeItem('thalitera_session_id');
      
      // Clear admin cookies
      const domain = window.location.hostname;
      document.cookie = `THALITERA_ADMIN_SESSION_ID=; Path=/admin; domain=${domain}; Max-Age=0`;
      document.cookie = 'THALITERA_ADMIN_SESSION_ID=; Path=/admin; Max-Age=0';
      
      // Redirect to main login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Admin logout error:', error);
      setError('Logout failed');
      
      // Even if API call fails, clear local authentication data
      setIsAdminAuthenticated(false);
      setLocalStorageAuth(false);
      
      localStorage.removeItem('thalitera_admin_auth');
      localStorage.removeItem('thalitera_session_id');
      
      document.cookie = 'THALITERA_ADMIN_SESSION_ID=; Path=/admin; Max-Age=0';
      
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  }, [setLocalStorageAuth]);

  return {
    isAdminAuthenticated,
    isLoading,
    login,
    logout,
    error
  };
} 
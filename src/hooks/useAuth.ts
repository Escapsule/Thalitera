'use client';

import { useState, useEffect, useCallback } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi } from '@/lib/auth';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for auth in localStorage as fallback
  const checkLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('thalitera_auth') === 'true';
    }
    return false;
  }, []);
  
  // Set auth in localStorage as fallback
  const setLocalStorageAuth = useCallback((value: boolean) => {
    if (typeof window !== 'undefined') {
      if (value) {
        localStorage.setItem('thalitera_auth', 'true');
      } else {
        localStorage.removeItem('thalitera_auth');
      }
    }
  }, []);

  // Create cookie from localStorage auth data
  const createCookieFromLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('thalitera_auth') === 'true') {
      const tempSessionId = `useAuth_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Create only the main cookie
      document.cookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
      
      return true;
    }
    return false;
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        // Check for cookie first
        const hasCookie = typeof window !== 'undefined' && 
          document.cookie.split(';')
            .map(c => c.trim())
            .some(cookie => cookie.startsWith('THALITERA_SESSION_ID='));
        
        // Check localStorage
        const hasLocalStorage = checkLocalStorage();
        
        // Synchronize states
        if (hasCookie && !hasLocalStorage) {
          console.log('Cookie found but localStorage not set, synchronizing');
          setLocalStorageAuth(true);
        } else if (hasLocalStorage && !hasCookie) {
          console.log('localStorage auth found but no cookie, creating cookie');
          createCookieFromLocalStorage();
        }
        
        // User is authenticated if either localStorage or cookie is present
        setIsAuthenticated(hasLocalStorage || hasCookie);
        
      } catch (error) {
        console.error('Auth verification error:', error);
        // On error, fall back to localStorage
        const localAuth = checkLocalStorage();
        setIsAuthenticated(localAuth);
        if (localAuth) {
          createCookieFromLocalStorage();
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [checkLocalStorage, setLocalStorageAuth, createCookieFromLocalStorage]);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginApi(email, password);
      
      if (response.code === 200) {
        console.log('Login API returned success');
        
        // After successful login, the cookie should be set
        // Check if the THALITERA_SESSION_ID cookie exists in the browser
        const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
        console.log('Cookie check after login:', hasCookie ? 'found' : 'not found');
        
        // Always set localStorage on successful login
        setLocalStorageAuth(true);
        setIsAuthenticated(true);
        
        // Create cookie if needed
        if (!hasCookie) {
          createCookieFromLocalStorage();
        }
        
        // Track that we're coming from login in sessionStorage to help detect loops
        sessionStorage.setItem('coming_from_login', 'true');
        sessionStorage.setItem('last_redirect_time', Date.now().toString());
        
        return true;
      } else {
        setError(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setLocalStorageAuth, createCookieFromLocalStorage]);

  // Register function
  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await registerApi(email, password);
      
      if (response.code === 200) {
        return true;
      } else {
        setError(response.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await logoutApi();
      
      // Update local state
      setIsAuthenticated(false);
      setLocalStorageAuth(false);
      
      // Clear auth data from localStorage
      localStorage.removeItem('thalitera_auth');
      
      // Clear session cookie - try both domain and no domain for maximum compatibility
      const domain = window.location.hostname;
      document.cookie = `THALITERA_SESSION_ID=; Path=/; domain=${domain}; Max-Age=0`;
      document.cookie = 'THALITERA_SESSION_ID=; Path=/; Max-Age=0';
      
      console.log('Auth data cleared in useAuth');
      
      // Force a hard redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
      
      // Even if logout API fails, clear local auth data
      setIsAuthenticated(false);
      setLocalStorageAuth(false);
      
      // Clear local storage
      localStorage.removeItem('thalitera_auth');
      
      // Clear session cookie
      document.cookie = 'THALITERA_SESSION_ID=; Path=/; Max-Age=0';
      
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  }, [setLocalStorageAuth]);

  return {
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    error
  };
} 
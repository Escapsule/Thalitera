'use client';

import { useState, useEffect, useCallback } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, checkAuth } from '@/lib/auth';

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

  // Check authentication status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        // First try the API-based check
        const authenticated = await checkAuth();
        
        // If API says we're authenticated, trust it
        if (authenticated) {
          console.log('User is authenticated via API check');
          setIsAuthenticated(true);
          setLocalStorageAuth(true);
          return;
        }
        
        // If API check fails, fall back to localStorage
        const localAuth = checkLocalStorage();
        if (localAuth) {
          console.log('User is authenticated via localStorage fallback');
          setIsAuthenticated(true);
          return;
        }
        
        // Neither method authenticated the user
        setIsAuthenticated(false);
        setLocalStorageAuth(false);
      } catch (error) {
        console.error('Auth verification error:', error);
        // On error, check localStorage as fallback
        const localAuth = checkLocalStorage();
        setIsAuthenticated(localAuth);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [checkLocalStorage, setLocalStorageAuth]);

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
        
        // Force a hard navigation to ensure cookies are properly processed
        window.location.href = '/dashboard';
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
  }, [setLocalStorageAuth]);

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
      setIsAuthenticated(false);
      setLocalStorageAuth(false);
      
      // Force a hard redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
      
      // Even if logout API fails, clear local auth
      setIsAuthenticated(false);
      setLocalStorageAuth(false);
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
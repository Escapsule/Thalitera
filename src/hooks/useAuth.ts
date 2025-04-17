'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  login as loginApi, 
  register as registerApi, 
  logout as logoutApi,
  setupMfa as setupMfaApi,
  enableMfa as enableMfaApi,
  MfaSetupResponse,
  ApiResponse
} from '@/lib/auth';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, fingerprint?: string, totpCode?: string, recoveryCode?: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setupMfa: (email: string) => Promise<ApiResponse<MfaSetupResponse> | null>;
  enableMfa: (email: string, totpCode: string) => Promise<ApiResponse | null>;
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
  const login = useCallback(async (
    email: string, 
    password: string, 
    fingerprint?: string,
    totpCode?: string, 
    recoveryCode?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginApi(email, password, fingerprint, totpCode, recoveryCode);
      
      console.log('Login response code:', response.code);
      
      // Handle successful login (code 200)
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
      } 
      // Handle MFA not set up error (code 2018)
      else if (response.code === 2018) {
        setError('MFA not enabled. You need to set up Multi-Factor Authentication.');
        console.log('MFA not enabled error detected (code 2018)');
        return false;
      }
      // Handle MFA required error for existing setups (code 2019)
      else if (response.code === 2019) {
        setError('MFA required. Please provide your authentication code.');
        console.log('MFA required error detected (code 2019)');
        return false;
      }
      // Handle other errors
      else {
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

  // Setup MFA
  const setupMfa = useCallback(async (email: string): Promise<ApiResponse<MfaSetupResponse> | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Setting up MFA for email in useAuth:', email);
      const response = await setupMfaApi(email);
      
      console.log('MFA setup API response:', response);
      
      if (response.code === 200 && response.data) {
        return response;
      } else {
        console.error('MFA setup failed with code:', response.code, 'message:', response.message);
        setError(response.message || 'Failed to setup MFA');
        return null;
      }
    } catch (error) {
      console.error('MFA setup error:', error);
      setError('An unexpected error occurred during MFA setup');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enable MFA
  const enableMfa = useCallback(async (email: string, totpCode: string): Promise<ApiResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Enabling MFA for email in useAuth:', email);
      const response = await enableMfaApi(email, totpCode);
      
      console.log('MFA enable API response:', response);
      
      if (response.code === 200) {
        return response;
      } else {
        console.error('MFA enable failed with code:', response.code, 'message:', response.message);
        setError(response.message || 'Failed to enable MFA');
        return null;
      }
    } catch (error) {
      console.error('MFA enable error:', error);
      setError('An unexpected error occurred while enabling MFA');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    setupMfa,
    enableMfa,
    error
  };
} 
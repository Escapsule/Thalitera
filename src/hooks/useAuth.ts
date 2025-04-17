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

interface LoginResult {
  success: boolean;
  code: number;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, fingerprint?: string, totpCode?: string, recoveryCode?: string) => Promise<LoginResult>;
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

  // Clear ANY session cookies - aggressive approach
  const clearAllAuthCookies = useCallback(() => {
    if (typeof window !== 'undefined') {
      console.log('Aggressively clearing ALL auth cookies');
      
      // Clear the session cookie - multiple variations to ensure it's cleared
      const cookies = [
        // THALITERA_SESSION_ID with various path/domain combinations
        'THALITERA_SESSION_ID=; Path=/; Max-Age=0',
        'THALITERA_SESSION_ID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'THALITERA_SESSION_ID=; Path=/; Domain=localhost; Max-Age=0',
        // Client-side created cookies
        'thalitera_session=; Path=/; Max-Age=0',
        'thalitera_auth=; Path=/; Max-Age=0',
        // For any dashboard-specific cookies
        'dashboard_*=; Path=/; Max-Age=0'
      ];
      
      // Apply all cookie clearing directives
      cookies.forEach(cookie => {
        document.cookie = cookie;
      });
      
      // Manually check for cookies with THALITERA_SESSION or dashboard_ prefix and clear them
      const existingCookies = document.cookie.split(';');
      existingCookies.forEach(cookie => {
        const trimmedCookie = cookie.trim();
        if (
          trimmedCookie.startsWith('THALITERA_SESSION_ID=') || 
          trimmedCookie.startsWith('thalitera_session=') ||
          trimmedCookie.startsWith('dashboard_')
        ) {
          const name = trimmedCookie.split('=')[0];
          document.cookie = `${name}=; Path=/; Max-Age=0`;
          document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          console.log(`Explicitly cleared cookie: ${name}`);
        }
      });
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        // Check for valid THALITERA_SESSION_ID cookie - ONLY consider server-set cookies valid
        const hasCookie = typeof window !== 'undefined' && 
          document.cookie.split(';')
            .map(c => c.trim())
            .some(cookie => cookie.startsWith('THALITERA_SESSION_ID='));
        
        // Any other session cookies should be cleared (client-created ones)
        const hasInvalidCookies = typeof window !== 'undefined' && 
          document.cookie.split(';')
            .map(c => c.trim())
            .some(cookie => 
              cookie.startsWith('thalitera_session=') || 
              cookie.startsWith('dashboard_')
            );
        
        if (hasInvalidCookies) {
          console.log('Found client-created session cookies - clearing them');
          clearAllAuthCookies();
        }
        
        // User is authenticated ONLY if they have a valid server-set THALITERA_SESSION_ID cookie
        setIsAuthenticated(hasCookie);
        
        // Sync localStorage with cookie state
        if (hasCookie) {
          localStorage.setItem('thalitera_auth', 'true');
        } else {
          localStorage.removeItem('thalitera_auth');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        // On error, check for cookie and use that to determine auth state
        const hasCookie = typeof window !== 'undefined' && 
          document.cookie.includes('THALITERA_SESSION_ID=');
        setIsAuthenticated(hasCookie);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
    
    // Set up interval to periodically check and clear any client-side cookies
    const cookieCleanupInterval = setInterval(() => {
      const hasInvalidCookies = typeof window !== 'undefined' && 
        document.cookie.split(';')
          .map(c => c.trim())
          .some(cookie => 
            (cookie.startsWith('thalitera_session=') && !cookie.includes('THALITERA_SESSION_ID')) || 
            cookie.startsWith('dashboard_')
          );
      
      if (hasInvalidCookies) {
        console.log('Cleanup: Found client-created session cookies - clearing them');
        clearAllAuthCookies();
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(cookieCleanupInterval);
  }, [clearAllAuthCookies]);

  // Login function
  const login = useCallback(async (
    email: string, 
    password: string, 
    fingerprint?: string,
    totpCode?: string, 
    recoveryCode?: string
  ): Promise<LoginResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Clear any existing cookies before login
      clearAllAuthCookies();
      
      const response = await loginApi(email, password, fingerprint, totpCode, recoveryCode);
      
      console.log('Login response code:', response.code);
      
      // Handle successful login (code 200)
      if (response.code === 200) {
        console.log('Login API returned success');
        
        // After successful login, check if the cookie was set by the server
        const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
        console.log('Cookie check after login:', hasCookie ? 'found' : 'not found');
        
        // Only set local auth state if server cookie exists
        if (hasCookie) {
          setIsAuthenticated(true);
          localStorage.setItem('thalitera_auth', 'true');
          
          // Track that we're coming from login in sessionStorage to help detect loops
          sessionStorage.setItem('coming_from_login', 'true');
          sessionStorage.setItem('last_redirect_time', Date.now().toString());
        } else {
          console.warn('Login successful but no session cookie found! Authentication may fail.');
        }
        
        return { success: true, code: 200 };
      } 
      // For non-200 status codes, ensure no cookies are present
      else {
        // Just to be absolutely certain, clear cookies again
        clearAllAuthCookies();
        
        // Handle MFA not set up error (code 2018)
        if (response.code === 2018) {
          setError('MFA not enabled. You need to set up Multi-Factor Authentication.');
          console.log('MFA not enabled error detected (code 2018)');
          return { success: false, code: 2018 };
        }
        // Handle MFA required error for existing setups (code 2019)
        else if (response.code === 2019) {
          setError('MFA required. Please provide your authentication code.');
          console.log('MFA required error detected (code 2019)');
          return { success: false, code: 2019 };
        }
        // Handle new device requiring MFA (code 2608)
        else if (response.code === 2608) {
          setError('New device detected. Please provide your authentication code.');
          console.log('New device MFA required error detected (code 2608)');
          return { success: false, code: 2608 };
        }
        // Handle other errors
        else {
          setError(response.message || 'Login failed');
          return { success: false, code: response.code };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
      
      // Clear any cookies that might have been set
      clearAllAuthCookies();
      
      return { success: false, code: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [clearAllAuthCookies]);

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
      
      // Clear all auth data
      localStorage.removeItem('thalitera_auth');
      clearAllAuthCookies();
      
      console.log('Auth data cleared in useAuth');
      
      // Force a hard redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
      
      // Even if logout API fails, clear local auth data
      setIsAuthenticated(false);
      localStorage.removeItem('thalitera_auth');
      clearAllAuthCookies();
      
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  }, [clearAllAuthCookies]);

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
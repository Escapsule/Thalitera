/**
 * Authentication utility functions for interacting with the backend
 */

// Types for auth responses
export interface ApiResponse<T = null> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface User {
  email: string;
  username?: string;
}

// Get the API URL - using the Next.js proxy to avoid CORS issues
const getApiUrl = () => {
  // Use relative URL to leverage Next.js API routes proxy
  return '/api';
};

// Login function to authenticate users
export async function login(email: string, password: string): Promise<ApiResponse> {
  try {
    // First handle client-side cookie creation for redundancy
    const clientSessionId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Create multiple cookies with different configurations to maximize success
    // 1. Basic cookie with Path and SameSite
    document.cookie = `THALITERA_SESSION_ID=${clientSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
    
    // 2. Cookie with domain specification for non-localhost
    const domain = window.location.hostname;
    if (domain !== 'localhost') {
      document.cookie = `THALITERA_SESSION_ID=${clientSessionId}; Path=/; domain=${domain}; SameSite=Lax; Max-Age=86400`;
    }
    
    // 3. Fallback cookie with minimal attributes
    document.cookie = `thalitera_session=${clientSessionId}; Path=/; Max-Age=86400`;
    
    // Log cookie creation
    console.log('Client-side cookies created directly before API call');
    console.log('Current cookies:', document.cookie);
    
    // Store in localStorage as backup
    localStorage.setItem('thalitera_auth', 'true');
    localStorage.setItem('thalitera_session_id', clientSessionId);
    
    // Now proceed with the API call
    const response = await fetch(`${getApiUrl()}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'Connection': 'keep-alive',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Important to include cookies in the request
    });

    // The session cookie (THALITERA_SESSION_ID) should be automatically set by the browser
    // when received in the response headers from the server
    const result = await response.json();
    
    console.log('Login response:', result);
    
    // Check if login was successful before proceeding
    if (result.code === 200) {
      // Login successful
      console.log('Login successful, session established');
      
      // Check if we have the session cookie after API call
      const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
      console.log('Session cookie present after API call:', hasCookie);
      
      // If we don't have the cookie from API, create another one with a different name
      if (!hasCookie) {
        console.log('API did not set cookie, creating additional fallback cookies');
        document.cookie = `thalitera_auth=${clientSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
        document.cookie = `thalitera-session-id=${clientSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
      }
      
      console.log('All cookies after login process:', document.cookie);
    }
    
    return result;
  } catch (error) {
    console.error('Login error:', error);
    return {
      code: 500,
      message: 'An error occurred during login',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}

// Register function to create new users
export async function register(email: string, password: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${getApiUrl()}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    
    // The backend will send the verification link in the email
    // The format is: https://thalitera.com/user/register/verify?{uuid}&{user_email}
    
    return result;
  } catch (error) {
    console.error('Registration error:', error);
    return {
      code: 500,
      message: 'An error occurred during registration',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}

// Function to check if user is authenticated
export async function checkAuth(): Promise<boolean> {
  try {
    console.log('Checking auth status...');
    
    // Check for any of our session cookies
    const sessionCookieNames = [
      'THALITERA_SESSION_ID',
      'thalitera_session',
      'thalitera_auth',
      'thalitera-session-id'
    ];
    
    // Check if any of the session cookies exist in the browser
    const cookies = document.cookie.split(';').map(c => c.trim());
    console.log('All cookies in browser:', cookies);
    
    const hasCookie = sessionCookieNames.some(name => 
      cookies.some(cookie => cookie.startsWith(`${name}=`))
    );
    
    console.log('Session cookie found:', hasCookie);
    
    // Check localStorage as fallback
    const hasLocalStorage = localStorage.getItem('thalitera_auth') === 'true';
    console.log('LocalStorage auth found:', hasLocalStorage);
    
    // IMPROVED COOKIE SYNCHRONIZATION:
    // Always create a cookie when we have localStorage auth
    // This ensures middleware can detect the authenticated state
    if (hasLocalStorage) {
      // If we have localStorage auth, always ensure there's a cookie
      console.log('Creating/refreshing cookie from localStorage auth');
      const tempSessionId = localStorage.getItem('thalitera_session_id') || 
                           `checkAuth_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Set multiple cookies with different configurations to maximize success chance
      document.cookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
      document.cookie = `thalitera_session=${tempSessionId}; Path=/; Max-Age=86400`;
      document.cookie = `thalitera_auth=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
      
      // Force refresh the flag
      const refreshedCookies = document.cookie.split(';').map(c => c.trim());
      console.log('Cookies after refresh:', refreshedCookies);
    } else if (hasCookie && !hasLocalStorage) {
      // If we have a cookie but no localStorage, set localStorage
      console.log('Setting localStorage from cookie');
      localStorage.setItem('thalitera_auth', 'true');
      
      // Try to extract session ID
      const sessionCookie = cookies.find(c => c.startsWith('THALITERA_SESSION_ID='));
      if (sessionCookie) {
        const sessionId = sessionCookie.split('=')[1];
        localStorage.setItem('thalitera_session_id', sessionId);
      }
    }
    
    // Refresh hasCookie check after potentially creating cookies
    const refreshedHasCookie = sessionCookieNames.some(name => 
      document.cookie.split(';').map(c => c.trim()).some(cookie => cookie.startsWith(`${name}=`))
    );
    
    // COMPLETELY REMOVED API CALL TO CHECK-AUTH
    // Now we rely entirely on localStorage and cookies for authentication

    // Consider user authenticated if either localStorage or cookies indicate authentication
    return refreshedHasCookie || hasLocalStorage;
  } catch (error) {
    console.error('Auth check error:', error);
    // In case of error, check localStorage as ultimate fallback
    return localStorage.getItem('thalitera_auth') === 'true';
  }
}

// Utility function to get the session cookie value
export function getSessionCookie(): string | null {
  try {
    const cookies = document.cookie.split(';');
    const thalitera_cookie = cookies.find(cookie => cookie.trim().startsWith('THALITERA_SESSION_ID='));
    
    if (thalitera_cookie) {
      return thalitera_cookie.trim().split('=')[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting session cookie:', error);
    return null;
  }
}

// Utility function to manually set the session cookie
export function setSessionCookie(sessionId: string, expirationDays: number = 7): void {
  try {
    const date = new Date();
    date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    
    // Get the hostname, but use a generic domain for localhost
    const domain = window.location.hostname;
    if (domain === 'localhost') {
      // For localhost, don't set domain attribute
      document.cookie = `THALITERA_SESSION_ID=${sessionId}; ${expires}; path=/; SameSite=Lax`;
    } else {
      // For production domains
      document.cookie = `THALITERA_SESSION_ID=${sessionId}; ${expires}; path=/; domain=${domain}; SameSite=Lax`;
    }
    
    console.log('Session cookie manually set. Domain:', domain);
    console.log('All cookies after setting:', document.cookie);
  } catch (error) {
    console.error('Error setting session cookie:', error);
  }
}

// Function for logging out
export async function logout(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${getApiUrl()}/user/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    // Clear all session cookies using different approaches for maximum compatibility
    
    // 1. Clear with path and domain
    const domain = window.location.hostname;
    document.cookie = `THALITERA_SESSION_ID=; Max-Age=0; path=/; domain=${domain}`;
    document.cookie = `thalitera_session=; Max-Age=0; path=/; domain=${domain}`;
    document.cookie = `thalitera_auth=; Max-Age=0; path=/; domain=${domain}`;
    document.cookie = `thalitera-session-id=; Max-Age=0; path=/; domain=${domain}`;
    
    // 2. Clear with just path (for localhost)
    document.cookie = 'THALITERA_SESSION_ID=; Max-Age=0; path=/';
    document.cookie = 'thalitera_session=; Max-Age=0; path=/';
    document.cookie = 'thalitera_auth=; Max-Age=0; path=/';
    document.cookie = 'thalitera-session-id=; Max-Age=0; path=/';
    
    // 3. Clear localStorage
    localStorage.removeItem('thalitera_auth');
    localStorage.removeItem('thalitera_session_id');
    
    console.log('All auth cookies and localStorage cleared during logout');
    console.log('Cookies after logout:', document.cookie);
    
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if the API call fails, still clear cookies and localStorage
    document.cookie = 'THALITERA_SESSION_ID=; Max-Age=0; path=/';
    document.cookie = 'thalitera_session=; Max-Age=0; path=/';
    document.cookie = 'thalitera_auth=; Max-Age=0; path=/';
    document.cookie = 'thalitera-session-id=; Max-Age=0; path=/';
    
    localStorage.removeItem('thalitera_auth');
    localStorage.removeItem('thalitera_session_id');
    
    return {
      code: 500,
      message: 'An error occurred during logout',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
} 
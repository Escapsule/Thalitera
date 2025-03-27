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
    
    // Check if login was successful before proceeding
    if (result.code === 200) {
      // Login successful, browser should have stored the cookie automatically
      console.log('Login successful, session established');
      
      // Check if we have the session cookie
      const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
      
      // If we don't have the cookie but login was successful, try to manually set it
      // This is a fallback in case the server doesn't set the cookie properly
      if (!hasCookie && result.data && result.data.sessionId) {
        setSessionCookie(result.data.sessionId);
      }
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
    // Check if the THALITERA_SESSION_ID cookie exists in the browser
    const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
    
    // Only make the API call if we have the cookie
    if (!hasCookie) {
      return false;
    }
    
    const response = await fetch(`${getApiUrl()}/user/check-auth`, {
      method: 'GET',
      credentials: 'include', // Important to include cookies in the request
    });
    
    const data = await response.json();
    return data.code === 200;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
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
    document.cookie = `THALITERA_SESSION_ID=${sessionId}; ${expires}; path=/; domain=${window.location.hostname}`;
    console.log('Session cookie manually set');
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
    
    // Clear the session cookie on the client side as well
    // This is a belt-and-suspenders approach in case the server doesn't properly clear the cookie
    document.cookie = 'THALITERA_SESSION_ID=; Max-Age=0; path=/; domain=' + window.location.hostname;
    
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    return {
      code: 500,
      message: 'An error occurred during logout',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
} 
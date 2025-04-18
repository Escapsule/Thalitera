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

// MFA setup response type - updated to match actual API response
export interface MfaSetupResponse {
  qr_code: string;  // Changed from qrCode to qr_code to match API
  recovery_codes: string[];  // Changed from recoveryCodes to recovery_codes
}

// Login request body type
export interface LoginRequest {
  email: string;
  password: string;
  totp_code?: string;
  recovery_code?: string;
}

// Get the API URL - using the Next.js proxy to avoid CORS issues
const getApiUrl = () => {
  // Use relative URL to leverage Next.js API routes proxy
  return '/api';
};

// Clear ALL session-related cookies - to be used before making auth requests
function clearAllSessionCookies() {
  if (typeof window !== 'undefined') {
    console.log('Clearing all session cookies before auth request');
    
    // Clear using various methods to maximize compatibility
    const cookies = [
      'THALITERA_SESSION_ID=; Path=/; Max-Age=0',
      'THALITERA_SESSION_ID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'thalitera_session=; Path=/; Max-Age=0',
      'thalitera_auth=; Path=/; Max-Age=0',
      'thalitera-session-id=; Path=/; Max-Age=0'
    ];
    
    cookies.forEach(cookie => {
      document.cookie = cookie;
    });
    
    // Find and clear any cookies that match dashboard_* pattern
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
        console.log(`Cleared specific cookie: ${name}`);
      }
    });
  }
}

// Login function to authenticate users
export async function login(
  email: string, 
  password: string, 
  fingerprint?: string, 
  totpCode?: string, 
  recoveryCode?: string
): Promise<ApiResponse> {
  try {
    // CRITICAL: Clear any existing cookies before login
    clearAllSessionCookies();
    
    // Create headers with basic requirements
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': '*/*',
    };
    
    // Add fingerprint to headers if provided
    if (fingerprint) {
      headers['THALITERA_FINGERPRINT'] = fingerprint;
    }
    
    // Check if this is an admin login
    if (email === 'admin@xjtlu.edu.cn') {
      // Add admin email to headers for auth checks
      headers['admin-email'] = email;
      
      // Use admin login endpoint
      const adminResponse = await fetch(`${getApiUrl()}/admin/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email_address: email, password }),
        credentials: 'include',
      });

      const adminResult = await adminResponse.json();
      console.log('Admin login response:', adminResult);
      
      if (adminResult.code === 200) {
        console.log('Admin login successful, session established');
        localStorage.setItem('thalitera_auth', 'true');
        localStorage.setItem('is_admin', 'true');
      } else {
        localStorage.removeItem('thalitera_auth');
        localStorage.removeItem('is_admin');
        clearAllSessionCookies();
      }
      
      return adminResult;
    }
    
    // Regular user login
    // Create the request body with TOTP or recovery code if provided
    const requestBody: LoginRequest = { email, password };
    if (totpCode) {
      requestBody.totp_code = totpCode;
    }
    if (recoveryCode) {
      requestBody.recovery_code = recoveryCode;
    }
    
    // Now proceed with the API call
    const response = await fetch(`${getApiUrl()}/user/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
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
      
      // Keep track of authentication in localStorage ONLY
      localStorage.setItem('thalitera_auth', 'true');
      localStorage.removeItem('is_admin');
      
      // Check if we have the session cookie after API call
      const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
      console.log('Session cookie present after API call:', hasCookie);
      
      if (!hasCookie) {
        console.warn('WARNING: API call succeeded but no session cookie was set by the server.');
      }
    } else {
      // Login failed - clear localStorage
      localStorage.removeItem('thalitera_auth');
      localStorage.removeItem('is_admin');
      
      // Clear any cookies that might have been set
      clearAllSessionCookies();
    }
    
    return result;
  } catch (error) {
    console.error('Login error:', error);
    // Clear localStorage and cookies on error
    localStorage.removeItem('thalitera_auth');
    localStorage.removeItem('is_admin');
    clearAllSessionCookies();
    
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
    
    // ONLY check for the THALITERA_SESSION_ID cookie
    const hasCookie = document.cookie.split(';')
      .map(c => c.trim())
      .some(cookie => cookie.startsWith('THALITERA_SESSION_ID='));
    
    console.log('Valid session cookie found:', hasCookie);
    
    // Check for client-created cookies that match dashboard_* pattern and clear them
    const invalidCookies = document.cookie.split(';')
      .map(c => c.trim())
      .filter(cookie => 
        cookie.startsWith('THALITERA_SESSION_ID=dashboard_') || 
        cookie.startsWith('thalitera_session=') ||
        cookie.startsWith('dashboard_')
      );
    
    if (invalidCookies.length > 0) {
      console.log('Found invalid client-created cookies - clearing them');
      clearAllSessionCookies();
    }
    
    // Sync localStorage based on cookie presence
    if (hasCookie) {
      localStorage.setItem('thalitera_auth', 'true');
    } else {
      localStorage.removeItem('thalitera_auth');
    }
    
    // User is authenticated ONLY if they have a valid THALITERA_SESSION_ID cookie
    return hasCookie;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

// Utility function to get the session cookie value
export function getSessionCookie(): string | null {
  try {
    const cookies = document.cookie.split(';');
    const thalitera_cookie = cookies.find(cookie => {
      const trimmed = cookie.trim();
      return trimmed.startsWith('THALITERA_SESSION_ID=') && !trimmed.includes('dashboard_');
    });
    
    if (thalitera_cookie) {
      return thalitera_cookie.trim().split('=')[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting session cookie:', error);
    return null;
  }
}

// Function for logging out
export async function logout(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${getApiUrl()}/user/logout`, {
      method: 'GET',
      credentials: 'include',
    });
    
    // Clear all session cookies and localStorage
    clearAllSessionCookies();
    localStorage.removeItem('thalitera_auth');
    localStorage.removeItem('is_admin');
    
    console.log('All auth cookies and localStorage cleared during logout');
    
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if the API call fails, still clear cookies and localStorage
    clearAllSessionCookies();
    localStorage.removeItem('thalitera_auth');
    localStorage.removeItem('is_admin');
    
    return {
      code: 500,
      message: 'An error occurred during logout',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}

// MFA setup function to get QR code and recovery codes
export async function setupMfa(email: string, fingerprint?: string): Promise<ApiResponse<MfaSetupResponse>> {
  try {
    console.log('Setting up MFA for email:', email);
    
    // Create headers with basic requirements
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add fingerprint to headers if provided
    if (fingerprint) {
      headers['THALITERA_FINGERPRINT'] = fingerprint;
      console.log('Adding fingerprint to MFA setup request:', fingerprint);
    }
    
    const response = await fetch(`${getApiUrl()}/user/mfa/setup?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    const result = await response.json();
    console.log('MFA setup response code:', result.code);
    
    return result;
  } catch (error) {
    console.error('MFA setup error:', error);
    return {
      code: 500,
      message: 'An error occurred while setting up MFA',
      data: { qr_code: '', recovery_codes: [] },
      timestamp: new Date().toISOString(),
    };
  }
}

// Enable MFA function to verify and enable MFA for a user
export async function enableMfa(email: string, totpCode: string, fingerprint?: string): Promise<ApiResponse> {
  try {
    console.log('Enabling MFA for email:', email);
    
    // Create headers with basic requirements
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add fingerprint to headers if provided
    if (fingerprint) {
      headers['THALITERA_FINGERPRINT'] = fingerprint;
      console.log('Adding fingerprint to MFA enable request:', fingerprint);
    }
    
    const response = await fetch(`${getApiUrl()}/user/mfa/enable`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, totp_code: totpCode }),
      credentials: 'include',
    });

    const result = await response.json();
    console.log('MFA enable response code:', result.code);
    
    return result;
  } catch (error) {
    console.error('MFA enable error:', error);
    return {
      code: 500,
      message: 'An error occurred while enabling MFA',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}

// Function to check if MFA is required for a user (without login)
export async function checkMfaStatus(email: string): Promise<{
  isMfaRequired: boolean;
  isMfaSetUp: boolean;
  error?: string;
}> {
  try {
    console.log('Checking MFA status for email:', email);
    
    // First try to get MFA QR code
    const setupResponse = await fetch(`${getApiUrl()}/user/mfa/setup?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    const setupResult = await setupResponse.json();
    console.log('MFA status check response code:', setupResult.code);
    
    if (setupResult.code === 200 && setupResult.data && setupResult.data.qr_code) {
      // If we can get QR code, MFA is required but not set up yet
      return {
        isMfaRequired: true,
        isMfaSetUp: false,
      };
    } else if (setupResult.code === 403) {
      // If we get a 403, MFA is already set up
      return {
        isMfaRequired: true,
        isMfaSetUp: true,
      };
    } else if (setupResult.code === 404 || setupResult.code === 400) {
      // If we get a 404 or 400, MFA is not required
      return {
        isMfaRequired: false,
        isMfaSetUp: false,
      };
    } else {
      // Some other error
      return {
        isMfaRequired: false,
        isMfaSetUp: false,
        error: setupResult.message || 'Unknown error checking MFA status',
      };
    }
  } catch (error) {
    console.error('MFA status check error:', error);
    return {
      isMfaRequired: false,
      isMfaSetUp: false,
      error: 'An error occurred checking MFA status',
    };
  }
} 
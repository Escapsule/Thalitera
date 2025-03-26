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
  email_address: string;
  username?: string;
}

// Get the backend URL from environment variables
const getBackendUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'k1ng.tech:8080';
  return `http://${backendUrl}`;
};

// Login function to authenticate users
export async function login(email_address: string, password: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address, password }),
      credentials: 'include', // Important to include cookies in the request
    });

    return await response.json();
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
export async function register(email_address: string, password: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address, password }),
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
    const response = await fetch(`${getBackendUrl()}/user/check-auth`, {
      credentials: 'include', // Important to include cookies in the request
    });
    
    const data = await response.json();
    return data.code === 200;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

// Function for logging out
export async function logout(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/user/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
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
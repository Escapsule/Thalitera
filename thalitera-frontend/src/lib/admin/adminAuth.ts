/**
 * Admin authentication
 */

// Types for auth responses
export interface ApiResponse<T = null> {
    code: number;
    message: string;
    data: T;
    timestamp: string;
  }
  
  // Get API URL
  const getApiUrl = () => {
    return '/api';
  };
  
  /**
   * Admin login
   * @param email Admin email
   * @param password Admin password
   * @returns Promise<ApiResponse>
   */
  export async function login(email: string, password: string): Promise<ApiResponse> {
    try {
      // First handle client-side cookie creation for redundancy
      const clientSessionId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Create multiple different configuration cookies for maximum compatibility
      // 1. Basic cookie, with Path and SameSite
      document.cookie = `THALITERA_ADMIN_SESSION_ID=${clientSessionId}; Path=/admin; SameSite=Lax; Max-Age=86400`;
      
      // 2. Cookie with domain specification for non-localhost
      const domain = window.location.hostname;
      if (domain !== 'localhost') {
        document.cookie = `THALITERA_ADMIN_SESSION_ID=${clientSessionId}; Path=/admin; domain=${domain}; SameSite=Lax; Max-Age=86400`;
      }
      
      // 3. Minimum configuration backup cookie
      document.cookie = `thalitera_admin_session=${clientSessionId}; Path=/admin; Max-Age=86400`;
      
      // Log cookie creation
      console.log('Admin client cookie creation completed');
      console.log('Current cookies:', document.cookie);
      
      // Store in localStorage as backup
      localStorage.setItem('thalitera_admin_auth', 'true');
      localStorage.setItem('thalitera_session_id', clientSessionId);
      
      // Perform API call
      const response = await fetch(`${getApiUrl()}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
          'Connection': 'keep-alive',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
  
      const result = await response.json();
      
      console.log('Admin login response:', result);
      
      if (result.code === 200) {
        console.log('Admin login successful, session established');
        
        // Check if session cookie exists after API call
        const hasCookie = document.cookie.includes('THALITERA_ADMIN_SESSION_ID=');
        console.log('Session cookie status after API call:', hasCookie ? 'exists' : 'does not exist');
        
        // If no cookie, create additional backup cookie
        if (!hasCookie) {
          console.log('API did not set cookie, creating additional backup cookie');
          document.cookie = `thalitera_admin_auth=${clientSessionId}; Path=/admin; SameSite=Lax; Max-Age=86400`;
          document.cookie = `thalitera-admin-session-id=${clientSessionId}; Path=/admin; SameSite=Lax; Max-Age=86400`;
        }
        
        console.log('All cookies after login process:', document.cookie);
      }
      
      return result;
    } catch (error) {
      console.error('Admin login error:', error);
      return {
        code: 500,
        message: 'Admin login process error',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  /**
   * Admin logout
   * @returns Promise<ApiResponse>
   */
  export async function logout(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${getApiUrl()}/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      // Use different strategies to clear all authentication cookies for maximum compatibility
      // 1. Clear with domain
      const domain = window.location.hostname;
      document.cookie = `THALITERA_ADMIN_SESSION_ID=; Path=/admin; domain=${domain}; Max-Age=0`;
      document.cookie = `thalitera_admin_session=; Path=/admin; domain=${domain}; Max-Age=0`;
      document.cookie = `thalitera_admin_auth=; Path=/admin; domain=${domain}; Max-Age=0`;
      document.cookie = `thalitera-admin-session-id=; Path=/admin; domain=${domain}; Max-Age=0`;
      
      // 2. Clear without domain (for localhost)
      document.cookie = 'THALITERA_ADMIN_SESSION_ID=; Path=/admin; Max-Age=0';
      document.cookie = 'thalitera_admin_session=; Path=/admin; Max-Age=0';
      document.cookie = 'thalitera_admin_auth=; Path=/admin; Max-Age=0';
      document.cookie = 'thalitera-admin-session-id=; Path=/admin; Max-Age=0';
      
      // 3. Clear localStorage
      localStorage.removeItem('thalitera_admin_auth');
      localStorage.removeItem('thalitera_session_id');
      
      console.log('Admin authentication data cleared');
      console.log('Cookies after logout:', document.cookie);
      
      return await response.json();
    } catch (error) {
      console.error('Admin logout error:', error);
      
      // Even if API call fails, clear local authentication data
      document.cookie = 'THALITERA_ADMIN_SESSION_ID=; Path=/admin; Max-Age=0';
      document.cookie = 'thalitera_admin_session=; Path=/admin; Max-Age=0';
      document.cookie = 'thalitera_admin_auth=; Path=/admin; Max-Age=0';
      document.cookie = 'thalitera-admin-session-id=; Path=/admin; Max-Age=0';
      
      localStorage.removeItem('thalitera_admin_auth');
      localStorage.removeItem('thalitera_session_id');
      
      return {
        code: 500,
        message: 'Admin logout process error',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  /**
   * Check admin authentication status
   * @returns Promise<boolean>
   */
  export async function checkAdminAuth(): Promise<boolean> {
    try {
      console.log('Checking admin authentication status...');
      
      // Check all possible session cookies
      const sessionCookieNames = [
        'THALITERA_ADMIN_SESSION_ID',
        'thalitera_admin_session',
        'thalitera_admin_auth',
        'thalitera-admin-session-id'
      ];
      
      // Check if any session cookie exists in the browser
      const cookies = document.cookie.split(';').map(c => c.trim());
      console.log('All cookies in the browser:', cookies);
      
      const hasCookie = sessionCookieNames.some(name => 
        cookies.some(cookie => cookie.startsWith(`${name}=`))
      );
      
      console.log('Found session cookie:', hasCookie);
      
      // Check localStorage as backup
      const hasLocalStorage = localStorage.getItem('thalitera_admin_auth') === 'true';
      console.log('Found localStorage authentication:', hasLocalStorage);
      
      // Improved cookie synchronization:
      // Always create cookies when localStorage authentication is present
      // This ensures middleware can detect authentication status
      if (hasLocalStorage) {
        console.log('Creating/refreshing cookie from localStorage authentication');
        const tempSessionId = localStorage.getItem('thalitera_session_id') || 
                             `check_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        
        // Set multiple different configuration cookies to maximize success chances
        document.cookie = `THALITERA_ADMIN_SESSION_ID=${tempSessionId}; Path=/admin; SameSite=Lax; Max-Age=86400`;
        document.cookie = `thalitera_admin_session=${tempSessionId}; Path=/admin; Max-Age=86400`;
        document.cookie = `thalitera_admin_auth=${tempSessionId}; Path=/admin; SameSite=Lax; Max-Age=86400`;
        
        // Refresh flag
        const refreshedCookies = document.cookie.split(';').map(c => c.trim());
        console.log('Refreshed cookies:', refreshedCookies);
      } else if (hasCookie && !hasLocalStorage) {
        // If there is a cookie but no localStorage, set localStorage
        console.log('Setting localStorage from cookie');
        localStorage.setItem('thalitera_admin_auth', 'true');
        
        // Try to extract session ID
        const sessionCookie = cookies.find(c => c.startsWith('THALITERA_ADMIN_SESSION_ID='));
        if (sessionCookie) {
          const sessionId = sessionCookie.split('=')[1];
          localStorage.setItem('thalitera_session_id', sessionId);
        }
      }
      
      // Refresh hasCookie check
      const refreshedHasCookie = sessionCookieNames.some(name => 
        document.cookie.split(';').map(c => c.trim()).some(cookie => cookie.startsWith(`${name}=`))
      );
      
      // Completely removed API call check for authentication
      // Now fully relies on localStorage and cookies for authentication
      
      // If localStorage or cookies indicate authentication, consider user authenticated
      return refreshedHasCookie || hasLocalStorage;
    } catch (error) {
      console.error('Admin authentication check error:', error);
      // When an error occurs, check localStorage as final backup
      return localStorage.getItem('thalitera_admin_auth') === 'true';
    }
  }
  
  /**
   * Get admin session cookie value
   * @returns string | null
   */
  export function getAdminSessionCookie(): string | null {
    try {
      const cookies = document.cookie.split(';');
      const adminCookie = cookies.find(cookie => cookie.trim().startsWith('THALITERA_ADMIN_SESSION_ID='));
      
      if (adminCookie) {
        return adminCookie.trim().split('=')[1];
      }
      
      return null;
    } catch (error) {
      console.error('Get admin session cookie error:', error);
      return null;
    }
  }
  
  /**
   * Manually set admin session cookie
   * @param sessionId session ID
   * @param expirationDays expiration days, default 7 days
   */
  export function setAdminSessionCookie(sessionId: string, expirationDays: number = 7): void {
    try {
      const date = new Date();
      date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
      const expires = `expires=${date.toUTCString()}`;
      
      // Get hostname, but use generic domain for localhost
      const domain = window.location.hostname;
      if (domain === 'localhost') {
        // For localhost, do not set domain property
        document.cookie = `THALITERA_ADMIN_SESSION_ID=${sessionId}; ${expires}; path=/admin; SameSite=Lax`;
      } else {
        // For production domain
        document.cookie = `THALITERA_ADMIN_SESSION_ID=${sessionId}; ${expires}; path=/admin; domain=${domain}; SameSite=Lax`;
      }
      
      console.log('Admin session cookie manually set. Domain:', domain);
      console.log('All cookies after setting:', document.cookie);
    } catch (error) {
      console.error('Setting admin session cookie error:', error);
    }
  }
  
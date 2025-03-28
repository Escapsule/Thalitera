/**
 * Authentication helper script that runs on every page load
 * to ensure consistent authentication state
 */
(function() {
  // Detect if we're on a protected route
  const isProtectedRoute = window.location.pathname.startsWith('/dashboard') || 
                           window.location.pathname.startsWith('/admin');
                           
  // Detect if we're on the login page
  const isLoginPage = window.location.pathname.startsWith('/login');
  
  // Check for auth in localStorage
  const hasLocalStorageAuth = localStorage.getItem('thalitera_auth') === 'true';
  
  // Check for auth cookie
  const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
  
  console.log('Auth helper running on:', window.location.pathname, {
    isProtectedRoute,
    isLoginPage,
    hasLocalStorageAuth,
    hasCookie,
    allCookies: document.cookie
  });
  
  // SYNC AUTHENTICATION STATE BETWEEN COOKIE AND LOCALSTORAGE
  
  // If we have a cookie but no localStorage, set localStorage
  if (hasCookie && !hasLocalStorageAuth) {
    console.log('Setting localStorage from existing cookie');
    localStorage.setItem('thalitera_auth', 'true');
    
    // Extract session ID from cookie if possible
    try {
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(c => c.trim().startsWith('THALITERA_SESSION_ID='));
      if (sessionCookie) {
        const sessionId = sessionCookie.trim().split('=')[1];
        localStorage.setItem('thalitera_session_id', sessionId);
      }
    } catch (e) {
      console.error('Error extracting session ID from cookie:', e);
    }
  }
  
  // If we're on a protected route with localStorage auth but no cookie, create one
  if (isProtectedRoute && hasLocalStorageAuth && !hasCookie) {
    console.log('Creating cookie from localStorage auth');
    const tempSessionId = `global_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    document.cookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
  }
  
  // If we're on login page but already have localStorage auth, redirect to dashboard
  if (isLoginPage && hasLocalStorageAuth) {
    console.log('Already authenticated, redirecting to dashboard');
    
    // Add a short delay to ensure the page has time to initialize
    setTimeout(() => {
      window.location.href = `/dashboard?bypassAuth=true&t=${Date.now()}`;
    }, 500);
  }
})(); 
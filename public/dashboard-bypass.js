// This script helps bypass potential auth issues with cookies by using localStorage as a fallback
(function() {
  // Check if we can access localStorage
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage is not available, cannot use auth fallback');
    return;
  }

  // Check for auth in localStorage
  const hasLocalStorageAuth = localStorage.getItem('thalitera_auth') === 'true';
  
  // Check for cookie
  const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
  
  console.log('Dashboard bypass running:', {
    path: window.location.pathname,
    hasLocalStorageAuth,
    hasCookie,
    allCookies: document.cookie
  });
  
  // SYNCHRONIZE AUTH STATE:
  
  // If we have a cookie but no localStorage, set localStorage
  if (hasCookie && !hasLocalStorageAuth) {
    console.log('Setting localStorage from cookie');
    localStorage.setItem('thalitera_auth', 'true');
    
    // Also extract the session ID if possible
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
  
  // If we have localStorage auth but no cookie, create one
  if (hasLocalStorageAuth && !hasCookie) {
    console.log('Creating cookie from localStorage auth');
    const tempSessionId = `bypass_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    document.cookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
  }
  
  // Redirect logic:
  
  // If we have auth in localStorage but got redirected to login, try force loading dashboard
  if (hasLocalStorageAuth && window.location.pathname.includes('/login')) {
    console.log('Detected auth in localStorage but on login page, redirecting to dashboard');
    // Always include bypassAuth parameter to avoid middleware redirect
    window.location.replace(`/dashboard?bypassAuth=true&t=${Date.now()}`);
  }
  
  // If we're on dashboard but don't have localStorage auth, set it
  if (window.location.pathname.includes('/dashboard') && !hasLocalStorageAuth) {
    console.log('On dashboard but no localStorage auth, setting it');
    localStorage.setItem('thalitera_auth', 'true');
  }
  
  // Add a custom event to the document for debugging
  document.dispatchEvent(new CustomEvent('thalitera-auth-check', { 
    detail: { 
      pathname: window.location.pathname,
      hasLocalStorageAuth,
      hasCookie,
      cookies: document.cookie
    } 
  }));
})(); 
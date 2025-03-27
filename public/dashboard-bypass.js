// This script helps bypass potential auth issues with cookies by using localStorage as a fallback
(function() {
  // Check if we can access localStorage
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage is not available, cannot use auth fallback');
    return;
  }

  // Check for auth in localStorage
  const isAuthenticated = localStorage.getItem('thalitera_auth') === 'true';
  
  // If we have auth in localStorage but got redirected to login, try force loading dashboard
  if (isAuthenticated && window.location.pathname.includes('/login')) {
    console.log('Detected auth in localStorage but on login page, redirecting to dashboard');
    window.location.replace('/dashboard');
  }
  
  // If we're on dashboard but don't have localStorage auth, set it
  if (window.location.pathname.includes('/dashboard') && !isAuthenticated) {
    console.log('On dashboard but no localStorage auth, setting it');
    localStorage.setItem('thalitera_auth', 'true');
  }
  
  // Add a custom event to the document for debugging
  document.dispatchEvent(new CustomEvent('thalitera-auth-check', { 
    detail: { 
      pathname: window.location.pathname,
      authenticated: isAuthenticated,
      cookies: document.cookie
    } 
  }));
})(); 
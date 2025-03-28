import { NextRequest, NextResponse } from 'next/server';

/**
 * This special endpoint serves two purposes:
 * 1. Directly set auth cookies for users
 * 2. Act as a middleware check point for localStorage authentication
 */
export async function GET(request: NextRequest) {
  // Get timestamp to prevent caching
  const timestamp = Date.now();
  
  // Generate a temporary session ID that looks like a UUID
  const tempSessionId = `special_${timestamp}_${Math.random().toString(36).substring(2, 10)}`;
  
  // Create an HTML response with script to check localStorage and redirect appropriately
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Authentication Check</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: sans-serif; text-align: center; padding: 40px; background: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      h1 { color: #333; }
      .spinner { display: inline-block; width: 50px; height: 50px; border: 3px solid rgba(0,0,0,.3); border-radius: 50%; border-top-color: #3b82f6; animation: spin 1s ease-in-out infinite; margin: 20px 0; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .cookie-status { margin-top: 20px; font-size: 14px; background: #e0f2ff; padding: 10px; border-radius: 4px; text-align: left; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Authentication Setup</h1>
      <p>Setting up your session...</p>
      <div class="spinner"></div>
      <div class="cookie-status" id="status">Setting cookies...</div>
    </div>
    
    <script>
      // Element to show status
      const statusEl = document.getElementById('status');
      
      // Add to status log
      function logStatus(message) {
        const now = new Date();
        const timestamp = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0') + ':' + 
                          now.getSeconds().toString().padStart(2, '0');
        statusEl.innerHTML += '<br>' + timestamp + ' - ' + message;
      }
      
      // Try to set cookies in different ways
      function setCookies() {
        try {
          // Set a regular cookie
          document.cookie = 'THALITERA_SESSION_ID=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400';
          logStatus('Set client cookie #1');
          
          // Set a different domain cookie
          const domain = window.location.hostname;
          document.cookie = 'THALITERA_SESSION_ID=${tempSessionId}; Path=/; domain=' + domain + '; SameSite=Lax; Max-Age=86400';
          logStatus('Set client cookie #2 with domain: ' + domain);
          
          // Set fallback cookie without SameSite
          document.cookie = 'THALITERA_SESSION_ID=${tempSessionId}; Path=/; Max-Age=86400';
          logStatus('Set client cookie #3 without SameSite');
          
          // Store in localStorage too
          localStorage.setItem('thalitera_auth', 'true');
          localStorage.setItem('thalitera_session_id', '${tempSessionId}');
          logStatus('Set localStorage auth values');
          
          // Check if cookie was set
          const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
          logStatus('Cookie check: ' + (hasCookie ? 'SUCCESS' : 'FAILED'));
          
          return hasCookie;
        } catch (e) {
          logStatus('ERROR setting cookies: ' + e.message);
          return false;
        }
      }

      // Set the cookies
      const cookiesSet = setCookies();
      logStatus('Current cookies: ' + document.cookie);
      
      // Wait a moment to ensure cookie is set
      setTimeout(() => {
        logStatus('Redirecting to dashboard...');
        // Redirect to dashboard with bypass parameter to prevent redirect loop
        window.location.href = '/dashboard?bypassAuth=true&t=${timestamp}';
      }, 2000);
    </script>
  </body>
  </html>
  `;
  
  // Return the HTML response with cookies
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      // Set multiple cookies to maximize chances of success
      'Set-Cookie': [
        `THALITERA_SESSION_ID=${tempSessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
        `alt_session=${tempSessionId}; Path=/; Max-Age=86400; SameSite=Lax`,
        `fallback_session=${tempSessionId}; Path=/`,
      ].join(', '),
    },
  });
} 
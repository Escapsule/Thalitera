import { NextRequest, NextResponse } from 'next/server';

/**
 * This is a special endpoint that sets the auth cookie directly
 * It's used to bypass normal auth flow for debugging the redirect issues
 */
export async function GET(request: NextRequest) {
  // Generate a temporary session ID
  const tempSessionId = `debug_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  // Create a response that redirects to dashboard
  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  
  // Set a session cookie
  const cookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
  response.headers.set('Set-Cookie', cookie);
  
  // Log the operation
  console.log('Special login executed, setting cookie:', cookie);
  
  return response;
} 
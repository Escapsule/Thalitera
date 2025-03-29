'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getSessionCookie } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { login, register, error, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Check if already authenticated via localStorage
  useEffect(() => {
    // If we're already authenticated via localStorage, redirect to dashboard
    if (typeof window !== 'undefined') {
      // Check if we just got redirected from dashboard (likely a redirect loop)
      const referrer = document.referrer;
      const justFromDashboard = referrer && referrer.includes('/dashboard');
      
      // If we came from dashboard and have localStorage auth, this is likely a loop
      const isAuthenticated = localStorage.getItem('thalitera_auth') === 'true';
      
      if (justFromDashboard && isAuthenticated) {
        console.log('POTENTIAL REDIRECT LOOP DETECTED - Just came from dashboard and have localStorage auth');
        
        // Force create all possible cookies
        const tempSessionId = `loopBreaker_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        document.cookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
        document.cookie = `thalitera_session=${tempSessionId}; Path=/; Max-Age=86400`;
        document.cookie = `thalitera_auth=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
        document.cookie = `thalitera-session-id=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
        
        // Store session ID in localStorage
        localStorage.setItem('thalitera_session_id', tempSessionId);
        
        // Force redirect to dashboard
        console.log('Breaking potential loop by forcing dashboard');
        window.location.href = `/dashboard?forceBreak=true&ts=${Date.now()}`;
        return;
      }
      
      if (isAuthenticated) {
        console.log('Already authenticated via localStorage, redirecting to dashboard');
        // Check for cookie and create one if missing
        const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
        if (!hasCookie) {
          console.log('No session cookie found, creating multiple cookies');
          const tempSessionId = `login_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          
          // Create multiple cookies with different configurations to maximize compatibility
          document.cookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
          document.cookie = `thalitera_session=${tempSessionId}; Path=/; Max-Age=86400`;
          document.cookie = `thalitera_auth=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
          
          // Store session ID in localStorage for reference
          localStorage.setItem('thalitera_session_id', tempSessionId);
          
          // Log cookies after setting
          console.log('Cookies after setting:', document.cookie);
        }
        
        // Redirect to dashboard
        window.location.href = `/dashboard?ts=${Date.now()}`;
      }

      // Add debug info
      const cookies = document.cookie.split(';').map(c => c.trim());
      const authInfo = {
        localStorage: localStorage.getItem('thalitera_auth'),
        cookies: cookies,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      setDebugInfo(JSON.stringify(authInfo, null, 2));
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Authenticated via useAuth hook, redirecting to dashboard');
      
      // Ensure we have cookies before redirecting
      const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
      if (!hasCookie) {
        console.log('No session cookie found when redirecting via useAuth hook, creating cookies');
        const tempSessionId = `useAuth_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        
        // Create multiple cookies to maximize compatibility
        document.cookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
        document.cookie = `thalitera_session=${tempSessionId}; Path=/; Max-Age=86400`;
        document.cookie = `thalitera_auth=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
        
        // Store in localStorage for reference
        localStorage.setItem('thalitera_session_id', tempSessionId);
      }
      
      // Redirect to dashboard
      window.location.href = `/dashboard?ts=${Date.now()}`;
    }
  }, [isAuthenticated]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setSuccessMessage('');
  };

  // Special debug login to bypass normal auth flow
  const handleDebugLogin = () => {
    console.log('Using special login bypass');
    window.location.href = '/debug-dashboard';
  };

  // Direct dashboard access with a timestamp to prevent caching
  const handleDirectDashboard = () => {
    // Add timestamp to prevent caching issues
    const timestamp = Date.now();
    
    // Create a client-side cookie first
    const clientSessionId = `client_${timestamp}_${Math.random().toString(36).substring(2, 15)}`;
    document.cookie = `THALITERA_SESSION_ID=${clientSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
    
    // Store in localStorage for extra backup
    localStorage.setItem('thalitera_auth', 'true');
    localStorage.setItem('thalitera_session_id', clientSessionId);
    
    // Navigate to dashboard with timestamp
    window.location.href = `/dashboard?ts=${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        // Handle login
        console.log('Attempting login with:', email);
        const success = await login(email, password);
        if (success) {
          // After successful login, check if the cookie is set
          const sessionCookie = getSessionCookie();
          console.log('Login success, session cookie value:', sessionCookie ? 'exists' : 'not found');
          
          // Store auth in localStorage as backup
          localStorage.setItem('thalitera_auth', 'true');
          
          // Create cookies directly if none exist, as extra security
          const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
          if (!hasCookie) {
            console.log('No session cookie after login API call, creating manual cookies');
            const tempSessionId = `manual_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
            
            // Create multiple cookie formats to maximize compatibility
            document.cookie = `THALITERA_SESSION_ID=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
            document.cookie = `thalitera_session=${tempSessionId}; Path=/; Max-Age=86400`;
            document.cookie = `thalitera_auth=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
            document.cookie = `thalitera-session-id=${tempSessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
            
            // Store session ID in localStorage
            localStorage.setItem('thalitera_session_id', tempSessionId);
            
            console.log('Manually created cookies after login:', document.cookie);
          }
          
          // Force a hard redirect to ensure cookies are properly processed
          console.log('Redirecting to dashboard...');
          window.location.href = `/dashboard?ts=${Date.now()}`;
        }
      } else {
        // Handle registration
        const success = await register(email, password);
        if (success) {
          setSuccessMessage('Registration successful! Please check your email to verify your account.');
          setEmail('');
          setPassword('');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="container flex flex-col items-center justify-center space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2">
          <Image 
            src="/icon.png?height=40&width=40" 
            alt="Thalitera" 
            width={40} 
            height={40} 
          />
          <h1 className="text-2xl font-bold">Thalitera</h1>
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {isLogin ? 'Sign In' : 'Create an account'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? 'Enter your email and password to access your account' 
                : 'Enter your email and password to create an account'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {successMessage && (
              <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
                {error}
              </div>
            )}
            
            {debugInfo && (
              <div className="mb-4 rounded-md bg-blue-50 p-4 text-blue-800 overflow-auto text-xs">
                <details>
                  <summary className="cursor-pointer font-medium">Authentication Debug Info</summary>
                  <pre className="mt-2">{debugInfo}</pre>
                </details>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm">Remember me</Label>
                  </div>
                  <Link href="#" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (isLogin ? 'Signing in...' : 'Registering...') 
                  : (isLogin ? 'Sign In' : 'Register')}
              </Button>
            </form>
          </CardContent>
          
          <Separator />
          
          <CardFooter className="flex flex-col space-y-4 p-6">
            <div className="text-center text-sm">
              {isLogin 
                ? "Don't have an account?" 
                : "Already have an account?"}
              <button 
                onClick={toggleAuthMode}
                className="ml-1 text-blue-600 hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
            
            {/* Debug buttons */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleDebugLogin}
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 mb-2"
              >
                Debug Dashboard
              </button>
              <div className="flex space-x-2">
                <Link
                  href="/api/special-login"
                  className="flex-1 rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 text-center"
                >
                  Set Cookie & Redirect
                </Link>
                <button
                  onClick={handleDirectDashboard}
                  className="flex-1 rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200 text-center"
                >
                  Direct Dashboard
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Use debug options to troubleshoot authentication issues
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

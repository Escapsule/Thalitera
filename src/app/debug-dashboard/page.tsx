'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

/**
 * This is a special debug dashboard that doesn't have any authentication requirements
 * It's used to bypass the redirect loop between login and the normal dashboard
 */
export default function DebugDashboard() {
  const [authState, setAuthState] = useState<Record<string, any>>({});
  const [cookieValue, setCookieValue] = useState<string>(`debug_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`);
  const [cookieName, setCookieName] = useState<string>('THALITERA_SESSION_ID');
  const [cookiePath, setCookiePath] = useState<string>('/');
  const [cookieExpires, setCookieExpires] = useState<number>(86400); // 1 day in seconds
  const [cookieSameSite, setCookieSameSite] = useState<string>('Lax');
  const [cookieSecure, setCookieSecure] = useState<boolean>(false);
  const [cookieHttpOnly, setCookieHttpOnly] = useState<boolean>(false);
  const [cookieDomain, setCookieDomain] = useState<string>('');
  const [cookieCreateStatus, setCookieCreateStatus] = useState<string>('');
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };
  
  // Fetch auth state on mount and whenever cookies change
  useEffect(() => {
    const fetchAuthState = async () => {
      try {
        addLog('Fetching auth state...');
        const response = await fetch('/auth-debug');
        const data = await response.json();
        setAuthState(data);
        addLog('Auth state updated');
      } catch (error) {
        console.error('Error fetching auth state:', error);
        addLog(`Error fetching auth state: ${error}`);
      }
    };
    
    fetchAuthState();
    
    // Also set default domain to current hostname
    if (!cookieDomain && typeof window !== 'undefined') {
      setCookieDomain(window.location.hostname);
    }
    
    // Set up a listener for cookie changes
    const cookieChangeInterval = setInterval(() => {
      fetchAuthState();
    }, 5000);
    
    return () => clearInterval(cookieChangeInterval);
  }, []);
  
  // Handler for creating a cookie
  const handleCreateCookie = () => {
    try {
      addLog(`Creating cookie: ${cookieName}=${cookieValue}`);
      
      // Build cookie string
      let cookieStr = `${cookieName}=${cookieValue}; Path=${cookiePath}; Max-Age=${cookieExpires}`;
      
      // Add optional attributes
      if (cookieSameSite) cookieStr += `; SameSite=${cookieSameSite}`;
      if (cookieSecure) cookieStr += `; Secure`;
      if (cookieDomain) cookieStr += `; Domain=${cookieDomain}`;
      
      // Note: HttpOnly can't be set via JavaScript
      if (cookieHttpOnly) {
        addLog('Note: HttpOnly flag can only be set by the server, not JavaScript');
      }
      
      // Set the cookie
      document.cookie = cookieStr;
      
      // Check if it was set successfully
      const cookies = document.cookie.split(';').map(c => c.trim());
      const createdCookie = cookies.find(c => c.startsWith(`${cookieName}=`));
      
      if (createdCookie) {
        setCookieCreateStatus('Cookie created successfully!');
        addLog('Cookie created successfully');
      } else {
        setCookieCreateStatus('Failed to create cookie. Check browser settings.');
        addLog('Failed to create cookie');
      }
      
      // Refresh auth state
      setTimeout(() => {
        fetch('/auth-debug').then(r => r.json()).then(setAuthState);
      }, 100);
    } catch (error) {
      console.error('Error creating cookie:', error);
      setCookieCreateStatus(`Error: ${error.message}`);
      addLog(`Error creating cookie: ${error.message}`);
    }
  };
  
  // Handler for clearing a specific cookie
  const handleClearCookie = (name: string) => {
    try {
      addLog(`Clearing cookie: ${name}`);
      document.cookie = `${name}=; Path=/; Max-Age=0`;
      document.cookie = `${name}=; Path=/; Max-Age=0; Domain=${window.location.hostname}`;
      setCookieCreateStatus(`Cookie ${name} cleared`);
      
      // Refresh auth state
      setTimeout(() => {
        fetch('/auth-debug').then(r => r.json()).then(setAuthState);
      }, 100);
    } catch (error) {
      console.error('Error clearing cookie:', error);
      setCookieCreateStatus(`Error clearing ${name}: ${error.message}`);
      addLog(`Error clearing cookie ${name}: ${error.message}`);
    }
  };
  
  // Handler for clearing localStorage
  const handleClearLocalStorage = () => {
    try {
      addLog('Clearing localStorage');
      localStorage.removeItem('thalitera_auth');
      localStorage.removeItem('thalitera_session_id');
      setCookieCreateStatus('localStorage cleared');
      
      // Refresh auth state
      setTimeout(() => {
        fetch('/auth-debug').then(r => r.json()).then(setAuthState);
      }, 100);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      setCookieCreateStatus(`Error clearing localStorage: ${error.message}`);
      addLog(`Error clearing localStorage: ${error.message}`);
    }
  };
  
  // Handle redirect to dashboard to test authentication
  const handleTestDashboard = () => {
    addLog('Preparing to test dashboard access...');
    // Start a countdown
    setRedirectCountdown(3);
  };
  
  // Countdown effect for redirection
  useEffect(() => {
    if (redirectCountdown === null) return;
    
    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      addLog('Redirecting to dashboard...');
      window.location.href = `/dashboard?t=${Date.now()}`;
    }
  }, [redirectCountdown]);
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Authentication Debug Dashboard</h1>
        
        <div className="flex gap-2">
          <Link href="/" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Home
          </Link>
          <Link href="/login" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Login Page
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Authentication State</CardTitle>
            <CardDescription>
              Real-time authentication information from your browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-gray-100">
                <h3 className="text-lg font-semibold mb-2">Cookies</h3>
                {authState.cookies && authState.cookies.length > 0 ? (
                  <div className="space-y-2">
                    {authState.cookies.map((cookie: string, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded bg-white">
                        <code className="text-sm">{cookie}</code>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleClearCookie(cookie.split('=')[0])}
                        >
                          Clear
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-500">No cookies found</p>
                )}
              </div>
              
              <div className="p-4 rounded-md bg-gray-100">
                <h3 className="text-lg font-semibold mb-2">LocalStorage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded bg-white">
                    <div>
                      <strong>thalitera_auth:</strong> {authState.localStorage?.thalitera_auth || 'not set'}
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleClearLocalStorage}
                    >
                      Clear
                    </Button>
                  </div>
                  {authState.localStorage?.thalitera_session_id && (
                    <div className="p-2 rounded bg-white">
                      <strong>thalitera_session_id:</strong> {authState.localStorage.thalitera_session_id}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 rounded-md bg-gray-100">
                <h3 className="text-lg font-semibold mb-2">Session Summary</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li className={authState.hasSessionCookie ? 'text-green-600' : 'text-red-600'}>
                    Session Cookie: {authState.hasSessionCookie ? 'Present' : 'Missing'}
                  </li>
                  <li className={authState.localStorage?.thalitera_auth === 'true' ? 'text-green-600' : 'text-red-600'}>
                    LocalStorage Auth: {authState.localStorage?.thalitera_auth === 'true' ? 'Present' : 'Missing'}
                  </li>
                  <li>
                    Browser: {authState.userAgent || 'Unknown'}
                  </li>
                  <li>
                    Redirect Count: {authState.redirectCount || 0}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Refresh
            </Button>
            
            <Button
              onClick={handleTestDashboard}
              disabled={redirectCountdown !== null}
            >
              {redirectCountdown !== null 
                ? `Testing dashboard in ${redirectCountdown}s...` 
                : 'Test Dashboard Access'}
            </Button>
          </CardFooter>
        </Card>
        
        <Tabs defaultValue="create-cookie">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="create-cookie">Create Cookie</TabsTrigger>
            <TabsTrigger value="fixes">Quick Fixes</TabsTrigger>
            <TabsTrigger value="logs">Debug Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create-cookie">
            <Card>
              <CardHeader>
                <CardTitle>Cookie Creation Tool</CardTitle>
                <CardDescription>
                  Create custom cookies to test authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cookieName">Cookie Name</Label>
                      <Input 
                        id="cookieName" 
                        value={cookieName} 
                        onChange={(e) => setCookieName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cookieValue">Cookie Value</Label>
                      <Input 
                        id="cookieValue" 
                        value={cookieValue} 
                        onChange={(e) => setCookieValue(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cookiePath">Path</Label>
                      <Input 
                        id="cookiePath" 
                        value={cookiePath} 
                        onChange={(e) => setCookiePath(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cookieExpires">Max Age (seconds)</Label>
                      <Input 
                        id="cookieExpires" 
                        type="number"
                        value={cookieExpires} 
                        onChange={(e) => setCookieExpires(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cookieDomain">Domain (optional)</Label>
                      <Input 
                        id="cookieDomain" 
                        value={cookieDomain} 
                        onChange={(e) => setCookieDomain(e.target.value)}
                        placeholder={window.location.hostname}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cookieSameSite">SameSite</Label>
                      <select 
                        id="cookieSameSite"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                        value={cookieSameSite} 
                        onChange={(e) => setCookieSameSite(e.target.value)}
                        aria-label="SameSite cookie setting"
                      >
                        <option value="Lax">Lax</option>
                        <option value="Strict">Strict</option>
                        <option value="None">None</option>
                        <option value="">No SameSite</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="cookieSecure" 
                        checked={cookieSecure}
                        onCheckedChange={(checked) => setCookieSecure(checked === true)}
                      />
                      <Label htmlFor="cookieSecure">Secure</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="cookieHttpOnly" 
                        checked={cookieHttpOnly}
                        onCheckedChange={(checked) => setCookieHttpOnly(checked === true)}
                      />
                      <Label htmlFor="cookieHttpOnly">HttpOnly (server-side only)</Label>
                    </div>
                  </div>
                </div>
                
                {cookieCreateStatus && (
                  <div className={`mt-4 p-3 rounded-md ${cookieCreateStatus.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {cookieCreateStatus}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleCreateCookie}>Create Cookie</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="fixes">
            <Card>
              <CardHeader>
                <CardTitle>Quick Fixes</CardTitle>
                <CardDescription>
                  Common solutions to authentication issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    className="w-full"
                    onClick={() => {
                      // Create default session cookie
                      const sessionId = `quickfix_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
                      document.cookie = `THALITERA_SESSION_ID=${sessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
                      localStorage.setItem('thalitera_auth', 'true');
                      localStorage.setItem('thalitera_session_id', sessionId);
                      addLog('Set standard authentication cookie and localStorage');
                      setTimeout(() => fetch('/auth-debug').then(r => r.json()).then(setAuthState), 100);
                    }}
                  >
                    Set Standard Authentication
                  </Button>
                  
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      // Clear all auth cookies
                      const cookieNames = [
                        'THALITERA_SESSION_ID',
                        'thalitera_session',
                        'thalitera_auth',
                        'thalitera-session-id',
                        'alt_session',
                        'fallback_session'
                      ];
                      
                      cookieNames.forEach(name => {
                        document.cookie = `${name}=; Path=/; Max-Age=0`;
                        document.cookie = `${name}=; Path=/; Max-Age=0; Domain=${window.location.hostname}`;
                      });
                      
                      // Clear localStorage
                      localStorage.removeItem('thalitera_auth');
                      localStorage.removeItem('thalitera_session_id');
                      
                      addLog('Cleared all authentication data');
                      setTimeout(() => fetch('/auth-debug').then(r => r.json()).then(setAuthState), 100);
                    }}
                  >
                    Clear All Authentication
                  </Button>
                  
                  <Button 
                    className="w-full"
                    variant="secondary"
                    onClick={() => {
                      // Synchronize cookie to localStorage
                      const hasCookie = document.cookie.includes('THALITERA_SESSION_ID=');
                      
                      if (hasCookie) {
                        // Extract session ID
                        const cookies = document.cookie.split(';');
                        const sessionCookie = cookies.find(c => c.trim().startsWith('THALITERA_SESSION_ID='));
                        let sessionId = '';
                        
                        if (sessionCookie) {
                          sessionId = sessionCookie.trim().split('=')[1];
                        }
                        
                        // Set localStorage
                        localStorage.setItem('thalitera_auth', 'true');
                        if (sessionId) {
                          localStorage.setItem('thalitera_session_id', sessionId);
                        }
                        
                        addLog('Synchronized cookie to localStorage');
                      } else {
                        // Check localStorage and create cookie if needed
                        const hasLocalStorage = localStorage.getItem('thalitera_auth') === 'true';
                        
                        if (hasLocalStorage) {
                          // Create cookie from localStorage
                          const sessionId = localStorage.getItem('thalitera_session_id') || 
                                          `sync_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
                          
                          document.cookie = `THALITERA_SESSION_ID=${sessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
                          addLog('Synchronized localStorage to cookie');
                        } else {
                          addLog('No authentication found to synchronize');
                        }
                      }
                      
                      setTimeout(() => fetch('/auth-debug').then(r => r.json()).then(setAuthState), 100);
                    }}
                  >
                    Synchronize Authentication
                  </Button>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      href="/api/special-login" 
                      className="flex justify-center items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Use Special Login
                    </Link>
                    
                    <Link 
                      href={`/dashboard?bypassAuth=true&t=${Date.now()}`}
                      className="flex justify-center items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Bypass Auth Check
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Debug Logs</CardTitle>
                <CardDescription>
                  Activity log for debugging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded-md h-[400px] overflow-y-auto font-mono text-sm">
                  {logs.length === 0 ? (
                    <p>No logs yet...</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="pb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  onClick={() => setLogs([])}
                >
                  Clear Logs
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
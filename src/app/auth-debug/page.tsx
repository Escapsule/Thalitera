'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthDebugPage() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        // Fetch data from the API route
        const response = await fetch('/auth-debug');
        const apiData = await response.json();
        
        // Add localStorage information
        const localStorage = {
          thalitera_auth: window.localStorage.getItem('thalitera_auth'),
          thalitera_session_id: window.localStorage.getItem('thalitera_session_id'),
        };
        
        // Combine data
        setDebugData({
          ...apiData,
          localStorage
        });
      } catch (error) {
        console.error('Error fetching auth debug info:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDebugInfo();
  }, []);
  
  // Check if there's a sync issue between cookies and localStorage
  const hasSyncIssue = debugData && 
    ((debugData.hasSessionCookie && debugData.localStorage?.thalitera_auth !== 'true') ||
     (!debugData.hasSessionCookie && debugData.localStorage?.thalitera_auth === 'true'));
  
  // Fix sync issues between cookies and localStorage
  const handleFixSync = () => {
    try {
      if (!debugData) return;
      
      if (debugData.hasSessionCookie && debugData.localStorage?.thalitera_auth !== 'true') {
        // Cookie exists but localStorage doesn't - set localStorage
        localStorage.setItem('thalitera_auth', 'true');
        
        // Try to extract session ID from cookie
        const sessionCookie = document.cookie.split(';')
          .map(c => c.trim())
          .find(c => c.startsWith('THALITERA_SESSION_ID='));
          
        if (sessionCookie) {
          const sessionId = sessionCookie.split('=')[1];
          localStorage.setItem('thalitera_session_id', sessionId);
        }
        
        setSyncMessage('localStorage updated from cookie');
      } else if (!debugData.hasSessionCookie && debugData.localStorage?.thalitera_auth === 'true') {
        // localStorage exists but cookie doesn't - set cookie
        const sessionId = debugData.localStorage.thalitera_session_id || 
                         `sync_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        document.cookie = `THALITERA_SESSION_ID=${sessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
        
        setSyncMessage('Cookie created from localStorage');
      }
      
      // Refresh data after a short delay
      setTimeout(() => {
        setLoading(true);
        fetch('/auth-debug').then(r => r.json()).then(apiData => {
          setDebugData({
            ...apiData,
            localStorage: {
              thalitera_auth: window.localStorage.getItem('thalitera_auth'),
              thalitera_session_id: window.localStorage.getItem('thalitera_session_id'),
            }
          });
          setLoading(false);
        });
      }, 300);
    } catch (error) {
      console.error('Error fixing sync issues:', error);
      setSyncMessage(`Error: ${error.message}`);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Authentication Debug Information</h1>
        <div className="space-x-2">
          <Link href="/debug-dashboard" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Debug Dashboard
          </Link>
          <Link href="/dashboard" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
            Dashboard
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication State</CardTitle>
          <CardDescription>
            Comprehensive information about your current authentication state
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : debugData ? (
            <div className="space-y-6">
              <div className={`bg-${hasSyncIssue ? 'yellow' : 'blue'}-50 p-4 rounded-md`}>
                <h3 className="font-semibold mb-2">Authentication Summary</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li className={debugData.hasSessionCookie ? 'text-green-600' : 'text-red-600'}>
                    Session Cookie: {debugData.hasSessionCookie ? 'Present' : 'Missing'}
                  </li>
                  <li className={debugData.localStorage?.thalitera_auth === 'true' ? 'text-green-600' : 'text-red-600'}>
                    LocalStorage Auth: {debugData.localStorage?.thalitera_auth === 'true' ? 'Present' : 'Missing'}
                  </li>
                  <li className={hasSyncIssue ? 'text-yellow-600 font-semibold' : ''}>
                    Sync Status: {hasSyncIssue ? 'OUT OF SYNC' : 'In Sync'}
                  </li>
                  <li>Timestamp: {new Date(debugData.timestamp).toLocaleString()}</li>
                  <li>Redirect Count: {debugData.redirectCount}</li>
                </ul>
                
                {hasSyncIssue && (
                  <div className="mt-3">
                    <Button 
                      onClick={handleFixSync}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      Fix Sync Issues
                    </Button>
                    {syncMessage && (
                      <p className="mt-2 text-sm text-green-600">{syncMessage}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Cookies</h3>
                {debugData.cookies && debugData.cookies.length > 0 ? (
                  <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-40">
                    <pre className="text-sm">
                      {debugData.cookies.join('\n')}
                    </pre>
                  </div>
                ) : (
                  <p className="text-red-500">No cookies found</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">LocalStorage</h3>
                <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-40">
                  <pre className="text-sm">
                    {JSON.stringify(debugData.localStorage, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Request Details</h3>
                <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-40">
                  <pre className="text-sm">
                    URL: {debugData.url}
                    Method: {debugData.method}
                    User Agent: {debugData.userAgent}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Headers</h3>
                <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-40">
                  <pre className="text-sm">
                    {JSON.stringify(debugData.headers, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-red-500">Failed to load authentication information</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh Information
          </Button>
          
          <div className="space-x-2">
            <Button 
              onClick={() => {
                // Create a cookie and localStorage for authentication
                const sessionId = `debug_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
                document.cookie = `THALITERA_SESSION_ID=${sessionId}; Path=/; SameSite=Lax; Max-Age=86400`;
                localStorage.setItem('thalitera_auth', 'true');
                localStorage.setItem('thalitera_session_id', sessionId);
                
                // Refresh after a short delay
                setTimeout(() => window.location.reload(), 300);
              }}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Set Both Auth Methods
            </Button>
            
            <Button 
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
                
                // Refresh after a short delay
                setTimeout(() => window.location.reload(), 300);
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Clear All Auth
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 
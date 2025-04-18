'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useAdminAuthContext } from '@/components/admin-auth-provider';

/**
 * Administrator login page component
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdminAuthenticated } = useAdminAuthContext();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  /**
   * Get browser fingerprint
   * @returns {Promise<string>} Browser fingerprint
   */
  const getFingerprint = async (): Promise<string> => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  };

  /**
   * Handle login request
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in email and password');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Get fingerprint
      const fingerprint = await getFingerprint();
      
      // Send login request
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'THALITERA_FINGERPRINT': fingerprint
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
        credentials: 'include'
      });

      // Get response text
      const responseText = await response.text();
      
      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON parsing error:', responseText);
        throw new Error('The data format returned by the server is incorrect');
      }

      // Check response status
      if (!response.ok) {
        // Handle specific error messages
        if (data && data.message) {
          switch (data.message) {
            case 'User does not exist.':
              setError('User does not exist. Please check if the email is correct');
              return;
            case 'Invalid password.':
              setError('Invalid password. Please re-enter');
              return;
            default:
              setError(data.message);
              return;
          }
        }
        setError(`Request failed: ${response.status} ${response.statusText}`);
        return;
      }
      
      if (data.code === 200) {
        // Save login status to cookies, set SameSite attribute
        document.cookie = `admin_auth=true; path=/; max-age=86400; SameSite=Lax`; // 24 hours expiration
        document.cookie = `admin_email=${email}; path=/; max-age=86400; SameSite=Lax`;
        
        // Update authentication status
        setAdminAuthenticated(true);
        
        setSuccessMessage('Login successful. Redirecting...');
        // Login successful, redirect to dashboard
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        if (err.message.includes('JSON')) {
          setError('The server response format is incorrect. Please try again later');
        } else if (err.message.includes('Request failed')) {
          setError(`Login failed: ${err.message}`);
        } else {
          setError(err.message || 'Login request failed. Please try again later');
        }
      } else {
        setError('An unknown error occurred. Please try again later');
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
              Admin Login
            </CardTitle>
            <CardDescription className="text-center">
              Please enter the admin email and password
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
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@example.com" 
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm">Remember me</Label>
                </div>
                <Link href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

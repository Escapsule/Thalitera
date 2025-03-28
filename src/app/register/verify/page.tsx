'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Get the backend URL from environment variables
const getBackendUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'k1ng.tech:8080';
  return `http://${backendUrl}`;
};

export default function VerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your account...');
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        // Get the uuid and email from the URL
        const uuid = searchParams.get('uuid');
        const email_address = searchParams.get('email_address');
        
        if (!uuid || !email_address) {
          setStatus('error');
          setMessage('Invalid verification link. Please request a new one.');
          return;
        }
        
        // Call the verification endpoint
        const response = await fetch(`${getBackendUrl()}/user/register/verify?uuid=${uuid}&email_address=${email_address}`, {
          method: 'GET',
        });
        
        const data = await response.json();
        
        if (data.code === 200) {
          setStatus('success');
          setMessage('Your account has been successfully verified!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. Please try again or contact support.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };
    
    verifyAccount();
  }, [searchParams]);

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
              Account Verification
            </CardTitle>
            <CardDescription className="text-center">
              {status === 'loading' ? 'Please wait while we verify your account' : ''}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
            {status === 'loading' && (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            )}
            
            {status === 'success' && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            
            <p className="text-center text-lg">
              {message}
            </p>
          </CardContent>
          
          <CardFooter className="flex justify-center p-6">
            {(status === 'success' || status === 'error') && (
              <Button asChild>
                <Link href="/login">
                  {status === 'success' ? 'Proceed to Login' : 'Back to Login'}
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 
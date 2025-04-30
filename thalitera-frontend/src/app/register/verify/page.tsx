'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

function VerifyPageContent() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your account...');
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const verificationTimeout = setTimeout(() => {
      if (verificationStatus === 'loading') {
        setVerificationStatus('error');
        setMessage('Verification timed out. Please try again or contact support.');
      }
    }, 10000); // Reduce timeout to 10 seconds

    // Also add a separate visual feedback for long loading
    const loadingFeedbackTimeout = setTimeout(() => {
      if (verificationStatus === 'loading') {
        // Keep status as loading but update message to inform user
        setMessage('Verification is taking longer than expected, still trying...');
      }
    }, 5000);

    const verifyAccount = async () => {
      try {
        // 获取参数
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        
        if (!token || !email) {
          setVerificationStatus('error');
          setMessage('Invalid verification link. Missing token or email.');
          return;
        }
        
        // 检查是否已经验证过（使用sessionStorage）
        const verificationKey = `verified:${email}:${token}`;
        const storedResult = sessionStorage.getItem(verificationKey);
        
        if (storedResult) {
          try {
            // 解析缓存结果
            const cachedResult = JSON.parse(storedResult);
            console.log('Found cached verification result:', cachedResult);
            
            if (cachedResult.success) {
              setVerificationStatus('success');
              setMessage('Your account has been successfully verified!');
              handleSuccessfulVerification(email);
            } else {
              setVerificationStatus('error');
              setMessage(cachedResult.message || 'Verification failed. Please try again or contact support.');
            }
            return;
          } catch (e) {
            console.error('Error parsing stored verification result:', e);
            // 如果解析失败则继续验证
          }
        }
        
        // 调用API
        try {
          console.log('Calling verification API...');
          const response = await fetch(`/api/user/verify?token=${token}&email=${email}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          // Check if the response is ok
          if (!response.ok) {
            console.error('Verification API error:', response.status, response.statusText);
            setVerificationStatus('error');
            setMessage(`Verification failed with status: ${response.status}. Please try again later.`);
            return;
          }
          
          const data = await response.json();
          console.log('Verification API response:', data);
          
          // Check if the response has the expected structure
          if (!data || typeof data !== 'object') {
            setVerificationStatus('error');
            setMessage('Invalid response from verification server. Please try again.');
            return;
          }
          
          // 缓存验证结果（无论成功或失败）
          const resultToStore = {
            success: data.code === 200,
            message: data.message || (data.code === 200 ? 'Verification successful' : 'Verification failed'),
            timestamp: new Date().toISOString()
          };
          sessionStorage.setItem(verificationKey, JSON.stringify(resultToStore));
          
          if (data.code === 200) {
            setVerificationStatus('success');
            setMessage('Your account has been successfully verified!');
            handleSuccessfulVerification(email);
          } else {
            setVerificationStatus('error');
            setMessage(data.message || 'Verification failed. Please try again or contact support.');
          }
        } catch (fetchError) {
          console.error('API fetch error:', fetchError);
          setVerificationStatus('error');
          setMessage('Network error during verification. Please try again or contact support.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage('An unexpected error occurred during verification. Please try again or contact support.');
      }
    };
    
    // 定义处理成功验证的函数
    const handleSuccessfulVerification = (email: string) => {
      // 存储邮箱地址方便登录
      localStorage.setItem('verified_email', email);
      
      // 重定向
      if (isAuthenticated) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      }
    };
    
    verifyAccount();
    
    // Clean up timeouts when component unmounts
    return () => {
      clearTimeout(verificationTimeout);
      clearTimeout(loadingFeedbackTimeout);
    };
  }, [searchParams, router, isAuthenticated, verificationStatus]);
  
  const handleRetry = () => {
    setIsRetrying(true);
    setVerificationStatus('loading');
    setMessage('Retrying verification...');
    
    // Clear cached result to force a fresh verification
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token && email) {
      const verificationKey = `verified:${email}:${token}`;
      sessionStorage.removeItem(verificationKey);
    }
    
    // Wait a short time before retrying
    setTimeout(() => {
      setIsRetrying(false);
      // Force re-run of the verification effect
      router.refresh();
    }, 1000);
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="container flex flex-col items-center justify-center space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/icon.png?height=40&width=40" 
            alt="Thalitera" 
            width={40} 
            height={40} 
          />
          <h1 className="text-2xl font-bold">Thalitera</h1>
        </Link>
        
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className={`
            ${verificationStatus === 'success' ? 'bg-green-50' : ''}
            ${verificationStatus === 'error' ? 'bg-red-50' : ''}
            rounded-t-lg
          `}>
            <CardTitle className="text-center text-2xl">
              Account Verification
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              {verificationStatus === 'loading' && (
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              )}
              
              {verificationStatus === 'success' && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
              
              {verificationStatus === 'error' && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              )}
              
              <p className="text-lg font-semibold">{message}</p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center gap-3 p-6 pt-0">
            {verificationStatus === 'error' && (
              <>
                <Button 
                  onClick={handleRetry} 
                  disabled={isRetrying}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isRetrying ? 'Retrying...' : 'Retry Verification'}
                </Button>
                <Link href="/login">
                  <Button variant="outline">Back to Login</Button>
                </Link>
              </>
            )}
            
            {verificationStatus === 'success' && !isAuthenticated && (
              <Link href="/login">
                <Button className="bg-green-600 hover:bg-green-700">
                  Proceed to Login
                </Button>
              </Link>
            )}
            
            {verificationStatus === 'success' && isAuthenticated && (
              <Link href="/dashboard">
                <Button className="bg-green-600 hover:bg-green-700">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p>Loading verification page...</p>
        </div>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  );
} 
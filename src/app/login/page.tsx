'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDeviceInfo } from '@/hooks/use-device-info';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Types for auth steps - streamlined for combined login
type AuthStep = 'login' | 'register';

export default function LoginPage() {
  // Current step in the auth flow
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [totpCode, setTotpCode] = useState<string>('');
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [mfaMethod, setMfaMethod] = useState<'totp' | 'recovery'>('totp');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showMfaInput, setShowMfaInput] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { login, register, error, isAuthenticated } = useAuth();
  const deviceInfo = useDeviceInfo();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get browser fingerprint
  const getFingerprint = async (): Promise<string> => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  };

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use API to check auth status
        const response = await fetch('/api/user/check-auth', {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
        });
        
        const data = await response.json();
        if (data.code === 200) {
          console.log('Already authenticated, redirecting to dashboard');
          router.push('/dashboard');
        } else if (data.code === 2019) {
          // MFA required but not set up - redirect to setup if user is logged in
          console.log('MFA required but not set up, redirecting to setup page');
          router.push('/login/mfa-setup');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    
    checkAuth();
  }, [router]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Add effect to check for verification success or error
  useEffect(() => {
    // Check if we have a verified=true parameter in URL
    if (searchParams.get('verified') === 'true') {
      setSuccessMessage('Your account has been successfully verified! You can now log in.');
      
      // Get the verified email from localStorage if available
      const verifiedEmail = localStorage.getItem('verified_email');
      if (verifiedEmail) {
        setEmail(verifiedEmail);
        // Remove the stored email
        localStorage.removeItem('verified_email');
      }
    }
    
    // Check for error parameter
    const error = searchParams.get('error');
    if (error === 'invalid_verification_link') {
      setLoginError('Invalid verification link. Please request a new verification email.');
    }
  }, [searchParams]);

  // Handle login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) return;
    
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      // Check if attempting admin login
      const isAdminLogin = email.endsWith('@xjtlu.edu.cn') || email === 'admin@thalitera.com';
      
      if (isAdminLogin) {
        // Handle admin login directly
        const fingerprint = await getFingerprint();
        
        // Send admin login request
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

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (_unused) {
          console.error('JSON parsing error:', responseText);
          throw new Error('The data format returned by the server is incorrect');
        }

        if (!response.ok) {
          if (data && data.message) {
            setIsSubmitting(false);
            setSuccessMessage('');
            switch (data.message) {
              case 'User does not exist.':
                throw new Error('User does not exist. Please check if the email is correct');
              case 'Invalid password.':
                throw new Error('Invalid password. Please re-enter');
              default:
                throw new Error(data.message);
            }
          }
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        
        if (data.code === 200) {
          // Save admin login status to cookies
          document.cookie = `admin_auth=true; path=/; max-age=86400; SameSite=Lax`; // 24 hours expiration
          document.cookie = `admin_email=${email}; path=/; max-age=86400; SameSite=Lax`;
          
          localStorage.setItem('is_admin', 'true');
          
          setSuccessMessage('Admin login successful. Redirecting...');
          // Login successful, redirect to admin dashboard
          router.push('/admin/dashboard');
        } else {
          throw new Error(data.message || 'Admin login failed');
        }
      } else {
        // Use the TOTP code or recovery code if provided
        const mfaCode = showMfaInput && mfaMethod === 'totp' ? totpCode : undefined;
        const recovery = showMfaInput && mfaMethod === 'recovery' ? recoveryCode : undefined;
        
        console.log('Attempting login with:', { email, mfaCode: mfaCode || 'none', recovery: recovery || 'none' });
        
        const result = await login(email, password, deviceInfo?.fingerprint, mfaCode, recovery);
        
        // Handle different status codes
        if (result.success) {
          console.log('Login successful, redirecting to dashboard');
          router.push('/dashboard');
        } else if (result.code === 2018 || result.code === 2019) {
          // MFA not enabled but required - redirect to MFA setup
          console.log('MFA required but not set up, redirecting to setup page');
          localStorage.setItem('user_email', email);
          sessionStorage.setItem('temp_password', password);
          router.push('/login/mfa-setup');
        } else if (result.code === 2608) {
          // New device requires MFA - show MFA input
          console.log('New device detected, MFA required, showing MFA input');
          setShowMfaInput(true);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setSuccessMessage('');
        if (error.message.includes('JSON')) {
          setLoginError('The server response format is incorrect. Please try again later');
        } else {
          setLoginError(error.message || 'Login failed');
        }
      } else {
        setLoginError('An unknown error occurred. Please try again later');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effect to track when email changes - hide MFA input for admin
  useEffect(() => {
    const isAdminEmail = email.endsWith('@xjtlu.edu.cn') || email === 'admin@thalitera.com';
    if (isAdminEmail) {
      setShowMfaInput(false);
    }
  }, [email]);

  // Handle registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await register(email, password);
      
      if (success) {
        setSuccessMessage('Registration successful! Please check your email to verify your account.');
        setEmail('');
        setPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToRegister = () => {
    setAuthStep('register');
    setSuccessMessage('');
    setShowMfaInput(false);
  };

  const switchToLogin = () => {
    setAuthStep('login');
    setSuccessMessage('');
    setShowMfaInput(false);
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
              {authStep === 'login' && 'Sign In'}
              {authStep === 'register' && 'Create an account'}
            </CardTitle>
            <CardDescription className="text-center">
              {authStep === 'login' && 'Enter your credentials to sign in'}
              {authStep === 'register' && 'Enter your email and password to create an account'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {successMessage && (
              <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">
                {successMessage}
              </div>
            )}
            
            {(error || loginError) && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
                {loginError || error}
              </div>
            )}
            
            {authStep === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
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
                  {(email.endsWith('@xjtlu.edu.cn') || email === 'admin@thalitera.com') && (
                    <p className="text-xs text-blue-600">Admin login detected. MFA not required.</p>
                  )}
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
                
                {showMfaInput && (
                  <div className="space-y-3">
                    <Label>Multi-Factor Authentication</Label>
                    <Tabs defaultValue="totp" onValueChange={(v) => setMfaMethod(v as 'totp' | 'recovery')} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="totp">Authenticator App</TabsTrigger>
                        <TabsTrigger value="recovery">Recovery Code</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="totp" className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="totp">Authentication Code</Label>
                          <Input 
                            id="totp" 
                            type="text" 
                            placeholder="000000" 
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value)}
                            maxLength={6}
                            pattern="[0-9]{6}"
                          />
                          <p className="text-xs text-gray-500">
                            Enter the 6-digit code from your authenticator app
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="recovery" className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="recovery">Recovery Code</Label>
                          <Input 
                            id="recovery" 
                            type="text" 
                            placeholder="xxxx-xxxx-xxxx-xxxx" 
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.target.value)}
                          />
                          <p className="text-xs text-gray-500">
                            Enter one of your recovery codes (this can only be used once)
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
                
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
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            )}
            
            {authStep === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input 
                    id="reg-email" 
                    type="email" 
                    placeholder="email@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input 
                    id="reg-password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </Button>
              </form>
            )}
          </CardContent>
          
          <Separator />
          
          <CardFooter className="flex flex-col space-y-4 p-6">
            <div className="text-center text-sm">
              {authStep !== 'register' 
                ? "Don't have an account?" 
                : "Already have an account?"}
              <button 
                onClick={authStep !== 'register' ? switchToRegister : switchToLogin}
                className="ml-1 text-blue-600 hover:underline"
              >
                {authStep !== 'register' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

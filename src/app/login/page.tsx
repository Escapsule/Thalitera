'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDeviceInfo } from '@/hooks/use-device-info';
import { checkMfaStatus } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// MFA verification status
type AuthStep = 'email' | 'mfa-verification' | 'password' | 'register';

export default function LoginPage() {
  // Current step in the auth flow
  const [authStep, setAuthStep] = useState<AuthStep>('email');
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [totpCode, setTotpCode] = useState<string>('');
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [mfaMethod, setMfaMethod] = useState<'totp' | 'recovery'>('totp');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [verifiedMfaCode, setVerifiedMfaCode] = useState<string>('');
  const [verifiedRecoveryCode, setVerifiedRecoveryCode] = useState<string>('');
  
  const { login, register, error, isAuthenticated } = useAuth();
  const deviceInfo = useDeviceInfo();
  const router = useRouter();

  // Check if already authenticated via THALITERA_SESSION_ID cookie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSessionCookie = document.cookie.includes('THALITERA_SESSION_ID=');
      if (hasSessionCookie) {
        router.push('/dashboard');
      }
    }
  }, [router]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Handle email submission - first step
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if MFA is required for this email
      console.log('Checking MFA status for email:', email);
      const mfaStatus = await checkMfaStatus(email);
      
      if (mfaStatus.error) {
        console.error('Error checking MFA status:', mfaStatus.error);
        return;
      }
      
      if (mfaStatus.isMfaRequired) {
        if (!mfaStatus.isMfaSetUp) {
          // MFA required but not set up - redirect to setup
          console.log('MFA required but not set up, redirecting to setup page');
          localStorage.setItem('user_email', email);
          console.log('Stored email in localStorage:', localStorage.getItem('user_email'));
          
          // Also store the password temporarily for completing the login flow after MFA setup
          if (password) {
            sessionStorage.setItem('temp_password', password);
            console.log('Stored temporary password in sessionStorage');
          }
          
          router.push('/login/mfa-setup');
        } else {
          // MFA required and set up - proceed to verification
          console.log('MFA required and set up, proceeding to verification');
          setAuthStep('mfa-verification');
        }
      } else {
        // MFA not required - proceed directly to password
        console.log('MFA not required, proceeding to password entry');
        setAuthStep('password');
      }
    } catch (error) {
      console.error('Error checking MFA status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle MFA verification
  const handleMfaVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    const mfaCode = mfaMethod === 'totp' ? totpCode : undefined;
    const recovery = mfaMethod === 'recovery' ? recoveryCode : undefined;
    
    if (!mfaCode && !recovery) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Verifying MFA code before password entry');
      
      // Store the verified codes for the next step
      if (mfaMethod === 'totp') {
        setVerifiedMfaCode(totpCode);
        setVerifiedRecoveryCode('');
      } else {
        setVerifiedRecoveryCode(recoveryCode);
        setVerifiedMfaCode('');
      }
      
      // In a real implementation, we would verify the MFA code here
      // against the backend to ensure it's valid before asking for password
      // For this implementation, we'll just proceed to password step
      
      // Move to password entry
      setAuthStep('password');
    } catch (error) {
      console.error('MFA verification error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle final login with password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Attempting final login with email and password');
      
      // Use the verified MFA code from previous step
      const mfaCode = verifiedMfaCode || undefined;
      const recovery = verifiedRecoveryCode || undefined;
      
      const success = await login(email, password, deviceInfo?.fingerprint, mfaCode, recovery);
      
      if (success) {
        console.log('Login successful, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        // If login fails at this point, it's likely a password issue
        console.error('Login failed with error:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
  };

  const switchToLogin = () => {
    setAuthStep('email');
    setSuccessMessage('');
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
              {authStep === 'email' && 'Sign In'}
              {authStep === 'mfa-verification' && 'Multi-Factor Authentication'}
              {authStep === 'password' && 'Enter Password'}
              {authStep === 'register' && 'Create an account'}
            </CardTitle>
            <CardDescription className="text-center">
              {authStep === 'email' && 'Enter your email to begin the login process'}
              {authStep === 'mfa-verification' && 'Enter your verification code to proceed'}
              {authStep === 'password' && 'Enter your password to complete sign in'}
              {authStep === 'register' && 'Enter your email and password to create an account'}
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
            
            {authStep === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Checking...' : 'Continue'}
                </Button>
              </form>
            )}
            
            {authStep === 'mfa-verification' && (
              <form onSubmit={handleMfaVerification} className="space-y-4">
                <Tabs defaultValue="totp" onValueChange={(v) => setMfaMethod(v as 'totp' | 'recovery')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="totp">Authenticator App</TabsTrigger>
                    <TabsTrigger value="recovery">Recovery Code</TabsTrigger>
                  </TabsList>
                  <TabsContent value="totp" className="space-y-4 pt-4">
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
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="recovery" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="recovery">Recovery Code</Label>
                      <Input 
                        id="recovery" 
                        type="text" 
                        placeholder="xxxx-xxxx-xxxx-xxxx" 
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Enter one of your recovery codes (this can only be used once)
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || 
                    (mfaMethod === 'totp' && totpCode.length !== 6) || 
                    (mfaMethod === 'recovery' && !recoveryCode)}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setAuthStep('email')}
                >
                  Back
                </Button>
              </form>
            )}
            
            {authStep === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setAuthStep('mfa-verification')}
                >
                  Back
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

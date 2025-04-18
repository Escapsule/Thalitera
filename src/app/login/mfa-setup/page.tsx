'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDeviceInfo } from '@/hooks/use-device-info';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CopyIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';

export default function MfaSetupPage() {
  const [email, setEmail] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState<boolean>(false);
  const [totp_code, setTotp_code] = useState<string>('');
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isRedirectedFromLogin, setIsRedirectedFromLogin] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setupMfa, enableMfa, error, isAuthenticated, login } = useAuth();
  const deviceInfo = useDeviceInfo();
  const router = useRouter();

  // Get user email from localStorage or session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('user_email');
      console.log('MFA setup page - storedEmail from localStorage:', storedEmail);
      if (storedEmail) {
        setEmail(storedEmail);
        setIsRedirectedFromLogin(true);
      }
    }
  }, []);

  // Check authentication status
  useEffect(() => {
    // Give time for the first useEffect to run and set isRedirectedFromLogin
    if (typeof window !== 'undefined') {
      const timeoutId = setTimeout(() => {
        // Only redirect if we're not redirected from login and not authenticated
        console.log('MFA setup page - checking auth state:', { 
          isRedirectedFromLogin, 
          isAuthenticated,
          email: localStorage.getItem('user_email')
        });
        
        if (!isRedirectedFromLogin && !isAuthenticated) {
          console.log('MFA setup page - redirecting to login page');
          router.push('/login');
        }
      }, 500); // Small delay to ensure localStorage is checked first
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, router, isRedirectedFromLogin]);

  const handleSetupMfa = async () => {
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Setting up MFA for email:', email);
      const response = await setupMfa(email, deviceInfo?.fingerprint);
      
      if (response && response.code === 200 && response.data) {
        console.log('MFA setup successful, proceeding to verification step', response.data);
        
        // Check if the response data has the expected properties
        const qrCodeValue = response.data.qr_code;
        const recoveryCodesArray = response.data.recovery_codes;
        
        if (qrCodeValue) {
          setQrCode(qrCodeValue);
          if (Array.isArray(recoveryCodesArray)) {
            setRecoveryCodes(recoveryCodesArray);
          }
          setStep('verify');
        } else {
          console.error('Invalid QR code in response:', response.data);
        }
      } else {
        console.error('MFA setup failed:', response?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('MFA setup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !totp_code) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Verifying and enabling MFA for email:', email);
      const response = await enableMfa(email, totp_code, deviceInfo?.fingerprint);
      
      if (response && response.code === 200) {
        console.log('MFA successfully enabled');
        
        // If this was redirected from login, we need to complete the login process
        if (isRedirectedFromLogin) {
          // Get the stored password (from sessionStorage for this particular flow)
          const storedPassword = sessionStorage.getItem('temp_password');
          
          if (storedPassword) {
            console.log('Attempting login with newly enabled MFA');
            // Clear the temporary password
            sessionStorage.removeItem('temp_password');
            
            // Try to log in with the new MFA setup
            const loginResult = await login(email, storedPassword, deviceInfo?.fingerprint, totp_code);
            
            if (loginResult.success) {
              console.log('Auto-login successful after MFA setup');
              router.push('/dashboard');
              return;
            } else {
              console.error('Auto-login failed after MFA setup');
            }
          }
        }
        
        setStep('complete');
      } else if (response && response.code === 2606) {
        // TOTP secret not found error - need to set up MFA first
        console.error('TOTP secret not found. Restarting MFA setup process.');
        setErrorMessage('TOTP secret not found. Please set up MFA again.');
        setStep('setup');
        // Clear any cached data
        setQrCode('');
        setRecoveryCodes([]);
        setTotp_code('');
      } else {
        console.error('MFA verification failed:', response?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('MFA verification error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    // Clear stored data
    localStorage.removeItem('user_email');
    sessionStorage.removeItem('temp_password');
    
    // With the new flow, we always redirect back to login
    // after MFA setup is complete
    router.push('/login');
  };

  const copyRecoveryCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadRecoveryCodes = () => {
    const element = document.createElement('a');
    const content = `THALITERA RECOVERY CODES\n\nKeep these codes safe and secure. Each code can only be used once.\n\n${recoveryCodes.join('\n')}\n\nGenerated on: ${new Date().toLocaleString()}`;
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'thalitera-recovery-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-[lch(100_0_0)]">
      <Card className="w-full max-w-3xl shadow-lg border border-[lch(97_0_0)]">
        <CardHeader className="bg-[lch(100_0_0)] border-b border-[lch(97_0_0)] py-3">
          <CardTitle className="text-xl font-bold text-[lch(17_23_133)] text-center">
            {step === 'setup' && 'Set Up Multi-Factor Authentication'}
            {step === 'verify' && 'Verify Your Authentication App'}
            {step === 'complete' && 'Multi-Factor Authentication Enabled'}
          </CardTitle>
          <CardDescription className="text-center text-[lch(56_0_0)] text-sm mt-1">
            {step === 'setup' && 'Add an extra layer of security to your account'}
            {step === 'verify' && 'Scan the QR code with your authenticator app and verify to complete setup'}
            {step === 'complete' && 'Your account is now protected with multi-factor authentication'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3 pt-3">
          {(error || errorMessage) && (
            <Alert variant="destructive" className="border-[lch(57_24_27)] bg-[lch(97_2_27)]">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage || error}</AlertDescription>
            </Alert>
          )}
          
          {step === 'setup' && (
            <div className="space-y-4">
              <p className="text-[lch(17_23_133)] text-center">
                Multi-factor authentication adds an extra layer of security to your account by requiring 
                a verification code in addition to your password when you sign in.
              </p>
              
              <div className="space-y-2 max-w-md mx-auto">
                <Label htmlFor="email" className="text-[lch(17_23_133)]">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-[lch(92_0_0)] focus:ring-[lch(17_23_133)/50] focus:border-[lch(17_23_133)]"
                />
              </div>
              
              <div className="pt-4 flex justify-center">
                <Button 
                  onClick={handleSetupMfa}
                  disabled={isSubmitting || !email}
                  className="w-full max-w-md bg-[lch(17_23_133)] hover:bg-[lch(25_25_133)] text-[lch(100_0_0)]"
                >
                  {isSubmitting ? 'Setting up...' : 'Set Up MFA'}
                </Button>
              </div>
            </div>
          )}
          
          {step === 'verify' && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-2">
                  <h3 className="text-base font-medium text-[lch(17_23_133)]">1. Scan QR Code</h3>
                  <p className="text-[lch(17_23_133)] text-xs">
                    Scan this QR code with your authenticator app (Google Authenticator, 
                    Microsoft Authenticator, or Authy).
                  </p>
                  
                  <div className="flex justify-center py-2">
                    {qrCode && (
                      <div className="overflow-hidden rounded-lg border border-[lch(92_0_0)] bg-[lch(100_0_0)] p-1 shadow-md">
                        <Image 
                          src={qrCode} 
                          alt="QR Code for Authenticator App" 
                          width={150} 
                          height={150}
                          className="h-[150px] w-[150px]"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-medium text-[lch(17_23_133)]">3. Verify Setup</h3>
                    <p className="text-[lch(17_23_133)] text-xs">
                      Enter the 6-digit verification code from your app.
                    </p>
                    
                    <form onSubmit={handleVerifyMfa} className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="totp_code" className="text-[lch(17_23_133)] text-xs">Verification Code</Label>
                        <Input 
                          id="totp_code" 
                          type="text" 
                          placeholder="000000" 
                          value={totp_code}
                          onChange={(e) => setTotp_code(e.target.value)}
                          maxLength={6}
                          pattern="[0-9]{6}"
                          required
                          className="border-[lch(92_0_0)] focus:ring-[lch(17_23_133)/50] focus:border-[lch(17_23_133)] text-center text-base tracking-widest"
                        />
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full bg-[lch(17_23_133)] hover:bg-[lch(25_25_133)] text-[lch(100_0_0)] text-sm py-1"
                          disabled={isSubmitting || totp_code.length !== 6}
                        >
                          {isSubmitting ? 'Verifying...' : 'Verify and Enable'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-base font-medium text-[lch(17_23_133)]">2. Save Recovery Codes</h3>
                  <p className="text-[lch(17_23_133)] text-xs">
                    Save these recovery codes in a safe place. If you lose your authenticator app, 
                    you can use one of these codes to sign in. Each code can be used only once.
                  </p>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
                      className="border-[lch(17_23_133)] text-[lch(17_23_133)] hover:bg-[lch(94_5_133)] text-xs py-1 px-2"
                      size="sm"
                    >
                      {showRecoveryCodes ? 'Hide Codes' : 'Show Codes'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={downloadRecoveryCodes}
                      className="border-[lch(17_23_133)] text-[lch(17_23_133)] hover:bg-[lch(94_5_133)] text-xs py-1 px-2"
                      size="sm"
                    >
                      Download Codes
                    </Button>
                  </div>
                  
                  {showRecoveryCodes && (
                    <div className="space-y-1 rounded-md border border-[lch(92_0_0)] bg-[lch(97_0_0)] p-2 max-h-[250px] overflow-y-auto">
                      <div className="grid grid-cols-1 gap-1">
                        {recoveryCodes.map((code, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between rounded-md border border-[lch(92_0_0)] bg-[lch(100_0_0)] p-1 hover:shadow-md transition-shadow duration-200"
                          >
                            <code className="font-mono text-xs text-[lch(17_23_133)]">{code}</code>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => copyRecoveryCode(code, index)}
                              title="Copy to clipboard"
                              className="text-[lch(17_23_133)] hover:bg-[lch(94_5_133)] h-6 w-6 p-0"
                            >
                              {copiedIndex === index ? 
                                <CheckCircleIcon className="h-3 w-3 text-[lch(47_69_149)]" /> : 
                                <CopyIcon className="h-3 w-3" />
                              }
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {step === 'complete' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center py-4">
                <div className="rounded-full bg-[lch(94_5_133)] p-4">
                  <CheckCircleIcon className="h-16 w-16 text-[lch(47_69_149)]" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-[lch(17_23_133)]">Setup Complete!</h3>
              
              <p className="text-[lch(17_23_133)] max-w-lg mx-auto">
                Your account is now protected with multi-factor authentication. 
                You&apos;ll need to enter a verification code each time you sign in.
              </p>
              
              <Alert className="bg-[lch(94_5_133)] text-[lch(17_23_133)] border-[lch(17_23_133)/20] max-w-lg mx-auto">
                <AlertDescription>
                  Remember to keep your recovery codes in a safe place. You&apos;ll need them 
                  if you lose access to your authenticator app.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t border-[lch(97_0_0)] bg-[lch(97_0_0)] rounded-b-xl py-2 flex justify-center">
          <div className="flex w-full max-w-md justify-between">
            {step !== 'setup' && (
              <Button 
                variant="outline" 
                onClick={() => router.push('/login')}
                className="border-[lch(17_23_133)] text-[lch(17_23_133)] hover:bg-[lch(94_5_133)] text-sm py-1"
                size="sm"
              >
                Back to Login
              </Button>
            )}
            
            {step === 'complete' && (
              <Button 
                onClick={handleComplete}
                className="bg-[lch(17_23_133)] hover:bg-[lch(25_25_133)] text-[lch(100_0_0)] ml-auto text-sm py-1"
                size="sm"
              >
                Continue to Login
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 
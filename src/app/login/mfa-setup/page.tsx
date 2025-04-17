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
import { Separator } from '@/components/ui/separator';
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
      const response = await setupMfa(email);
      
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
      const response = await enableMfa(email, totp_code);
      
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
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[lch(100_0_0)]">
      <Card className="w-full max-w-3xl shadow-lg border border-[lch(97_0_0)]">
        <CardHeader className="bg-[lch(100_0_0)] border-b border-[lch(97_0_0)] pb-6">
          <CardTitle className="text-2xl font-bold text-[lch(17_23_133)] text-center">
            {step === 'setup' && 'Set Up Multi-Factor Authentication'}
            {step === 'verify' && 'Verify Your Authentication App'}
            {step === 'complete' && 'Multi-Factor Authentication Enabled'}
          </CardTitle>
          <CardDescription className="text-center text-[lch(56_0_0)] mt-2">
            {step === 'setup' && 'Add an extra layer of security to your account'}
            {step === 'verify' && 'Scan the QR code with your authenticator app and verify to complete setup'}
            {step === 'complete' && 'Your account is now protected with multi-factor authentication'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive" className="border-[lch(57_24_27)] bg-[lch(97_2_27)]">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
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
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[lch(17_23_133)] text-center">Step 1: Scan QR Code</h3>
                <p className="text-[lch(17_23_133)] text-center">
                  Scan this QR code with your authenticator app (like Google Authenticator, 
                  Microsoft Authenticator, or Authy).
                </p>
                
                <div className="flex justify-center py-4">
                  {qrCode && (
                    <div className="overflow-hidden rounded-lg border border-[lch(92_0_0)] bg-[lch(100_0_0)] p-2 shadow-md">
                      <Image 
                        src={qrCode} 
                        alt="QR Code for Authenticator App" 
                        width={200} 
                        height={200}
                        className="h-[200px] w-[200px]"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <Separator className="bg-[lch(92_0_0)]" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[lch(17_23_133)] text-center">Step 2: Save Recovery Codes</h3>
                <p className="text-[lch(17_23_133)] text-center">
                  Save these recovery codes in a safe place. If you lose your authenticator app, 
                  you can use one of these codes to sign in. Each code can only be used once.
                </p>
                
                <div className="flex justify-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
                    className="border-[lch(17_23_133)] text-[lch(17_23_133)] hover:bg-[lch(94_5_133)]"
                  >
                    {showRecoveryCodes ? 'Hide Codes' : 'Show Codes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={downloadRecoveryCodes}
                    className="border-[lch(17_23_133)] text-[lch(17_23_133)] hover:bg-[lch(94_5_133)]"
                  >
                    Download Codes
                  </Button>
                </div>
                
                {showRecoveryCodes && (
                  <div className="mt-4 space-y-2 rounded-md border border-[lch(92_0_0)] bg-[lch(97_0_0)] p-4">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {recoveryCodes.map((code, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between rounded-md border border-[lch(92_0_0)] bg-[lch(100_0_0)] p-2 hover:shadow-md transition-shadow duration-200"
                        >
                          <code className="font-mono text-sm text-[lch(17_23_133)]">{code}</code>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyRecoveryCode(code, index)}
                            title="Copy to clipboard"
                            className="text-[lch(17_23_133)] hover:bg-[lch(94_5_133)]"
                          >
                            {copiedIndex === index ? 
                              <CheckCircleIcon className="h-4 w-4 text-[lch(47_69_149)]" /> : 
                              <CopyIcon className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator className="bg-[lch(92_0_0)]" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[lch(17_23_133)] text-center">Step 3: Verify Setup</h3>
                <p className="text-[lch(17_23_133)] text-center">
                  Enter the 6-digit verification code from your authenticator app to complete setup.
                </p>
                
                <form onSubmit={handleVerifyMfa} className="space-y-4">
                  <div className="space-y-2 max-w-md mx-auto">
                    <Label htmlFor="totp_code" className="text-[lch(17_23_133)]">Verification Code</Label>
                    <Input 
                      id="totp_code" 
                      type="text" 
                      placeholder="000000" 
                      value={totp_code}
                      onChange={(e) => setTotp_code(e.target.value)}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                      className="border-[lch(92_0_0)] focus:ring-[lch(17_23_133)/50] focus:border-[lch(17_23_133)] text-center text-lg tracking-widest"
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-center">
                    <Button 
                      type="submit" 
                      className="w-full max-w-md bg-[lch(17_23_133)] hover:bg-[lch(25_25_133)] text-[lch(100_0_0)]"
                      disabled={isSubmitting || totp_code.length !== 6}
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify and Enable'}
                    </Button>
                  </div>
                </form>
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
        
        <CardFooter className="border-t border-[lch(97_0_0)] bg-[lch(97_0_0)] rounded-b-xl py-4 flex justify-center">
          <div className="flex w-full max-w-md justify-between">
            {step !== 'setup' && (
              <Button 
                variant="outline" 
                onClick={() => router.push('/login')}
                className="border-[lch(17_23_133)] text-[lch(17_23_133)] hover:bg-[lch(94_5_133)]"
              >
                Back to Login
              </Button>
            )}
            
            {step === 'complete' && (
              <Button 
                onClick={handleComplete}
                className="bg-[lch(17_23_133)] hover:bg-[lch(25_25_133)] text-[lch(100_0_0)] ml-auto"
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
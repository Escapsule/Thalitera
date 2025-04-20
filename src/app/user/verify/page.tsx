'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerificationRedirector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Get token and email parameters
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    // Immediately redirect to our main verification page, preserving query parameters
    if (token && email) {
      // Use router.replace instead of push to avoid adding to history
      router.replace(`/register/verify?token=${token}&email=${email}`);
    } else {
      // If missing parameters, redirect to login with error
      router.replace('/login?error=invalid_verification_link');
    }
  }, [router, searchParams]);
  
  // Show a simple loading message while redirecting
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
        <p>Redirecting to verification page...</p>
      </div>
    </div>
  );
}

export default function VerifyRedirector() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p>Loading verification page...</p>
        </div>
      </div>
    }>
      <VerificationRedirector />
    </Suspense>
  );
} 
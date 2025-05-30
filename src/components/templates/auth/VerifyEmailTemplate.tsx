'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useVerifyEmailStore } from '@/stores/verifyEmailStore';
import VerifyEmailWait from '@/components/organisms/auth/VerifyEmailWait';
import VerifyEmailConfirm from '@/components/organisms/auth/VerifyEmailConfirm';

export default function VerifyEmailTemplate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    verificationStatus,
    countdown,
    isResending,
    pendingEmail,
    errorMessage,
    token,
    setVerificationStatus,
    setIsResending,
    setPendingEmail,
    setErrorMessage,
    setToken,
    decrementCountdown,
    resetCountdown,
  } = useVerifyEmailStore();

  const handleEmailVerification = useCallback(async (verificationToken: string) => {
    setVerificationStatus('verifying');
    
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setVerificationStatus('success');
        toast.success('Email verified successfully!', {
          description: result.message,
        });
        
        // Clear pending email from storage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('pendingVerificationEmail');
        }
        
        // Redirect to login after success
        setTimeout(() => {
          router.push('/auth/login?verified=true');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setErrorMessage(result.message || 'Invalid or expired verification token.');
        toast.error('Verification failed', {
          description: result.message || 'Invalid or expired verification token.',
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
      toast.error('Verification failed', {
        description: 'An unexpected error occurred. Please try again.',
      });
    }
  }, [router, setVerificationStatus, setErrorMessage]);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    
    if (urlToken) {
      setToken(urlToken);
      if (verificationStatus === 'pending') {
        setVerificationStatus('verifying'); 
        handleEmailVerification(urlToken);
      }
      return; 
    }

    // Get pending verification email from sessionStorage
    if (typeof window !== 'undefined') {
      const email = sessionStorage.getItem('pendingVerificationEmail');
      setPendingEmail(email);
    }

    // Countdown timer (only if not verifying)
    if (verificationStatus === 'pending' && countdown > 0) {
      const timer = setTimeout(() => {
        decrementCountdown();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (verificationStatus === 'pending' && countdown <= 0) {
      router.push('/');
    }
  }, [
    countdown, 
    router, 
    searchParams, 
    handleEmailVerification, 
    verificationStatus,
    setToken,
    setPendingEmail,
    decrementCountdown,
    setVerificationStatus 
  ]);

  const handleResendVerification = async () => {
    if (!pendingEmail) {
      toast.error('No email found', {
        description: 'Please try registering again.',
      });
      return;
    }

    setIsResending(true);
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: pendingEmail }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Verification email sent!', {
          description: result.message || 'Please check your inbox.',
        });
        
        // Reset countdown
        resetCountdown(60); // Give more time after resend
      } else {
        toast.error('Failed to resend email', {
          description: result.message || 'Please try again later.',
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Something went wrong', {
        description: 'Could not resend verification email. Please try again later.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToHomepage = () => {
    router.push('/');
  };

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  const handleGoToRegister = () => {
    router.push('/auth/register');
  };

  // If token is present, show verification confirmation state
  if (token) {
    return (
      <VerifyEmailConfirm
        verificationStatus={verificationStatus}
        errorMessage={errorMessage}
        onGoToRegister={handleGoToRegister}
        onGoToHomepage={handleGoToHomepage}
      />
    );
  }

  // Default state - waiting for email verification
  return (
    <VerifyEmailWait
      countdown={countdown}
      isResending={isResending}
      pendingEmail={pendingEmail}
      onResendVerification={handleResendVerification}
      onGoToHomepage={handleGoToHomepage}
      onGoToLogin={handleGoToLogin}
    />
  );
}
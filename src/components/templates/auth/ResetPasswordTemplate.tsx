'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useResetPasswordStore } from '@/stores/resetPasswordStore';
import ForgotPasswordState from '@/components/organisms/auth/ForgotPasswordState';
import ResetPasswordState from '@/components/organisms/auth/ResetPasswordState';
import {
  RequestPasswordResetFormData,
  ResetPasswordFormData,
} from '@/lib/zodValidation';

export default function ResetPasswordTemplate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    pageState,
    isLoading,
    serverMessage,
    token,
    setPageState,
    setIsLoading,
    setServerMessage,
    setToken,
  } = useResetPasswordStore();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      setPageState('reset_form');
    } else {
      setPageState('request_form');
    }
  }, [searchParams, setToken, setPageState]);

  const handleRequestReset = async (data: RequestPasswordResetFormData) => {
    setIsLoading(true);
    setServerMessage(null);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Request Submitted', {
          description: result.message || 'If an account exists, a reset link has been sent.',
        });
        setPageState('request_submitted');
        setServerMessage(
          result.message || 
          'If an account exists, a reset link has been sent to your email address. Please check your inbox (and spam folder).'
        );
      } else {
        toast.error('Request Failed', {
          description: result.message || 'Could not process your request.',
        });
        setServerMessage(result.message || 'An error occurred. Please try again.');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Network Error', {
        description: 'Could not connect to the server. Please try again.',
      });
      setServerMessage('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Error', { description: 'Reset token is missing.' });
      setPageState('reset_error');
      setServerMessage('Reset token is missing. Please try requesting a new link.');
      return;
    }

    setIsLoading(true);
    setServerMessage(null);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, token }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Password Reset Successful!', {
          description: result.message || 'Your password has been changed.',
        });
        setPageState('reset_success');
        setServerMessage(
          result.message || 
          'Your password has been successfully reset. You can now log in with your new password.'
        );
        setTimeout(() => {
          router.push('/auth/login?reset=success');
        }, 3000);
      } else {
        toast.error('Reset Failed', {
          description: result.message || 'Could not reset your password.',
        });
        setPageState('reset_error');
        setServerMessage(
          result.message || 
          'Invalid or expired token, or password did not meet requirements.'
        );
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Network Error', {
        description: 'Could not connect to the server. Please try again.',
      });
      setPageState('reset_error');
      setServerMessage('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRequestForm = () => {
    setPageState('request_form');
    setServerMessage(null);
  };

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  // Render appropriate state component
  if (pageState === 'request_form' || pageState === 'request_submitted') {
    return (
      <ForgotPasswordState
        pageState={pageState}
        isLoading={isLoading}
        serverMessage={serverMessage}
        onSubmit={handleRequestReset}
        onBackToRequestForm={handleBackToRequestForm}
        onGoToLogin={handleGoToLogin}
      />
    );
  }

  if (pageState === 'reset_form' || pageState === 'reset_error' || pageState === 'reset_success') {
    return (
      <ResetPasswordState
        pageState={pageState}
        isLoading={isLoading}
        serverMessage={serverMessage}
        onSubmit={handleResetPassword}
        onGoToLogin={handleGoToLogin}
      />
    );
  }

  return null;
}
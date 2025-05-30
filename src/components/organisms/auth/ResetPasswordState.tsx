'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from '@/lib/zodValidation';
import Link from 'next/link';
import { PageState } from '@/stores/resetPasswordStore';

interface ResetPasswordStateProps {
  pageState: PageState;
  isLoading: boolean;
  serverMessage: string | null;
  onSubmit: (data: ResetPasswordFormData) => Promise<void>;
  onGoToLogin: () => void;
}

export default function ResetPasswordState({
  pageState,
  isLoading,
  serverMessage,
  onSubmit,
  onGoToLogin,
}: ResetPasswordStateProps) {
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  if (pageState === 'reset_form' || pageState === 'reset_error') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Enter and confirm your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                {...form.register('newPassword')}
                disabled={isLoading}
              />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="••••••••"
                {...form.register('confirmNewPassword')}
                disabled={isLoading}
              />
              {form.formState.errors.confirmNewPassword && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.confirmNewPassword.message}
                </p>
              )}
            </div>
            {pageState === 'reset_error' && serverMessage && (
              <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{serverMessage}</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-center">
          <Link href="/auth/login" className="underline">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (pageState === 'reset_success') {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Password Reset Successful!</CardTitle>
          <CardDescription>
            {serverMessage || 'Your password has been changed. Redirecting to login...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onGoToLogin} className="w-full">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
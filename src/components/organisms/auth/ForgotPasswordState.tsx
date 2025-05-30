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
import { Loader2, Mail } from 'lucide-react';
import {
  requestPasswordResetSchema,
  RequestPasswordResetFormData,
} from '@/lib/zodValidation';
import Link from 'next/link';
import { PageState } from '@/stores/resetPasswordStore';    

interface ForgotPasswordStateProps {
  pageState: PageState;
  isLoading: boolean;
  serverMessage: string | null;
  onSubmit: (data: RequestPasswordResetFormData) => Promise<void>;
  onBackToRequestForm: () => void;
  onGoToLogin: () => void;
}

export default function ForgotPasswordState({
  pageState,
  isLoading,
  serverMessage,
  onSubmit,
  onBackToRequestForm,
}: ForgotPasswordStateProps) {
  const form = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: '',
    },
  });

  if (pageState === 'request_form') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your email address below and we will send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...form.register('email')}
                disabled={isLoading}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            {serverMessage && (
              <p className="text-sm text-muted-foreground">{serverMessage}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-center">
          Remember your password?{' '}
          <Link href="/auth/login" className="underline">
            Sign In
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (pageState === 'request_submitted') {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <Mail className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>{serverMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you do not receive an email within a few minutes, please check your spam folder or
            try{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={onBackToRequestForm}
            >
              requesting another link
            </Button>
            .
          </p>
        </CardContent>
        <CardFooter className="text-sm text-center">
          <Link href="/auth/login" className="underline">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return null;
}
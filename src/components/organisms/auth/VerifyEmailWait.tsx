'use client';

import { MailCheck, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface VerifyEmailWaitProps {
  countdown: number;
  isResending: boolean;
  pendingEmail: string | null;
  onResendVerification: () => Promise<void>;
  onGoToHomepage: () => void;
  onGoToLogin: () => void;
}

export default function VerifyEmailWait({
  countdown,
  isResending,
  pendingEmail,
  onResendVerification,
  onGoToHomepage,
  onGoToLogin,
}: VerifyEmailWaitProps) {
  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="items-center">
        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
          <MailCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
        <CardDescription className="text-muted-foreground text-center">
          We have sent a verification link to {pendingEmail ? (
            <span className="font-medium text-foreground">{pendingEmail}</span>
          ) : (
            'your email address'
          )}. Please check your inbox and spam folder to complete your registration.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          Redirecting to homepage in {countdown} seconds...
        </div>
        
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            Did not receive the email?{' '}
            <Button 
              variant="link" 
              size="sm" 
              onClick={onResendVerification}
              disabled={isResending || !pendingEmail}
              className="p-0 h-auto text-primary"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend verification link'
              )}
            </Button>
          </p>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={onGoToHomepage} 
              variant="outline" 
              className="w-full"
            >
              Go to Homepage Now
            </Button>
            
            <Button 
              onClick={onGoToLogin} 
              variant="ghost" 
              size="sm"
              className="w-full text-xs"
            >
              Already verified? Sign In
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
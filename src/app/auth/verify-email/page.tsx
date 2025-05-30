'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MailCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming you have this
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5); // Start countdown from 5 seconds

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/'); // Redirect to homepage
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer); // Cleanup timer
  }, [countdown, router]);

  // Optional: Function to resend verification email
  const handleResendVerification = async () => {
    // You would call an API endpoint here to trigger resending the email
    // For example: await fetch('/api/auth/resend-verification-email', { method: 'POST', body: JSON.stringify({ email: 'user-email-from-store-or-param' }) });
    alert('Resend verification email functionality to be implemented.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-900 text-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <MailCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription className="text-muted-foreground">
            We have sent a verification link to your email address. Please check your inbox (and spam folder) to complete your registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            Redirecting to homepage in {countdown} seconds...
          </div>
          <p className="text-xs text-muted-foreground">
            Did not receive the email?{' '}
            <Button variant="link" size="sm" onClick={handleResendVerification} className="p-0 h-auto text-primary">
              Resend verification link
            </Button>
          </p>
          <Button onClick={() => router.push('/')} variant="outline" className="w-full">
            Go to Homepage Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VerificationStatus } from '@/stores/verifyEmailStore';

interface VerifyEmailConfirmProps {
  verificationStatus: VerificationStatus;
  errorMessage: string;
  onGoToRegister: () => void;
  onGoToHomepage: () => void;
}

export default function VerifyEmailConfirm({
  verificationStatus,
  errorMessage,
  onGoToRegister,
  onGoToHomepage,
}: VerifyEmailConfirmProps) {
  const getStatusConfig = () => {
    switch (verificationStatus) {
      case 'verifying':
        return {
          bgColor: 'bg-blue-100 dark:bg-blue-900',
          icon: <RefreshCw className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />,
          title: 'Verifying Email...',
          description: 'Please wait while we verify your email address.',
        };
      case 'success':
        return {
          bgColor: 'bg-green-100 dark:bg-green-900',
          icon: <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />,
          title: 'Email Verified!',
          description: 'Your email has been successfully verified. Redirecting to login...',
        };
      case 'error':
        return {
          bgColor: 'bg-red-100 dark:bg-red-900',
          icon: <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />,
          title: 'Verification Failed',
          description: errorMessage,
        };
      default:
        return {
          bgColor: 'bg-gray-100 dark:bg-gray-900',
          icon: <AlertCircle className="h-12 w-12 text-gray-600 dark:text-gray-400" />,
          title: 'Unknown Status',
          description: 'Something unexpected happened.',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card className="w-full max-w-md shadow-xl text-center">
      <CardHeader className="items-center">
        <div className={`p-3 rounded-full mb-4 ${statusConfig.bgColor}`}>
          {statusConfig.icon}
        </div>
        <CardTitle className="text-2xl font-bold">
          {statusConfig.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {statusConfig.description}
        </CardDescription>
      </CardHeader>
      
      {verificationStatus === 'error' && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button 
              onClick={onGoToRegister} 
              className="w-full"
            >
              Try Registration Again
            </Button>
            
            <Button 
              onClick={onGoToHomepage} 
              variant="outline" 
              className="w-full"
            >
              Go to Homepage
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
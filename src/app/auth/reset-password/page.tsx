'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ResetPasswordTemplate from '@/components/templates/auth/ResetPasswordTemplate';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-900">
      <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin text-primary" />}>
        <ResetPasswordTemplate />
      </Suspense>
    </div>
  );
}
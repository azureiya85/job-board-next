import { CredentialsRegister } from '@/components/organisms/auth/CredentialRegister';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-900">
      <Suspense fallback={<div>Loading...</div>}> {/* Good practice for client components */}
        <CredentialsRegister />
      </Suspense>
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStores';

export default function CompanyRedirectPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const redirectToCompany = async () => {
      if (!isAuthenticated || !user) {
        router.push('/auth/login');
        return;
      }

      if (user.role !== 'COMPANY_ADMIN') {
        router.push('/dashboard');
        return;
      }

      try {
        // Fetch the company ID for this admin
        const response = await fetch('/api/companies/admin'); 
        if (response.ok) {
          const data = await response.json();
          if (data.companyId) {
            router.push(`/companies/${data.companyId}`);
          } else {
            // No company found, redirect to setup or dashboard
            router.push('/dashboard');
          }
        } else {
          console.error('Failed to fetch company data');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching company:', error);
        router.push('/dashboard');
      }
    };

    redirectToCompany();
  }, [user, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your company profile...</p>
      </div>
    </div>
  );
}
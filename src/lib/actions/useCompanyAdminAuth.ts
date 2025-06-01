'use client';

import { useState, useEffect } from 'react';
import { CompanyAuthResult } from './companyAuth';

// Client-side hook for company admin validation
export function useCompanyAdminAuth(companyId: string) {
  const [authData, setAuthData] = useState<CompanyAuthResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}/auth`);
        const data = await response.json();
        setAuthData(data);
      } catch (error) {
        console.error('Error validating company access:', error);
        setAuthData({
          isAuthenticated: false,
          isCompanyAdmin: false,
          isOwner: false,
          user: null,
          error: 'Failed to validate access'
        });
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      validateAccess();
    }
  }, [companyId]);

  return { authData, loading };
}
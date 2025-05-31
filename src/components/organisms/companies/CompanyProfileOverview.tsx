'use client';

import { useCompanyProfileStore } from '@/stores/companyProfileStores';
import { CompanyDetailed } from '@/types';
import CompanyProfileHeader from '@/components/molecules/companies/CompanyProfileHeader';
import CompanyProfileDetails from '@/components/molecules/companies/CompanyProfileDetails';

interface CompanyProfileOverviewProps {
  className?: string;
}

export default function CompanyProfileOverview({ className }: CompanyProfileOverviewProps) {
  const company = useCompanyProfileStore((state) => state.company) as CompanyDetailed | null;

  if (!company) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <CompanyProfileHeader company={company} />
      <CompanyProfileDetails company={company} />
    </div>
  );
}
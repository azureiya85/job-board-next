'use client';

import { useEffect, useState } from 'react';
import { useCompanyProfileStore } from '@/stores/companyProfileStores';
import CompanyProfileOverview from '@/components/organisms/companies/CompanyProfileOverview';
import CompanyProfileJobs from '@/components/organisms/companies/CompanyProfleJobs';
import type { CompanyDetailed } from '@/types'; 
import Image from 'next/image';

interface CompanyProfileTemplateProps {
  company: CompanyDetailed; 
  className?: string;
}

export default function CompanyProfileTemplate({ company, className }: CompanyProfileTemplateProps) {
  const { 
    activeTab, 
    setActiveTab, 
    setCompany, 
    resetStore,
    totalJobs: jobsCountFromStore
  } = useCompanyProfileStore();

  // State for handling banner image loading
  const [bannerError, setBannerError] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(!!company.banner);

  useEffect(() => {
     console.log("[CompanyProfileTemplate] Received company prop:", JSON.stringify(company, null, 2));
    if (company) { 
        setCompany(company);
    } else {
        console.error("[CompanyProfileTemplate] useEffect - company prop is null or undefined, cannot set in store.");
    }
    
    // Reset banner states when company changes
    setBannerError(false);
    setBannerLoading(!!company.banner);
    
    return () => {
      console.log('[CompanyProfileTemplate] useEffect - resetting store on unmount.');
      resetStore();
    };
  }, [company, setCompany, resetStore]);

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'jobs' as const, label: 'Jobs' }
  ];

  const displayJobsCount = jobsCountFromStore > 0 || !useCompanyProfileStore.getState().isLoadingJobs 
    ? jobsCountFromStore
    : company.stats.activeJobs;

  const handleBannerError = () => {
    console.log(`[CompanyProfileTemplate] Banner image failed to load: ${company.banner}`);
    setBannerError(true);
    setBannerLoading(false);
  };

  const handleBannerLoad = () => {
    console.log(`[CompanyProfileTemplate] Banner image loaded successfully: ${company.banner}`);
    setBannerError(false);
    setBannerLoading(false);
  };

  // Add a timeout to stop loading state if onLoad doesn't fire
  useEffect(() => {
    if (bannerLoading && company.banner) {
      const timeout = setTimeout(() => {
        console.log(`[CompanyProfileTemplate] Banner loading timeout - assuming loaded: ${company.banner}`);
        setBannerLoading(false);
      }, 3000); 

      return () => clearTimeout(timeout);
    }
  }, [bannerLoading, company.banner]);

  return (
    <div className={`min-h-screen bg-gray-100 ${className}`}>
      {/* Hero Banner */}
      <div className="relative h-56 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        {company.banner && !bannerError ? (
          <>
            <Image
              src={company.banner}
              alt={`${company.name} banner`}
              fill
              className="object-cover"
              priority={true}
              unoptimized={company.banner.startsWith('http')}
              onError={handleBannerError}
              onLoad={handleBannerLoad}
            />
            {bannerLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center z-10">
                <div className="text-white text-lg">Loading {company.name} banner...</div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
            {bannerError && company.banner ? (
              <div className="text-center text-white">
                <div className="text-lg font-medium">{company.name} Banner</div>
                <div className="text-sm opacity-75 mt-1">Image failed to load</div>
              </div>
            ) : (
              <div className="text-center text-white">
                <div className="text-lg font-medium">{company.name}</div>
                <div className="text-sm opacity-75 mt-1">Company Banner</div>
              </div>
            )}
          </div>
        )}
        {/* Overlay*/}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end gap-4 md:gap-6">
              <div className="flex-1 min-w-0 py-2">
                <h1 className="text-2xl md:text-4xl font-bold text-white truncate">
                  {company.name}
                </h1>
                {company.industry && (
                  <p className="text-sm md:text-lg text-gray-200 truncate">
                    {company.industry}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-6 md:space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-3 md:py-4 px-1 border-b-2 font-medium text-sm md:text-base
                  focus:outline-none
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
                {tab.id === 'jobs' && (displayJobsCount > 0 || company.stats.activeJobs > 0) && ( 
                  <span
                    className={`
                      ml-2 py-0.5 px-2 rounded-full text-xs font-semibold
                      ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-800'
                      }
                    `}
                  >
                    {displayJobsCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <main className="py-6 md:py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {activeTab === 'overview' && company && (
              <CompanyProfileOverview />
            )}
            
            {activeTab === 'jobs' && company && (
              <CompanyProfileJobs companyId={company.id} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
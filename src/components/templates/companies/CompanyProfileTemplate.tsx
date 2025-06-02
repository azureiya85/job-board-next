'use client';

import { useEffect, useState } from 'react';
import { useCompanyProfileStore, type CompanyProfileTabId } from '@/stores/companyProfileStores';
import { useAuthStore } from '@/stores/authStores';
import CompanyProfileOverview from '@/components/organisms/companies/CompanyProfileOverview';
import CompanyProfileManagement from '@/components/organisms/companies/CompanyProfileManagement';
import CompanyJobsManagement from '@/components/organisms/companies/CompanyJobsManagement';
import CompanyProfileJobs from '@/components/organisms/companies/CompanyProfleJobs';
import type { CompanyDetailed } from '@/types'; 
import Image from 'next/image';

// Define the user type interface
interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  // Add other user properties as needed
}

// Hook to validate company admin access
function useCompanyAdminAuth(companyId: string) {
  const [authData, setAuthData] = useState<{
    isAuthenticated: boolean;
    isCompanyAdmin: boolean;
    isOwner: boolean;
    user: AuthUser | null;
    error?: string;
  } | null>(null);
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

interface CompanyProfileTemplateProps {
  company: CompanyDetailed; 
  className?: string;
}

interface Tab {
  id: CompanyProfileTabId;
  label: string;
}

export default function CompanyProfileTemplate({ company, className }: CompanyProfileTemplateProps) {
  const { 
    activeTab, 
    setActiveTab, 
    setCompany, 
    resetStore,
    totalJobs: jobsCountFromStore
  } = useCompanyProfileStore();

  const { user } = useAuthStore();
  const { authData, loading: authLoading } = useCompanyAdminAuth(company.id);

  // State for handling banner image loading
  const [bannerError, setBannerError] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(!!company.banner);

  // Check if current user is the company admin based on server validation
  const isCompanyAdmin = authData?.isOwner || false;

  // Define tabs based on user role
  const getAvailableTabs = (): Tab[] => {
    const baseTabs: Tab[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'jobs', label: 'Jobs' }
    ];

    if (isCompanyAdmin) {
      return [
        ...baseTabs,
        { id: 'profile-management', label: 'Profile Management' },
        { id: 'job-management', label: 'Job Management' }
      ];
    }

    return baseTabs;
  };

  useEffect(() => {
    console.log("[CompanyProfileTemplate] Received company prop:", JSON.stringify(company, null, 2));
    console.log("[CompanyProfileTemplate] Current user:", user);
    console.log("[CompanyProfileTemplate] Is company admin:", isCompanyAdmin);
    
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
  }, [company, setCompany, resetStore, user, isCompanyAdmin]);

  // Reset active tab if user role changes and current tab is not available
useEffect(() => {
  // Define available tabs directly inside useEffect
  const baseTabs: Tab[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'jobs', label: 'Jobs' }
  ];

  const availableTabs = isCompanyAdmin 
    ? [
        ...baseTabs,
        { id: 'profile-management', label: 'Profile Management' },
        { id: 'job-management', label: 'Job Management' }
      ]
    : baseTabs;

  const currentTabExists = availableTabs.some(tab => tab.id === activeTab);
  
  if (!currentTabExists) {
    setActiveTab('overview');
  }
}, [isCompanyAdmin, activeTab, setActiveTab]);

  const tabs = getAvailableTabs();

  const displayJobsCount = jobsCountFromStore > 0 || !useCompanyProfileStore.getState().isLoadingJobs 
    ? jobsCountFromStore
    : company.stats.activeJobs;

  const handleBannerError = () => {
    console.log(`[CompanyProfileTemplate] Banner image failed to load: ${company.banner}`);
    setBannerError(true);
    setBannerLoading(false);
  };

  const handleBannerLoad = () => {
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
      {/* Show loading state while validating auth */}
      {authLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validating access...</p>
          </div>
        </div>
      )}

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
      </div>

      {/* Admin Indicator */}
      {isCompanyAdmin && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You are viewing your company profile as an administrator. You have access to additional management features.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {/* Badge for admin-only tabs */}
                {(tab.id === 'profile-management' || tab.id === 'job-management') && (
                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Admin
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

            {activeTab === 'profile-management' && isCompanyAdmin && (
  <CompanyProfileManagement />
)}

{activeTab === 'job-management' && isCompanyAdmin && (
  <CompanyJobsManagement />
)}
          </div>
        </div>
      </main>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';
import { useCompanyProfileStore, JobPostingInStore } from '@/stores/companyProfileStores';
import type { JobPosting, City, Province } from '@prisma/client';
import CompanyJobCard from '@/components/molecules/companies/CompanyJobCard';
import CVSubmitModal from '@/components/atoms/modals/CVSubmitModal'; 

interface CompanyProfileJobsProps {
  companyId: string;
  className?: string;
}

type ApiJob = JobPosting & {
  city: Pick<City, 'name'> | null;
  province: Pick<Province, 'name'> | null;
  workType?: string; 
};

export default function CompanyProfileJobs({ companyId, className }: CompanyProfileJobsProps) {
  const {
    jobs,
    isLoadingJobs,
    jobsPage,
    hasMoreJobs,
    totalJobs,
    setJobs,
    addJobs,
    setLoadingJobs,
    setJobsPagination
  } = useCompanyProfileStore();

  const [initialLoad, setInitialLoad] = useState(true);

  const transformApiJobToStoreJob = (apiJob: ApiJob): JobPostingInStore => {
    let locationString = 'Location not specified';
    if (apiJob.city && apiJob.province) {
      locationString = `${apiJob.city.name}, ${apiJob.province.name}`;
    } else if (apiJob.city) {
      locationString = apiJob.city.name;
    } else if (apiJob.province) {
      locationString = apiJob.province.name;
    } else if (apiJob.isRemote) {
      locationString = 'Remote';
    }

    let workType = apiJob.workType;
    if (!workType) {
      if (apiJob.isRemote) { 
        workType = 'REMOTE';
      } else {
        workType = 'ON_SITE';
      }
    }

    return {
      id: apiJob.id,
      title: apiJob.title,
      type: apiJob.employmentType,
      workType: workType,
      location: locationString,
      minSalary: apiJob.salaryMin === null ? undefined : apiJob.salaryMin,
      maxSalary: apiJob.salaryMax === null ? undefined : apiJob.salaryMax,
      description: apiJob.description,
      requirements: apiJob.requirements || [],
      benefits: apiJob.benefits || [],
      isActive: apiJob.isActive,
      createdAt: apiJob.createdAt.toString(),
      updatedAt: apiJob.updatedAt.toString(),
      applicationDeadline: apiJob.applicationDeadline?.toString(),
      experienceLevel: apiJob.experienceLevel, 
    };
  };

  const fetchJobs = async (pageToFetch: number = 1, append: boolean = false) => {
    if (!companyId) {
      console.error('[CompanyProfileJobs] companyId is undefined or null. Cannot fetch jobs.');
      setLoadingJobs(false);
      if (!append) setInitialLoad(false);
      return;
    }

    try {
      setLoadingJobs(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const itemsPerPage = 30; 
      const skip = (pageToFetch - 1) * itemsPerPage;
      const take = itemsPerPage;

      const queryParams = new URLSearchParams({
        skip: skip.toString(),
        take: take.toString(),
      });

      const response = await fetch(
        `${apiUrl}/api/companies/${companyId}/jobs?${queryParams.toString()}`
      );
        
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[CompanyProfileJobs] Failed to fetch jobs. Status: ${response.status}, StatusText: ${response.statusText}, URL: ${response.url}, Body: ${errorText}`);
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json(); 
      const transformedJobs = (data.jobPostings || []).map(transformApiJobToStoreJob);

      if (append) {
        addJobs(transformedJobs);
      } else {
        setJobs(transformedJobs);
      }
      
      setJobsPagination(
        data.pagination?.page || pageToFetch, 
        data.pagination?.hasNext || false,
        data.pagination?.total || 0
      );
    } catch (error) {
      console.error('[CompanyProfileJobs] Error fetching jobs:', error);
    } finally {
      setLoadingJobs(false);
      if (!append) {
        setInitialLoad(false);
      }
    }
  };

  useEffect(() => {
    if (companyId && initialLoad) {
      fetchJobs(1, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, initialLoad]);

  const loadMoreJobs = () => {
    if (hasMoreJobs && !isLoadingJobs) {
      fetchJobs(jobsPage + 1, true);
    }
  };

  if (initialLoad && isLoadingJobs) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-2/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!jobs.length && !isLoadingJobs && !initialLoad) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Active Jobs
        </h3>
        <p className="text-gray-500">
          This company does not have any active job postings at the moment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Open Positions ({totalJobs})
          </h2>
        </div>
        <div className="space-y-4">
          {jobs.map((job) => (
            <CompanyJobCard key={job.id} job={job} />
          ))}
        </div>

        {hasMoreJobs && (
          <div className="text-center pt-4">
            <button
              onClick={loadMoreJobs}
              disabled={isLoadingJobs}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingJobs ? 'Loading...' : 'Load More Jobs'}
            </button>
          </div>
        )}

        {isLoadingJobs && !initialLoad && jobs.length > 0 && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span>Loading more jobs...</span>
            </div>
          </div>
        )}
      </div>
      <CVSubmitModal />
    </>
  );
}
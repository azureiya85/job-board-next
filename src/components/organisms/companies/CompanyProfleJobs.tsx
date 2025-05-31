'use client';

import { useEffect, useState } from 'react';
import { MapPin, Clock, DollarSign, Users, Calendar, Briefcase } from 'lucide-react';
import { useCompanyProfileStore, JobPostingInStore } from '@/stores/companyProfileStores';
import { formatDistanceToNow } from 'date-fns';
import type { JobPosting, City, Province, EmploymentType, ExperienceLevel } from '@prisma/client';

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
  console.log('[CompanyProfileJobs] Attempting to fetch jobs for companyId:', companyId, 'page:', pageToFetch);

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

    // Construct query parameters carefully
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      take: take.toString(),
    });
    // Add other filters 
    // if (filters.category) queryParams.append('category', filters.category);

    const response = await fetch(
      `${apiUrl}/api/companies/${companyId}/jobs?${queryParams.toString()}`
    );
      
      if (!response.ok) {
        // Log more details for failed requests
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
  console.log('[CompanyProfileJobs] useEffect - companyId:', companyId, 'initialLoad:', initialLoad);
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

  const formatSalary = (minSalary?: number, maxSalary?: number) => {
    const formatNumber = (num: number) => num.toLocaleString('id-ID');

    if (minSalary && maxSalary) {
      if (minSalary === maxSalary) return `Rp ${formatNumber(minSalary)}`;
      return `Rp ${formatNumber(minSalary)} - Rp ${formatNumber(maxSalary)}`;
    }
    if (minSalary) return `Rp ${formatNumber(minSalary)}+`;
    if (maxSalary) return `Up to Rp ${formatNumber(maxSalary)}`;
    
    return 'Competitive'; 
  };

  const formatJobType = (type: EmploymentType) => {
    const typeMap: Record<EmploymentType, string> = {
      FULL_TIME: 'Full Time',
      PART_TIME: 'Part Time',
      CONTRACT: 'Contract',
      INTERNSHIP: 'Internship',
      FREELANCE: 'Freelance',
      REMOTE: 'Remote Work', 
    };
    return typeMap[type] || type;
  };

  const formatWorkType = (workType: string) => { 
    const workTypeMap: Record<string, string> = {
      ON_SITE: 'On-site',
      REMOTE: 'Remote',
      HYBRID: 'Hybrid'
    };
    return workTypeMap[workType] || workType;
  };

  const formatExperienceLevel = (level: ExperienceLevel) => {
    const levelMap: Record<ExperienceLevel, string> = {
      ENTRY_LEVEL: 'Entry Level',
      MID_LEVEL: 'Mid Level',
      SENIOR_LEVEL: 'Senior Level',
      EXECUTIVE: 'Executive',
    };
    return levelMap[level] || level;
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
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Open Positions ({totalJobs})
        </h2>
      </div>
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {job.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatJobType(job.type)}</span> 
                  </div>
                   <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                     <span>{formatWorkType(job.workType)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{formatExperienceLevel(job.experienceLevel)}</span> 
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Apply Now
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 line-clamp-3">
                {job.description}
              </p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  {job.requirements.slice(0, 3).map((requirement, index) => (
                    <li key={index}>
                      {requirement}
                    </li>
                  ))}
                  {job.requirements.length > 3 && (
                    <li className="text-blue-600 font-medium">
                      +{job.requirements.length - 3} more requirements
                    </li>
                  )}
                </ul>
              </div>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.slice(0, 4).map((benefit, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full"
                    >
                      {benefit}
                    </span>
                  ))}
                  {job.benefits.length > 4 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      +{job.benefits.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {job.applicationDeadline && (
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Application deadline: {new Date(job.applicationDeadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
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
  );
}
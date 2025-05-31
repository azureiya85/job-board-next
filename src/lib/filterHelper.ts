import { JobPostingFeatured } from '@/types';

export interface FilterParams {
  category?: string;
  experienceLevel?: string;
  employmentType?: string;
  companySize?: string | null;
  isRemote?: boolean;
  cityName?: string;
  provinceName?: string;
}

export function buildRelatedJobsQuery(
  currentJob: JobPostingFeatured,
  attempt: number
): string {
  const params = new URLSearchParams();
  params.append('take', '12');
  params.append('skip', '0');

  const filterParams: FilterParams = {
    category: currentJob.category,
    experienceLevel: currentJob.experienceLevel,
    employmentType: currentJob.employmentType,
    companySize: currentJob.company?.size ?? null,
    isRemote: currentJob.isRemote,
    cityName: currentJob.city?.name,
    provinceName: currentJob.province?.name,
  };

  // --- Attempt-based filtering ---

  // Attempt 1: Strictest (Category + Experience + Employment Type + Location/Remote + Company Size)
  if (attempt === 1) {
    if (filterParams.category) params.append('categories', filterParams.category);
    if (filterParams.experienceLevel) params.append('experienceLevels', filterParams.experienceLevel);
    if (filterParams.employmentType) params.append('employmentTypes', filterParams.employmentType);
    if (filterParams.companySize) params.append('companySizes', filterParams.companySize);
    
    if (filterParams.isRemote) {
      params.append('isRemote', 'true');
    } else if (filterParams.cityName) {
      params.append('locationQuery', filterParams.cityName);
    }
  } 
  // Attempt 2: Medium (Category + Experience + Location/Remote)
  else if (attempt === 2) {
    if (filterParams.category) params.append('categories', filterParams.category);
    if (filterParams.experienceLevel) params.append('experienceLevels', filterParams.experienceLevel);

    if (filterParams.isRemote) {
      params.append('isRemote', 'true');
    } else if (filterParams.cityName) {
      params.append('locationQuery', filterParams.cityName);
    }
  } 
  // Attempt 3: Looser (Category + Location/Remote OR just Category)
  else if (attempt === 3) {
    if (filterParams.category) params.append('categories', filterParams.category);
    
    if (filterParams.isRemote) {
      params.append('isRemote', 'true');
    } else if (filterParams.cityName) {
      params.append('locationQuery', filterParams.cityName);
    } else if (filterParams.provinceName) { 
      params.append('locationQuery', filterParams.provinceName); 
    }
  }
  // Attempt 4 (Fallback): Broadest (Just Category, or if no category, then nothing specific)
  else { 
    if (filterParams.category) {
      params.append('categories', filterParams.category);
    }
  }
  
  return params.toString();
}

export function filterRelatedJobs(
  jobs: JobPostingFeatured[],
  currentJobId: string,
  maxResults: number = 5
): JobPostingFeatured[] {
  return jobs
    .filter((job: JobPostingFeatured) => job.id !== currentJobId)
    .slice(0, maxResults);
}

export function parseJobsResponse(responseData: unknown): JobPostingFeatured[] {
  let fetchedJobsArray: JobPostingFeatured[] = [];

  if (Array.isArray(responseData)) {
    fetchedJobsArray = responseData as JobPostingFeatured[];
  } else if (
    responseData &&
    typeof responseData === 'object' &&
    'data' in responseData &&
    Array.isArray((responseData as { data: unknown }).data)
  ) {
    fetchedJobsArray = (responseData as { data: JobPostingFeatured[] }).data;
  } else {
    console.warn('API response for jobs not in expected format:', responseData);
  }

  return fetchedJobsArray;
}
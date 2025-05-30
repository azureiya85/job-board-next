import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { JobPostingFeatured, GetJobsParams } from '@/types'; 
import { JobCategory, EmploymentType, ExperienceLevel, CompanySize } from '@prisma/client';

// --- Types for the store ---
export interface JobSearchState { 
  // UI Input States
  searchTermInput: string;      
  locationSearchInput: string;  

  // Filter States 
  categories?: JobCategory[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  companySizes?: CompanySize[];
  isRemote?: boolean;

  // Data states
  jobs: JobPostingFeatured[];
  isLoading: boolean;
  error: string | null;
  totalJobs: number;

  // Pagination states
  currentPage: number;
  pageSize: number;
  skip?: number; 
  take?: number;
}

export interface JobSearchActions {
  setSearchTermInput: (term: string) => void;
  setLocationSearchInput: (location: string) => void;
  setCategories: (categories: JobCategory[]) => void;
  setEmploymentTypes: (types: EmploymentType[]) => void;
  setExperienceLevels: (levels: ExperienceLevel[]) => void;
  setCompanySizes: (sizes: CompanySize[]) => void;
  setIsRemote: (isRemote?: boolean) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  fetchJobs: () => Promise<void>;
  resetFilters: () => void;
}

// --- Initial State for the UI and Filters ---
const initialUiAndFilterState = {
  searchTermInput: '',
  locationSearchInput: '',
  categories: [],
  employmentTypes: [],
  experienceLevels: [],
  companySizes: [],
  isRemote: undefined,
  currentPage: 1,
  pageSize: 10,
  take: 10, 
  skip: 0,  
};

const initialState: JobSearchState = {
  ...initialUiAndFilterState,
  jobs: [],
  isLoading: false,
  error: null,
  totalJobs: 0,
};

// --- API Fetching Logic ---
async function fetchJobsFromApi(params: GetJobsParams): Promise<{jobs: JobPostingFeatured[], totalCount: number}> {
  const query = new URLSearchParams();
  // Map from GetJobsParams to query params
  if (params.jobTitle) query.set('jobTitle', params.jobTitle); 
  if (params.locationQuery) query.set('locationQuery', params.locationQuery); 
  if (params.categories && params.categories.length > 0) params.categories.forEach(cat => query.append('categories', cat));
  if (params.employmentTypes && params.employmentTypes.length > 0) params.employmentTypes.forEach(type => query.append('employmentTypes', type));
  if (params.experienceLevels && params.experienceLevels.length > 0) params.experienceLevels.forEach(level => query.append('experienceLevels', level));
  if (params.companySizes && params.companySizes.length > 0) params.companySizes.forEach(size => query.append('companySizes', size));
  if (typeof params.isRemote === 'boolean') query.set('isRemote', String(params.isRemote));
  if (params.take) query.set('take', String(params.take));
  if (params.skip) query.set('skip', String(params.skip));
  
  const response = await fetch(`/api/jobs?${query.toString()}`);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error fetching jobs:", response.status, errorText);
    throw new Error(`Failed to fetch jobs: ${response.status} ${errorText || response.statusText}`);
  }
  const data = await response.json();
  const totalCount = Array.isArray(data) ? data.length : (data.jobs ? data.totalCount || data.jobs.length : 0);
  const jobsArray = Array.isArray(data) ? data : (data.jobs || []);

  return { jobs: jobsArray, totalCount };
}

// --- Create the Store ---
export const useJobSearchStore = create<JobSearchState & JobSearchActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Setters for UI inputs
      setSearchTermInput: (term) => set({ searchTermInput: term }),
      setLocationSearchInput: (location) => set({ locationSearchInput: location }),
      
      // Setters for direct filters
      setCategories: (categories) => set({ categories }),
      setEmploymentTypes: (types) => set({ employmentTypes: types }),
      setExperienceLevels: (levels) => set({ experienceLevels: levels }),
      setCompanySizes: (sizes) => set({ companySizes: sizes }),
      setIsRemote: (isRemote) => set({ isRemote }),
      
      setCurrentPage: (page) => {
        set((state) => ({ 
          currentPage: page,
          skip: (page - 1) * state.pageSize
        }));
      },
      setPageSize: (size) => {
        set(() => ({ 
          pageSize: size,
          take: size,
          currentPage: 1,
          skip: 0,
        }));
      },

      fetchJobs: async () => {
        const { 
          searchTermInput, locationSearchInput, categories, employmentTypes, 
          experienceLevels, companySizes, isRemote, take, skip 
        } = get();

        set({ isLoading: true, error: null });
        try {
          // Map store state (searchTermInput, locationSearchInput) to API params (jobTitle, locationQuery)
          const apiParams: GetJobsParams = {
            jobTitle: searchTermInput || undefined, 
            locationQuery: locationSearchInput || undefined, 
            categories: categories && categories.length > 0 ? categories : undefined,
            employmentTypes: employmentTypes && employmentTypes.length > 0 ? employmentTypes : undefined,
            experienceLevels: experienceLevels && experienceLevels.length > 0 ? experienceLevels : undefined,
            companySizes: companySizes && companySizes.length > 0 ? companySizes : undefined,
            isRemote,
            take,
            skip,
          };
          const { jobs, totalCount } = await fetchJobsFromApi(apiParams);
          set({ jobs, totalJobs: totalCount, isLoading: false });
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          set({ error: errorMessage, isLoading: false, jobs: [] });
        }
      },

      resetFilters: () => {
        set({ 
          ...initialUiAndFilterState, // Reset to the UI and filter initial state
           jobs: [],
           error: null,
        });
        get().fetchJobs(); // Fetch jobs with the initial state
      },
    }),
  )
);
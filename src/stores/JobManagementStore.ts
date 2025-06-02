import { create } from 'zustand';
import type { JobPosting } from '@prisma/client'; 
import type { JobApplicationDetails, ApplicationFilters } from '@/types/applicants';

// Extend JobPosting if your API returns _count
export interface JobPostingWithApplicantCount extends JobPosting {
  _count?: {
    applications: number;
  };
  company?: { id: string; name: string; logo?: string | null };
  location?: string; // Assuming this is derived or part of the job data
}


interface JobManagementState {
  // For Job List in CompanyJobsManagement
  jobs: JobPostingWithApplicantCount[];
  isLoadingJobs: boolean;
  jobsError: string | null;
  jobFilters: { search?: string; status?: string /* other filters */ };
  jobPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  setJobs: (jobs: JobPostingWithApplicantCount[]) => void;
  setIsLoadingJobs: (loading: boolean) => void;
  setJobsError: (error: string | null) => void;
  setJobPagination: (pagination: Partial<JobManagementState['jobPagination']>) => void;

  // For ApplicantListModal
  selectedJobForApplicants: JobPostingWithApplicantCount | null;
  isApplicantModalOpen: boolean;
  applicants: JobApplicationDetails[];
  isLoadingApplicants: boolean;
  applicantsError: string | null;
  applicantFilters: ApplicationFilters;
  applicantPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  setSelectedJobForApplicants: (job: JobPostingWithApplicantCount | null) => void;
  setIsApplicantModalOpen: (isOpen: boolean) => void;
  setApplicants: (applicants: JobApplicationDetails[]) => void;
  setIsLoadingApplicants: (loading: boolean) => void;
  setApplicantsError: (error: string | null) => void;
  setApplicantFilters: (filters: ApplicationFilters) => void;
  setApplicantPagination: (pagination: Partial<JobManagementState['applicantPagination']>) => void;
  updateApplicantInList: (updatedApplicant: JobApplicationDetails) => void;
  removeJobFromList: (jobId: string) => void;
  updateJobInList: (updatedJob: JobPostingWithApplicantCount) => void;
}

export const useJobManagementStore = create<JobManagementState>((set) => ({
  // Job List State
  jobs: [],
  isLoadingJobs: false,
  jobsError: null,
  jobFilters: {},
  jobPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
  setJobs: (jobs) => set({ jobs }),
  setIsLoadingJobs: (isLoadingJobs) => set({ isLoadingJobs }),
  setJobsError: (jobsError) => set({ jobsError }),
  setJobPagination: (pagination) => set((state) => ({
    jobPagination: { ...state.jobPagination, ...pagination }
  })),

  // Applicant Modal State
  selectedJobForApplicants: null,
  isApplicantModalOpen: false,
  applicants: [],
  isLoadingApplicants: false,
  applicantsError: null,
  applicantFilters: { sortBy: 'createdAt', sortOrder: 'asc' }, // Default sort by oldest
  applicantPagination: { page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
  setSelectedJobForApplicants: (job) => set({ selectedJobForApplicants: job, isApplicantModalOpen: !!job }),
  setIsApplicantModalOpen: (isOpen) => set({ isApplicantModalOpen: isOpen }),
  setApplicants: (applicants) => set({ applicants }),
  setIsLoadingApplicants: (isLoadingApplicants) => set({ isLoadingApplicants }),
  setApplicantsError: (applicantsError) => set({ applicantsError }),
  setApplicantFilters: (applicantFilters) => set({ applicantFilters }),
  setApplicantPagination: (pagination) => set(state => ({
    applicantPagination: { ...state.applicantPagination, ...pagination }
  })),
  updateApplicantInList: (updatedApplicant) => set(state => ({
    applicants: state.applicants.map(app => app.id === updatedApplicant.id ? updatedApplicant : app)
  })),
  removeJobFromList: (jobId) => set(state => ({
    jobs: state.jobs.filter(job => job.id !== jobId)
  })),
  updateJobInList: (updatedJob) => set(state => ({
    jobs: state.jobs.map(job => job.id === updatedJob.id ? { ...job, ...updatedJob } : job)
  })),
}));
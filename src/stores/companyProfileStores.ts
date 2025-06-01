import { create } from 'zustand';
import type { CompanyDetailed } from '@/types';
import type { EmploymentType, ExperienceLevel } from '@prisma/client'; 

// Extended tab types for company profile
export type BaseTabId = 'overview' | 'jobs';
export type AdminTabId = 'profile-management' | 'job-management';
export type CompanyProfileTabId = BaseTabId | AdminTabId;

// Company info for job postings
export interface JobCompanyInfo {
  id: string;
  name: string;
  logo?: string | null;
  adminId: string;
}

export interface JobPostingInStore {
  isPriority?: boolean;
  id: string;
  title: string;
  type: EmploymentType; 
  workType: string;
  location: string;
  minSalary?: number;
  maxSalary?: number;
  description: string;
  requirements: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  applicationDeadline?: string;
  experienceLevel: ExperienceLevel;
  company?: JobCompanyInfo;
}

interface CompanyProfileState {
  company: CompanyDetailed | null;
  jobs: JobPostingInStore[];
  activeTab: CompanyProfileTabId; // Updated to use extended type
  isLoadingCompany: boolean;
  isLoadingJobs: boolean;
  jobsPage: number;
  hasMoreJobs: boolean;
  totalJobs: number;
  setCompany: (company: CompanyDetailed) => void;
  setJobs: (jobs: JobPostingInStore[]) => void;
  addJobs: (jobs: JobPostingInStore[]) => void;
  setActiveTab: (tab: CompanyProfileTabId) => void; // Updated to use extended type
  setLoadingCompany: (loading: boolean) => void;
  setLoadingJobs: (loading: boolean) => void;
  setJobsPagination: (page: number, hasMore: boolean, total: number) => void;
  resetStore: () => void;
}

export const useCompanyProfileStore = create<CompanyProfileState>((set) => ({
  company: null,
  jobs: [],
  activeTab: 'overview',
  isLoadingCompany: false,
  isLoadingJobs: false,
  jobsPage: 1,
  hasMoreJobs: true,
  totalJobs: 0,
  setCompany: (company) => set({ company }),
  setJobs: (jobs) => set({ jobs }),
  addJobs: (newJobs) => set((state) => ({
    jobs: [...state.jobs, ...newJobs]
  })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLoadingCompany: (loading) => set({ isLoadingCompany: loading }),
  setLoadingJobs: (loading) => set({ isLoadingJobs: loading }),
  setJobsPagination: (page, hasMore, total) => set({
    jobsPage: page,
    hasMoreJobs: hasMore,
    totalJobs: total
  }),
  resetStore: () => set({
    company: null,
    jobs: [],
    activeTab: 'overview',
    isLoadingCompany: false,
    isLoadingJobs: false,
    jobsPage: 1,
    hasMoreJobs: true,
    totalJobs: 0
  })
}));
import { create } from 'zustand';
import { ApplicationStatus } from '@prisma/client';
import type {
  ApplicationsZustandState,
  ApplicationsZustandActions,
  UpdateApplicationRequestBody,
} from '@/types/applicants';

const initialState: ApplicationsZustandState = {
  applications: [],
  selectedApplications: [],
  currentApplication: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    sortBy: 'createdAt',
    sortOrder: 'asc',
  },
  isLoading: false,
  error: null,
  isUpdating: false,
  statistics: {
    total: 0,
    byStatus: {
      [ApplicationStatus.PENDING]: 0,
      [ApplicationStatus.REVIEWED]: 0,
      [ApplicationStatus.INTERVIEW_SCHEDULED]: 0,
      [ApplicationStatus.INTERVIEW_COMPLETED]: 0,
      [ApplicationStatus.ACCEPTED]: 0,
      [ApplicationStatus.REJECTED]: 0,
      [ApplicationStatus.WITHDRAWN]: 0,
    },
    byEducation: {},
    ageRange: { min: null, max: null },
    salaryRange: { min: null, max: null },
    withCV: 0,
    withCoverLetter: 0,
    withTestScore: 0,
  },
  currentCompanyIdForStore: null,
  currentJobPostingIdForStore: null,
};

export const useApplicantsStore = create<ApplicationsZustandState & ApplicationsZustandActions>((set, get) => ({
  ...initialState,
  
  // Data fetching
  fetchApplications: async (companyId: string, jobPostingId?: string | null) => {
    set({ 
      isLoading: true, 
      error: null,
      currentCompanyIdForStore: companyId,
      currentJobPostingIdForStore: jobPostingId || null,
    });
    
    try {
      const { filters, pagination } = get();
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });
      
      // Add pagination
      params.set('page', String(pagination.page));
      params.set('limit', String(pagination.limit));
      
      // Add job posting filter if specified
      if (jobPostingId) {
        params.set('jobPostingId', jobPostingId);
      }
      
      const response = await fetch(
        `/api/companies/${companyId}/jobs/applicants?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      
      set({
        applications: data.applications,
        pagination: data.pagination,
        statistics: data.statistics || initialState.statistics,
        isLoading: false,
      });
      
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isLoading: false,
      });
    }
  },
  
  refreshApplications: async () => {
    const { currentCompanyIdForStore, currentJobPostingIdForStore, fetchApplications } = get();
    
    if (!currentCompanyIdForStore) {
      set({ error: 'No company context available for refresh' });
      return;
    }
    
    await fetchApplications(currentCompanyIdForStore, currentJobPostingIdForStore);
  },
  
  // Single application actions
  updateApplicationStatus: async (companyId, applicationId, status, options = {}) => {
    set({ isUpdating: true, error: null });
    
    try {
      const requestBody: UpdateApplicationRequestBody = {
        applicationId,
        status,
        rejectionReason: options.rejectionReason || undefined,
        adminNotes: options.adminNotes || undefined,
        scheduleInterview: options.scheduleInterview || undefined,
      };

      const response = await fetch(
        `/api/companies/${companyId}/jobs/applicants`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      // Update local state
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === applicationId
            ? { 
                ...app, 
                status, 
                updatedAt: new Date(),
                rejectionReason: options.rejectionReason || app.rejectionReason,
                adminNotes: options.adminNotes || app.adminNotes,
              }
            : app
        ),
        isUpdating: false,
      }));
      
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update status',
        isUpdating: false,
      });
      return false;
    }
  },
  
  setCurrentApplication: (application) => {
    set({ currentApplication: application });
  },
  
  // Selection actions
  selectApplication: (applicationId) => {
    set((state) => ({
      selectedApplications: state.selectedApplications.includes(applicationId)
        ? state.selectedApplications
        : [...state.selectedApplications, applicationId],
    }));
  },
  
  selectAllApplications: () => {
    set((state) => ({
      selectedApplications: state.applications.map((app) => app.id),
    }));
  },
  
  deselectApplication: (applicationId) => {
    set((state) => ({
      selectedApplications: state.selectedApplications.filter((id) => id !== applicationId),
    }));
  },
  
  clearSelection: () => {
    set({ selectedApplications: [] });
  },
  
  bulkUpdateStatus: async (companyId, status, options = {}) => {
    const { selectedApplications, updateApplicationStatus } = get();
    
    if (selectedApplications.length === 0) {
      return false;
    }
    
    set({ isUpdating: true });
    
    try {
      const promises = selectedApplications.map((applicationId) =>
        updateApplicationStatus(companyId, applicationId, status, options)
      );
      
      const results = await Promise.all(promises);
      const success = results.every((result) => result);
      
      if (success) {
        set({ selectedApplications: [] }); // Clear selection after successful bulk update
      }
      
      return success;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      set({
        error: 'Failed to update applications',
        isUpdating: false,
      });
      return false;
    }
  },
  
  // Filters & Search
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }, // Reset to first page when filtering
    }));
  },
  
  clearFilters: () => {
    set({
      filters: {
        sortBy: 'createdAt',
        sortOrder: 'asc',
      },
      pagination: { ...get().pagination, page: 1 },
    });
  },
  
  setPagination: (page, limit) => {
    set((state) => ({
      pagination: {
        ...state.pagination,
        page,
        ...(limit && { limit }),
      },
    }));
  },
  
  // UI State
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setUpdating: (updating) => set({ isUpdating: updating }),
  
  // Context management
  setCurrentContextForStore: (companyId, jobPostingId = null) => {
    set({ 
      currentCompanyIdForStore: companyId,
      currentJobPostingIdForStore: jobPostingId,
    });
  },
  
  // Reset
  reset: () => set(initialState),
}));

// Selectors for easier state access
export const useApplicationsData = () => useApplicantsStore((state) => ({
  applications: state.applications,
  pagination: state.pagination,
  statistics: state.statistics,
}));

export const useApplicationsFilters = () => useApplicantsStore((state) => ({
  filters: state.filters,
  setFilters: state.setFilters,
  clearFilters: state.clearFilters,
}));

export const useApplicationsSelection = () => useApplicantsStore((state) => ({
  selectedApplications: state.selectedApplications,
  selectApplication: state.selectApplication,
  selectAllApplications: state.selectAllApplications,
  deselectApplication: state.deselectApplication,
  clearSelection: state.clearSelection,
}));

export const useApplicationsStatus = () => useApplicantsStore((state) => ({
  isLoading: state.isLoading,
  error: state.error,
  isUpdating: state.isUpdating,
}));

export const useCurrentApplication = () => useApplicantsStore((state) => ({
  currentApplication: state.currentApplication,
  setCurrentApplication: state.setCurrentApplication,
}));

export const useApplicationsContext = () => useApplicantsStore((state) => ({
  currentCompanyIdForStore: state.currentCompanyIdForStore,
  currentJobPostingIdForStore: state.currentJobPostingIdForStore,
  setCurrentContextForStore: state.setCurrentContextForStore,
}));
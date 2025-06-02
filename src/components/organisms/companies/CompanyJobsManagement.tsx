'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useJobManagementStore } from '@/stores/JobManagementStore';
import { useCompanyProfileStore } from '@/stores/companyProfileStores'; 
import CompanyJobCardAdmin from '@/components/molecules/companies/CompanyJobCardAdmin';
import ApplicantListModal from '@/components/atoms/modals/companies/ApplicationListModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Loader2, AlertTriangle, RefreshCw, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const DEBOUNCE_DELAY_JOBS = 500;

export default function CompanyJobsManagement() {
  const {
    jobs,
    setJobs,
    isLoadingJobs,
    setIsLoadingJobs,
    jobsError,
    setJobsError,
    jobPagination,
    setJobPagination,
  } = useJobManagementStore();
  
  const company = useCompanyProfileStore(state => state.company);
  const [searchTerm, setSearchTerm] = useState('');

  const companyId = company?.id;

 const fetchJobs = useCallback(async (cId: string, page: number, limit: number, search?: string) => {
    if (!cId) return; // Guard against undefined companyId
    setIsLoadingJobs(true);
    setJobsError(null);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        take: String(limit),
        skip: String((page - 1) * limit),
      });
      if (search) queryParams.append('search', search);

      const response = await fetch(`/api/companies/${cId}/jobs?${queryParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data.jobPostings || []);
      setJobPagination({
        page: data.pagination.page,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasNext: data.pagination.hasNext,
        hasPrev: data.pagination.hasPrev,
        limit: limit,
      });
    } catch (error) {
      console.error("Fetch jobs error:", error);
      setJobsError(error instanceof Error ? error.message : 'An unknown error occurred');
      setJobs([]);
    } finally {
      setIsLoadingJobs(false);
    }
  }, [setIsLoadingJobs, setJobsError, setJobs, setJobPagination]); 


  // Initial fetch and page change fetch
  useEffect(() => {
    if (companyId) {
      // For the initial load or page change, use the current searchTerm from state
      fetchJobs(companyId, jobPagination.page, jobPagination.limit, searchTerm || undefined);
    }
  }, [companyId, jobPagination.page, jobPagination.limit, fetchJobs, searchTerm]); 


  // Debounced search effect
  useEffect(() => {
    if (!companyId) return;
    const handler = setTimeout(() => {
      fetchJobs(companyId, 1, jobPagination.limit, searchTerm || undefined);
    }, DEBOUNCE_DELAY_JOBS);

    return () => clearTimeout(handler);
  }, [searchTerm, companyId, jobPagination.limit, fetchJobs]); 

  const handlePageChange = (newPage: number) => {
    setJobPagination({ page: newPage });
  };

  const handleCreateJob = () => {
    toast.info("Create Job Posting feature is under construction.");
  };

  if (!companyId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Company information is not available. Please select a company.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Top Bar: Create Button & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-50 rounded-lg border">
        <Button onClick={handleCreateJob}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Job Posting
        </Button>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Add Sort Dropdown if needed */}
        </div>
      </div>

      {/* Job List Area */}
      {isLoadingJobs && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2">Loading jobs...</p>
        </div>
      )}

      {jobsError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <p>Error loading jobs: {jobsError}</p>
           <Button onClick={() => fetchJobs(companyId, jobPagination.page, jobPagination.limit, searchTerm || undefined)} variant="ghost" size="sm" className="ml-auto">
            <RefreshCw className="w-4 h-4 mr-1"/> Retry
          </Button>
        </div>
      )}

      {!isLoadingJobs && !jobsError && jobs.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-2" />
          No job postings found.
          {searchTerm && <p className="text-sm">Try adjusting your search term.</p>}
        </div>
      )}

      {!isLoadingJobs && !jobsError && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <CompanyJobCardAdmin key={job.id} job={job} companyId={companyId} />
          ))}
        </div>
      )}

      {/* Pagination for Jobs */}
      {!isLoadingJobs && !jobsError && jobPagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          <Button
            onClick={() => handlePageChange(jobPagination.page - 1)}
            disabled={!jobPagination.hasPrev}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {jobPagination.page} of {jobPagination.totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(jobPagination.page + 1)}
            disabled={!jobPagination.hasNext}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}

      {/* Applicant List Modal */}
      <ApplicantListModal />
    </div>
  );
}
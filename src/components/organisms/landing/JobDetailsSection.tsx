'use client';

import {
  useJobSearchStore,
  JobSearchState,   
  JobSearchActions  
} from '@/stores/jobSearchStore';
import { JobCard } from '@/components/molecules/landing/JobCard';
import { AlertCircle, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function JobDetailsSection() {
  // Select individual state slices and actions 
  const jobs = useJobSearchStore((state: JobSearchState) => state.jobs);
  const isLoading = useJobSearchStore((state: JobSearchState) => state.isLoading);
  const error = useJobSearchStore((state: JobSearchState) => state.error);
  const totalJobs = useJobSearchStore((state: JobSearchState) => state.totalJobs);
  const currentPage = useJobSearchStore((state: JobSearchState) => state.currentPage);
  const pageSize = useJobSearchStore((state: JobSearchState) => state.pageSize);
  const setCurrentPage = useJobSearchStore((state: JobSearchActions) => state.setCurrentPage);
  const totalPages = Math.ceil(totalJobs / pageSize);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(pageSize || 3)].map((_, i) => ( 
          <div key={i} className="p-6 bg-card rounded-lg shadow-sm border animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive-foreground rounded-lg border border-destructive flex items-center gap-3">
        <AlertCircle className="h-6 w-6" />
        <div>
            <p className="font-semibold">Error loading jobs:</p>
            <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0 && !isLoading) {
    return (
      <div className="p-10 text-center bg-card rounded-lg shadow-sm border">
        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Jobs Found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}

      {totalJobs > 0 && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isLoading} 
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isLoading} 
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
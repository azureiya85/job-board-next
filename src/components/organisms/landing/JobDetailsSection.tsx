'use client';

import {
  useJobSearchStore,
  JobSearchState,   
  JobSearchActions  
} from '@/stores/jobSearchStore';
import { JobCard } from '@/components/molecules/landing/JobCard';
import { AlertCircle, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function JobDetailsSection() {
  // Select individual state slices and actions 
  const jobs = useJobSearchStore((state: JobSearchState) => state.jobs);
  const isLoading = useJobSearchStore((state: JobSearchState) => state.isLoading);
  const error = useJobSearchStore((state: JobSearchState) => state.error);
  const totalJobs = useJobSearchStore((state: JobSearchState) => state.totalJobs);
  const currentPage = useJobSearchStore((state: JobSearchState) => state.currentPage);
  const pageSize = useJobSearchStore((state: JobSearchState) => state.pageSize);
  const setCurrentPage = useJobSearchStore((state: JobSearchActions) => state.setCurrentPage);

  // Local state for hybrid pagination
  const [loadMoreCount, setLoadMoreCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const JOBS_PER_LOAD = 10; // Display 10 jobs per load
  const MAX_LOAD_MORE_CYCLES = 4; // Allow up to 4 load more cycles

  const totalPages = Math.ceil(totalJobs / pageSize);
  
  // Calculate how many jobs to show based on load more cycles
  const jobsToShow = JOBS_PER_LOAD * (loadMoreCount + 1);
  const displayJobs = jobs.slice(0, jobsToShow);
  const currentJobsShown = displayJobs.length;
  
  const isInLoadMoreMode = loadMoreCount < MAX_LOAD_MORE_CYCLES && currentPage === 1;
  const canLoadMore = isInLoadMoreMode && currentJobsShown < jobs.length;

  const handleLoadMore = async () => {
    if (canLoadMore && !isLoadingMore) {
      setIsLoadingMore(true);
  
      setTimeout(() => {
        setLoadMoreCount(prev => prev + 1);
        setIsLoadingMore(false);
      }, 300); 
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setLoadMoreCount(0);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setLoadMoreCount(0);
    }
  };

  const handleSwitchToTraditionalPagination = () => {
    // Switch to page 2 to enable traditional pagination
    setCurrentPage(2);
    setLoadMoreCount(0);
  };

  if (isLoading && currentPage === 1 && loadMoreCount === 0) {
    return (
      <div className="space-y-4">
        {[...Array(JOBS_PER_LOAD)].map((_, i) => ( 
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

  if (displayJobs.length === 0 && !isLoading) {
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
      {/* Job Results Counter */}
      <div className="text-sm text-muted-foreground mb-4">
        Showing {currentJobsShown} of {jobs.length} jobs
        {totalJobs > jobs.length && (
          <span className="ml-1">({totalJobs} total in database)</span>
        )}
        {currentPage > 1 && (
          <span className="ml-2">
            (Page {currentPage} of {totalPages})
          </span>
        )}
      </div>

      {/* Job Cards */}
      {displayJobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}

      {/* Hybrid Pagination Controls */}
      <div className="mt-8 flex flex-col items-center gap-4">
        {/* Load More Button (first 3 cycles) */}
        {canLoadMore && (
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              variant="outline"
              size="lg"
              className="min-w-[120px]"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                `Load More (${Math.min(JOBS_PER_LOAD, jobs.length - currentJobsShown)} more)`
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              {loadMoreCount + 1} of {MAX_LOAD_MORE_CYCLES} quick loads
            </p>
          </div>
        )}

        {/* Transition to Traditional Pagination */}
        {isInLoadMoreMode && loadMoreCount >= MAX_LOAD_MORE_CYCLES && currentJobsShown < jobs.length && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground text-center">
              You&#39;ve loaded {currentJobsShown} jobs. Switch to page navigation for more results.
            </p>
            <Button
              onClick={handleSwitchToTraditionalPagination}
              variant="default"
            >
              Continue with Page Navigation
            </Button>
          </div>
        )}

        {/* Traditional Pagination (when not in load more mode) */}
        {!isInLoadMoreMode && totalPages > 1 && (
          <div className="flex items-center gap-4">
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

        {/* Back to Load More Mode (when on page 2+) */}
        {!isInLoadMoreMode && currentPage > 1 && (
          <Button
            onClick={() => {
              setCurrentPage(1);
              setLoadMoreCount(0);
            }}
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            ← Back to first page
          </Button>
        )}
      </div>
    </div>
  );
}
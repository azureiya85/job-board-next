'use client';

import { FilteredBySection } from '@/components/organisms/landing/FilteredBySection';
import { SearchJobSection } from '@/components/organisms/landing/SearchJobSection';
import { JobDetailsSection } from '@/components/organisms/landing/JobDetailsSection';
import { useJobSearchStore } from '@/stores/jobSearchStore';
import { useEffect } from 'react';

export function JobListPage() {
  const fetchJobs = useJobSearchStore((state) => state.fetchJobs);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <section id="job-listing" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Left Column: Filters */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <FilteredBySection />
          </div>

          {/* Right Column: Search and Job Details */}
          <div className="w-full md:w-2/3 lg:w-3/4 space-y-8">
            <SearchJobSection />
            <JobDetailsSection />
          </div>
        </div>
      </div>
    </section>
  );
}
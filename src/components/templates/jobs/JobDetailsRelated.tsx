'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Briefcase, Loader2 } from 'lucide-react';
import { JobPostingFeatured } from '@/types'; 
import { RelatedJobCard } from '@/components/molecules/jobs/RelatedJobCard';
import { AnimatePresence } from 'framer-motion';

interface JobDetailsRelatedProps {
  currentJob: JobPostingFeatured;
}

export function JobDetailsRelated({ currentJob }: JobDetailsRelatedProps) {
  const [relatedJobs, setRelatedJobs] = useState<JobPostingFeatured[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Build query parameters based on attempt number
  const buildRelatedJobsQuery = useCallback((attempt: number): string => {
    const params = new URLSearchParams();
    params.append('take', '12'); 
    params.append('skip', '0');

    // --- Attempt-based filtering ---

    // Attempt 1: Strictest (Category + Experience + Employment Type + Location/Remote + Company Size)
    if (attempt === 1) {
      if (currentJob.category) params.append('categories', currentJob.category);
      if (currentJob.experienceLevel) params.append('experienceLevels', currentJob.experienceLevel);
      if (currentJob.employmentType) params.append('employmentTypes', currentJob.employmentType);
      if (currentJob.company?.size) params.append('companySizes', currentJob.company.size);
      
      if (currentJob.isRemote) {
        params.append('isRemote', 'true');
      } else if (currentJob.city?.name) {
        params.append('locationQuery', currentJob.city.name);
      }
    } 
    // Attempt 2: Medium (Category + Experience + Location/Remote)
    else if (attempt === 2) {
      if (currentJob.category) params.append('categories', currentJob.category);
      if (currentJob.experienceLevel) params.append('experienceLevels', currentJob.experienceLevel);

      if (currentJob.isRemote) {
        params.append('isRemote', 'true');
      } else if (currentJob.city?.name) {
        params.append('locationQuery', currentJob.city.name);
      }
    } 
    // Attempt 3: Looser (Category + Location/Remote OR just Category)
    else if (attempt === 3) {
      if (currentJob.category) params.append('categories', currentJob.category);
      
      if (currentJob.isRemote) {
        params.append('isRemote', 'true');
      } else if (currentJob.city?.name) {
        params.append('locationQuery', currentJob.city.name);
      } else if (currentJob.province?.name) { 
        params.append('locationQuery', currentJob.province.name); 
      }
    }
    // Attempt 4 (Fallback): Broadest (Just Category, or if no category, then nothing specific)
    else { 
        if (currentJob.category) {
            params.append('categories', currentJob.category);
        }
    }
    
    return params.toString();
  }, [
    currentJob.category,
    currentJob.experienceLevel,
    currentJob.employmentType,
    currentJob.company, 
    currentJob.isRemote,
    currentJob.city,   
    currentJob.province 
  ]);

  // Fetch related jobs with multi-stage attempts
  const fetchRelatedJobs = useCallback(async (attempt = 1) => {
    if (attempt === 1) {
        setIsLoading(true);
        setError(null);
        setRelatedJobs([]); 
    }
    
    console.log(`Fetching related jobs, attempt: ${attempt}`);

    try {
      const queryString = buildRelatedJobsQuery(attempt);
      if (!queryString.includes('take=')) { // Basic check if params were even generated
          console.warn("Query string seems empty, might not fetch anything useful.", queryString);
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/jobs?${queryString}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch related jobs (attempt ${attempt}, status: ${response.status})`);
      }

      const responseData: unknown = await response.json();
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
        console.warn(`API response for jobs (attempt ${attempt}) not in expected format:`, responseData);
      }
      
      const filteredJobs = fetchedJobsArray
        .filter((job: JobPostingFeatured) => job.id !== currentJob.id)
        .slice(0, 5); 

      console.log(`Attempt ${attempt} yielded ${filteredJobs.length} filtered jobs.`);

      const MAX_ATTEMPTS = 4; 
      if (filteredJobs.length >= 3 || attempt >= MAX_ATTEMPTS) {
        setRelatedJobs(filteredJobs);
        setIsLoading(false); 
        if (filteredJobs.length === 0 && attempt >= MAX_ATTEMPTS) {
            setError("Could not find suitably related jobs after several tries.");
        }
      } else {
        fetchRelatedJobs(attempt + 1);
      }

    } catch (err) {
      console.error(`Error fetching related jobs (attempt ${attempt}):`, err);
      const MAX_ATTEMPTS = 4;
      if (attempt < MAX_ATTEMPTS) {
        console.log(`Attempt ${attempt} failed, trying next attempt.`);
        fetchRelatedJobs(attempt + 1);
      } else {
        setError('Failed to load related jobs after multiple attempts.');
        setRelatedJobs([]); // Ensure no stale data is shown
        setIsLoading(false);
      }
    }
  }, [buildRelatedJobsQuery, currentJob.id]); 

  // Check scroll position and update button states
  const updateScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth -1); 
    }
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Initial fetch when currentJob.id changes
  useEffect(() => {
    if (currentJob.id) { 
        fetchRelatedJobs(1); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [currentJob.id]); 
  
  // Effect for scroll listeners and button updates
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && relatedJobs.length > 0) {
      updateScrollButtons(); // Initial check      
      const handleScrollOrResize = () => updateScrollButtons();
      container.addEventListener('scroll', handleScrollOrResize);
      window.addEventListener('resize', handleScrollOrResize);     
      const timeoutId = setTimeout(updateScrollButtons, 150); 
      
      return () => {
        if (container) {
            container.removeEventListener('scroll', handleScrollOrResize);
        }
        window.removeEventListener('resize', handleScrollOrResize);
        clearTimeout(timeoutId);
      };
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  }, [relatedJobs, updateScrollButtons]); 

  if (isLoading) {
    return (
      <Card className="border-2 border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Related Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading related jobs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Related Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedJobs.length === 0) {
    return (
      <Card className="border-2 border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Related Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No related jobs found at the moment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-border/50 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Related Jobs
          </CardTitle>
          
          {/* Scroll buttons */}
          {canScrollLeft || canScrollRight ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className="h-8 w-8 p-0 border-2 border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Scroll related jobs left"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollRight}
                disabled={!canScrollRight}
                className="h-8 w-8 p-0 border-2 border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Scroll related jobs right"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{
              scrollSnapType: 'x mandatory', 
            }}
          >
            <AnimatePresence>
              {relatedJobs.map((job, index) => (
                <RelatedJobCard
                  key={job.id}
                  job={job}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {(canScrollLeft || canScrollRight) && relatedJobs.length > 1 && (
            <div className="flex justify-center mt-4 gap-1">
              {Array.from({ length: Math.min(relatedJobs.length, 5) }).map((_, index) => ( 
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-muted-foreground/20 transition-colors duration-200"
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
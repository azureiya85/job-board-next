'use client';

import { useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import {
  useJobSearchStore,
  JobSearchState,   
  JobSearchActions 
} from '@/stores/jobSearchStore';

export function useDebouncedJobSearchActions(debounceMs: number = 500) {
  // --- Select individual state slices and actions ---
  const searchTermInput = useJobSearchStore((state: JobSearchState) => state.searchTermInput);
  const locationSearchInput = useJobSearchStore((state: JobSearchState) => state.locationSearchInput);
  const categories = useJobSearchStore((state: JobSearchState) => state.categories);
  const employmentTypes = useJobSearchStore((state: JobSearchState) => state.employmentTypes);
  const experienceLevels = useJobSearchStore((state: JobSearchState) => state.experienceLevels);
  const companySizes = useJobSearchStore((state: JobSearchState) => state.companySizes);
  const isRemote = useJobSearchStore((state: JobSearchState) => state.isRemote);
  const currentPage = useJobSearchStore((state: JobSearchState) => state.currentPage);
  const pageSize = useJobSearchStore((state: JobSearchState) => state.pageSize);

  const setSearchTermInput = useJobSearchStore((state: JobSearchActions) => state.setSearchTermInput);
  const setLocationSearchInput = useJobSearchStore((state: JobSearchActions) => state.setLocationSearchInput);
  const fetchJobs = useJobSearchStore((state: JobSearchActions) => state.fetchJobs);

  // Debounce the UI input state values that are directly typed by the user
  const [debouncedSearchTermInput] = useDebounce(searchTermInput, debounceMs);
  const [debouncedLocationSearchInput] = useDebounce(locationSearchInput, debounceMs);

  useEffect(() => {
    fetchJobs();
  }, [
    debouncedSearchTermInput,
    debouncedLocationSearchInput,
    categories,          
    employmentTypes,     
    experienceLevels,    
    companySizes,       
    isRemote,            
    currentPage,         
    pageSize,           
    fetchJobs,           
  ]);

  return {
    setSearchTermInput,
    setLocationSearchInput,
  };
}
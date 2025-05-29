'use client';

import { useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useJobSearchStore } from '@/stores/jobSearchStore';

export function useDebouncedJobSearchActions(debounceMs: number = 500) {
  const {
    // Get the UI input states from the store
    searchTermInput,
    locationSearchInput,
    // Get the setters for these UI input states
    setSearchTermInput,
    setLocationSearchInput,
    // Other filter states 
    categories,
    employmentTypes,
    experienceLevels,
    companySizes,
    isRemote,
    currentPage,
    pageSize,
    // The fetch action
    fetchJobs,
  } = useJobSearchStore((state) => ({
    searchTermInput: state.searchTermInput,
    locationSearchInput: state.locationSearchInput,
    setSearchTermInput: state.setSearchTermInput,
    setLocationSearchInput: state.setLocationSearchInput,
    categories: state.categories,
    employmentTypes: state.employmentTypes,
    experienceLevels: state.experienceLevels,
    companySizes: state.companySizes,
    isRemote: state.isRemote,
    currentPage: state.currentPage,
    pageSize: state.pageSize,
    fetchJobs: state.fetchJobs,
  }));

  // Debounce the UI input state values
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
    // Expose the setters for the UI inputs
    setSearchTermInput,
    setLocationSearchInput,
  };
}
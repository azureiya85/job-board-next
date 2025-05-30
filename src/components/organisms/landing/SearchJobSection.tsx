'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useJobSearchStore,
  JobSearchState, 
  JobSearchActions
} from '@/stores/jobSearchStore';
import { useDebouncedJobSearchActions } from '@/hooks/useJobSearch'; 
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, MapPin } from 'lucide-react'; 

const searchFormSchema = z.object({
  jobTitle: z.string().optional(),
  location: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export function SearchJobSection() {
  // Select individual state slices from Zustand 
  const storeSearchTerm = useJobSearchStore((state: JobSearchState) => state.searchTermInput);
  const storeLocationSearch = useJobSearchStore((state: JobSearchState) => state.locationSearchInput);

  // Get debounced setters from  custom hook
  const {
    setSearchTermInput: debouncedSetSearchTerm,
    setLocationSearchInput: debouncedSetLocationSearch,
  } = useDebouncedJobSearchActions();

  // Get direct fetchJobs action from Zustand
  const fetchJobs = useJobSearchStore((state: JobSearchActions) => state.fetchJobs);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    // Initialize form with current store values
    defaultValues: {
      jobTitle: storeSearchTerm || '',
      location: storeLocationSearch || '',
    },
  });

  // --- Sync react-hook-form with Zustand store (one-way: store -> form) ---
  useEffect(() => {
    form.setValue('jobTitle', storeSearchTerm || '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
  }, [storeSearchTerm, form.setValue, form]);

  useEffect(() => {
    form.setValue('location', storeLocationSearch || '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
  }, [storeLocationSearch, form.setValue, form]);

  // --- Sync form changes to Zustand store via debounced setters (one-way: form -> store) ---
  const jobTitleValue = form.watch('jobTitle');
  const locationValue = form.watch('location');

  useEffect(() => {
    debouncedSetSearchTerm(jobTitleValue === undefined ? '' : jobTitleValue);
  }, [jobTitleValue, debouncedSetSearchTerm]);

  useEffect(() => {
    debouncedSetLocationSearch(locationValue === undefined ? '' : locationValue);
  }, [locationValue, debouncedSetLocationSearch]);

  // Handle form submission 
  const onSubmit = (values: SearchFormValues) => {
    console.log("Form submitted, triggering explicit fetch with current store state:", values);
    fetchJobs();
  };

  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold font-heading text-foreground mb-4">Search Jobs</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">By Job Title</FormLabel>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="e.g., Software Engineer" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">By Location</FormLabel>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="e.g., Jakarta, Remote" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
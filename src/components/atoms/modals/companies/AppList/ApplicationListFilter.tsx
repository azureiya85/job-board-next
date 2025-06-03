'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplicationStatus } from '@prisma/client';
import type { ApplicationFilters } from '@/types/applicants';
import { getStatusDisplay } from '@/lib/applicants/statusValidation';
import { RefreshCw } from 'lucide-react';
import { formatEducationLevel } from '@/lib/utils';

const DEBOUNCE_DELAY = 500;
const educationLevels = ["HIGH_SCHOOL", "DIPLOMA", "BACHELOR", "MASTER", "DOCTORATE", "VOCATIONAL", "OTHER"];
const ALL_ITEMS_VALUE = "__ALL__";

interface ApplicationListFilterProps {
  filters: ApplicationFilters;
  onFiltersChange: (filters: ApplicationFilters) => void;
  onClearFilters: () => void;
}

export default function ApplicationListFilter({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: ApplicationListFilterProps) {
  const [localFilters, setLocalFilters] = useState<ApplicationFilters>(filters);

  // Debounce filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (JSON.stringify(localFilters) !== JSON.stringify(filters)) {
        onFiltersChange(localFilters);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [localFilters, filters, onFiltersChange]);

  // Update local filters when external filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = <K extends keyof ApplicationFilters>(key: K, value: ApplicationFilters[K]) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 border-b bg-gray-50/50">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search Name</label>
            <Input
              placeholder="Enter name..."
              value={localFilters.name || ''}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              className="h-9"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Min Age</label>
            <Input
              type="number"
              placeholder="Min age"
              value={localFilters.ageMin || ''}
              onChange={(e) => handleFilterChange('ageMin', e.target.value ? parseInt(e.target.value) : undefined)}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Max Age</label>
            <Input
              type="number"
              placeholder="Max age"
              value={localFilters.ageMax || ''}
              onChange={(e) => handleFilterChange('ageMax', e.target.value ? parseInt(e.target.value) : undefined)}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Min Salary</label>
            <Input
              type="number"
              placeholder="Min salary"
              value={localFilters.salaryMin || ''}
              onChange={(e) => handleFilterChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Max Salary</label>
            <Input
              type="number"
              placeholder="Max salary"
              value={localFilters.salaryMax || ''}
              onChange={(e) => handleFilterChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Education</label>
            <Select
              value={localFilters.education || ALL_ITEMS_VALUE}
              onValueChange={(value) => {
                handleFilterChange('education', value === ALL_ITEMS_VALUE ? undefined : value);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Education" />
              </SelectTrigger>
              <SelectContent>
               {educationLevels.map(level => (
  <SelectItem key={level} value={level}>
    {formatEducationLevel(level)}
  </SelectItem>
))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select
              value={localFilters.status || ALL_ITEMS_VALUE}
              onValueChange={(value) => {
                handleFilterChange('status', value === ALL_ITEMS_VALUE ? undefined : value as ApplicationStatus);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ITEMS_VALUE}>All Statuses</SelectItem>
                {Object.values(ApplicationStatus).map(status => (
                  <SelectItem key={status} value={status}>
                    {getStatusDisplay(status).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Actions</label>
            <Button onClick={onClearFilters} variant="outline" className="h-9 w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
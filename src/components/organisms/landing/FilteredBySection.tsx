'use client';

import {
  useJobSearchStore,
  JobSearchState,
  JobSearchActions
} from '@/stores/jobSearchStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; 
import { JobCategory, EmploymentType, ExperienceLevel, CompanySize } from '@prisma/client';
import { useCallback } from 'react';

const formatEnumKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

interface FilterGroupProps<T extends string> {
  title: string;
  items: Record<string, T>;
  selectedItems: T[];
  onChange: (selected: T[]) => void;
}

function FilterGroupContent<T extends string>({ items, selectedItems, onChange, title }: FilterGroupProps<T>) {
  const handleCheckboxChange = useCallback((itemValue: T, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      if (!selectedItems.includes(itemValue)) {
        onChange([...selectedItems, itemValue]);
      }
    } else {
      onChange(selectedItems.filter(val => val !== itemValue));
    }
  }, [selectedItems, onChange]);

  return (
    <ScrollArea className="h-auto max-h-60 pr-3"> 
      <div className="space-y-2 py-2">
        {Object.values(items).map((value) => (
          <div key={value} className="flex items-center space-x-2">
            <Checkbox
              id={`${title.replace(/\s+/g, '-')}-${value}`}
              checked={selectedItems.includes(value)}
              onCheckedChange={(checked) => handleCheckboxChange(value, checked)}
            />
            <Label
              htmlFor={`${title.replace(/\s+/g, '-')}-${value}`}
              className="font-normal text-sm text-foreground/80 cursor-pointer"
            >
              {formatEnumKey(value)}
            </Label>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function FilteredBySection() {
  const categories = useJobSearchStore((state: JobSearchState) => state.categories || []);
  const employmentTypes = useJobSearchStore((state: JobSearchState) => state.employmentTypes || []);
  const experienceLevels = useJobSearchStore((state: JobSearchState) => state.experienceLevels || []);
  const companySizes = useJobSearchStore((state: JobSearchState) => state.companySizes || []);
  const isRemote = useJobSearchStore((state: JobSearchState) => state.isRemote);

  const setCategories = useJobSearchStore((state: JobSearchActions) => state.setCategories);
  const setEmploymentTypes = useJobSearchStore((state: JobSearchActions) => state.setEmploymentTypes);
  const setExperienceLevels = useJobSearchStore((state: JobSearchActions) => state.setExperienceLevels);
  const setCompanySizes = useJobSearchStore((state: JobSearchActions) => state.setCompanySizes);
  const setIsRemote = useJobSearchStore((state: JobSearchActions) => state.setIsRemote);

  const defaultOpen = ["job-category", "employment-type"]; 

  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border space-y-4"> 
      <h2 className="text-xl font-bold font-heading text-foreground mb-2">Filter By</h2>

      <Accordion type="multiple" defaultValue={defaultOpen} className="w-full cursor-pointer">
        <AccordionItem value="job-category">
          <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
            Job Category
          </AccordionTrigger>
          <AccordionContent>
            <FilterGroupContent
              title="Job Category"
              items={JobCategory}
              selectedItems={categories}
              onChange={setCategories}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="employment-type">
          <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
            Employment Type
          </AccordionTrigger>
          <AccordionContent>
            <FilterGroupContent
              title="Employment Type"
              items={EmploymentType}
              selectedItems={employmentTypes}
              onChange={setEmploymentTypes}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="experience-level">
          <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
            Experience Level
          </AccordionTrigger>
          <AccordionContent>
            <FilterGroupContent
              title="Experience Level"
              items={ExperienceLevel}
              selectedItems={experienceLevels}
              onChange={setExperienceLevels}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="company-size">
          <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
            Company Size
          </AccordionTrigger>
          <AccordionContent>
            <FilterGroupContent
              title="Company Size"
              items={CompanySize}
              selectedItems={companySizes}
              onChange={setCompanySizes}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion type="single" collapsible defaultValue="work-arrangement" className="w-full">
        <AccordionItem value="work-arrangement">
            <AccordionTrigger className="cursor-pointer text-lg font-semibold font-heading text-primary hover:no-underline py-3">
                Work Arrangement
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-2 py-2"> 
                    <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isRemoteFilter"
                        checked={isRemote === true}
                        onCheckedChange={(checked) => setIsRemote(checked === true ? true : undefined)}
                    />
                    <Label htmlFor="isRemoteFilter" className="font-normal text-sm text-foreground/80 cursor-pointer">
                        Remote Only
                    </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isOfficeFilter"
                        checked={isRemote === false}
                        onCheckedChange={(checked) => setIsRemote(checked === true ? false : undefined)}
                    />
                    <Label htmlFor="isOfficeFilter" className="font-normal text-sm text-foreground/80 cursor-pointer">
                        Office-Based / On-Site
                    </Label>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
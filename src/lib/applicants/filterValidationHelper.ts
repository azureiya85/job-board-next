import { ApplicationStatus, Education } from '@prisma/client';
import { ApplicationFilters } from '@/types/applicants';
import { applicationFiltersSchema } from '@/lib/validations/zodApplicationValidation';
import { ZodError } from 'zod';

export function validateFilters(filters: ApplicationFilters): {
  isValid: boolean;
  errors: string[];
} {
  try {
    applicationFiltersSchema.parse(filters);
    
    return {
      isValid: true,
      errors: [],
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((issue) => issue.message);
      
      return {
        isValid: false,
        errors,
      };
    }
    
    return {
      isValid: false,
      errors: ['An unexpected validation error occurred'],
    };
  }
}

export function getDefaultFilters(): ApplicationFilters {
  return {
    sortBy: 'createdAt',
    sortOrder: 'desc', 
  };
}

export function filtersToSearchParams(filters: ApplicationFilters): URLSearchParams {
  const params = new URLSearchParams();
  (Object.keys(filters) as Array<keyof ApplicationFilters>).forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== null && (typeof value === 'string' ? value !== '' : true)) {
      params.set(key, String(value));
    }
  });
  return params;
}

export function searchParamsToFilters(searchParams: URLSearchParams): ApplicationFilters {
  const filters: Partial<ApplicationFilters> = {};

  (['name', 'location', 'dateFrom', 'dateTo'] as const).forEach(field => {
    const value = searchParams.get(field);
    if (value !== null) filters[field] = value;
  });

  const educationVal = searchParams.get('education');
  if (educationVal !== null) filters.education = educationVal as Education | string;

  const statusVal = searchParams.get('status');
  if (statusVal && Object.values(ApplicationStatus).includes(statusVal as ApplicationStatus)) {
    filters.status = statusVal as ApplicationStatus;
  }

  const sortByVal = searchParams.get('sortBy');
  const allowedSortBy: ApplicationFilters['sortBy'][] = ['createdAt', 'expectedSalary', 'name', 'testScore', 'age'];
  if (sortByVal && allowedSortBy.includes(sortByVal as ApplicationFilters['sortBy'])) {
    filters.sortBy = sortByVal as ApplicationFilters['sortBy'];
  }

  const sortOrderVal = searchParams.get('sortOrder');
  if (sortOrderVal === 'asc' || sortOrderVal === 'desc') {
    filters.sortOrder = sortOrderVal;
  }

  (['ageMin', 'ageMax', 'salaryMin', 'salaryMax', 'testScoreMin', 'testScoreMax'] as const).forEach(field => {
    const value = searchParams.get(field);
    if (value !== null && !isNaN(Number(value))) filters[field] = Number(value);
  });

  (['hasCV', 'hasCoverLetter'] as const).forEach(field => {
    const value = searchParams.get(field);
    if (value === 'true' || value === 'false') filters[field] = value === 'true';
  });

  return filters as ApplicationFilters;
}
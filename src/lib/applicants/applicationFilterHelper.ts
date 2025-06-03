import { ApplicationFilters, JobApplicationDetails } from '@/types/applicants';

export const DEBOUNCE_DELAY = 500;
export const ALL_ITEMS_VALUE = "__ALL__";

export const educationLevels = [
  "HIGH_SCHOOL", 
  "DIPLOMA", 
  "BACHELOR", 
  "MASTER", 
  "DOCTORATE", 
  "VOCATIONAL", 
  "OTHER"
];

export const sortOptions = [
  { value: 'createdAt', label: 'Application Date' },
  { value: 'name', label: 'Name' },
  { value: 'age', label: 'Age' },
  { value: 'expectedSalary', label: 'Expected Salary' },
  { value: 'testScore', label: 'Test Score' }
];

export const sortOrderOptions = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' }
];

/**
 * Creates default filter configuration
 */
export function createDefaultFilters(): ApplicationFilters {
  return { 
    sortBy: 'createdAt', 
    sortOrder: 'asc' 
  };
}

/**
 * Checks if any filters are active (excluding default sort settings)
 */
export function hasActiveFilters(filters: ApplicationFilters): boolean {
  const defaultFilters = createDefaultFilters();
  
  return Object.keys(filters).some(key => {
    const filterKey = key as keyof ApplicationFilters;
    const value = filters[filterKey];
    const defaultValue = defaultFilters[filterKey];
    
    // Skip empty/undefined values
    if (value === undefined || value === null || value === '') {
      return false;
    }
    
    // Check if different from default
    return value !== defaultValue;
  });
}

/**
 * Clears all filters except default sort settings
 */
export function clearAllFilters(): ApplicationFilters {
  return createDefaultFilters();
}

/**
 * Validates filter values and converts string inputs to appropriate types
 */
export function sanitizeFilters(filters: Partial<ApplicationFilters>): ApplicationFilters {
  const sanitized: ApplicationFilters = {};
  
  // Handle string fields
  if (filters.name && filters.name.trim() !== '') {
    sanitized.name = filters.name.trim();
  }
  
  if (filters.location && filters.location.trim() !== '') {
    sanitized.location = filters.location.trim();
  }
  
  if (filters.education && filters.education !== ALL_ITEMS_VALUE) {
    sanitized.education = filters.education;
  }
  
  if (filters.status && (filters.status as string) !== ALL_ITEMS_VALUE) {
    sanitized.status = filters.status;
  }
  
  // Handle numeric fields with validation
 const numericFields = ['ageMin', 'ageMax', 'salaryMin', 'salaryMax', 'testScoreMin', 'testScoreMax'] as const;
numericFields.forEach(field => {
  const value = filters[field] as string | number | undefined | null;
  if (value !== undefined && value !== null && value !== '') {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    if (typeof num === 'number' && !isNaN(num) && num >= 0) {
      sanitized[field] = num;
    }
  }
});
  
  // Handle date fields
  if (filters.dateFrom && filters.dateFrom.trim() !== '') {
    sanitized.dateFrom = filters.dateFrom;
  }
  
  if (filters.dateTo && filters.dateTo.trim() !== '') {
    sanitized.dateTo = filters.dateTo;
  }
  
  // Handle boolean fields
  if (filters.hasCV !== undefined) {
    sanitized.hasCV = filters.hasCV;
  }
  
  if (filters.hasCoverLetter !== undefined) {
    sanitized.hasCoverLetter = filters.hasCoverLetter;
  }
  
  // Handle sort fields with defaults
  sanitized.sortBy = filters.sortBy || 'createdAt';
  sanitized.sortOrder = filters.sortOrder || 'asc';
  
  return sanitized;
}

/**
 * Builds URL search parameters from filters for API calls
 */
export function buildFilterParams(filters: ApplicationFilters, page: number, limit: number): URLSearchParams {
  const queryParams = new URLSearchParams();
  
  queryParams.append('page', String(page));
  queryParams.append('limit', String(limit));
  
  if (filters.name) queryParams.append('name', filters.name);
  if (filters.ageMin !== undefined) queryParams.append('ageMin', String(filters.ageMin));
  if (filters.ageMax !== undefined) queryParams.append('ageMax', String(filters.ageMax));
  if (filters.salaryMin !== undefined) queryParams.append('salaryMin', String(filters.salaryMin));
  if (filters.salaryMax !== undefined) queryParams.append('salaryMax', String(filters.salaryMax));
  if (filters.education) queryParams.append('education', filters.education);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.location) queryParams.append('location', filters.location);
  if (filters.hasCV !== undefined) queryParams.append('hasCV', String(filters.hasCV));
  if (filters.hasCoverLetter !== undefined) queryParams.append('hasCoverLetter', String(filters.hasCoverLetter));
  if (filters.testScoreMin !== undefined) queryParams.append('testScoreMin', String(filters.testScoreMin));
  if (filters.testScoreMax !== undefined) queryParams.append('testScoreMax', String(filters.testScoreMax));
  if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
  
  return queryParams;
}

/**
 * Client-side filtering function for applications
 */
export function filterApplications(
  applications: JobApplicationDetails[],
  filters: ApplicationFilters
): JobApplicationDetails[] {
  let filtered = [...applications];

  // Filter by name (firstName + lastName search)
  if (filters.name && filters.name.trim() !== '') {
    const searchTerm = filters.name.toLowerCase().trim();
    filtered = filtered.filter((app) => {
      const fullName = app.applicant.name.toLowerCase();
      const email = app.applicant.email.toLowerCase();
      return fullName.includes(searchTerm) || email.includes(searchTerm);
    });
  }

  // Filter by age range
  if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
    filtered = filtered.filter((app) => {
      if (app.applicant.age === null || app.applicant.age === undefined) return false;
      
      const meetsMinAge = filters.ageMin === undefined || app.applicant.age >= filters.ageMin;
      const meetsMaxAge = filters.ageMax === undefined || app.applicant.age <= filters.ageMax;
      
      return meetsMinAge && meetsMaxAge;
    });
  }

  // Filter by expected salary range
  if (filters.salaryMin !== undefined || filters.salaryMax !== undefined) {
    filtered = filtered.filter((app) => {
      if (app.expectedSalary === null || app.expectedSalary === undefined) return false;
      
      const meetsMinSalary = filters.salaryMin === undefined || app.expectedSalary >= filters.salaryMin;
      const meetsMaxSalary = filters.salaryMax === undefined || app.expectedSalary <= filters.salaryMax;
      
      return meetsMinSalary && meetsMaxSalary;
    });
  }

  // Filter by education level
  if (filters.education && filters.education !== '') {
    filtered = filtered.filter((app) => {
      return app.applicant.education === filters.education;
    });
  }

  // Filter by application status
  if (filters.status) {
    filtered = filtered.filter((app) => app.status === filters.status);
  }

  // Filter by location (city or province or currentAddress)
  if (filters.location && filters.location.trim() !== '') {
    const locationTerm = filters.location.toLowerCase().trim();
    filtered = filtered.filter((app) => {
      const location = app.applicant.location?.toLowerCase() || '';
      const address = app.applicant.currentAddress?.toLowerCase() || '';
      
      return location.includes(locationTerm) || address.includes(locationTerm);
    });
  }

  // Filter by CV availability
  if (filters.hasCV !== undefined) {
    filtered = filtered.filter((app) => {
      const hasCV = Boolean(app.cvUrl && app.cvUrl.trim() !== '');
      return hasCV === filters.hasCV;
    });
  }

  // Filter by cover letter availability
  if (filters.hasCoverLetter !== undefined) {
    filtered = filtered.filter((app) => {
      const hasCoverLetter = Boolean(app.coverLetter && app.coverLetter.trim() !== '');
      return hasCoverLetter === filters.hasCoverLetter;
    });
  }

  // Filter by test score range
  if (filters.testScoreMin !== undefined || filters.testScoreMax !== undefined) {
    filtered = filtered.filter((app) => {
      if (app.testScore === null || app.testScore === undefined) return false;
      
      const meetsMinScore = filters.testScoreMin === undefined || app.testScore >= filters.testScoreMin;
      const meetsMaxScore = filters.testScoreMax === undefined || app.testScore <= filters.testScoreMax;
      
      return meetsMinScore && meetsMaxScore;
    });
  }

  // Filter by date range
  if (filters.dateFrom || filters.dateTo) {
    filtered = filtered.filter((app) => {
      const appDate = new Date(app.createdAt);
      
      const meetsFromDate = !filters.dateFrom || appDate >= new Date(filters.dateFrom);
      const meetsToDate = !filters.dateTo || appDate <= new Date(filters.dateTo + 'T23:59:59.999Z');
      
      return meetsFromDate && meetsToDate;
    });
  }

  // Apply sorting
  if (filters.sortBy) {
    filtered = sortApplications(filtered, filters.sortBy, filters.sortOrder || 'asc');
  }

  return filtered;
}

/**
 * Sorts applications based on specified criteria
 */
export function sortApplications(
  applications: JobApplicationDetails[],
  sortBy: NonNullable<ApplicationFilters['sortBy']>,
  sortOrder: 'asc' | 'desc' = 'asc'
): JobApplicationDetails[] {
  const multiplier = sortOrder === 'asc' ? 1 : -1;

  return [...applications].sort((a, b) => { 
    switch (sortBy) {
      case 'name':
        const nameA = a.applicant.name.trim().toLowerCase();
        const nameB = b.applicant.name.trim().toLowerCase();
        return nameA.localeCompare(nameB) * multiplier;
      case 'expectedSalary':
        const salaryA = a.expectedSalary ?? (sortOrder === 'asc' ? Infinity : -Infinity);
        const salaryB = b.expectedSalary ?? (sortOrder === 'asc' ? Infinity : -Infinity);
        return (salaryA - salaryB) * multiplier;
      case 'testScore':
        const scoreA = a.testScore ?? (sortOrder === 'asc' ? -Infinity : Infinity);
        const scoreB = b.testScore ?? (sortOrder === 'asc' ? -Infinity : Infinity);
        return (scoreA - scoreB) * multiplier;
      case 'age':
        const ageA = a.applicant.age ?? (sortOrder === 'asc' ? Infinity : 0);
        const ageB = b.applicant.age ?? (sortOrder === 'asc' ? Infinity : 0);
        return (ageA - ageB) * multiplier;
      case 'createdAt':
      default:
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return (dateA - dateB) * multiplier;
    }
  });
}
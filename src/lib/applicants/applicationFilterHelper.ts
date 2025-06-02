import { ApplicationFilters, JobApplicationDetails } from '@/types/applicants';

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

  if (filters.sortBy) {
    filtered = sortApplications(filtered, filters.sortBy, filters.sortOrder || 'asc');
  }

  return filtered;
}

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
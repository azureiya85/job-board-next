import { Prisma, ApplicationStatus, Education } from '@prisma/client';
import { ApplicationFilters, JobApplicationDetails, ApplicationStatistics } from '@/types/applicants';

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function getFilterStatistics(applications: JobApplicationDetails[]): ApplicationStatistics {
  const stats: ApplicationStatistics = {
    total: applications.length,
    byStatus: {} as Record<ApplicationStatus, number>,
    byEducation: {} as Record<string, number>,
    ageRange: { min: null, max: null },
    salaryRange: { min: null, max: null },
    withCV: 0,
    withCoverLetter: 0,
    withTestScore: 0,
  };

  // Initialize status counts
  Object.values(ApplicationStatus).forEach(status => {
    stats.byStatus[status] = 0;
  });

  const ages: number[] = [];
  const salaries: number[] = [];

  applications.forEach(app => {
    stats.byStatus[app.status]++;
    
    const education = app.applicant.education || 'NOT_SPECIFIED';
    stats.byEducation[education] = (stats.byEducation[education] || 0) + 1;
    
    if (app.applicant.age !== null && app.applicant.age !== undefined) {
      ages.push(app.applicant.age);
    }
    
    if (app.expectedSalary !== null && app.expectedSalary !== undefined) {
      salaries.push(app.expectedSalary);
    }
    
    if (app.cvUrl && app.cvUrl.trim() !== '') stats.withCV++;
    if (app.coverLetter && app.coverLetter.trim() !== '') stats.withCoverLetter++;
    if (app.testScore !== null && app.testScore !== undefined) stats.withTestScore++;
  });

  if (ages.length > 0) {
    stats.ageRange.min = Math.min(...ages);
    stats.ageRange.max = Math.max(...ages);
  }
  if (salaries.length > 0) {
    stats.salaryRange.min = Math.min(...salaries);
    stats.salaryRange.max = Math.max(...salaries);
  }
  
  return stats;
}

export function buildFilterQuery(filters: ApplicationFilters): {
  where: Prisma.JobApplicationWhereInput;
  orderBy: Prisma.JobApplicationOrderByWithRelationInput;
} {
  const where: Prisma.JobApplicationWhereInput = {};
  const andConditions: Prisma.JobApplicationWhereInput[] = [];

  let orderBy: Prisma.JobApplicationOrderByWithRelationInput = { createdAt: filters.sortOrder || 'asc' };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.dateFrom || filters.dateTo) {
    const createdAtFilter: Prisma.DateTimeFilter = {};
    if (filters.dateFrom) {
      createdAtFilter.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      createdAtFilter.lte = endDate;
    }
    where.createdAt = createdAtFilter;
  }

  if (filters.salaryMin !== undefined || filters.salaryMax !== undefined) {
    const salaryFilter: Prisma.IntNullableFilter = {};
    if (filters.salaryMin !== undefined) {
      salaryFilter.gte = filters.salaryMin;
    }
    if (filters.salaryMax !== undefined) {
      salaryFilter.lte = filters.salaryMax;
    }
    where.expectedSalary = salaryFilter;
  }

  if (filters.testScoreMin !== undefined || filters.testScoreMax !== undefined) {
    const scoreFilter: Prisma.IntNullableFilter = {};
    if (filters.testScoreMin !== undefined) {
      scoreFilter.gte = filters.testScoreMin;
    }
    if (filters.testScoreMax !== undefined) {
      scoreFilter.lte = filters.testScoreMax;
    }
    where.testScore = scoreFilter;
  }

  // CV filter (cvUrl is String, non-nullable)
  if (filters.hasCV === true) {
    where.cvUrl = { not: "" }; 
  } else if (filters.hasCV === false) {
    where.cvUrl = { equals: "" }; 
  }

  // Cover letter filter (coverLetter is String?, nullable)
  if (filters.hasCoverLetter === true) {
    andConditions.push(
      { coverLetter: { not: null } },
      { coverLetter: { not: "" } }
    );
  } else if (filters.hasCoverLetter === false) {
    andConditions.push({
      OR: [
        { coverLetter: { equals: null } },
        { coverLetter: { equals: "" } },
      ],
    });
  }
  
  const userWhereConditions: Prisma.UserWhereInput = {};
  let hasUserConditions = false;
  
  if (filters.name && filters.name.trim() !== '') {
    const nameTrimmed = filters.name.trim();
    userWhereConditions.OR = [
      { firstName: { contains: nameTrimmed, mode: 'insensitive' } },
      { lastName: { contains: nameTrimmed, mode: 'insensitive' } },
      { email: { contains: nameTrimmed, mode: 'insensitive' } },
    ];
    hasUserConditions = true;
  }

  if (filters.education && filters.education !== '') {
    userWhereConditions.lastEducation = filters.education as Education;
    hasUserConditions = true;
  }

  if (hasUserConditions) {
    where.user = userWhereConditions;
  }
  
  // If there are conditions in andConditions, add them to the main where clause
  if (andConditions.length > 0) {
    if (where.AND) {
      // If where.AND already exists merge them
      if (Array.isArray(where.AND)) {
        where.AND.push(...andConditions);
      } else { // If where.AND was an object, make it an array
        where.AND = [where.AND, ...andConditions];
      }
    } else {
      where.AND = andConditions;
    }
  }

  if (filters.sortBy && filters.sortOrder) {
    const sortOrderValue = filters.sortOrder;
    switch (filters.sortBy) {
      case 'name': 
        orderBy = { user: { firstName: sortOrderValue } };
        break;
      case 'expectedSalary':
        orderBy = { expectedSalary: sortOrderValue };
        break;
      case 'testScore':
        orderBy = { testScore: sortOrderValue };
        break;
      case 'age':
        orderBy = { user: { dateOfBirth: sortOrderValue === 'asc' ? 'desc' : 'asc' } };
        break;
      case 'createdAt':
      default:
        orderBy = { createdAt: sortOrderValue };
        break;
    }
  }

  return { where, orderBy };
}
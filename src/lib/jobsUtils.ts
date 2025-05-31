import prisma from '@/lib/prisma';
import {
  JobPostingFeatured, 
} from '@/types';
import { Prisma, JobCategory, EmploymentType, ExperienceLevel, CompanySize } from '@prisma/client';

// Define the structure for search and filter parameters
export interface GetJobsParams {
  take?: number;
  skip?: number;
  orderBy?: Prisma.JobPostingOrderByWithRelationInput | Prisma.JobPostingOrderByWithRelationInput[];
  
  // Search Parameters
  jobTitle?: string; // Search by job title and description
  locationQuery?: string; // Search by city or province name

  // Filter Parameters
  categories?: JobCategory[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  companySizes?: CompanySize[]; 
  isRemote?: boolean;
  companyId?: string; // Filter by specific company
  
  // Response options
  includePagination?: boolean; // Whether to return pagination info
}

// Return type for paginated results
export interface GetJobsResult {
  jobs: JobPostingFeatured[];
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Helper function to build the where clause
const buildWhereClause = (params: GetJobsParams): Prisma.JobPostingWhereInput => {
  const {
    jobTitle,
    locationQuery,
    categories,
    employmentTypes,
    experienceLevels,
    companySizes,
    isRemote,
    companyId,
  } = params;

  const where: Prisma.JobPostingWhereInput = {
    isActive: true, // Always filter for active jobs
  };

  // --- Search Logic ---
  if (jobTitle) {
    where.OR = [
      { title: { contains: jobTitle, mode: 'insensitive' } },
      { description: { contains: jobTitle, mode: 'insensitive' } },
    ];
  }

  if (locationQuery) {
    const locationConditions: Prisma.JobPostingWhereInput[] = [
      { 
        city: { 
          is: { 
            name: { contains: locationQuery, mode: 'insensitive' } 
          } 
        } 
      },
      { 
        province: { 
          is: { 
            name: { contains: locationQuery, mode: 'insensitive' } 
          } 
        } 
      },
    ];

    if (where.OR) {
      where.AND = [
        { OR: where.OR },
        { OR: locationConditions },
      ];
      delete where.OR;
    } else {
      where.OR = locationConditions;
    }
  }

  // --- Filter Logic ---
  if (categories && categories.length > 0) {
    where.category = { in: categories };
  }

  if (employmentTypes && employmentTypes.length > 0) {
    where.employmentType = { in: employmentTypes };
  }

  if (experienceLevels && experienceLevels.length > 0) {
    where.experienceLevel = { in: experienceLevels };
  }
  
  if (typeof isRemote === 'boolean') {
    where.isRemote = isRemote;
  }

  // Filtering by CompanySize 
  if (companySizes && companySizes.length > 0) {
    where.company = {
      is: {
        size: { in: companySizes },
      },
    };
  }

  // Filter by specific company
  if (companyId) {
    where.companyId = companyId;
  }

  return where;
};

export async function getJobs(params: GetJobsParams = {}): Promise<JobPostingFeatured[] | GetJobsResult> {
  const {
    take = 3000,
    skip = 0,
    orderBy,
    includePagination = false,
  } = params;

  const effectiveOrderBy = orderBy || [{ isPriority: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];

  const where = buildWhereClause(params);

  try {
    if (includePagination) {
      const [jobs, totalCount] = await Promise.all([
        prisma.jobPosting.findMany({
          where,
          orderBy: effectiveOrderBy,
          take,
          skip,
          select: {
            id: true,
            title: true,
            description: true,      
            employmentType: true,
            experienceLevel: true,   
            category: true,          
            isRemote: true,
            createdAt: true,
            publishedAt: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            isPriority: true,
            tags: true,              
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                size: true,
                industry: true,
              },
            },
            city: {
              select: {
                id: true,
                name: true,
              },
            },
            province: {
              select: {
                id: true,
                name: true,
              },
            },
            requirements: true, 
            benefits: true,
            _count: {
              select: {
                applications: true,
              },
            },
          },
        }),
        prisma.jobPosting.count({ where }),
      ]);

      return {
        jobs: jobs as unknown as JobPostingFeatured[],
        pagination: {
          total: totalCount,
          page: Math.floor(skip / take) + 1,
          totalPages: Math.ceil(totalCount / take),
          hasNext: skip + take < totalCount,
          hasPrev: skip > 0,
        },
      };
    } else {
      const jobs = await prisma.jobPosting.findMany({
        where,
        orderBy: effectiveOrderBy,
        take,
        skip,
        select: {
          id: true,
          title: true,
          description: true,      
          employmentType: true,
          experienceLevel: true,   
          category: true,          
          isRemote: true,
          createdAt: true,
          publishedAt: true,
          salaryMin: true,
          salaryMax: true,
          salaryCurrency: true,
          isPriority: true,
          tags: true,              
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              size: true,
              industry: true,
            },
          },
          city: {
            select: {
              id: true,
              name: true,
            },
          },
          province: {
            select: {
              id: true,
              name: true,
            },
          },
          requirements: true, 
          benefits: true,
        },
      });

      return jobs as unknown as JobPostingFeatured[];
    }
  } catch (error) {
    console.error("Failed to fetch jobs with filters:", error);
    if (includePagination) {
      return {
        jobs: [],
        pagination: {
          total: 0,
          page: 1,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
    return [];
  }
}

// Specific function for latest featured jobs 
export async function getLatestFeaturedJobs(count: number = 5): Promise<JobPostingFeatured[]> {
  const result = await getJobs({
    take: count,
    orderBy: [{ isPriority: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    includePagination: false,
  });
  
  return result as JobPostingFeatured[];
}

// Utility function specifically for company job listings with pagination
export async function getCompanyJobs(
  companyId: string, 
  params: Omit<GetJobsParams, 'companyId'> = {}
): Promise<GetJobsResult> {
  const result = await getJobs({
    ...params,
    companyId,
    includePagination: true,
  });
  
  return result as GetJobsResult;
}
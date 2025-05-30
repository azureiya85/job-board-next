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
  jobTitle?: string; // Search by job title
  locationQuery?: string; // Search by city or province name

  // Filter Parameters
  categories?: JobCategory[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  companySizes?: CompanySize[]; 
  isRemote?: boolean; 
  // Add other filter parameters as needed: salaryMin, salaryMax etc.
}

export async function getJobs(params: GetJobsParams = {}): Promise<JobPostingFeatured[]> {
  const {
    take,
    skip,
    orderBy,
    jobTitle,
    locationQuery,
    categories,
    employmentTypes,
    experienceLevels,
    companySizes,
    isRemote,
  } = params;

  const where: Prisma.JobPostingWhereInput = {
    isActive: true, // Always filter for active jobs
  };

  // --- Search Logic ---
  if (jobTitle) {
    where.title = {
      contains: jobTitle,
      mode: 'insensitive', // Case-insensitive search
    };
  }

  if (locationQuery) {
    where.OR = [
      { city: { name: { contains: locationQuery, mode: 'insensitive' } } },
      { province: { name: { contains: locationQuery, mode: 'insensitive' } } },
    ];
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

  // Filtering by CompanySize requires a join
  if (companySizes && companySizes.length > 0) {
    where.company = {
      size: { in: companySizes },
    };
  }

  // Default sorting if not provided
  const effectiveOrderBy = orderBy || [{ isPriority: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];

   try {
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
            name: true,
            logo: true,
            size: true,
          },
        },
        city: {
          select: {
            name: true,
          },
        },
        province: {
          select: {
            name: true,
          },
        },
         requirements: true, 
         benefits: true,
      },
    });
    // The cast should be safe if your select matches JobPostingFeatured
    return jobs as unknown as JobPostingFeatured[];
  } catch (error) {
    console.error("Failed to fetch jobs with filters:", error);
    return [];
  }
}


// Specific function for latest featured jobs 
export async function getLatestFeaturedJobs(count: number = 5): Promise<JobPostingFeatured[]> {
  return getJobs({
    take: count,
    orderBy: [{ isPriority: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
  });
}
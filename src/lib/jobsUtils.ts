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
    // If isRemote is also true, and a locationQuery is provided, it might be contradictory.
    // Decide on the desired behavior: prioritize remote, or allow remote jobs in a specific location (e.g., "Remote in Jakarta")
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
        employmentType: true,
        isRemote: true,
        createdAt: true,
        publishedAt: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        isPriority: true,
        company: {
          select: {
            name: true,
            logo: true,
            size: true, // Need to select company size if filtering by it and want to display it
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
        // Select other fields  for a full job listing page
        // description: true, 
        // requirements: true,
        // benefits: true,
        // category: true,
        // experienceLevel: true,
      },
    });
    return jobs as JobPostingFeatured[];
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
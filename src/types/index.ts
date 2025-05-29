import { JobPosting, Company, City, Province, EmploymentType, ExperienceLevel, JobCategory, CompanySize, Prisma } from '@prisma/client'; 

export type JobPostingFeatured = Pick<
  JobPosting,
  | 'id'
  | 'title'
  | 'employmentType'
  | 'isRemote'
  | 'createdAt'
  | 'publishedAt'
  | 'salaryMin'
  | 'salaryMax'
  | 'salaryCurrency'
  | 'isPriority'
> & {
  company: Pick<Company, 'name' | 'logo' | 'size'> | null; 
  city: Pick<City, 'name'> | null;
  province: Pick<Province, 'name'> | null;
};

// Interface for the parameters passed to the getJobs function
export interface JobPostingSearchAndFilterParams {
  take?: number;
  skip?: number;
  orderBy?: Prisma.JobPostingOrderByWithRelationInput ; 
  
  jobTitle?: string;
  locationQuery?: string;

  categories?: JobCategory[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  companySizes?: CompanySize[];
  isRemote?: boolean;
}

export interface GetJobsParams { 
  take?: number;
  skip?: number;
  orderBy?: Prisma.JobPostingOrderByWithRelationInput | Prisma.JobPostingOrderByWithRelationInput[]; 
  
  jobTitle?: string;
  locationQuery?: string;

  categories?: JobCategory[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  companySizes?: CompanySize[];
  isRemote?: boolean;
}

export type JobPostingDetailed = JobPosting & {
  company: Company | null;
  city: City | null;
  province: Province | null;
};
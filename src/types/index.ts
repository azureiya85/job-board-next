import { JobPosting, Company, City, Province, EmploymentType, ExperienceLevel, JobCategory, CompanySize, Prisma } from '@prisma/client'; 

export type JobPostingFeatured = Pick<
  JobPosting,
  | 'id'
  | 'title'
  | 'description'       
  | 'employmentType'
  | 'experienceLevel'   
  | 'category'          
  | 'isRemote'
  | 'createdAt'
  | 'publishedAt'
  | 'salaryMin'
  | 'salaryMax'
  | 'salaryCurrency'
  | 'isPriority'
  | 'tags'  
  | 'benefits' 
  | 'requirements' 
  | 'applicationDeadline'           
> & {
  company: Pick<Company, 'id' | 'name' | 'logo' | 'size'> | null;
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
  
  // Added for company filtering
  companyId?: string;
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
  
  // Added for company filtering
  companyId?: string;
}

export type JobPostingDetailed = JobPosting & {
  company: Company | null;
  city: City | null;
  province: Province | null;
};

// New Company Types
export type CompanyWithLocation = Company & {
  province: Province | null;
  city: City | null;
  _count: {
    jobPostings: number;
  };
};

export type CompanyDetailed = Company & {
  province: Province | null;
  city: City | null;
  banner?: string | null; 
  admin: {
    id: string;
    name: string | null;
    email: string;
    profileImage: string | null;
  };
  stats: {
    activeJobs: number;
    totalReviews: number;
    averageRating: number;
    ratings: {
      culture: number;
      workLifeBalance: number;
      facilities: number;
      career: number;
    };
  };
};

export interface GetCompaniesParams {
  take?: number;
  skip?: number;
  search?: string;
  industry?: string;
  size?: CompanySize;
  provinceId?: string;
  cityId?: string;
}

export interface CompanyJobsParams {
  companyId: string;
  take?: number;
  skip?: number;
  category?: JobCategory;
  employmentType?: EmploymentType;
  experienceLevel?: ExperienceLevel;
  search?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
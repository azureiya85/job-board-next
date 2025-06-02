import { z } from 'zod';
import { JobCategory, EmploymentType, ExperienceLevel } from '@prisma/client';

// Base Job Schema
const baseJobSchema = z.object({
  title: z.string().min(1, "Job title is required").max(200, "Job title must be less than 200 characters"),
  description: z.string().min(50, "Job description must be at least 50 characters").max(5000, "Job description must be less than 5000 characters"),
  requirements: z.array(z.string().min(1, "Requirement cannot be empty")).min(1, "At least one requirement is needed").max(20, "Maximum 20 requirements allowed"),
  benefits: z.array(z.string().min(1, "Benefit cannot be empty")).max(20, "Maximum 20 benefits allowed").optional().default([]),
  tags: z.array(z.string().min(1, "Tag cannot be empty")).max(20, "Maximum 20 tags allowed").optional().default([]),
  category: z.nativeEnum(JobCategory),
  employmentType: z.nativeEnum(EmploymentType),
  workType: z.string().min(1, "Work type is required").max(50, "Work type must be less than 50 characters"),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  salaryMin: z.number().int().min(1000000, "Minimum salary should be at least Rp 1,000,000").optional(),
  salaryMax: z.number().int().max(1000000000, "Maximum salary should not exceed Rp 1,000,000,000").optional(),
  salaryCurrency: z.string().optional().default("IDR"),
  location: z.string().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  provinceId: z.string().uuid("Invalid province ID").optional().or(z.literal('')),
  cityId: z.string().uuid("Invalid city ID").optional().or(z.literal('')),
  applicationDeadline: z.coerce.date().min(new Date(), "Application deadline must be in the future").optional(),
  isPriority: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  isRemote: z.boolean().optional().default(false),
  latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional(),
  longitude: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional(),
  country: z.string().optional().default("Indonesia"),
  publishedAt: z.date().optional(),
  preSelectionTestId: z.string().uuid("Invalid pre-selection test ID").optional(),
  banner: z.string().url("Banner must be a valid URL").optional(),
});

// Job Creation Schema with validation
export const createJobSchema = baseJobSchema.refine((data) => {
  if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: "Minimum salary cannot be greater than maximum salary",
  path: ["salaryMax"],
});
export type CreateJobFormData = z.infer<typeof createJobSchema>;

// Job Update Schema
export const updateJobSchema = baseJobSchema.partial().refine((data) => {
  if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: "Minimum salary cannot be greater than maximum salary",
  path: ["salaryMax"],
});
export type UpdateJobFormData = z.infer<typeof updateJobSchema>;

// Job Filters Schema
export const jobFiltersSchema = z.object({
  category: z.nativeEnum(JobCategory).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  provinceId: z.string().uuid().optional(),
  cityId: z.string().uuid().optional(),
  isRemote: z.boolean().optional(),
  search: z.string().optional(),
});
export type JobFiltersData = z.infer<typeof jobFiltersSchema>;

// Job Status Schema (activate/deactivate)
export const jobStatusSchema = z.object({
  isActive: z.boolean(),
  isPriority: z.boolean().optional(),
});
export type JobStatusData = z.infer<typeof jobStatusSchema>;

// Company Jobs Query Schema
export const companyJobsSchema = z.object({
  take: z.coerce.number().int().positive().max(50).optional().default(10),
  skip: z.coerce.number().int().nonnegative().optional().default(0),
  category: z.nativeEnum(JobCategory).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  search: z.string().optional(),
});
export type CompanyJobsQueryData = z.infer<typeof companyJobsSchema>;
import { z } from 'zod';
import { Education, ApplicationStatus } from '@prisma/client';

// CV Submission Schema
export const cvSubmissionSchema = z.object({
  expectedSalary: z.number().min(1000000, 'Minimum salary should be at least Rp 1,000,000').max(1000000000, 'Maximum salary should not exceed Rp 1,000,000,000'),
  coverLetter: z.string().min(50, 'Cover letter should be at least 50 characters').max(2000, 'Cover letter should not exceed 2000 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Phone number should be at least 10 digits').max(15, 'Phone number should not exceed 15 digits'),
  currentLocation: z.string().min(2, 'Current location is required'),
  availableStartDate: z.string().min(1, 'Available start date is required'),
  portfolioUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
});
export type CVSubmissionForm = z.infer<typeof cvSubmissionSchema>;

// Application Filters Schema
export const applicationFiltersSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  ageMin: z.number().int().min(0, "Age values must be positive").max(100, "Age values seem unrealistic (max 100)").optional(),
  ageMax: z.number().int().min(0, "Age values must be positive").max(100, "Age values seem unrealistic (max 100)").optional(),
  salaryMin: z.number().int().min(0, "Salary values must be positive").optional(),
  salaryMax: z.number().int().min(0, "Salary values must be positive").optional(),
  education: z.nativeEnum(Education).or(z.string()).optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  hasCV: z.boolean().optional(),
  hasCoverLetter: z.boolean().optional(),
  testScoreMin: z.number().int().min(0, "Test score values must be positive").max(100, "Test score values cannot exceed 100").optional(),
  testScoreMax: z.number().int().min(0, "Test score values must be positive").max(100, "Test score values cannot exceed 100").optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['createdAt', 'expectedSalary', 'name', 'testScore', 'age']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).refine((data) => {
  // Age range validation
  if (data.ageMin !== undefined && data.ageMax !== undefined) {
    return data.ageMin <= data.ageMax;
  }
  return true;
}, {
  message: "Minimum age cannot be greater than maximum age",
  path: ["ageMax"],
}).refine((data) => {
  // Salary range validation
  if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: "Minimum salary cannot be greater than maximum salary",
  path: ["salaryMax"],
}).refine((data) => {
  // Test score range validation
  if (data.testScoreMin !== undefined && data.testScoreMax !== undefined) {
    return data.testScoreMin <= data.testScoreMax;
  }
  return true;
}, {
  message: "Minimum test score cannot be greater than maximum test score",
  path: ["testScoreMax"],
}).refine((data) => {
  // Date range validation
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateFrom) <= new Date(data.dateTo);
  }
  return true;
}, {
  message: "Start date cannot be after end date",
  path: ["dateTo"],
});
export type ApplicationFiltersData = z.infer<typeof applicationFiltersSchema>;
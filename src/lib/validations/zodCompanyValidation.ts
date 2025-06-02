import { z } from 'zod';
import { CompanySize } from '@prisma/client';

// Company Update Schema
export const updateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(100, "Company name must be less than 100 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters").optional(),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal('')),
  industry: z.string().min(1, "Industry is required").max(100, "Industry must be less than 100 characters").optional(),
  size: z.nativeEnum(CompanySize).optional(),
  foundedYear: z.number().int().min(1800, "Founded year must be at least 1800").max(new Date().getFullYear(), "Founded year cannot be in the future").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z.string().min(10, "Phone number should be at least 10 digits").max(20, "Phone number should not exceed 20 digits").optional().or(z.literal('')),
  address: z.string().max(500, "Address must be less than 500 characters").optional().or(z.literal('')),
  provinceId: z.string().uuid("Invalid province ID").optional().or(z.literal('')),
  cityId: z.string().uuid("Invalid city ID").optional().or(z.literal('')),
  country: z.string().max(100, "Country must be less than 100 characters").optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal('')),
  facebookUrl: z.string().url("Please enter a valid Facebook URL").optional().or(z.literal('')),
  twitterUrl: z.string().url("Please enter a valid Twitter URL").optional().or(z.literal('')),
  instagramUrl: z.string().url("Please enter a valid Instagram URL").optional().or(z.literal('')),
  logo: z.string().url("Please enter a valid logo URL").optional().or(z.literal('')),
  banner: z.string().url("Please enter a valid banner URL").optional().or(z.literal('')),
});
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>;
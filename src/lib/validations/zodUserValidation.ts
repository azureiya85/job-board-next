import { z } from 'zod';
import { Gender, Education } from '@prisma/client';

// User Profile Update Schema
export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  dateOfBirth: z.coerce.date().nullable().optional(), 
  gender: z.nativeEnum(Gender).nullable().optional(),
  lastEducation: z.nativeEnum(Education).nullable().optional(),
  currentAddress: z.string().max(255, "Address too long").nullable().optional(),
  phoneNumber: z.string().max(20, "Phone number too long").nullable().optional(),
  provinceId: z.string().uuid("Invalid province ID").nullable().optional(),
  cityId: z.string().uuid("Invalid city ID").nullable().optional(),
  country: z.string().max(100).optional().default("Indonesia"), 
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});
export type UpdateUserProfileFormData = z.infer<typeof updateUserProfileSchema>;
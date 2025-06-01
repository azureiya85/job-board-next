import { z } from 'zod';
import { Gender, Education } from '@prisma/client';

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters"),
});
export type LoginFormData = z.infer<typeof loginSchema>;

// New Registration Schema
export const registerSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string({ required_error: "Last name is required" })
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"), 
  confirmPassword: z
    .string({ required_error: "Confirm password is required" })
    .min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Path of error
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Schema for requesting a password reset
export const requestPasswordResetSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email address"),
});
export type RequestPasswordResetFormData = z.infer<typeof requestPasswordResetSchema>;

// Schema for resetting the password with a token
export const resetPasswordSchema = z.object({
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmNewPassword: z
    .string({ required_error: "Confirm new password is required" })
    .min(1, "Confirm new password is required"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match",
  path: ["confirmNewPassword"],
});
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

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

// User Profile Update Schema (from users/[id]/route.ts)
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

// Password Update Schema (from password/route.ts)
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    // .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character") // Optional special char
    ,
});

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

// TODO: Company Registration
// export const companyRegisterSchema = z.object({ ... });
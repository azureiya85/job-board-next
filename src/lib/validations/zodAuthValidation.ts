import { z } from 'zod';

// Login Schema
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

// Registration Schema
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
  path: ["confirmPassword"],
});
export type RegisterFormData = z.infer<typeof registerSchema>;

// Password Reset Request Schema
export const requestPasswordResetSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email address"),
});
export type RequestPasswordResetFormData = z.infer<typeof requestPasswordResetSchema>;

// Password Reset Schema
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

// Password Update Schema
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
});
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

// Company Registration Schema
export const companyRegisterSchema = z.object({
  companyName: z
    .string({ required_error: "Company name is required" })
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  companyEmail: z
    .string({ required_error: "Company email is required" })
    .min(1, "Company email is required")
    .email("Invalid email address"),
  industry: z
    .string({ required_error: "Industry is required" })
    .min(1, "Industry is required")
    .max(100, "Industry must be less than 100 characters"),
  website: z
    .string()
    .url("Please enter a valid website URL")
    .optional()
    .or(z.literal('')),
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
  path: ["confirmPassword"],
});
export type CompanyRegisterFormData = z.infer<typeof companyRegisterSchema>;
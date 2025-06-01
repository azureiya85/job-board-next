import { Gender, Education, UserRole } from '@prisma/client';

export interface Province {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string; 
  firstName: string;
  lastName: string;
  profileImage: string | null;
  isEmailVerified: boolean;
  role: UserRole;
  dateOfBirth: string | null; 
  gender: Gender | null;
  lastEducation: Education | null;
  currentAddress: string | null;
  phoneNumber: string | null;
  provinceId: string | null;
  province: Province | null;
  cityId: string | null;
  city: City | null;
  country: string | null;
}

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string; 
  lastEducation: string; 
  currentAddress: string;
  country: string;
}

export interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailFormValues {
  newEmail: string;
}

export interface ShowPasswordsState {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

export interface Message {
  type: 'success' | 'error';
  text: string;
}
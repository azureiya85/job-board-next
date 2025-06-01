import { Gender, Education } from '@prisma/client';

export const genderOptions = [
  { value: Gender.MALE, label: 'Male' },
  { value: Gender.FEMALE, label: 'Female' },
  { value: Gender.PREFER_NOT_TO_SAY, label: 'Prefer not to say' },
];

export const educationOptions = [
  { value: Education.HIGH_SCHOOL, label: 'High School/Equivalent' },
  { value: Education.DIPLOMA, label: 'Diploma' },
  { value: Education.BACHELOR, label: "Bachelor's Degree" },
  { value: Education.MASTER, label: "Master's Degree" },
  { value: Education.DOCTORATE, label: 'Doctorate' },
  { value: Education.OTHER, label: 'Other' },
];
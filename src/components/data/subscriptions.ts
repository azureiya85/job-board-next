import { Prisma } from '@prisma/client';

export interface UserSubscriptionPlanData {
  id: string;
  name: string; // 'STANDARD', 'PROFESSIONAL'
  price: number; // IDR
  duration: number; // days
  description: string;
  features: Prisma.JsonObject;
  createdAt?: Date;
  updatedAt?: Date;
}

export const userSubscriptionPlans: UserSubscriptionPlanData[] = [
  {
    id: 'plan_user_standard_01',
    name: 'STANDARD',
    price: 25000, // IDR 25,000 per month
    duration: 30,
    description: 'Access exclusive tools to boost your job search, including CV Generator and Skill Assessments.',
    features: {
      cvGenerator: true,
      skillAssessmentLimit: 2, // Can take 2 skill assessments per subscription period
      priorityCvReview: false,
    },
    createdAt: new Date('2023-01-01T10:00:00Z'),
    updatedAt: new Date('2023-01-01T10:00:00Z'),
  },
  {
    id: 'plan_user_professional_01',
    name: 'PROFESSIONAL',
    price: 100000, // IDR 100,000 per month
    duration: 30,
    description: 'Unlock all premium features: CV Generator, unlimited Skill Assessments, and priority CV review when applying.',
    features: {
      cvGenerator: true,
      skillAssessmentLimit: 'unlimited', // Or a very high number like 999
      priorityCvReview: true,
    },
    createdAt: new Date('2023-01-01T10:00:00Z'),
    updatedAt: new Date('2023-01-01T10:00:00Z'),
  },
];
import { ApplicationStatus } from '@prisma/client';
import { users } from './users'; 
import { jobPostings } from './jobs'; 

// Helper to generate unique CUID-like placeholders for applications
const generateApplicationId = (index: number): string => `application_${String(index).padStart(2, '0')}`;

// Helper for dates
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10, 0, 0, 0); // Standardize time for consistency
  return date;
};

export interface JobApplicationMockData {
  id: string;
  cvUrl: string;
  expectedSalary?: number;
  coverLetter?: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  adminNotes?: string; // Internal notes from company admin
  testScore?: number;
  testCompletedAt?: Date;
  userId: string;
  jobPostingId: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date; // When admin reviewed the application
}

const jobSeekerUsers = users.filter(user => user.role === 'USER');

// Ensure we have the specific seekers we expect by their mock emails/IDs
const seeker1 = jobSeekerUsers.find(u => u.id === 'user_seeker_01'); // Anisa Rahayu
const seeker2 = jobSeekerUsers.find(u => u.id === 'user_seeker_02'); // David Lee
const seeker3 = jobSeekerUsers.find(u => u.id === 'user_seeker_03'); // Siti Aminah

export const jobApplications: JobApplicationMockData[] = [];
let appIndex = 1;

const allJobPostingIds = jobPostings.map(jp => jp.id);

// --- Applications for Seeker 1 (Anisa Rahayu - user_seeker_01) ---
if (seeker1 && allJobPostingIds.length >= 4) {
  const seeker1JobIds = [allJobPostingIds[0], allJobPostingIds[1], allJobPostingIds[2], allJobPostingIds[3]]; // job_01 to job_04

  // App 1: PENDING
  jobApplications.push({
    id: generateApplicationId(appIndex++),
    userId: seeker1.id,
    jobPostingId: seeker1JobIds[0], // e.g., job_01
    cvUrl: `https://example.com/cv/${seeker1.firstName?.toLowerCase()}_${seeker1JobIds[0]}.pdf`,
    expectedSalary: 28000000,
    status: ApplicationStatus.PENDING,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  });

  // App 2: REVIEWED
  jobApplications.push({
    id: generateApplicationId(appIndex++),
    userId: seeker1.id,
    jobPostingId: seeker1JobIds[1], // e.g., job_02
    cvUrl: `https://example.com/cv/${seeker1.firstName?.toLowerCase()}_${seeker1JobIds[1]}.pdf`,
    expectedSalary: 18000000,
    status: ApplicationStatus.REVIEWED,
    adminNotes: 'Good profile, fits some criteria. Technical assessment pending.',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(3),
    reviewedAt: daysAgo(3),
  });

  // App 3: INTERVIEW_SCHEDULED
  jobApplications.push({
    id: generateApplicationId(appIndex++),
    userId: seeker1.id,
    jobPostingId: seeker1JobIds[2], // e.g., job_03
    cvUrl: `https://example.com/cv/${seeker1.firstName?.toLowerCase()}_${seeker1JobIds[2]}.pdf`,
    coverLetter: "Dear Hiring Manager, I am excited to apply for this position...",
    expectedSalary: 10000000,
    status: ApplicationStatus.INTERVIEW_SCHEDULED,
    adminNotes: 'Promising candidate, scheduled for initial screening.',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(2),
    reviewedAt: daysAgo(2),
  });

  // App 4: REJECTED
  jobApplications.push({
    id: generateApplicationId(appIndex++),
    userId: seeker1.id,
    jobPostingId: seeker1JobIds[3], // e.g., job_04
    cvUrl: `https://example.com/cv/${seeker1.firstName?.toLowerCase()}_${seeker1JobIds[3]}.pdf`,
    expectedSalary: 30000000,
    status: ApplicationStatus.REJECTED,
    rejectionReason: 'Experience level not matching senior requirements for this role. Lacks specific framework knowledge mentioned in JD.',
    adminNotes: 'Candidate has potential but not for this specific senior role.',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
    reviewedAt: daysAgo(1),
  });
} else {
  if (!seeker1) console.warn("Seeker 1 (user_seeker_01) not found.");
  if (allJobPostingIds.length < 4) console.warn("Not enough job postings for Seeker 1's applications.");
}

// --- Applications for Seeker 2 (David Lee - user_seeker_02) ---
if (seeker2 && allJobPostingIds.length >= 8) {
  const seeker2JobIds = [allJobPostingIds[4], allJobPostingIds[5], allJobPostingIds[6], allJobPostingIds[7]]; // job_05 to job_08

  // App 5: PENDING
  jobApplications.push({
    id: generateApplicationId(appIndex++),
    userId: seeker2.id,
    jobPostingId: seeker2JobIds[0], // e.g., job_05
    cvUrl: `https://example.com/cv/${seeker2.firstName?.toLowerCase()}_${seeker2JobIds[0]}.pdf`,
    expectedSalary: 16000000,
    status: ApplicationStatus.PENDING,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  });

  // App 6: REVIEWED
  jobApplications.push({
    id: generateApplicationId(appIndex++),
    userId: seeker2.id,
    jobPostingId: seeker2JobIds[1], // e.g., job_06
    cvUrl: `https://example.com/cv/${seeker2.firstName?.toLowerCase()}_${seeker2JobIds[1]}.pdf`,
    coverLetter: "To Whom It May Concern, I am writing to express my interest...",
    expectedSalary: 20000000,
    status: ApplicationStatus.REVIEWED,
    adminNotes: 'CV looks interesting. Portfolio review needed.',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(4),
    reviewedAt: daysAgo(4),
  });

  // App 7: INTERVIEW_SCHEDULED
  jobApplications.push({
    id: generateApplicationId(appIndex++),
    userId: seeker2.id,
    jobPostingId: seeker2JobIds[2], // e.g., job_07
    cvUrl: `https://example.com/cv/${seeker2.firstName?.toLowerCase()}_${seeker2JobIds[2]}.pdf`,
    expectedSalary: 12000000,
    status: ApplicationStatus.INTERVIEW_SCHEDULED,
    adminNotes: 'Strong match for junior role. Proceed with HR interview.',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(3),
    reviewedAt: daysAgo(3),
  });

  // App 8: REJECTED
  jobApplications.push({
    id: generateApplicationId(appIndex++),
    userId: seeker2.id,
    jobPostingId: seeker2JobIds[3], // e.g., job_08
    cvUrl: `https://example.com/cv/${seeker2.firstName?.toLowerCase()}_${seeker2JobIds[3]}.pdf`,
    expectedSalary: 25000000,
    status: ApplicationStatus.REJECTED,
    rejectionReason: 'Salary expectation significantly above budget for this position. Required specific certification not present.',
    adminNotes: 'Good candidate, but overqualified or mismatched expectations for this opening.',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(5),
    reviewedAt: daysAgo(5),
  });
} else {
  if (!seeker2) console.warn("Seeker 2 (user_seeker_02) not found.");
  if (allJobPostingIds.length < 8) console.warn("Not enough job postings for Seeker 2's applications.");
}


// --- Applications for Seeker 3 (Siti Aminah - user_seeker_03) ---
if (seeker3 && allJobPostingIds.length >= 12) {
  const seeker3JobIds = [allJobPostingIds[8], allJobPostingIds[9], allJobPostingIds[10], allJobPostingIds[11]]; // job_09 to job_12

  // App 9: PENDING
  jobApplications.push({
    id: generateApplicationId(appIndex++),
    userId: seeker3.id,
    jobPostingId: seeker3JobIds[0], // e.g., job_09
    cvUrl: `https://example.com/cv/${seeker3.firstName?.toLowerCase()}_${seeker3JobIds[0]}.pdf`,
    expectedSalary: 8000000,
    status: ApplicationStatus.PENDING,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  });

  // App 10: REVIEWED
  jobApplications.push({
    id: generateApplicationId(appIndex++),
    userId: seeker3.id,
    jobPostingId: seeker3JobIds[1], // e.g., job_10
    cvUrl: `https://example.com/cv/${seeker3.firstName?.toLowerCase()}_${seeker3JobIds[1]}.pdf`,
    expectedSalary: 10000000,
    status: ApplicationStatus.REVIEWED,
    adminNotes: 'Relevant internship experience. Worth a closer look for entry-level roles.',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    reviewedAt: daysAgo(1),
  });

  // App 11: INTERVIEW_SCHEDULED
  jobApplications.push({
    id: generateApplicationId(appIndex++),
    userId: seeker3.id,
    jobPostingId: seeker3JobIds[2], // e.g., job_11
    cvUrl: `https://example.com/cv/${seeker3.firstName?.toLowerCase()}_${seeker3JobIds[2]}.pdf`,
    coverLetter: "Dear Team, Please find my application for your consideration.",
    expectedSalary: 7500000,
    status: ApplicationStatus.INTERVIEW_SCHEDULED,
    adminNotes: 'Candidate accepted interview invitation for the internship program.',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(6),
    reviewedAt: daysAgo(6),
  });

  // App 12: REJECTED
  jobApplications.push({
    id: generateApplicationId(appIndex++),
    userId: seeker3.id,
    jobPostingId: seeker3JobIds[3], // e.g., job_12
    cvUrl: `https://example.com/cv/${seeker3.firstName?.toLowerCase()}_${seeker3JobIds[3]}.pdf`,
    expectedSalary: 12000000,
    status: ApplicationStatus.REJECTED,
    rejectionReason: 'Insufficient years of professional experience for the role. Looking for candidates with more project leadership.',
    adminNotes: 'Promising for entry-level, but this role requires more seniority.',
    createdAt: daysAgo(9),
    updatedAt: daysAgo(7),
    reviewedAt: daysAgo(7),
  });
} else {
    if (!seeker3) console.warn("Seeker 3 (user_seeker_03) not found.");
    if (allJobPostingIds.length < 12) console.warn("Not enough job postings for Seeker 3's applications.");
}

if (jobApplications.length < 12 && (seeker1 || seeker2 || seeker3)) {
    console.warn(`Generated ${jobApplications.length} applications. Expected up to 12 if all seekers and sufficient jobs are present.`);
}
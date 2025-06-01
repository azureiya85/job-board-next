import { InterviewType, InterviewStatus, ApplicationStatus } from '@prisma/client';
import { jobApplications } from './jobApplication'; 
import { users } from './users'; 
import { jobPostings } from './jobs'; 
import type { JobApplicationMockData } from './jobApplication';


// Helper to generate unique CUID-like placeholders for interviews
const generateInterviewId = (index: number): string => `interview_${String(index).padStart(2, '0')}`;

// Helper for dates
const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  // Set a specific time, e.g., 10:00 AM, 02:00 PM etc. for variety
  const hour = 9 + (days % 8); // 9 AM to 4 PM
  date.setHours(hour, 0, 0, 0);
  return date;
};

export interface InterviewScheduleMockData {
  id: string;
  scheduledAt: Date;
  duration: number; // Duration in minutes
  location?: string; // Physical location or meeting URL
  interviewType: InterviewType;
  notes?: string;
  status: InterviewStatus;
  reminderSent: boolean;
  jobApplicationId: string;
  jobPostingId: string;
  candidateId: string; // This is the userId
  createdAt: Date;
  updatedAt: Date;
}

export const interviewSchedules: InterviewScheduleMockData[] = [];

const applicationsForInterview = jobApplications.filter(
  (app): app is JobApplicationMockData & { reviewedAt: Date } => // Type guard for reviewedAt
    app.status === ApplicationStatus.INTERVIEW_SCHEDULED && app.reviewedAt !== undefined
);

let interviewIndex = 1;

applicationsForInterview.forEach(app => {
  const job = jobPostings.find(j => j.id === app.jobPostingId);
 const candidate = users.find(u => u.id === app.userId);

  const candidateName = candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Candidate';
  const jobTitle = job ? job.title : 'the position';

  let locationNotes = `Online Interview via Google Meet: https://meet.google.com/sample-${interviewIndex}`;
  if (interviewIndex % 2 === 0) {
    locationNotes = `Online Interview via Zoom: https://zoom.us/j/123456789${interviewIndex}`;
  }
  if (interviewIndex % 3 === 0) { // Occasional phone interview
  }


  interviewSchedules.push({
    id: generateInterviewId(interviewIndex++),
    jobApplicationId: app.id,
    jobPostingId: app.jobPostingId,
    candidateId: app.userId,
    scheduledAt: daysFromNow(7 + interviewIndex), // Stagger interview dates, ensure it's after application's reviewedAt
    duration: 60, // 1 hour
    location: locationNotes,
    interviewType: InterviewType.ONLINE,
    notes: `Initial HR screening for ${jobTitle} with ${candidateName}. Focus on cultural fit and experience overview.`,
    status: InterviewStatus.SCHEDULED,
    reminderSent: false, // Assume reminder not sent yet
    createdAt: app.reviewedAt ? new Date(app.reviewedAt.getTime() + 60000) : new Date(), // Created shortly after review
    updatedAt: app.reviewedAt ? new Date(app.reviewedAt.getTime() + 60000) : new Date(),
  });
});

if (applicationsForInterview.length > 0 && interviewSchedules.length === 0) {
    console.warn("Found applications for interview, but no interview schedules were generated. Check logic.");
}
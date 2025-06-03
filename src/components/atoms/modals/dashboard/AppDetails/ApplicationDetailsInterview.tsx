'use client';

import {
  ApplicationStatus,
  InterviewStatus,
  InterviewType,
  InterviewSchedule,
} from '@prisma/client';
import {
  Calendar,
  Clock,
  MapPin,
  Info,
  UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApplicationDetailsInterviewProps {
  status: ApplicationStatus;
  interviewSchedules: (Pick<
    InterviewSchedule,
    'id' | 'scheduledAt' | 'interviewType' | 'location' | 'status' | 'duration' | 'notes'
  >)[];
}

// Helper for interview type label
const interviewTypeLabels: Record<InterviewType, string> = {
  ONLINE: 'Online Meeting',
  PHONE: 'Phone Call',
  IN_PERSON: 'In-Person Interview',
};

// Helper for interview status label
const interviewStatusLabels: Record<InterviewStatus, string> = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Rescheduled', 
};

export default function ApplicationDetailsInterview({ 
  status, 
  interviewSchedules 
}: ApplicationDetailsInterviewProps) {
  // Only show interview section if conditions are met
  const shouldShowInterviews = (
    status === ApplicationStatus.INTERVIEW_SCHEDULED ||
    status === ApplicationStatus.INTERVIEW_COMPLETED ||
    (status === ApplicationStatus.ACCEPTED && interviewSchedules.length > 0) ||
    (status === ApplicationStatus.REJECTED && interviewSchedules.length > 0)
  ) && interviewSchedules.length > 0;

  if (!shouldShowInterviews) {
    return null;
  }

  return (
    <Card className="bg-sky-50 border-sky-100 shadow-sm">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-base font-semibold text-sky-800 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-sky-600" />
          Interview Details
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-sky-700 space-y-3 pt-0">
        {interviewSchedules.map((interview) => (
          <div key={interview.id} className="border-t border-sky-200 first:border-t-0 pt-3 first:pt-0">
            <p className="flex items-center mb-0.5">
              <Clock className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              <span className="font-medium">Date:</span> 
              {format(new Date(interview.scheduledAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </p>
            <p className="flex items-center mb-0.5">
              <Info className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              <span className="font-medium">Type:</span> 
              {interviewTypeLabels[interview.interviewType]}
            </p>
            <p className="flex items-center mb-0.5">
              <MapPin className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              <span className="font-medium">Location/Link:</span> 
              {interview.location || 'Details pending'}
            </p>
            <p className="text-xs flex items-start">
               <UserCheck className="w-3.5 h-3.5 mr-2 mt-0.5 flex-shrink-0" />
               <div><span className="font-medium">Status:</span> {interviewStatusLabels[interview.status]}</div>
            </p>
            {interview.notes && (
              <p className="mt-1.5 text-xs italic bg-sky-100/70 p-2 rounded-md border border-sky-200">
                <strong>Notes:</strong> {interview.notes}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
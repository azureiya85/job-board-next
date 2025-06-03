'use client';

import {
  ApplicationStatus,
  InterviewSchedule,
} from '@prisma/client';
import {
  X,
  CheckCircle,
  Activity,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { statusConfig, statusOrder } from '@/components/atoms/modals/dashboard/AppDetails/statusConfig';

interface ApplicationDetailsTimelineProps {
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  interviewSchedules: (Pick<
    InterviewSchedule,
    'id' | 'scheduledAt' | 'interviewType' | 'location' | 'status' | 'duration' | 'notes'
  >)[];
}



export default function ApplicationDetailsTimeline({ 
  status, 
  createdAt, 
  updatedAt, 
  interviewSchedules 
}: ApplicationDetailsTimelineProps) {

  // Timeline steps definition
  const timelineSteps = [
    { name: 'Applied', status: ApplicationStatus.PENDING, date: createdAt },
    {
      name: 'Reviewed',
      status: ApplicationStatus.REVIEWED,
      date: status !== ApplicationStatus.PENDING ? updatedAt : null, 
    },
    {
      name: 'Interview Stage',
      status: ApplicationStatus.INTERVIEW_SCHEDULED, // Represents the start of interview process
      date: interviewSchedules.length > 0 ? interviewSchedules[0].scheduledAt : null,
    },
    {
      name: 'Decision',
      status: status === ApplicationStatus.ACCEPTED || status === ApplicationStatus.REJECTED ? status : null,
      date: status === ApplicationStatus.ACCEPTED || status === ApplicationStatus.REJECTED ? updatedAt : null,
    },
  ];

  // Filter out Interview Stage if no interviews and status is PENDING/REVIEWED
  const filteredTimelineSteps = timelineSteps.filter(step => {
    if (step.name === 'Interview Stage') {
      return interviewSchedules.length > 0 || 
           (status === ApplicationStatus.INTERVIEW_SCHEDULED || status === ApplicationStatus.INTERVIEW_COMPLETED || status === ApplicationStatus.ACCEPTED)
    }
    return true;
  });

  const getStepVisualState = (
    stepTargetStatus: ApplicationStatus | null, // The status this timeline step represents
    currentAppStatus: ApplicationStatus
  ): 'completed' | 'current' | 'upcoming' | 'skipped' => {
    if (currentAppStatus === ApplicationStatus.WITHDRAWN) {
        if (stepTargetStatus === ApplicationStatus.PENDING) return 'completed';
        return 'upcoming'; // or 'skipped'
    }

    const stepTargetStatusIndex = stepTargetStatus ? statusOrder.indexOf(stepTargetStatus) : -1;

    // Case 1: Application is REJECTED
    if (currentAppStatus === ApplicationStatus.REJECTED) {
      if (stepTargetStatus === ApplicationStatus.REJECTED) return 'current'; 
      if (stepTargetStatus === ApplicationStatus.ACCEPTED) return 'skipped'; 
      if (stepTargetStatus && stepTargetStatusIndex < statusOrder.indexOf(ApplicationStatus.REJECTED)) {
        if (stepTargetStatus === ApplicationStatus.INTERVIEW_SCHEDULED || stepTargetStatus === ApplicationStatus.INTERVIEW_COMPLETED) {
          return interviewSchedules.length > 0 ? 'completed' : 'skipped'; // Skipped if no interview happened
        }
        return 'completed'; // PENDING, REVIEWED are completed
      }
      return 'upcoming'; // Should not be reached if timeline is structured well
    }

    // Case 2: Application is ACCEPTED
    if (currentAppStatus === ApplicationStatus.ACCEPTED) {
      if (stepTargetStatus === ApplicationStatus.ACCEPTED) return 'current';
      if (stepTargetStatus === ApplicationStatus.REJECTED) return 'skipped';
      if (stepTargetStatus && stepTargetStatusIndex < statusOrder.indexOf(ApplicationStatus.ACCEPTED)) return 'completed';
      return 'upcoming';
    }
    
    // Case 3: Application is INTERVIEW_COMPLETED
    if (currentAppStatus === ApplicationStatus.INTERVIEW_COMPLETED) {
        if (stepTargetStatus === ApplicationStatus.INTERVIEW_COMPLETED) return 'current';
        if (stepTargetStatus === ApplicationStatus.INTERVIEW_SCHEDULED) return 'completed'; // Scheduled is now completed
        if (stepTargetStatus && stepTargetStatusIndex < statusOrder.indexOf(ApplicationStatus.INTERVIEW_COMPLETED)) return 'completed';
        return 'upcoming';
    }

    // Case 4: Application is INTERVIEW_SCHEDULED
    if (currentAppStatus === ApplicationStatus.INTERVIEW_SCHEDULED) {
        if (stepTargetStatus === ApplicationStatus.INTERVIEW_SCHEDULED) return 'current';
        if (stepTargetStatus && stepTargetStatusIndex < statusOrder.indexOf(ApplicationStatus.INTERVIEW_SCHEDULED)) return 'completed';
        return 'upcoming';
    }
    
    // Case 5: Application is REVIEWED
    if (currentAppStatus === ApplicationStatus.REVIEWED) {
        if (stepTargetStatus === ApplicationStatus.REVIEWED) return 'current';
        if (stepTargetStatus === ApplicationStatus.PENDING) return 'completed';
        return 'upcoming';
    }

    // Case 6: Application is PENDING
    if (currentAppStatus === ApplicationStatus.PENDING) {
        if (stepTargetStatus === ApplicationStatus.PENDING) return 'current';
        return 'upcoming';
    }
    
    return 'upcoming'; 
  };

  // Don't render timeline for withdrawn applications
  if (status === ApplicationStatus.WITHDRAWN) {
    return null;
  }

  return (
    <div className="mt-2">
      <h4 className="text-base font-semibold text-foreground mb-4">Application Progress</h4>
      <ol className="relative border-l border-border ml-1.5">
        {filteredTimelineSteps.map((step, index) => {
          const stepState = getStepVisualState(step.status, status);
          
          let IconComponent = Clock;
          let iconClasses = 'bg-gray-200 text-gray-600'; // Upcoming
          let titleClass = 'text-foreground';

          if (stepState === 'completed') {
            IconComponent = CheckCircle;
            iconClasses = 'bg-green-500 text-green-50';
          } else if (stepState === 'current') {
            IconComponent = Activity; 
            iconClasses = 'bg-primary text-primary-foreground';
            titleClass = 'text-primary font-semibold';
          } else if (stepState === 'skipped') {
            IconComponent = X;
            iconClasses = 'bg-gray-100 text-gray-400';
            titleClass = 'text-muted-foreground line-through';
          }

          let stepName = step.name;
          if (step.name === 'Decision' && (status === ApplicationStatus.ACCEPTED || status === ApplicationStatus.REJECTED)) {
            stepName = statusConfig[status].text;
            if (stepState === 'current') { 
              IconComponent = statusConfig[status].icon;
            }
          }
          else if (step.name === 'Decision' && stepState === 'upcoming') {
               stepName = "Awaiting Decision";
          }

          return (
            <li key={step.name + index} className="mb-6 ml-6">
              <span
                className={`absolute flex items-center justify-center w-7 h-7 rounded-full -left-[0.9rem] ring-4 ring-background ${iconClasses}`}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </span>
              <h5 className={`font-medium text-sm ${titleClass}`}>
                {stepName}
              </h5>
              {step.date && stepState !== 'skipped' && ( // Hide date for skipped steps
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(step.date), 'MMM d, yyyy, HH:mm')}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
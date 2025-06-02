'use client';

import {
  ApplicationStatus,
  InterviewStatus,
  InterviewType,
  JobApplication,
  JobPosting,
  Company,
  InterviewSchedule,
} from '@prisma/client';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Info,
  CheckCircle,
  Building,
  XCircle,
  MessageSquare,
  UserCheck,
  AlertTriangle,
  CalendarCheck,
  Activity, 
  LucideIcon
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export type ApplicationWithDetails = JobApplication & {
  jobPosting: Pick<JobPosting, 'id' | 'title' | 'isRemote'> & {
    province?: { name: string } | null;
    city?: { name: string } | null;
    company: Pick<Company, 'id' | 'name' | 'logo'>;
  };
  interviewSchedules: (Pick<
    InterviewSchedule,
    'id' | 'scheduledAt' | 'interviewType' | 'location' | 'status' | 'duration' | 'notes'
  >)[];
};

interface ApplicationDetailModalProps {
  application: ApplicationWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

// Status configuration
const statusConfig: Record<
  ApplicationStatus,
  {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className: string;
    icon: LucideIcon; 
    text: string;
  }
> = {
  PENDING: {
    variant: 'secondary',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
    icon: Clock,
    text: 'Pending',
  },
  REVIEWED: {
    variant: 'secondary',
    className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    icon: MessageSquare,
    text: 'Reviewed',
  },
  INTERVIEW_SCHEDULED: {
    variant: 'secondary',
    className: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
    icon: CalendarCheck,
    text: 'Interview Scheduled',
  },
  INTERVIEW_COMPLETED: {
    variant: 'secondary',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    icon: UserCheck,
    text: 'Interview Completed',
  },
  ACCEPTED: {
    variant: 'secondary',
    className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    icon: CheckCircle,
    text: 'Accepted',
  },
  REJECTED: {
    variant: 'destructive', 
    className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', 
    icon: XCircle,
    text: 'Rejected',
  },
  WITHDRAWN: {
    variant: 'outline',
    className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
    icon: AlertTriangle,
    text: 'Withdrawn',
  },
};

function ModalStatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} gap-1.5 font-medium py-1 px-2.5 text-xs`}>
      <IconComponent className="h-3.5 w-3.5" />
      {config.text}
    </Badge>
  );
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

export default function ApplicationDetailModal({ application, isOpen, onClose }: ApplicationDetailModalProps) {
  if (!application) return null;

  const { jobPosting, status, createdAt, updatedAt, rejectionReason, adminNotes, interviewSchedules } = application;
  const company = jobPosting.company;

  const order: ApplicationStatus[] = [
    ApplicationStatus.PENDING,
    ApplicationStatus.REVIEWED,
    ApplicationStatus.INTERVIEW_SCHEDULED,
    ApplicationStatus.INTERVIEW_COMPLETED,
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED, 
  ];

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


    const stepTargetStatusIndex = stepTargetStatus ? order.indexOf(stepTargetStatus) : -1;

    // Case 1: Application is REJECTED
    if (currentAppStatus === ApplicationStatus.REJECTED) {
      if (stepTargetStatus === ApplicationStatus.REJECTED) return 'current'; 
      if (stepTargetStatus === ApplicationStatus.ACCEPTED) return 'skipped'; 
      if (stepTargetStatus && stepTargetStatusIndex < order.indexOf(ApplicationStatus.REJECTED)) {
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
      if (stepTargetStatus && stepTargetStatusIndex < order.indexOf(ApplicationStatus.ACCEPTED)) return 'completed';
      return 'upcoming';
    }
    
    // Case 3: Application is INTERVIEW_COMPLETED
    if (currentAppStatus === ApplicationStatus.INTERVIEW_COMPLETED) {
        if (stepTargetStatus === ApplicationStatus.INTERVIEW_COMPLETED) return 'current';
        if (stepTargetStatus === ApplicationStatus.INTERVIEW_SCHEDULED) return 'completed'; // Scheduled is now completed
        if (stepTargetStatus && stepTargetStatusIndex < order.indexOf(ApplicationStatus.INTERVIEW_COMPLETED)) return 'completed';
        return 'upcoming';
    }

    // Case 4: Application is INTERVIEW_SCHEDULED
    if (currentAppStatus === ApplicationStatus.INTERVIEW_SCHEDULED) {
        if (stepTargetStatus === ApplicationStatus.INTERVIEW_SCHEDULED) return 'current';
        if (stepTargetStatus && stepTargetStatusIndex < order.indexOf(ApplicationStatus.INTERVIEW_SCHEDULED)) return 'completed';
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
    
    return 'upcoming'; // Default
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-foreground">Application Details</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="flex-1 [&>div>div]:!px-6 [&>div>div]:!pb-6 [&>div>div]:pt-2"> {/* Apply padding to ScrollArea's content */}
          <div className="space-y-6">
            {/* Job and Company Info */}
            <div className="pt-4"> {/* Add pt-4 here to compensate for ScrollArea's structure */}
              <h3 className="text-lg font-semibold text-primary">{jobPosting.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Building className="w-4 h-4" /> {company.name}
              </p>
              <div className="mt-3">
                <ModalStatusBadge status={status} />
              </div>
            </div>

            {/* Application Progress Timeline */}
            {status !== ApplicationStatus.WITHDRAWN && ( 
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

                    // Special handling for the "Decision" step's name based on actual outcome
                    let stepName = step.name;
                    if (step.name === 'Decision' && (status === ApplicationStatus.ACCEPTED || status === ApplicationStatus.REJECTED)) {
                      stepName = statusConfig[status].text;
                      if (stepState === 'current') { // Use decision status icon if current
                        IconComponent = statusConfig[status].icon;
                      }
                    }
                    // If the step is "Decision" but it's upcoming (no decision yet)
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
            )}

            {/* Interview Information */}
            {(status === ApplicationStatus.INTERVIEW_SCHEDULED ||
              status === ApplicationStatus.INTERVIEW_COMPLETED ||
              (status === ApplicationStatus.ACCEPTED && interviewSchedules.length > 0) ||
              (status === ApplicationStatus.REJECTED && interviewSchedules.length > 0) 
            ) && interviewSchedules.length > 0 && (
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
                         <div><span className="font-medium">Status:</span> {interviewStatusLabels[interview.status]}</div>
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
            )}

            {/* Rejection Information */}
            {status === ApplicationStatus.REJECTED && (
              <Card className="bg-red-50 border-red-100 shadow-sm">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-base font-semibold text-red-800 flex items-center">
                    <XCircle className="w-4 h-4 mr-2 text-red-600" />
                    Application Outcome
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-red-700 pt-0">
                  {rejectionReason ? (
                    <p>{rejectionReason}</p>
                  ) : (
                    <p>
                      Unfortunately, your application was not successful at this time. We encourage you to apply for
                      other suitable roles.
                    </p>
                  )}
                  {adminNotes && <p className="text-xs text-red-600 mt-1.5 italic">(Internal Feedback: {adminNotes})</p>}
                </CardContent>
              </Card>
            )}

             {/* Withdrawn Information */}
            {status === ApplicationStatus.WITHDRAWN && (
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-gray-600" />
                    Application Withdrawn
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 pt-0">
                    <p>You have withdrawn this application on {format(new Date(updatedAt), 'MMMM d, yyyy')}.</p>
                </CardContent>
              </Card>
            )}


            <p className="text-xs text-muted-foreground text-center pt-2">
              Applied: {format(new Date(createdAt), 'MMM d, yyyy')} | Last Update: {format(new Date(updatedAt), 'MMM d, yyyy')}
            </p>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 sm:p-6 border-t bg-muted/30">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
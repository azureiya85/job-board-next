'use client';

import {
  ApplicationStatus,
  JobApplication,
  JobPosting,
  Company,
  InterviewSchedule,
} from '@prisma/client';
import {
  X,
  Building,
  XCircle,
  AlertTriangle,
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
import ApplicationDetailsTimeline from './AppDetails/ApplicationDetailsTimeline';
import ApplicationDetailsInterview from './AppDetails/ApplicationDetailsInterview';
import { statusConfig } from '@/components/atoms/modals/dashboard/AppDetails/statusConfig';

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

export default function ApplicationDetailModal({ application, isOpen, onClose }: ApplicationDetailModalProps) {
  if (!application) return null;

  const { jobPosting, status, createdAt, updatedAt, rejectionReason, adminNotes, interviewSchedules } = application;
  const company = jobPosting.company;

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

        <ScrollArea className="flex-1 [&>div>div]:!px-6 [&>div>div]:!pb-6 [&>div>div]:pt-2"> 
          <div className="space-y-6">
            {/* Job and Company Info */}
            <div className="pt-4">
              <h3 className="text-lg font-semibold text-primary">{jobPosting.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Building className="w-4 h-4" /> {company.name}
              </p>
              <div className="mt-3">
                <ModalStatusBadge status={status} />
              </div>
            </div>

            {/* Application Progress Timeline */}
            <ApplicationDetailsTimeline 
              status={status}
              createdAt={createdAt}
              updatedAt={updatedAt}
              interviewSchedules={interviewSchedules}
            />

            {/* Interview Information */}
            <ApplicationDetailsInterview 
              status={status}
              interviewSchedules={interviewSchedules}
            />

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
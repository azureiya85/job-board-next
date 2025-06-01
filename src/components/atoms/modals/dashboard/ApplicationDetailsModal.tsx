'use client';
import { ApplicationStatus, InterviewStatus, InterviewType } from '@prisma/client';
import { X, Calendar, Clock, MapPinIcon, Info, CheckCircle, Building, Users, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge, { statusStyles } from '@/components/atoms/dashboard/StatusBadge';
import { ApplicationWithDetails } from '@/components/atoms/dashboard/ApplicationCard'; 


interface ApplicationDetailModalProps {
  application: ApplicationWithDetails | null;
  onClose: () => void;
}

// Helper for interview type label
const interviewTypeLabels: Record<InterviewType, string> = {
  ONLINE: 'Online Meeting',
  PHONE: 'Phone Call',
  IN_PERSON: 'In-Person Interview',
};

// Helper for interview status label (optional, if you want to show it)
const interviewStatusLabels: Record<InterviewStatus, string> = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Rescheduled',
};


export default function ApplicationDetailModal({ application, onClose }: ApplicationDetailModalProps) {
  if (!application) return null;

  const { jobPosting, status, createdAt, updatedAt, rejectionReason, adminNotes, interviewSchedules } = application;
  const company = jobPosting.company;

  // Simple timeline steps
  const timelineSteps = [
    { name: 'Applied', status: ApplicationStatus.PENDING, date: createdAt },
    { name: 'Reviewed', status: ApplicationStatus.REVIEWED, date: status === ApplicationStatus.REVIEWED || status === ApplicationStatus.INTERVIEW_SCHEDULED || status === ApplicationStatus.ACCEPTED || status === ApplicationStatus.REJECTED ? updatedAt : null },
    { name: 'Interview Stage', status: ApplicationStatus.INTERVIEW_SCHEDULED, date: interviewSchedules.length > 0 ? interviewSchedules[0].scheduledAt : null },
    { name: 'Decision', status: status === ApplicationStatus.ACCEPTED || status === ApplicationStatus.REJECTED ? status : null, date: (status === ApplicationStatus.ACCEPTED || status === ApplicationStatus.REJECTED) ? updatedAt : null },
  ];

  const getStepStatus = (stepStatus: ApplicationStatus | null, currentAppStatus: ApplicationStatus) => {
    if (!stepStatus) return 'upcoming';
    const order: ApplicationStatus[] = [ApplicationStatus.PENDING, ApplicationStatus.REVIEWED, ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.INTERVIEW_COMPLETED, ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED];
    
    const stepIndex = order.indexOf(stepStatus);
    const currentIndex = order.indexOf(currentAppStatus);

    if (stepStatus === currentAppStatus && (currentAppStatus === ApplicationStatus.ACCEPTED || currentAppStatus === ApplicationStatus.REJECTED)) return 'current';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    if (currentAppStatus === ApplicationStatus.ACCEPTED && stepStatus === ApplicationStatus.REJECTED) return 'skipped'; // e.g. decision is ACCEPTED, skip REJECTED step
    if (currentAppStatus === ApplicationStatus.REJECTED && stepStatus === ApplicationStatus.ACCEPTED) return 'skipped'; // e.g. decision is REJECTED, skip ACCEPTED step
    
    // Special handling for when current status is REJECTED but we are at INTERVIEW_SCHEDULED step visually
    if (currentAppStatus === ApplicationStatus.REJECTED && stepStatus === ApplicationStatus.INTERVIEW_SCHEDULED && interviewSchedules.length > 0) return 'completed';


    return 'upcoming';
  };
  
  const currentStatusIndex = timelineSteps.findIndex(step => step.status === status || (step.name === 'Decision' && (status === ApplicationStatus.ACCEPTED || status === ApplicationStatus.REJECTED)));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Application Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Job and Company Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-primary-700">{jobPosting.title}</h3>
            <p className="text-md text-gray-600 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-gray-500" /> {company.name}
            </p>
            <div className="mt-2">
              <StatusBadge status={status} />
            </div>
          </div>

          {/* Tracking Process */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-700 mb-3">Application Progress</h4>
            <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2">
              {timelineSteps.map((step, index) => {
                let stepState = 'upcoming';
                if (index < currentStatusIndex) stepState = 'completed';
                else if (index === currentStatusIndex) stepState = 'current';

                // Specific logic for final decision step
                if (step.name === 'Decision') {
                    if (status === ApplicationStatus.ACCEPTED || status === ApplicationStatus.REJECTED) {
                        stepState = 'current'; // Always current if it's the decision
                    } else if (currentStatusIndex > index ) { // if we passed this hypothetical step
                        stepState = 'completed';
                    } else {
                        stepState = 'upcoming';
                    }
                } else if (status === ApplicationStatus.REJECTED && index < timelineSteps.findIndex(s => s.name === "Decision")) {
                    // If rejected, all previous steps are 'completed' unless it's the rejection itself
                    stepState = 'completed';
                }


                // A more direct way for status check for non-Decision steps
                if (step.status) {
                  const stepProgress = getStepStatus(step.status, status);
                   if (stepProgress === 'completed') stepState = 'completed';
                   else if (stepProgress === 'current') stepState = 'current';
                   else stepState = 'upcoming';

                   // if rejected, all previous steps are effectively complete
                   if (status === ApplicationStatus.REJECTED && step.status !== ApplicationStatus.REJECTED && timelineSteps.findIndex(s=>s.status === status) > index) {
                       stepState = 'completed';
                   }
                }


                return (
                  <li key={step.name} className="mb-6 ml-6">
                    <span
                      className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-white dark:ring-gray-900
                        ${stepState === 'completed' ? 'bg-green-500' : stepState === 'current' ? 'bg-primary-500' : 'bg-gray-300'}`}
                    >
                      {stepState === 'completed' ? (
                        <CheckCircle className="w-3 h-3 text-white" />
                      ) : stepState === 'current' ? (
                        <Users className="w-3 h-3 text-white" /> /* Using Users as a generic current icon */
                      ) : (
                        <Clock className="w-3 h-3 text-gray-700" />
                      )}
                    </span>
                    <h5 className="font-medium text-gray-800">
                      {step.name === 'Decision' && step.status ? statusStyles[step.status].text : step.name}
                    </h5>
                    {step.date && (
                       <p className="text-xs text-gray-500">
                         {format(new Date(step.date), 'MMM d, yyyy, HH:mm')}
                       </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>


          {/* Interview Information */}
          {(status === ApplicationStatus.INTERVIEW_SCHEDULED || status === ApplicationStatus.INTERVIEW_COMPLETED || status === ApplicationStatus.ACCEPTED) && interviewSchedules.length > 0 && (
            <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
              <h4 className="text-md font-semibold text-sky-800 mb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-sky-600" />
                Interview Scheduled
              </h4>
              {interviewSchedules.map(interview => (
                <div key={interview.id} className="mb-2 last:mb-0 text-sm text-sky-700">
                  <p className="flex items-center"><Clock className="w-4 h-4 mr-2" />Date: {format(new Date(interview.scheduledAt), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</p>
                  <p className="flex items-center"><Info className="w-4 h-4 mr-2" />Type: {interviewTypeLabels[interview.interviewType]}</p>
                  <p className="flex items-center"><MapPinIcon className="w-4 h-4 mr-2" />Location/Link: {interview.location || 'Details pending'}</p>
                  {interview.notes && <p className="mt-1 text-xs italic">Notes: {interview.notes}</p>}
                  <p className="text-xs mt-1">Status: <span className="font-medium">{interviewStatusLabels[interview.status]}</span></p>
                </div>
              ))}
            </div>
          )}

          {/* Rejection Information */}
          {status === ApplicationStatus.REJECTED && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-md font-semibold text-red-800 mb-2 flex items-center">
                <XCircle className="w-5 h-5 mr-2 text-red-600" />
                Application Update
              </h4>
              {rejectionReason ? (
                <p className="text-sm text-red-700">{rejectionReason}</p>
              ) : (
                <p className="text-sm text-red-700">Unfortunately, your application was not successful at this time. We encourage you to apply for other suitable roles.</p>
              )}
              {adminNotes && ( // Typically adminNotes are internal, but if you decide to show some part:
                <p className="text-xs text-red-600 mt-1 italic">(Feedback: {adminNotes})</p>
              )}
            </div>
          )}

          <p className="text-xs text-gray-400 text-center mt-4">
            Applied on: {format(new Date(createdAt), 'MMM d, yyyy')} | Last updated: {format(new Date(updatedAt), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="p-4 bg-gray-50 border-t text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
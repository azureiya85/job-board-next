import { ApplicationStatus } from '@prisma/client';
import { StatusDisplayInfo } from '@/types/applicants';

export function validateStatusTransition(
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): { valid: boolean; message: string } {
  const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    [ApplicationStatus.PENDING]: [
      ApplicationStatus.REVIEWED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.INTERVIEW_SCHEDULED,
    ],
    [ApplicationStatus.REVIEWED]: [
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.ACCEPTED,
    ],
    [ApplicationStatus.INTERVIEW_SCHEDULED]: [
      ApplicationStatus.INTERVIEW_COMPLETED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.ACCEPTED, 
    ],
    [ApplicationStatus.INTERVIEW_COMPLETED]: [
      ApplicationStatus.ACCEPTED,
      ApplicationStatus.REJECTED,
    ],
    [ApplicationStatus.ACCEPTED]: [], 
    [ApplicationStatus.REJECTED]: [], 
    [ApplicationStatus.WITHDRAWN]: [], 
  };

  if (currentStatus === newStatus) {
    return {
      valid: true, 
      message: 'New status is the same as current status.',
    };
  }

  const allowedNextStates = allowedTransitions[currentStatus] || [];

  if (!allowedNextStates.includes(newStatus)) {
    return {
      valid: false,
      message: `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedNextStates.join(', ') || 'None'}`,
    };
  }

  return {
    valid: true,
    message: 'Valid transition',
  };
}

export function getAvailableStatuses(
  currentStatus: ApplicationStatus
): ApplicationStatus[] {
  const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    [ApplicationStatus.PENDING]: [
      ApplicationStatus.REVIEWED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.INTERVIEW_SCHEDULED,
    ],
    [ApplicationStatus.REVIEWED]: [
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.ACCEPTED,
    ],
    [ApplicationStatus.INTERVIEW_SCHEDULED]: [
      ApplicationStatus.INTERVIEW_COMPLETED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.ACCEPTED,
    ],
    [ApplicationStatus.INTERVIEW_COMPLETED]: [
      ApplicationStatus.ACCEPTED,
      ApplicationStatus.REJECTED,
    ],
    [ApplicationStatus.ACCEPTED]: [],
    [ApplicationStatus.REJECTED]: [],
    [ApplicationStatus.WITHDRAWN]: [],
  };

  return allowedTransitions[currentStatus] || [];
}

export function getStatusDisplay(status: ApplicationStatus): StatusDisplayInfo {
  const statusMap: Record<ApplicationStatus, StatusDisplayInfo> = {
    [ApplicationStatus.PENDING]: {
      label: 'Pending Review',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      description: 'Application is waiting for review',
    },
    [ApplicationStatus.REVIEWED]: {
      label: 'Under Review',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      description: 'Application is being reviewed',
    },
    [ApplicationStatus.INTERVIEW_SCHEDULED]: {
      label: 'Interview Scheduled',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
      description: 'Interview has been scheduled',
    },
    [ApplicationStatus.INTERVIEW_COMPLETED]: {
      label: 'Interview Completed',
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-100',
      description: 'Interview has been completed',
    },
    [ApplicationStatus.ACCEPTED]: {
      label: 'Accepted',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      description: 'Application has been accepted',
    },
    [ApplicationStatus.REJECTED]: {
      label: 'Rejected',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      description: 'Application has been rejected',
    },
    [ApplicationStatus.WITHDRAWN]: {
      label: 'Withdrawn',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      description: 'Application has been withdrawn by the applicant',
    },
  };

  return statusMap[status] || { // Fallback for an unexpected status
    label: status,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    description: 'Unknown status',
  };
}
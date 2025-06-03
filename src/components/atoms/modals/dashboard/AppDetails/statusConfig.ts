import { ApplicationStatus } from '@prisma/client';
import {
  Clock,
  MessageSquare,
  CalendarCheck,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Calendar,
  LucideIcon
} from 'lucide-react';

// Complete status configuration for badges and UI elements
export const statusConfig: Record<
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

// Status action configurations for dropdown actions
export const statusActionConfig: Record<ApplicationStatus, { 
  icon: LucideIcon; 
  label: string; 
  color: string; 
}> = {
  [ApplicationStatus.PENDING]: { 
    icon: Clock, 
    label: 'Mark Pending', 
    color: 'text-yellow-600' 
  },
  [ApplicationStatus.REVIEWED]: { 
    icon: Eye, 
    label: 'Mark Reviewed', 
    color: 'text-blue-600' 
  },
  [ApplicationStatus.INTERVIEW_SCHEDULED]: { 
    icon: Calendar, 
    label: 'Schedule Interview', 
    color: 'text-purple-600' 
  },
  [ApplicationStatus.INTERVIEW_COMPLETED]: { 
    icon: CheckCircle, 
    label: 'Complete Interview', 
    color: 'text-blue-700' 
  },
  [ApplicationStatus.ACCEPTED]: { 
    icon: CheckCircle, 
    label: 'Accept', 
    color: 'text-green-600' 
  },
  [ApplicationStatus.REJECTED]: { 
    icon: XCircle, 
    label: 'Reject', 
    color: 'text-red-600' 
  },
  [ApplicationStatus.WITHDRAWN]: { 
    icon: XCircle, 
    label: 'Mark Withdrawn', 
    color: 'text-gray-600' 
  },
};

// Helper function to get status action configuration
export const getStatusAction = (status: ApplicationStatus) => {
  return statusActionConfig[status] || { 
    icon: Clock, 
    label: status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()), 
    color: 'text-gray-600' 
  };
};

// Application status order for timeline progression
export const statusOrder: ApplicationStatus[] = [
  ApplicationStatus.PENDING,
  ApplicationStatus.REVIEWED,
  ApplicationStatus.INTERVIEW_SCHEDULED,
  ApplicationStatus.INTERVIEW_COMPLETED,
  ApplicationStatus.ACCEPTED,
  ApplicationStatus.REJECTED,
];
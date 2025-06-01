import { ApplicationStatus } from '@prisma/client';
import { CheckCircle, Clock, XCircle, CalendarCheck, MessageSquare, UserCheck, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export const statusStyles: Record<ApplicationStatus, {
  bgColor: string;
  textColor: string;
  borderColor?: string;
  icon: React.ElementType;
  text: string;
}> = {
  PENDING: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: Clock, text: 'Pending' },
  REVIEWED: { bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: MessageSquare, text: 'Reviewed' },
  INTERVIEW_SCHEDULED: { bgColor: 'bg-sky-100', textColor: 'text-sky-700', icon: CalendarCheck, text: 'Interview Scheduled' },
  INTERVIEW_COMPLETED: { bgColor: 'bg-indigo-100', textColor: 'text-indigo-700', icon: UserCheck, text: 'Interview Completed' },
  ACCEPTED: { bgColor: 'bg-green-100', textColor: 'text-green-700', icon: CheckCircle, text: 'Accepted' },
  REJECTED: { bgColor: 'bg-red-100', textColor: 'text-red-700', icon: XCircle, text: 'Rejected' },
  WITHDRAWN: { bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: AlertTriangle, text: 'Withdrawn' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.PENDING;
  const IconComponent = style.icon;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style.bgColor} ${style.textColor} ${style.borderColor ? `border ${style.borderColor}` : ''}`}
    >
      <IconComponent className="w-3.5 h-3.5 mr-1.5" />
      {style.text}
    </span>
  );
}
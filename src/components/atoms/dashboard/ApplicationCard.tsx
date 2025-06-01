'use client';
import Image from 'next/image';
import { JobApplication, JobPosting, Company, InterviewSchedule } from '@prisma/client';
import { MapPin, CalendarDays, Briefcase, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from './StatusBadge';

export type ApplicationWithDetails = JobApplication & {
  jobPosting: Pick<JobPosting, 'id' | 'title' | 'isRemote'> & { 
    province?: { name: string } | null;
    city?: { name: string } | null;
    company: Pick<Company, 'id' | 'name' | 'logo'>;
  };
  interviewSchedules: (Pick<InterviewSchedule, 'id' | 'scheduledAt' | 'interviewType' | 'location' | 'status' | 'duration' | 'notes'>)[]; // Ensure all selected fields are here
};

interface ApplicationCardProps {
  application: ApplicationWithDetails;
  onViewDetails: (application: ApplicationWithDetails) => void;
}

export default function ApplicationCard({ application, onViewDetails }: ApplicationCardProps) {
  const { jobPosting, createdAt, status } = application;
const company = jobPosting.company;

const getDisplayLocation = () => {
  if (jobPosting.isRemote) {
    return 'Remote';
  }
  const city = jobPosting.city?.name;
  const province = jobPosting.province?.name;

  if (city && province) {
    return `${city}, ${province}`;
  }
  return city || province || 'Location N/A'; // Fallback
};

const displayLocation = getDisplayLocation();


  return (
    <div className="bg-white rounded-lg shadow-sm border p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {company.logo ? (
          <Image
            src={company.logo}
            alt={`${company.name} logo`}
            width={56}
            height={56}
            className="rounded-md object-contain border"
          />
        ) : (
          <div className="w-14 h-14 bg-gray-200 rounded-md flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-1">
            <h3 className="text-lg font-semibold text-gray-800 hover:text-primary-600 transition-colors">
              {jobPosting.title}
            </h3>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-gray-600 mb-2">{company.name}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <div className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              <span>{displayLocation}</span>
            </div>
            <div className="flex items-center">
              <CalendarDays className="w-3.5 h-3.5 mr-1" />
              <span>Applied {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={() => onViewDetails(application)}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center group"
        >
          View Details
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
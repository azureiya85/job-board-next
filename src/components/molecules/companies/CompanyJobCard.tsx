'use client';

import { useState } from 'react';
import { MapPin, Clock, DollarSign, Users, Calendar, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { EmploymentType, ExperienceLevel } from '@prisma/client';
import { JobPostingInStore } from '@/stores/companyProfileStores';
import { employmentTypeLabels, experienceLevelLabels, workTypeLabels } from '@/lib/jobConstants';

interface CompanyJobCardProps {
  job: JobPostingInStore;
}

export default function CompanyJobCard({ job }: CompanyJobCardProps) {
  const [showAllRequirements, setShowAllRequirements] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  const formatSalary = (minSalary?: number, maxSalary?: number) => {
    const formatNumber = (num: number) => num.toLocaleString('id-ID');

    if (minSalary && maxSalary) {
      if (minSalary === maxSalary) return `Rp ${formatNumber(minSalary)}`;
      return `Rp ${formatNumber(minSalary)} - Rp ${formatNumber(maxSalary)}`;
    }
    if (minSalary) return `Rp ${formatNumber(minSalary)}+`;
    if (maxSalary) return `Up to Rp ${formatNumber(maxSalary)}`;
    
    return 'Competitive'; 
  };

  const formatJobType = (type: EmploymentType) => {
    return employmentTypeLabels[type] || type;
  };

const formatWorkType = (workType: string) => { 
  return workTypeLabels[workType] || workType;
};

  const formatExperienceLevel = (level: ExperienceLevel) => {
    return experienceLevelLabels[level] || level;
  };

  const toggleRequirements = () => {
    setShowAllRequirements(!showAllRequirements);
  };

  const toggleBenefits = () => {
    setShowAllBenefits(!showAllBenefits);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatJobType(job.type)}</span> 
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{formatWorkType(job.workType)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>{formatExperienceLevel(job.experienceLevel)}</span> 
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <DollarSign className="w-4 h-4" />
              <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Apply Now
        </button>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 line-clamp-3">
          {job.description}
        </p>
      </div>

      {job.requirements && job.requirements.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            {(showAllRequirements ? job.requirements : job.requirements.slice(0, 3)).map((requirement, index) => (
              <li key={index}>
                {requirement}
              </li>
            ))}
          </ul>
          {job.requirements.length > 3 && (
            <button
              onClick={toggleRequirements}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2 flex items-center gap-1 transition-colors"
            >
              {showAllRequirements ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  +{job.requirements.length - 3} more requirements
                </>
              )}
            </button>
          )}
        </div>
      )}

      {job.benefits && job.benefits.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
          <div className="flex flex-wrap gap-2">
            {(showAllBenefits ? job.benefits : job.benefits.slice(0, 4)).map((benefit, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full"
              >
                {benefit}
              </span>
            ))}
          </div>
          {job.benefits.length > 4 && (
            <button
              onClick={toggleBenefits}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2 flex items-center gap-1 transition-colors"
            >
              {showAllBenefits ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  +{job.benefits.length - 4} more benefits
                </>
              )}
            </button>
          )}
        </div>
      )}

      {job.applicationDeadline && (
        <div className="flex items-center gap-1 text-sm text-orange-600">
          <Calendar className="w-4 h-4" />
          <span>
            Application deadline: {new Date(job.applicationDeadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
}
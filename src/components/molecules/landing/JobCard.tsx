import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Building, Clock, DollarSign, Wifi, Info, Users, TrendingUp, Tag, Plus } from 'lucide-react';
import { JobPostingFeatured } from '@/types'; 
import { formatRelativeDate, formatSalary, cn } from '@/lib/utils';
import { EmploymentType, ExperienceLevel, JobCategory } from '@prisma/client';

interface JobCardProps {
  job: JobPostingFeatured & { 
    experienceLevel?: ExperienceLevel; 
    category?: JobCategory;
  };
}

const employmentTypeLabels: Record<string, string> = { 
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  REMOTE: 'Remote Work',
};

const experienceLevelLabels: Record<string, string> = {
  ENTRY_LEVEL: 'Entry Level',
  MID_LEVEL: 'Mid Level',
  SENIOR_LEVEL: 'Senior Level',
  EXECUTIVE: 'Executive',
};

const companySizeLabels: Record<string, string> = {
    STARTUP: 'Startup (1-10)',
    SMALL: 'Small (11-50)',
    MEDIUM: 'Medium (51-200)',
    LARGE: 'Large (201-1000)',
    ENTERPRISE: 'Enterprise (1000+)',
};

const categoryLabels: Record<string, string> = {
  TECHNOLOGY: 'Technology',
  MARKETING: 'Marketing',
  SALES: 'Sales',
  FINANCE: 'Finance',
  HUMAN_RESOURCES: 'Human Resources',
  OPERATIONS: 'Operations',
  DESIGN: 'Design',
  CUSTOMER_SERVICE: 'Customer Service',
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education',
  LEGAL: 'Legal',
  CONSULTING: 'Consulting',
  MANUFACTURING: 'Manufacturing',
  RETAIL: 'Retail',
  OTHER: 'Other',
};

export function JobCard({ job }: JobCardProps) {
  const location = job.isRemote
    ? 'Remote'
    : job.city?.name
    ? `${job.city.name}${job.province?.name ? ', ' + job.province.name.replace('Provinsi ', '') : ''}`
    : 'Location Undisclosed';

  const postedDate = formatRelativeDate(job.publishedAt || job.createdAt);
  const salaryDisplay = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  // Handle tags display - show max 3, then +N more
  const displayTags = job.tags?.slice(0, 3) || [];
  const remainingTagsCount = (job.tags?.length || 0) - 3;

  return (
    <Link href={`/jobs/${job.id}`} className="group block">
      <Card 
        className={cn(
          "transition-all duration-300 ease-in-out hover:shadow-lg border",
          job.isPriority ? "border-primary/50 bg-primary/5" : "bg-card hover:border-muted-foreground/30"
        )}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {job.company?.logo ? (
                <Image
                  src={job.company.logo}
                  alt={`${job.company.name || 'Company'} logo`}
                  width={56}
                  height={56}
                  className="rounded-lg border object-contain bg-white p-0.5 shrink-0"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg border bg-muted shrink-0">
                  <Building className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl font-heading leading-tight group-hover:text-primary truncate">
                  {job.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground truncate">
                  {job.company?.name || 'Confidential Company'}
                </CardDescription>
              </div>
            </div>
            {job.isPriority && (
              <Badge variant="outline" className="bg-tertiary-500/20 text-tertiary-700 dark:text-tertiary-400 border-tertiary-500 text-xs px-2 py-1 shrink-0">
                <TrendingUp className="mr-1 h-3.5 w-3.5" /> Priority
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-foreground/90">
          {/* Three-column job details grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
            {/* First Column: Job Category and Location */}
            <div className="space-y-2">
              {job.category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium">{categoryLabels[job.category] || job.category}</span>
                </div>
              )}
              <div className="flex items-center gap-2" title={location}>
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="truncate">{location}</span>
                {job.isRemote && job.employmentType !== EmploymentType.REMOTE && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0.5">
                    <Wifi className="mr-1 h-3 w-3" />
                    Remote
                  </Badge>
                )}
              </div>
            </div>

            {/* Second Column: Employment Type and Salary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{employmentTypeLabels[job.employmentType] || job.employmentType}</span>
              </div>
              {salaryDisplay !== "Competitive" && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium text-green-600 dark:text-green-400">{salaryDisplay}</span>
                </div>
              )}
            </div>

            {/* Third Column: Experience Level and Company Size */}
            <div className="space-y-2">
              {job.experienceLevel && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{experienceLevelLabels[job.experienceLevel] || job.experienceLevel}</span>
                </div>
              )}
              {job.company?.size && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{companySizeLabels[job.company.size] || job.company.size}</span>
                </div>
              )}
            </div>
          </div>

          {/* Job Description */}
          {job.description && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 pr-8">
                {job.description}
              </p>
            </div>
          )}
        </CardContent>

        {/* Footer with Posted Date and Tags */}
        <div className="px-6 pb-4 pt-0">
          <div className="flex items-center justify-between">
            {/* Posted Date */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Posted {postedDate}</span>
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {displayTags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
                {remainingTagsCount > 0 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs px-2 py-0.5 text-muted-foreground border-dashed"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {remainingTagsCount}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
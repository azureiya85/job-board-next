'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Briefcase,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Wifi,
  Info,
  Users,
  Tag,
  ArrowRight,
  Star,
  TrendingUp,
  Bookmark,
  LogIn
} from 'lucide-react';
import { JobPostingFeatured } from '@/types';
import { formatRelativeDate, formatSalary, cn } from '@/lib/utils';
import {
  employmentTypeLabels,
  experienceLevelLabels,
  companySizeLabels,
  categoryLabels
} from '@/lib/jobConstants';
import { EmploymentType } from '@prisma/client';
import { useAuthStore } from '@/stores/authStores';

interface JobDetailsHeaderProps {
  job: JobPostingFeatured;
}

export function JobDetailsHeader({ job }: JobDetailsHeaderProps) {
  const { isAuthenticated } = useAuthStore();
  
  const location = job.isRemote
    ? 'Remote'
    : job.city?.name
    ? `${job.city.name}${job.province?.name ? ', ' + job.province.name.replace('Provinsi ', '') : ''}`
    : 'Location Undisclosed';

  const postedDate = formatRelativeDate(job.publishedAt || job.createdAt);
  const salaryDisplay = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <Card className={cn(
      "mb-8 overflow-hidden border-2 transition-all duration-300",
      job.isPriority ? "border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background" : "border-border"
    )}>
      <CardContent className="p-8">
        {/* Company Logo and Job Title */}
        <div className="flex items-start gap-6 mb-6">
          <div className="relative">
            {job.company?.logo ? (
              <Image
                src={job.company.logo}
                alt={`${job.company.name || 'Company'} logo`}
                width={80}
                height={80}
                className="rounded-2xl border-2 border-white shadow-lg object-contain bg-white p-1"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
                <Building className="h-10 w-10 text-primary" />
              </div>
            )}
            {job.isPriority && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                <Star className="h-4 w-4 text-white fill-current" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground mb-2 leading-tight">
              {job.title}
            </h1>
            <div className="flex items-center gap-2">
              <h2 className="text-xl text-muted-foreground font-medium">
                {job.company?.name || 'Confidential Company'}
              </h2>
              {job.isPriority && (
                <Badge className="bg-gradient-to-r from-tertiary-500 to-tertiary-600 text-white border-0">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Priority Listing
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Three-column job details grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 mb-6">
          {/* First Column: Job Category and Location */}
          <div className="space-y-3">
            {job.category && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Tag className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium text-foreground">{categoryLabels[job.category] || job.category}</span>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50" title={location}>
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="font-medium text-foreground truncate">{location}</span>
              {job.isRemote && job.employmentType !== EmploymentType.REMOTE && (
                <Badge variant="secondary" className="ml-1 text-xs px-2 py-1">
                  <Wifi className="mr-1 h-3 w-3" />
                  Remote
                </Badge>
              )}
            </div>
          </div>

          {/* Second Column: Employment Type and Salary */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="font-medium text-foreground">{employmentTypeLabels[job.employmentType] || job.employmentType}</span>
            </div>
            {salaryDisplay !== "Competitive" && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="font-semibold text-green-700 dark:text-green-300">{salaryDisplay}</span>
              </div>
            )}
          </div>

          {/* Third Column: Experience Level and Company Size */}
          <div className="space-y-3">
            {job.experienceLevel && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Info className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium text-foreground">{experienceLevelLabels[job.experienceLevel] || job.experienceLevel}</span>
              </div>
            )}
            {job.company?.size && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium text-foreground">{companySizeLabels[job.company.size] || job.company.size}</span>
              </div>
            )}
          </div>
        </div>

        {/* Posted Date */}
        <div className="flex items-center gap-2 text-muted-foreground mb-6">
          <Clock className="h-4 w-4" />
          <span>Posted {postedDate}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-accent hover:to-accent/95 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
            >
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-muted hover:bg-primary/70 hover:text-white text-muted-foreground border-2 border-muted-foreground/20 font-semibold px-8 py-3 rounded-lg transition-all duration-300 cursor-pointer group"
            >
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                Sign In To Apply
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            className="border-2 border-tertiary/50 hover:border-tertiary/60 hover:bg-secondary/30 hover:text-primary/70 font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group"
          >
            <Bookmark className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
            Save Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
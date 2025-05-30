import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Building, Clock, DollarSign, Wifi, Star } from 'lucide-react';
import { JobPostingFeatured } from '@/types';
import { formatRelativeDate, formatSalary, cn } from '@/lib/utils';
import { EmploymentType } from '@prisma/client';
import { motion } from 'framer-motion';

interface RelatedJobCardProps {
  job: JobPostingFeatured & { isPriority?: boolean };
  index: number;
}

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  REMOTE: 'Remote Work',
};

const employmentTypeColors: Record<EmploymentType, string> = {
  FULL_TIME: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  PART_TIME: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  CONTRACT: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  INTERNSHIP: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  FREELANCE: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
  REMOTE: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
};

export function RelatedJobCard({ job, index }: RelatedJobCardProps) {
  const location = job.isRemote
    ? 'Remote'
    : job.city?.name
    ? `${job.city.name}${job.province?.name ? ', ' + job.province.name.replace('Provinsi ', '') : ''}`
    : 'N/A';

  const postedDate = formatRelativeDate(job.publishedAt || job.createdAt);
  const salaryDisplay = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="flex-shrink-0 w-72 snap-start"
    >
      <Link href={`/jobs/${job.id}`} className="group block h-full">
        <Card className="h-full relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border border-border/50 shadow-md hover:shadow-xl transition-all duration-400 group-hover:shadow-primary/10 group-hover:border-primary/30">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Priority badge */}
          {job.isPriority && (
            <div className="absolute top-3 right-3 z-20">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-sm text-xs px-2 py-0.5">
                <Star className="mr-1 h-2.5 w-2.5 fill-current" />
                Featured
              </Badge>
            </div>
          )}

          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-start gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative flex-shrink-0"
              >
                {job.company?.logo ? (
                  <div className="relative">
                    <Image
                      src={job.company.logo}
                      alt={`${job.company.name || 'Company'} logo`}
                      width={48}
                      height={48}
                      className="rounded-lg border border-border/50 shadow-sm object-contain bg-white p-1"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border/50 bg-gradient-to-br from-primary/15 to-primary/5 shadow-sm">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                )}
              </motion.div>

              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-1">
                  {job.title}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground truncate">
                  {job.company?.name || 'Confidential Company'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 relative z-10 pt-0">
            {/* Location */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate" title={location}>
                {location}
              </span>
            </div>

            {/* Employment type */}
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium border transition-all duration-300",
                  employmentTypeColors[job.employmentType] || "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                )}
              >
                {employmentTypeLabels[job.employmentType] || job.employmentType}
              </Badge>
              {job.isRemote && job.employmentType !== EmploymentType.REMOTE && (
                <Badge className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-0 text-xs">
                  <Wifi className="mr-1 h-2.5 w-2.5" />
                  Remote
                </Badge>
              )}
            </div>

            {/* Salary */}
            {salaryDisplay !== "Competitive" && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="font-medium text-green-700 dark:text-green-300 truncate">
                  {salaryDisplay}
                </span>
              </div>
            )}

            {/* Posted date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Posted {postedDate}</span>
            </div>
          </CardContent>

          {/* Hover effect glow */}
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/5 via-transparent to-primary/3 pointer-events-none" />
        </Card>
      </Link>
    </motion.div>
  );
}
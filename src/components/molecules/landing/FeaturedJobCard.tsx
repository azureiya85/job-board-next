import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Building, Clock, DollarSign, Wifi, Star, TrendingUp } from 'lucide-react';
import { JobPostingFeatured } from '@/types';
import { formatRelativeDate, formatSalary, cn } from '@/lib/utils';
import { EmploymentType } from '@prisma/client';
import { motion } from 'framer-motion';

interface FeaturedJobCardProps {
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
  FULL_TIME: 'bg-blue-100 text-blue-700 border-blue-200',
  PART_TIME: 'bg-purple-100 text-purple-700 border-purple-200',
  CONTRACT: 'bg-orange-100 text-orange-700 border-orange-200',
  INTERNSHIP: 'bg-green-100 text-green-700 border-green-200',
  FREELANCE: 'bg-pink-100 text-pink-700 border-pink-200',
  REMOTE: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export function FeaturedJobCard({ job, index }: FeaturedJobCardProps) {
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
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="flex-shrink-0 w-80 mx-3"
    >
      <Link href={`/jobs/${job.id}`} className="group block h-full">
        <Card className="h-full relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:shadow-primary/10">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Floating elements */}
          <div className="absolute top-4 right-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="opacity-20 group-hover:opacity-40 transition-opacity duration-300"
            >
              <TrendingUp className="h-4 w-4 text-primary" />
            </motion.div>
          </div>

          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                {job.company?.logo ? (
                  <div className="relative">
                    <Image
                      src={job.company.logo}
                      alt={`${job.company.name || 'Company'} logo`}
                      width={56}
                      height={56}
                      className="rounded-xl border-2 border-white shadow-lg object-contain bg-white"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
                    <Building className="h-7 w-7 text-primary" />
                  </div>
                )}
              </motion.div>

              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {job.title}
                </CardTitle>
                <CardDescription className="text-base font-medium text-muted-foreground mt-1">
                  {job.company?.name || 'Confidential Company'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 relative z-10">
            {/* Location */}
            <motion.div 
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-foreground truncate" title={location}>
                {location}
              </span>
            </motion.div>

            {/* Employment type and remote */}
            <div className="ml-3 flex items-center gap-2 flex-wrap">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "font-medium border-2 transition-all duration-300 hover:scale-105",
                  employmentTypeColors[job.employmentType] || "bg-gray-100 text-gray-700 border-gray-200"
                )}
              >
                {employmentTypeLabels[job.employmentType] || job.employmentType}
              </Badge>
              {job.isRemote && job.employmentType !== EmploymentType.REMOTE && (
                <Badge className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-0 hover:scale-105 transition-transform duration-300">
                  <Wifi className="mr-1 h-3 w-3" />
                  Remote OK
                </Badge>
              )}
            </div>

            {/* Salary */}
            {salaryDisplay !== "Competitive" && (
              <motion.div 
                className="flex items-center gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-green-900/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-semibold text-green-700 dark:text-green-300">
                  {salaryDisplay}
                </span>
              </motion.div>
            )}

            {/* Posted date and Featured badge */}
            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Posted {postedDate}</span>
              </div>
              {job.isPriority && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-sm text-xs px-2 py-0.5">
                    <Star className="mr-1 h-2.5 w-2.5 fill-current" />
                    Featured
                  </Badge>
                </motion.div>
              )}
            </div>
          </CardContent>

          {/* Hover effect glow */}
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        </Card>
      </Link>
    </motion.div>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, DollarSign, Users, Calendar, Briefcase, ChevronDown, ChevronUp, LogIn, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { EmploymentType, ExperienceLevel } from '@prisma/client';
import { JobPostingInStore } from '@/stores/companyProfileStores';
import { employmentTypeLabels, experienceLevelLabels, workTypeLabels } from '@/lib/jobConstants';
import { useAuthStore } from '@/stores/authStores';
import { useCVModalStore } from '@/stores/CVModalStores';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CompanyJobCardProps {
  job: JobPostingInStore;
}

export default function CompanyJobCard({ job }: CompanyJobCardProps) {
  const [showAllRequirements, setShowAllRequirements] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useCVModalStore();

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

  const handleApplyClick = () => {
    if (isAuthenticated) {
      openModal(job);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {job.title}
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.location}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatJobType(job.type)}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {formatWorkType(job.workType)}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {formatExperienceLevel(job.experienceLevel)}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-600 font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          {/* Apply Button with Authentication Check */}
          {isAuthenticated ? (
            <Button 
              onClick={handleApplyClick}
              className="shrink-0 group/btn"
              size="lg"
            >
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Button>
          ) : (
            <Button asChild variant="secondary" size="lg" className="shrink-0 group/btn">
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                Sign In To Apply
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-base leading-relaxed">
          {job.description}
        </CardDescription>

        {job.requirements && job.requirements.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <Collapsible open={showAllRequirements} onOpenChange={setShowAllRequirements}>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  Requirements
                  <Badge variant="secondary" className="text-xs">
                    {job.requirements.length}
                  </Badge>
                </h4>
                
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  {job.requirements.slice(0, 3).map((requirement, index) => (
                    <li key={index} className="leading-relaxed">
                      {requirement}
                    </li>
                  ))}
                </ul>

                <CollapsibleContent className="space-y-2">
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    {job.requirements.slice(3).map((requirement, index) => (
                      <li key={index + 3} className="leading-relaxed">
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>

                {job.requirements.length > 3 && (
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 p-0 text-primary hover:text-primary/80">
                      {showAllRequirements ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Show {job.requirements.length - 3} more requirements
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>
            </Collapsible>
          </div>
        )}

        {job.benefits && job.benefits.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <Collapsible open={showAllBenefits} onOpenChange={setShowAllBenefits}>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  Benefits
                  <Badge variant="secondary" className="text-xs">
                    {job.benefits.length}
                  </Badge>
                </h4>
                
                <div className="flex flex-wrap gap-2">
                  {job.benefits.slice(0, 4).map((benefit, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                    >
                      {benefit}
                    </Badge>
                  ))}
                </div>

                <CollapsibleContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.slice(4).map((benefit, index) => (
                      <Badge
                        key={index + 4}
                        variant="secondary"
                        className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                      >
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>

                {job.benefits.length > 4 && (
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 p-0 text-primary hover:text-primary/80">
                      {showAllBenefits ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Show {job.benefits.length - 4} more benefits
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>
            </Collapsible>
          </div>
        )}
      </CardContent>

      {job.applicationDeadline && (
        <CardFooter className="pt-4">
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-md border border-orange-200">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">
              Application deadline: {new Date(job.applicationDeadline).toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
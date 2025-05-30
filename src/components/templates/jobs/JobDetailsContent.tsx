import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Info,
  CheckCircle,
  Gift,
  Calendar
} from 'lucide-react';
import { JobPostingFeatured } from '@/types';

interface JobDetailsContentProps {
  job: JobPostingFeatured;
}

export function JobDetailsContent({ job }: JobDetailsContentProps) {
  const deadlineDate = job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

  return (
    <>
      {/* Job Description */}
      <Card className="mb-8 border-2 border-border/50">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            Job Description
          </h3>
          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
            {/* 
              TODO: Markdown: Use react markdown
            */}
            <p>{job.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Requirements and Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <Card className="border-2 border-border/50 hover:border-primary/20 transition-colors duration-300">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                Requirements
              </h3>
              <ul className="space-y-3">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3 group">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                    </div>
                    <span className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-200">
                      {requirement}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <Card className="border-2 border-border/50 hover:border-primary/20 transition-colors duration-300">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Gift className="h-6 w-6 text-primary" />
                Benefits
              </h3>
              <ul className="space-y-3">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 group">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-200">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer with Deadline and Tags */}
      <Card className="border-2 border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Application Deadline */}
            {deadlineDate && (
              <div className="flex items-center gap-3 text-foreground">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block">Application Deadline</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">{deadlineDate}</span>
                </div>
              </div>
            )}

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/30 transition-all duration-200 cursor-default"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
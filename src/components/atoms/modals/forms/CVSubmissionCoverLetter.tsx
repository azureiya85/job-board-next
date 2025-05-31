'use client';

import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CVSubmissionForm } from '@/lib/zodValidation';
import { cn } from '@/lib/utils';

interface CVSubmissionCoverLetterProps {
  register: UseFormRegister<CVSubmissionForm>;
  errors: FieldErrors<CVSubmissionForm>;
  watch: UseFormWatch<CVSubmissionForm>;
}

export default function CVSubmissionCoverLetter({
  register,
  errors,
  watch,
}: CVSubmissionCoverLetterProps) {
  return (
    <Card className="border-border/50 shadow-sm bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-primary" />
          Cover Letter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
            <textarea
              {...register('coverLetter')}
              rows={6}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/90 focus:border-primary transition-all resize-none bg-background"
              placeholder="Tell the employer why you're the perfect fit for this position. Highlight your relevant experience, skills, and what makes you unique..."
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1">
              {errors.coverLetter && (
                <>
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  <span className="text-red-600">{errors.coverLetter.message}</span>
                </>
              )}
            </div>
            <span className={cn(
              "text-muted-foreground",
              (watch('coverLetter')?.length || 0) > 1900 && "text-orange-500",
              (watch('coverLetter')?.length || 0) >= 2000 && "text-red-500"
            )}>
              {watch('coverLetter')?.length || 0}/2000
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
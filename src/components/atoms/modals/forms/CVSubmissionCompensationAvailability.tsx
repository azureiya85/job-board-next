'use client';

import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { DollarSign, Calendar, ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CVSubmissionForm } from '@/lib/zodValidation';

interface CVSubmissionCompensationAvailabilityProps {
  register: UseFormRegister<CVSubmissionForm>;
  errors: FieldErrors<CVSubmissionForm>;
  watch: UseFormWatch<CVSubmissionForm>;
  formatSalary: (value: number) => string;
}

export default function CVSubmissionCompensationAvailability({
  register,
  errors,
  watch,
  formatSalary,
}: CVSubmissionCompensationAvailabilityProps) {
  return (
    <Card className="border-border/50 shadow-sm bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="w-5 h-5 text-primary" />
          Compensation & Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Expected Salary (IDR) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                {...register('expectedSalary', { valueAsNumber: true })}
                type="number"
                min="1000000"
                max="1000000000"
                step="100000"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/90 focus:border-primary transition-all bg-background"
                placeholder="Enter expected monthly salary"
              />
            </div>
            {watch('expectedSalary') > 0 && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  {formatSalary(watch('expectedSalary'))} per month
                </p>
              </div>
            )}
            {errors.expectedSalary && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.expectedSalary.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Available Start Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                {...register('availableStartDate')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/90 focus:border-primary transition-all bg-background"
              />
            </div>
            {errors.availableStartDate && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.availableStartDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Portfolio URL (Optional)
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                {...register('portfolioUrl')}
                type="url"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/90 focus:border-primary transition-all bg-background"
                placeholder="https://your-portfolio.com"
              />
            </div>
            {errors.portfolioUrl && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.portfolioUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              LinkedIn URL (Optional)
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                {...register('linkedinUrl')}
                type="url"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/90 focus:border-primary transition-all bg-background"
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>
            {errors.linkedinUrl && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.linkedinUrl.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
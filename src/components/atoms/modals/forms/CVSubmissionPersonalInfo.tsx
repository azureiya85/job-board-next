// components/CVSubmissionModal/CVSubmissionPersonalInfo.tsx
'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { User, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CVSubmissionForm } from '@/lib/validations/zodAuthValidation';

interface CVSubmissionPersonalInfoProps {
  register: UseFormRegister<CVSubmissionForm>;
  errors: FieldErrors<CVSubmissionForm>;
}

export default function CVSubmissionPersonalInfo({
  register,
  errors,
}: CVSubmissionPersonalInfoProps) {
  return (
    <Card className="border-border/50 shadow-sm bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-primary" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                {...register('fullName')}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/90 focus:border-primary transition-all bg-background"
                placeholder="Enter your full name"
              />
            </div>
            {errors.fullName && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                {...register('email')}
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/90 focus:border-primary transition-all bg-background"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                {...register('phoneNumber')}
                type="tel"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/90 focus:border-primary transition-all bg-background"
                placeholder="Enter your phone number"
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Current Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                {...register('currentLocation')}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/90 focus:border-primary transition-all bg-background"
                placeholder="Enter your current location"
              />
            </div>
            {errors.currentLocation && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.currentLocation.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
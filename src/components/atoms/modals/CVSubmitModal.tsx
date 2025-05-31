'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  FileText, 
  DollarSign, 
  MessageSquare, 
  User, 
  Phone, 
  Mail,
  Calendar,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building,
  Briefcase,
  Star,
  ExternalLink,
  Send
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCVModalStore } from '@/stores/CVModalStores';
import { useAuthStore } from '@/stores/authStores';
import { cvSubmissionSchema, CVSubmissionForm } from '@/lib/zodValidation';
import { cn } from '@/lib/utils';

export default function CVSubmitModal() {
  const { isOpen, selectedJob, closeModal, isSubmitting, setSubmitting } = useCVModalStore();
  const { user } = useAuthStore();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CVSubmissionForm>({
    resolver: zodResolver(cvSubmissionSchema),
    defaultValues: {
      fullName: user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      currentLocation: user?.currentAddress || '',
      expectedSalary: 0,
      coverLetter: '',
      availableStartDate: '',
      portfolioUrl: '',
      linkedinUrl: '',
    }
  });

  // File upload handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a PDF or Word document');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size should not exceed 5MB');
        return;
      }

      setCvFile(file);
      setUploadError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  // Format salary for display
  const formatSalary = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Submit handler
  const onSubmit = async (data: CVSubmissionForm) => {
    if (!cvFile) {
      setUploadError('Please upload your CV');
      return;
    }

    if (!selectedJob) return;

    setSubmitting(true);
    setUploadError('');

    try {
      // Upload CV file first
      const formData = new FormData();
      formData.append('file', cvFile);
      formData.append('folder', 'cvs');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload CV');
      }

      const { url: cvUrl } = await uploadResponse.json();

      // Submit application
      const applicationData = {
        jobPostingId: selectedJob.id,
        cvUrl,
        expectedSalary: data.expectedSalary,
        coverLetter: data.coverLetter,
        applicantInfo: {
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          currentLocation: data.currentLocation,
          availableStartDate: data.availableStartDate,
          portfolioUrl: data.portfolioUrl || null,
          linkedinUrl: data.linkedinUrl || null,
        }
      };

      const submitResponse = await fetch('/api/submit-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      closeModal();
      reset();
      setCvFile(null);
      setUploadError('');
      setSubmitSuccess(false);
    }
  };

  if (!isOpen || !selectedJob) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-slate-50 dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border/50 flex flex-col"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative flex-shrink-0"
                >
                  {selectedJob.company?.logo ? (
                    <div className="relative">
                      <img
                        src={selectedJob.company.logo}
                        alt={`${selectedJob.company.name || 'Company'} logo`}
                        className="w-16 h-16 rounded-xl border border-border/50 shadow-sm object-contain bg-white p-2"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-primary/15 to-primary/5 shadow-sm">
                      <Building className="h-8 w-8 text-primary" />
                    </div>
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-foreground leading-tight">
                      {selectedJob.title}
                    </h2>
                    {selectedJob.isPriority && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-sm text-xs px-2 py-0.5">
                        <Star className="mr-1 h-3 w-3 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-muted-foreground mb-1">
                    {selectedJob.company?.name || 'Confidential Company'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedJob.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{selectedJob.type}</span>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="absolute inset-0 bg-gradient-to-r from-green-500/90 to-emerald-600/90 backdrop-blur-sm rounded-t-2xl flex items-center justify-center"
                >
                  <div className="text-center text-white">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">Application Submitted!</h3>
                    <p className="text-green-100">Your application has been sent successfully.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form Content */}
          <div className="overflow-y-auto flex-grow min-h-0">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
              {/* CV Upload Section */}
              <Card className="border-border/50 shadow-sm bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    Upload Your CV/Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden",
                      isDragActive 
                        ? 'border-primary bg-primary/10 scale-105' 
                        : cvFile 
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' 
                          : 'border-border hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent'
                    )}
                  >
                    <input {...getInputProps()} />
                    {cvFile ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-3 text-green-700 dark:text-green-300"
                      >
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{cvFile.name}</p>
                          <p className="text-sm opacity-75">
                            {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready to upload
                        </Badge>
                      </motion.div>
                    ) : (
                      <div className="text-muted-foreground">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4"
                        >
                          <Upload className="w-8 h-8 text-primary" />
                        </motion.div>
                        <p className="text-lg font-medium text-foreground mb-1">
                          {isDragActive 
                            ? 'Drop your CV here...' 
                            : 'Drag & drop your CV, or click to select'
                          }
                        </p>
                        <p className="text-sm">
                          PDF, DOC, DOCX (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                  {uploadError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-600 text-sm mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {uploadError}
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Personal Information */}
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
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
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
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
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
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
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
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
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

              {/* Compensation & Availability */}
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
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
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
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
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
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
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
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
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

              {/* Cover Letter */}
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
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none bg-background"
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
            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border/50 bg-slate-50 dark:bg-gray-850 flex-shrink-0">
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || submitSuccess}
                className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-accent/90 hover:to-accent text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Application Submitted
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building,
  Star,
  MapPin,
  Briefcase,
  CheckCircle,
  Loader2,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// TODO: Define a proper type for selectedJob
interface Job {
  id: string;
  title: string;
  isPriority?: boolean;
  location?: string;
  type?: string;
  company?: {
    logo?: string; 
  };
  // Add other relevant job properties
}

interface CVSubmissionHeaderProps {
  selectedJob: Job;
  handleClose: () => void;
  isSubmitting: boolean;
  submitSuccess: boolean;
}

export function CVSubmissionHeader({
  selectedJob,
  handleClose,
  isSubmitting,
  submitSuccess,
}: CVSubmissionHeaderProps) {
  return (
    <div className="relative p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative flex-shrink-0"
          >
            {selectedJob.company?.logo ? (
              <div className="relative">   
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-primary/15 to-primary/5 shadow-sm">
                  <Building className="h-8 w-8 text-primary" /> 
                </div>
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
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
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
  );
}

interface CVSubmissionFooterProps {
  handleClose: () => void;
  isSubmitting: boolean;
  submitSuccess: boolean;
  formId: string;
}

export function CVSubmissionFooter({
  handleClose,
  isSubmitting,
  submitSuccess,
  formId,
}: CVSubmissionFooterProps) {
  return (
    <div className="p-6 border-t border-border/50 bg-slate-50 dark:bg-gray-850 flex-shrink-0">
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-gray-200 cursor-pointer dark:hover:bg-gray-800 transition-all disabled:opacity-50 font-medium"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          form={formId} // Link to the form in CVSubmissionModal
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
  );
}
'use client';

import { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CVSubmissionUploadCVProps {
  cvFile: File | null;
  uploadError: string;
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isDragActive: boolean;
}

export default function CVSubmissionUploadCV({
  cvFile,
  uploadError,
  getRootProps,
  getInputProps,
  isDragActive,
}: CVSubmissionUploadCVProps) {
  return (
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
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden',
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
                  : 'Drag & drop your CV, or click to select'}
              </p>
              <p className="text-sm">PDF, DOC, DOCX (Max 5MB)</p>
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
  );
}
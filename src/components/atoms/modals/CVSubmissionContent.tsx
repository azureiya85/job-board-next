// components/CVSubmissionModal/CVSubmissionContent.tsx
'use client';

import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';
import { CVSubmissionForm } from '@/lib/validations/zodAuthValidation';
import CVSubmissionUploadCV from './forms/CVSubmisssionUploadCV';
import CVSubmissionPersonalInfo from './forms/CVSubmissionPersonalInfo';
import CVSubmissionCompensationAvailability from './forms/CVSubmissionCompensationAvailability';
import CVSubmissionCoverLetter from './forms/CVSubmissionCoverLetter';

interface CVSubmissionContentProps {
  register: UseFormRegister<CVSubmissionForm>;
  errors: FieldErrors<CVSubmissionForm>;
  watch: UseFormWatch<CVSubmissionForm>;
  cvFile: File | null;
  uploadError: string;
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isDragActive: boolean;
  formatSalary: (value: number) => string;

  // Props to control which sections are visible
  showUploadCV?: boolean;
  showPersonalInfo?: boolean;
  showCompensationAvailability?: boolean;
  showCoverLetter?: boolean;
}

export default function CVSubmissionContent({
  register,
  errors,
  watch,
  cvFile,
  uploadError,
  getRootProps,
  getInputProps,
  isDragActive,
  formatSalary,
  showUploadCV = true, 
  showPersonalInfo = true,
  showCompensationAvailability = true,
  showCoverLetter = true,
}: CVSubmissionContentProps) {
  return (
    <>
      {showUploadCV && (
        <CVSubmissionUploadCV
          cvFile={cvFile}
          uploadError={uploadError}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
        />
      )}

      {showPersonalInfo && (
        <CVSubmissionPersonalInfo register={register} errors={errors} />
      )}

      {showCompensationAvailability && (
        <CVSubmissionCompensationAvailability
          register={register}
          errors={errors}
          watch={watch}
          formatSalary={formatSalary}
        />
      )}

      {showCoverLetter && (
        <CVSubmissionCoverLetter
          register={register}
          errors={errors}
          watch={watch}
        />
      )}
    </>
  );
}
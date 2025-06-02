'use client';

import { JobPostingWithApplicantCount, useJobManagementStore } from '@/stores/JobManagementStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Calendar, Users, Edit, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { employmentTypeLabels } from '@/lib/jobConstants'; // Assuming you have this
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useCompanyProfileStore } from '@/stores/companyProfileStores';


interface CompanyJobCardAdminProps {
  job: JobPostingWithApplicantCount;
  companyId: string;
}

export default function CompanyJobCardAdmin({ job, companyId }: CompanyJobCardAdminProps) {
  const { setSelectedJobForApplicants, removeJobFromList, updateJobInList } = useJobManagementStore();
  const { decrementTotalJobs } = useCompanyProfileStore(); // To update count in main profile store

  const applicantCount = job._count?.applications ?? 0;

  const handleViewApplicants = () => {
    setSelectedJobForApplicants(job);
  };

  const handleDeleteJob = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/jobs/${job.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete job posting.');
      }
      
      toast.success(result.message || 'Job posting processed successfully.');
      if (result.job && result.job.isActive === false) { // Soft delete
        updateJobInList(result.job); // Update the job in store to show it as inactive
      } else { // Hard delete
        removeJobFromList(job.id);
        decrementTotalJobs(); // Update count in main profile store if hard deleted
      }

    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{job.title}</CardTitle>
          {!job.isActive && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" /> Inactive
            </span>
          )}
        </div>
        <CardDescription className="text-sm text-gray-500">
          Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
            <span>{employmentTypeLabels[job.employmentType] || job.employmentType}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span>{applicantCount} Applicant{applicantCount !== 1 ? 's' : ''}</span>
          </div>
          {job.applicationDeadline && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={handleViewApplicants} disabled={!job.isActive && applicantCount === 0}>
          <Eye className="w-4 h-4 mr-1" /> Applicants
        </Button>
        <Button variant="outline" size="sm" disabled> {/* Placeholder for Edit */}
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the job posting
                {applicantCount > 0 ? " (or mark it as inactive if there are applicants)." : "."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
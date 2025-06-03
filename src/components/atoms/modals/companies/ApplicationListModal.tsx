'use client';

import { useEffect, useState, useCallback } from 'react';
import { useJobManagementStore } from '@/stores/JobManagementStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@prisma/client';
import type { ApplicationFilters } from '@/types/applicants';
import { getStatusDisplay } from '@/lib/applicants/statusValidation'; 
import { getStatusAction } from '@/components/atoms/modals/dashboard/AppDetails/statusConfig';
import { toast } from "sonner";
import { 
  FileText, 
  Loader2, 
  MoreHorizontal,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ApplicationListFilter from './AppList/ApplicationListFilter';
import ApplicationListPagination from './AppList/ApplicationListPagination';
import ApplicationListCVPreview from './AppList/ApplicationListCVPreview';
import { formatEducationLevelDisplay } from '@/lib/utils';

export default function ApplicantListModal() {
  const {
    isApplicantModalOpen,
    setIsApplicantModalOpen,
    selectedJobForApplicants,
    applicants,
    setApplicants,
    isLoadingApplicants,
    setIsLoadingApplicants,
    applicantsError,
    setApplicantsError,
    applicantFilters,
    setApplicantFilters,
    applicantPagination,
    setApplicantPagination,
    updateApplicantInList,
  } = useJobManagementStore();

  const [showFullCvPreview, setShowFullCvPreview] = useState<string | null>(null);

  const companyId = useJobManagementStore(state => state.selectedJobForApplicants?.companyId);

  const fetchApplicants = useCallback(async (jobId: string, filters: ApplicationFilters, page: number, limit: number) => {
    if (!companyId) {
      setApplicantsError("Company context is missing.");
      return;
    }
    setIsLoadingApplicants(true);
    setApplicantsError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.ageMin) queryParams.append('ageMin', String(filters.ageMin));
      if (filters.ageMax) queryParams.append('ageMax', String(filters.ageMax));
      if (filters.salaryMin) queryParams.append('salaryMin', String(filters.salaryMin));
      if (filters.salaryMax) queryParams.append('salaryMax', String(filters.salaryMax));
      if (filters.education) queryParams.append('education', filters.education);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/applicants?${queryParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch applicants');
      }
      const data = await response.json();
      setApplicants(data.applications || []);
      setApplicantPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasNext: data.pagination.hasNext,
        hasPrev: data.pagination.hasPrev,
      });
    } catch (error) {
      console.error("Fetch applicants error:", error);
      setApplicantsError(error instanceof Error ? error.message : 'An unknown error occurred');
      setApplicants([]);
    } finally {
      setIsLoadingApplicants(false);
    }
  }, [companyId, setIsLoadingApplicants, setApplicantsError, setApplicants, setApplicantPagination]);

  useEffect(() => {
    if (selectedJobForApplicants && isApplicantModalOpen) {
      const defaultFilters = { sortBy: 'createdAt', sortOrder: 'asc' } as ApplicationFilters;
      setApplicantFilters(defaultFilters);
      fetchApplicants(selectedJobForApplicants.id, defaultFilters, 1, applicantPagination.limit);
    } else {
      setApplicants([]);
      setApplicantsError(null);
    }
  }, [
      selectedJobForApplicants, 
      isApplicantModalOpen, 
      fetchApplicants, 
      setApplicantFilters, 
      setApplicants,       
      setApplicantsError,  
      applicantPagination.limit 
  ]);

  const handleFiltersChange = (newFilters: ApplicationFilters) => {
    if (selectedJobForApplicants) {
      setApplicantFilters(newFilters);
      fetchApplicants(selectedJobForApplicants.id, newFilters, 1, applicantPagination.limit);
    }
  };

  const handleClearFilters = () => {
    const defaultFilters = { sortBy: 'createdAt', sortOrder: 'asc' } as ApplicationFilters;
    setApplicantFilters(defaultFilters);
    if (selectedJobForApplicants) {
      fetchApplicants(selectedJobForApplicants.id, defaultFilters, 1, applicantPagination.limit);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (selectedJobForApplicants) {
      fetchApplicants(selectedJobForApplicants.id, applicantFilters, newPage, applicantPagination.limit);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    if (!selectedJobForApplicants || !companyId) return;
    
    let rejectionReason: string | undefined;
    if (newStatus === ApplicationStatus.REJECTED) {
      const reasonInput = prompt("Enter rejection reason (optional):");
      // Check if prompt was cancelled (null) or user entered empty string
      if (reasonInput !== null && reasonInput.trim() !== "") {
        rejectionReason = reasonInput;
      } else if (reasonInput === null) { // User cancelled
        return; 
      }
    }

    try {
      const response = await fetch(`/api/companies/${companyId}/jobs/${selectedJobForApplicants.id}/applicants/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejectionReason }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }
      toast.success(`Status updated to ${getStatusDisplay(newStatus).label}`);
      updateApplicantInList(result.application);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  if (!isApplicantModalOpen || !selectedJobForApplicants) {
    return null;
  }

  return (
    <>
      <Dialog open={isApplicantModalOpen} onOpenChange={(open) => {
        setIsApplicantModalOpen(open);
        if (!open) setShowFullCvPreview(null);
      }}>
        <DialogContent className="!w-[88vw] !max-w-none h-[95vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b bg-gray-50/50">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Applicants for: {selectedJobForApplicants.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Manage and review applications for this job posting. Total applications: {applicantPagination.total || 0}
            </DialogDescription>
          </DialogHeader>

          {/* Filters Section */}
          <ApplicationListFilter
            filters={applicantFilters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              {isLoadingApplicants && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-gray-600">Loading applicants...</p>
                  </div>
                </div>
              )}
              
              {applicantsError && (
                <div className="m-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <strong>Error:</strong> {applicantsError}
                  </div>
                </div>
              )}
              
              {!isLoadingApplicants && !applicantsError && applicants.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2">
                    <FileText className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">No applicants found</p>
                  <p className="text-gray-500">Try adjusting your filters or check back later.</p>
                </div>
              )}

              {!isLoadingApplicants && !applicantsError && applicants.length > 0 && (
                <div className="w-full">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="w-16 pl-6">Photo</TableHead>
                        <TableHead className="w-48 font-semibold">Applicant Info</TableHead>
                        <TableHead className="w-32 font-semibold">Details</TableHead>
                        <TableHead className="w-36 font-semibold">Salary Expectation</TableHead>
                        <TableHead className="w-32 font-semibold">Applied Date</TableHead>
                        <TableHead className="w-24 font-semibold text-center">CV</TableHead>
                        <TableHead className="w-32 font-semibold">Status</TableHead>
                        <TableHead className="w-28 font-semibold text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    {applicants.map((app) => {
                        const statusInfo = getStatusDisplay(app.status);
                        return (
                          <TableRow key={app.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="pl-6">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={app.applicant.profileImage || undefined} alt={app.applicant.name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                  {app.applicant.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-semibold text-gray-900 truncate">{app.applicant.name}</p>
                                <p className="text-sm text-gray-600 truncate">{app.applicant.email}</p>
                              </div>
                            </TableCell>
                            
                            <TableCell> {/* Details Cell (Age & Education) */}
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="text-gray-600">Age:</span>
                                  <span className="font-medium ml-1">{app.applicant.age ?? 'N/A'}</span>
                                </p>
                                <p className="text-sm">
                                  <span className="text-gray-600">Edu:</span>
                                  <span className="font-medium ml-1 text-xs">
                                    {formatEducationLevelDisplay(app.applicant.education)}
                                  </span>
                                </p>
                              </div>
                            </TableCell>
                            
                            <TableCell> {/* Salary Expectation Cell  */}
                              <div className="text-sm">
                                {app.expectedSalary ? (
                                  <span className="font-semibold text-green-700">
                                    Rp {app.expectedSalary.toLocaleString('id-ID')}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Not specified</span>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell> {/* Applied Date Cell */}
                              <div className="text-sm text-gray-600">
                                {new Date(app.createdAt).toLocaleDateString('id-ID', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: '2-digit'
                                })}
                              </div>
                            </TableCell>
                            
                            <TableCell className="text-center"> {/* CV Cell */}
                              {app.cvUrl ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setShowFullCvPreview(app.cvUrl || null)}
                                  className="h-8 px-2 text-xs"
                                >
                                  <FileText className="w-3 h-3" />
                                </Button>
                              ) : (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                  No CV
                                </span>
                              )}
                            </TableCell>
                            
                            <TableCell> {/* Status Cell */}
                              <Badge 
                                className={`${statusInfo.bgColor} ${statusInfo.color} hover:${statusInfo.bgColor} px-2 py-1 text-xs whitespace-nowrap`}
                              >
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="text-center"> {/* Actions Cell */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 px-2">
                                    <MoreHorizontal className="w-4 h-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {Object.values(ApplicationStatus).map(status => {
                                    const actionConfig = getStatusAction(status);
                                    const Icon = actionConfig.icon;
                                    return (
                                      <DropdownMenuItem 
                                        key={status} 
                                        onClick={() => handleStatusChange(app.id, status)}
                                        disabled={status === app.status}
                                        className={`${status === app.status ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                      >
                                        <Icon className={`w-4 h-4 mr-2 ${actionConfig.color}`} />
                                        {actionConfig.label}
                                        {status === app.status && (
                                          <span className="ml-auto text-xs text-gray-400">(Current)</span>
                                        )}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Pagination */}
          <ApplicationListPagination
            pagination={applicantPagination}
            currentItemsCount={applicants.length}
            onPageChange={handlePageChange}
            isLoading={isLoadingApplicants}
          />
        </DialogContent>
      </Dialog>

      {/* CV Preview Modal */}
      <ApplicationListCVPreview
        cvUrl={showFullCvPreview}
        isOpen={!!showFullCvPreview}
        onClose={() => setShowFullCvPreview(null)}
      />
    </>
  );
}
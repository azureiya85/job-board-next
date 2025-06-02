'use client';

import { useEffect, useState, useCallback } from 'react';
import { useJobManagementStore } from '@/stores/JobManagementStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@prisma/client';
import type { ApplicationFilters } from '@/types/applicants';
import { getStatusDisplay } from '@/lib/applicants/statusValidation'; 
import { toast } from "sonner";
import { 
  FileText, 
  Loader2, 
  RefreshCw, 
  MoreHorizontal, 
  Eye, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  type LucideIcon 
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

const DEBOUNCE_DELAY = 500;

// Define education levels for filter if needed, or fetch dynamically
const educationLevels = ["HIGH_SCHOOL", "DIPLOMA", "BACHELOR", "MASTER", "DOCTORATE", "VOCATIONAL", "OTHER"];

// Special value for "All" options in Select components
const ALL_ITEMS_VALUE = "__ALL__";

// Status action configurations
const getStatusAction = (status: ApplicationStatus) => {
  const configs: Record<ApplicationStatus, { icon: LucideIcon, label: string, color: string }> = { 
    [ApplicationStatus.PENDING]: { icon: Clock, label: 'Mark Pending', color: 'text-yellow-600' },
    [ApplicationStatus.REVIEWED]: { icon: Eye, label: 'Mark Reviewed', color: 'text-blue-600' },
    [ApplicationStatus.INTERVIEW_SCHEDULED]: { icon: Calendar, label: 'Schedule Interview', color: 'text-purple-600' },
    [ApplicationStatus.INTERVIEW_COMPLETED]: { icon: CheckCircle, label: 'Complete Interview', color: 'text-blue-700' },
    [ApplicationStatus.ACCEPTED]: { icon: CheckCircle, label: 'Accept', color: 'text-green-600' },
    [ApplicationStatus.REJECTED]: { icon: XCircle, label: 'Reject', color: 'text-red-600' },
    [ApplicationStatus.WITHDRAWN]: { icon: XCircle, label: 'Mark Withdrawn', color: 'text-gray-600' },
  };
  // Provide a default fallback if a status is somehow not in configs
  return configs[status] || { icon: Clock, label: status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()), color: 'text-gray-600' };
};

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

  const [localFilters, setLocalFilters] = useState<ApplicationFilters>(applicantFilters);
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
      setLocalFilters(defaultFilters);
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

  useEffect(() => {
    if (!selectedJobForApplicants || !isApplicantModalOpen) return;

    const handler = setTimeout(() => {
      if (JSON.stringify(localFilters) !== JSON.stringify(applicantFilters)) {
         setApplicantFilters(localFilters);
         fetchApplicants(selectedJobForApplicants.id, localFilters, 1, applicantPagination.limit);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [
      localFilters, 
      selectedJobForApplicants, 
      isApplicantModalOpen, 
      applicantFilters,       
      fetchApplicants,        
      setApplicantFilters,    
      applicantPagination.limit 
  ]);
  
  const handleFilterChange = <K extends keyof ApplicationFilters>(key: K, value: ApplicationFilters[K]) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
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
  
  const clearFilters = () => {
    const defaultFilters = { sortBy: 'createdAt', sortOrder: 'asc' } as ApplicationFilters;
    setLocalFilters(defaultFilters);
    if (selectedJobForApplicants) {
      fetchApplicants(selectedJobForApplicants.id, defaultFilters, 1, applicantPagination.limit);
    }
  };

  if (!isApplicantModalOpen || !selectedJobForApplicants) {
    return null;
  }

  return (
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

        {/*  Filters Section */}
        <div className="p-4 border-b bg-gray-50/50">
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search Name</label>
                <Input
                  placeholder="Enter name..."
                  value={localFilters.name || ''}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Min Age</label>
                <Input
                  type="number"
                  placeholder="Min age"
                  value={localFilters.ageMin || ''}
                  onChange={(e) => handleFilterChange('ageMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Max Age</label>
                <Input
                  type="number"
                  placeholder="Max age"
                  value={localFilters.ageMax || ''}
                  onChange={(e) => handleFilterChange('ageMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Min Salary</label>
                <Input
                  type="number"
                  placeholder="Min salary"
                  value={localFilters.salaryMin || ''}
                  onChange={(e) => handleFilterChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Max Salary</label>
                <Input
                  type="number"
                  placeholder="Max salary"
                  value={localFilters.salaryMax || ''}
                  onChange={(e) => handleFilterChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Education</label>
                <Select
                  value={localFilters.education || ALL_ITEMS_VALUE}
                  onValueChange={(value) => {
                    handleFilterChange('education', value === ALL_ITEMS_VALUE ? undefined : value);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_ITEMS_VALUE}>All Levels</SelectItem>
                    {educationLevels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={localFilters.status || ALL_ITEMS_VALUE}
                  onValueChange={(value) => {
                    handleFilterChange('status', value === ALL_ITEMS_VALUE ? undefined : value as ApplicationStatus);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_ITEMS_VALUE}>All Statuses</SelectItem>
                    {Object.values(ApplicationStatus).map(status => (
                      <SelectItem key={status} value={status}>
                        {getStatusDisplay(status).label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Actions</label>
                <Button onClick={clearFilters} variant="outline" className="h-9 w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
        
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
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="text-gray-600">Age:</span> 
                                <span className="font-medium ml-1">{app.applicant.age ?? 'N/A'}</span>
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-600">Edu:</span>
                                <span className="font-medium ml-1 text-xs">
                                  {app.applicant.education?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) ?? 'N/A'}
                                </span>
                              </p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm">
                              {app.expectedSalary ? (
                                <span className="font-semibold text-green-700">
                                  Rp {(app.expectedSalary / 1000000).toFixed(0)}M
                                </span>
                              ) : (
                                <span className="text-gray-400">Not specified</span>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {new Date(app.createdAt).toLocaleDateString('id-ID', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: '2-digit'
                              })}
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center">
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
                          
                          <TableCell>
                            <Badge 
                              className={`${statusInfo.bgColor} ${statusInfo.color} hover:${statusInfo.bgColor} px-2 py-1 text-xs whitespace-nowrap`}
                            >
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="text-center">
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

        {/*  Pagination */}
        {!isLoadingApplicants && !applicantsError && applicantPagination.totalPages > 1 && (
          <div className="p-4 border-t bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {((applicantPagination.page - 1) * applicantPagination.limit) + (applicants.length > 0 ? 1 : 0)} to{' '}
              {Math.min(applicantPagination.page * applicantPagination.limit, applicantPagination.total)} of{' '}
              {applicantPagination.total} applicants
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => handlePageChange(applicantPagination.page - 1)} 
                disabled={!applicantPagination.hasPrev}
                variant="outline"
                size="sm"
                className="h-8"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 px-2">
                Page {applicantPagination.page} of {applicantPagination.totalPages}
              </span>
              <Button 
                onClick={() => handlePageChange(applicantPagination.page + 1)} 
                disabled={!applicantPagination.hasNext}
                variant="outline"
                size="sm"
                className="h-8"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/*  CV Preview Modal */}
        {showFullCvPreview && (
          <Dialog open={!!showFullCvPreview} onOpenChange={() => setShowFullCvPreview(null)}>
            <DialogContent className="max-w-4xl h-[85vh] p-0">
              <DialogHeader className="p-4 border-b bg-gray-50/50">
                <DialogTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  CV Preview
                </DialogTitle>
              </DialogHeader>
              <div className="h-full flex-grow overflow-hidden">
                {showFullCvPreview.endsWith('.pdf') ? (
                  <iframe 
                    src={showFullCvPreview} 
                    width="100%" 
                    height="100%" 
                    title="CV Preview"
                    className="border-0"
                  />
                ) : (
                  <div className="p-8 text-center h-full flex flex-col justify-center">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Cannot preview this file type</p>
                    <p className="text-gray-600 mb-6">This file format is not supported for preview.</p>
                    <Button asChild className="mx-auto">
                      <a href={showFullCvPreview} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        Open CV in new tab
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
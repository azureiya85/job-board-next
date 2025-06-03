'use client';

import { Button } from '@/components/ui/button';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApplicationListPaginationProps {
  pagination: PaginationInfo;
  currentItemsCount: number;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

export default function ApplicationListPagination({
  pagination,
  onPageChange,
  isLoading = false
}: ApplicationListPaginationProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const startItem = pagination.total === 0 ? 0 : ((pagination.page - 1) * pagination.limit) + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="p-4 border-t bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {pagination.total} applicants
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          onClick={() => onPageChange(pagination.page - 1)} 
          disabled={!pagination.hasPrev || isLoading}
          variant="outline"
          size="sm"
          className="h-8"
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600 px-2">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <Button 
          onClick={() => onPageChange(pagination.page + 1)} 
          disabled={!pagination.hasNext || isLoading}
          variant="outline"
          size="sm"
          className="h-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
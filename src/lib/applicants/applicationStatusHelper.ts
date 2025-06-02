import { PrismaClient, ApplicationStatus } from '@prisma/client';
import {
  StatusUpdateOptions as SharedStatusUpdateOptions, 
  ApplicationForStatusUpdate,
  ApplicationDatabaseUpdateData,
  ApplicationStatsWhereClause,
} from '@/types/applicants'; 
import { validateStatusTransition } from './statusValidation';

const prisma = new PrismaClient();

export type StatusUpdateOptions = SharedStatusUpdateOptions;

export interface StatusUpdateResult {
  success: boolean;
  message: string;
  application?: ApplicationForStatusUpdate; 
  error?: string;
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  options: StatusUpdateOptions = {}
): Promise<StatusUpdateResult> {
  try {
    const currentApplication: ApplicationForStatusUpdate | null =
      await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          jobPosting: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

    if (!currentApplication) {
      return {
        success: false,
        message: 'Application not found',
        error: 'APPLICATION_NOT_FOUND',
      };
    }

    // Validate status transition
    const isValidTransition = validateStatusTransition(
      currentApplication.status,
      newStatus
    );

    if (!isValidTransition.valid) {
      return {
        success: false,
        message: isValidTransition.message,
        error: 'INVALID_STATUS_TRANSITION',
      };
    }

    // Prepare update data using shared ApplicationDatabaseUpdateData
    const updateData: ApplicationDatabaseUpdateData = {
      status: newStatus,
      updatedAt: new Date(), 
    };

    // Handle status-specific updates
    switch (newStatus) {
      case ApplicationStatus.REVIEWED:
        updateData.reviewedAt = new Date();
        break;

      case ApplicationStatus.REJECTED:
        if (options.rejectionReason) {
          updateData.rejectionReason = options.rejectionReason;
        }
        updateData.reviewedAt = new Date(); 
        break;

      case ApplicationStatus.INTERVIEW_SCHEDULED:
      case ApplicationStatus.ACCEPTED: 
        updateData.reviewedAt = new Date();
        break;
    }

    // Add admin notes if provided
    if (options.adminNotes) {
      updateData.adminNotes = options.adminNotes;
    }

    const updatedApplication: ApplicationForStatusUpdate =
      await prisma.jobApplication.update({
        where: { id: applicationId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          jobPosting: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

    return {
      success: true,
      message: `Application status updated to ${newStatus}`,
      application: updatedApplication,
    };
  } catch (error) {
    console.error('Error updating application status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return {
      success: false,
      message: `Failed to update application status. ${errorMessage}`,
      error: 'DATABASE_ERROR',
    };
  }
}

export async function bulkUpdateApplicationStatus(
  applicationIds: string[],
  newStatus: ApplicationStatus,
  options: StatusUpdateOptions = {} 
): Promise<{
  success: boolean;
  message: string;
  updatedCount: number; 
  failedCount: number;   
  errors: Array<{ applicationId: string; reason: string }>; 
}> {
  let updatedCount = 0;
  let failedCount = 0;
  const errors: Array<{ applicationId: string; reason: string }> = [];

  for (const applicationId of applicationIds) {
    try {
      const result = await updateApplicationStatus(
        applicationId,
        newStatus,
        options
      );
      if (result.success) {
        updatedCount++;
      } else {
        failedCount++;
        errors.push({ applicationId, reason: result.message || 'Update failed' });
      }
    } catch (error) {
      failedCount++;
      const reason = error instanceof Error ? error.message : 'Unexpected error during bulk update';
      errors.push({ applicationId, reason });
    }
  }

  return {
    success: failedCount === 0,
    message: `Bulk update finished. ${updatedCount} applications updated. ${failedCount} failed.`,
    updatedCount,
    failedCount,
    errors,
  };
}

export async function getApplicationStatistics(
  companyId?: string,
  jobPostingId?: string
): Promise<Record<ApplicationStatus, number>> {
  const whereClause: ApplicationStatsWhereClause = {};

  if (jobPostingId) {
    whereClause.jobPostingId = jobPostingId;
  } else if (companyId) {
    whereClause.jobPosting = {
      companyId: companyId,
    };
  }

  const statistics = await prisma.jobApplication.groupBy({
    by: ['status'],
    where: whereClause,
    _count: {
      status: true,
    },
  });

  // Initialize all statuses with 0
  const result: Record<ApplicationStatus, number> = Object.values(
    ApplicationStatus
  ).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  // Fill in actual counts
  statistics.forEach((stat) => {
    if (result.hasOwnProperty(stat.status)) { 
      result[stat.status] = stat._count.status ?? 0;
    }
  });

  return result;
}

// Import validation and utility functions
export { validateStatusTransition, getAvailableStatuses } from './statusValidation';
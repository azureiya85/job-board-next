import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, ApplicationStatus, NotificationType, InterviewType } from '@prisma/client';
import { auth } from '@/auth';
import { buildFilterQuery, calculateAge } from '@/lib/applicants/applicationStatsHelper';
import { searchParamsToFilters, validateFilters } from '@/lib/applicants/filterValidationHelper';
import { updateApplicationStatus } from '@/lib/applicants/applicationStatusHelper'; 
import type {
  RouteAndPaginationFilters,
  JobApplicationDetails,
  UpdateApplicationRequestBody,
} from '@/types/applicants';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } 
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = params.id; 
    const { searchParams } = new URL(request.url);

    // 1. Parse query parameters using the helper
    const baseClientFilters = searchParamsToFilters(searchParams);
    
    const routeFilters: RouteAndPaginationFilters = {
      ...baseClientFilters,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
      jobPostingId: searchParams.get('jobPostingId'), // Will be string or null
    };

    // 2. Validate filters (optional, but good practice)
    const { isValid, errors: validationErrors } = validateFilters(routeFilters);
    if (!isValid) {
      return NextResponse.json({ 
        message: "Invalid filter parameters", 
        errors: validationErrors 
      }, { status: 400 });
    }

    // 3. Verify company ownership
    const company = await prisma.company.findFirst({
      where: { id: companyId, adminId: session.user.id },
    });
    if (!company) {
      return NextResponse.json({ error: 'Company not found or unauthorized' }, { status: 404 });
    }

    // 4. Build WHERE clause for Prisma using the helper
    const { where: dynamicWhereFromHelper, orderBy: orderByFromHelper } = buildFilterQuery(routeFilters);

    // Create the main where clause, starting with companyId
    const finalWhereClause: Prisma.JobApplicationWhereInput = {
      jobPosting: {
        companyId: companyId,
      },
      ...dynamicWhereFromHelper, 
    };
    
    // Add job posting filter if specified (AND it with existing conditions)
    if (routeFilters.jobPostingId) {
      // Ensure finalWhereClause.AND is an array
      if (!finalWhereClause.AND) {
        finalWhereClause.AND = [];
      } else if (!Array.isArray(finalWhereClause.AND)) {
        finalWhereClause.AND = [finalWhereClause.AND];
      }
      (finalWhereClause.AND as Prisma.JobApplicationWhereInput[]).push({ 
        jobPostingId: routeFilters.jobPostingId 
      });
    }

    // 5. Calculate pagination
    const skip = (routeFilters.page! - 1) * routeFilters.limit!;
    const take = routeFilters.limit!;

    // 6. Fetch applications with related data
    const applications = await prisma.jobApplication.findMany({
      where: finalWhereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
            dateOfBirth: true,
            lastEducation: true,
            phoneNumber: true,
            currentAddress: true,
            province: { select: { name: true } },
            city: { select: { name: true } },
          },
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            salaryMin: true,
            salaryMax: true,
          },
        },
        interviewSchedules: {
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            interviewType: true,
          },
          orderBy: { scheduledAt: 'desc' },
          take: 1,
        },
      },
      orderBy: orderByFromHelper,
      skip,
      take,
    });

    // 7. Calculate total count for pagination (using the same where clause)
    const totalCount = await prisma.jobApplication.count({
      where: finalWhereClause,
    });

    // 8. Transform data for response using shared types
    const transformedApplications: JobApplicationDetails[] = applications.map((app) => {
      const user = app.user;
      const age = user.dateOfBirth ? calculateAge(new Date(user.dateOfBirth)) : null;

      const location = [user.city?.name, user.province?.name]
        .filter(Boolean)
        .join(', ');

      return {
        id: app.id,
        status: app.status,
        expectedSalary: app.expectedSalary,
        coverLetter: app.coverLetter,
        cvUrl: app.cvUrl,
        testScore: app.testScore,
        testCompletedAt: app.testCompletedAt,
        rejectionReason: app.rejectionReason,
        adminNotes: app.adminNotes,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        reviewedAt: app.reviewedAt,
        jobPosting: app.jobPosting,
        latestInterview: app.interviewSchedules.length > 0 ? app.interviewSchedules[0] : null,
        applicant: {
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage,
          age,
          education: user.lastEducation,
          phoneNumber: user.phoneNumber,
          location,
          currentAddress: user.currentAddress,
        },
      };
    });

    const response = {
      applications: transformedApplications,
      pagination: {
        page: routeFilters.page,
        limit: routeFilters.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / routeFilters.limit!),
        hasNext: routeFilters.page! * routeFilters.limit! < totalCount,
        hasPrev: routeFilters.page! > 1,
      },
      appliedFilters: routeFilters, 
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching applicants:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } } 
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = params.id;
    const body = (await request.json()) as UpdateApplicationRequestBody; 

    const {
      applicationId,
      status,
      rejectionReason,
      adminNotes,
      scheduleInterview,
    } = body;

    if (!applicationId || !status) {
      return NextResponse.json({ 
        error: 'Application ID and status are required' 
      }, { status: 400 });
    }
    
    if (!Object.values(ApplicationStatus).includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid application status value' 
      }, { status: 400 });
    }

    const company = await prisma.company.findFirst({
      where: { id: companyId, adminId: session.user.id },
    });
    if (!company) {
      return NextResponse.json({ 
        error: 'Company not found or unauthorized' 
      }, { status: 404 });
    }

    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        jobPosting: { companyId: companyId },
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        jobPosting: { select: { id: true, title: true } },
      },
    });
    
    if (!application) {
      return NextResponse.json({ 
        error: 'Application not found or does not belong to this company' 
      }, { status: 404 });
    }

    // Update application status using helper
    const updatedApplication = await updateApplicationStatus(
      applicationId,
      status, 
      {
        rejectionReason: rejectionReason || undefined, 
        adminNotes: adminNotes || undefined,
        reviewedBy: session.user.id, 
      }
    );

    if (scheduleInterview && status === ApplicationStatus.INTERVIEW_SCHEDULED) {
      const {
        scheduledAt,
        duration = 60,
        location,
        interviewType = InterviewType.ONLINE,
        notes,
      } = scheduleInterview;

      if (!scheduledAt) {
        return NextResponse.json({ 
          error: 'Interview scheduled date is required' 
        }, { status: 400 });
      }
      
      if (interviewType && !Object.values(InterviewType).includes(interviewType)) {
        return NextResponse.json({ 
          error: 'Invalid interview type value' 
        }, { status: 400 });
      }

      await prisma.interviewSchedule.create({
        data: {
          scheduledAt: new Date(scheduledAt),
          duration,
          location: location || undefined,
          interviewType,
          notes: notes || undefined,
          jobApplicationId: applicationId,
          jobPostingId: application.jobPosting.id, 
          candidateId: application.user.id,   
        },
      });
    }

    // Create notification for applicant
    await prisma.notification.create({
      data: {
        userId: application.user.id,
        type: NotificationType.APPLICATION_STATUS_UPDATE,
        message: `Your application for "${application.jobPosting.title}" has been ${status.toLowerCase().replace('_', ' ')}.`,
        link: `/applications/${applicationId}`, 
      },
    });

    return NextResponse.json({
      message: 'Application status updated successfully',
      application: updatedApplication,
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
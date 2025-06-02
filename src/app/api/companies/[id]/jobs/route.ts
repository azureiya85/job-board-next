import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateCompanyAccess } from '@/lib/actions/companyAuth';
import { createJobSchema, updateJobSchema, companyJobsSchema } from '@/lib/validations/zodJobValidation';
import { ProcessedJobUpdateData } from '@/types';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = request.nextUrl;
    const paramsObject = Object.fromEntries(searchParams.entries());

    const validationResult = companyJobsSchema.safeParse(paramsObject);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: validationResult.error.format(),
      }, { status: 400 });
    }

    const { take, skip, category, employmentType, experienceLevel, search } = validationResult.data;

    const company = await prisma.company.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const where = {
      companyId: id,
      isActive: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(category && { category }),
      ...(employmentType && { employmentType }),
      ...(experienceLevel && { experienceLevel }),
    };

    const [jobPostings, totalCount] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              industry: true,
            }
          },
          province: { select: { id: true, name: true, code: true } },
          city: { select: { id: true, name: true, type: true } },
          preSelectionTest: {
            select: {
              id: true,
              title: true,
              isActive: true,
            }
          },
          _count: { select: { applications: true } }
        },
        orderBy: [
          { isPriority: 'desc' },
          { createdAt: 'desc' },
        ],
        take,
        skip,
      }),
      prisma.jobPosting.count({ where }),
    ]);

    return NextResponse.json({
      company: { id: company.id, name: company.name },
      jobPostings,
      pagination: {
        total: totalCount,
        page: Math.floor(skip / take) + 1,
        totalPages: Math.ceil(totalCount / take),
        hasNext: skip + take < totalCount,
        hasPrev: skip > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await context.params;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Validate company admin access
    const authResult = await validateCompanyAccess(companyId);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!authResult.isCompanyAdmin || !authResult.isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized. Only company administrators can create job postings.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createJobSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: validationResult.error.format(),
      }, { status: 400 });
    }

    const jobData = validationResult.data;

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, adminId: true }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Double-check ownership
    if (company.adminId !== authResult.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only create jobs for your own company.' },
        { status: 403 }
      );
    }

    // If preSelectionTestId is provided, validate it belongs to the company
    if (jobData.preSelectionTestId) {
      const test = await prisma.preSelectionTest.findFirst({
        where: {
          id: jobData.preSelectionTestId,
          companyId: companyId,
          isActive: true,
        }
      });

      if (!test) {
        return NextResponse.json({
          error: 'Pre-selection test not found or does not belong to your company'
        }, { status: 400 });
      }
    }

    // Prepare data for creation 
    const createData = {
      ...jobData,
      companyId,
      // Convert empty strings to null for optional UUID fields
      provinceId: jobData.provinceId === '' ? null : jobData.provinceId,
      cityId: jobData.cityId === '' ? null : jobData.cityId,
      preSelectionTestId: jobData.preSelectionTestId || null,
      publishedAt: jobData.publishedAt || (jobData.isActive ? new Date() : null),
    };

    // Create the job posting
    const newJob = await prisma.jobPosting.create({
      data: createData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
          }
        },
        province: { select: { id: true, name: true, code: true } },
        city: { select: { id: true, name: true, type: true } },
        preSelectionTest: {
          select: {
            id: true,
            title: true,
            isActive: true,
          }
        },
        _count: { select: { applications: true } }
      },
    });

    return NextResponse.json({
      message: 'Job posting created successfully',
      job: newJob
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating job posting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await context.params;
    const { searchParams } = request.nextUrl;
    const jobId = searchParams.get('jobId');

    if (!companyId || !jobId) {
      return NextResponse.json(
        { error: 'Company ID and Job ID are required' },
        { status: 400 }
      );
    }

    // Validate company admin access
    const authResult = await validateCompanyAccess(companyId);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!authResult.isCompanyAdmin || !authResult.isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized. Only company administrators can update job postings.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateJobSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: validationResult.error.format(),
      }, { status: 400 });
    }

    const updateData = validationResult.data;

    // Check if job exists and belongs to the company
    const existingJob = await prisma.jobPosting.findFirst({
      where: {
        id: jobId,
        companyId: companyId,
      },
      include: {
        company: {
          select: { adminId: true }
        }
      }
    });

    if (!existingJob) {
      return NextResponse.json({ 
        error: 'Job posting not found or does not belong to this company' 
      }, { status: 404 });
    }

    // Double-check ownership
    if (existingJob.company.adminId !== authResult.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only update your own company\'s job postings.' },
        { status: 403 }
      );
    }

    // If preSelectionTestId is being updated, validate it
    if (updateData.preSelectionTestId) {
      const test = await prisma.preSelectionTest.findFirst({
        where: {
          id: updateData.preSelectionTestId,
          companyId: companyId,
          isActive: true,
        }
      });

      if (!test) {
        return NextResponse.json({
          error: 'Pre-selection test not found or does not belong to your company'
        }, { status: 400 });
      }
    }

    // Process update data 
    const processedData: ProcessedJobUpdateData = { ...updateData };
    
    // Convert empty strings to null for optional UUID fields
    if ('provinceId' in processedData && processedData.provinceId === '') {
      processedData.provinceId = null;
    }
    if ('cityId' in processedData && processedData.cityId === '') {
      processedData.cityId = null;
    }
    if ('preSelectionTestId' in processedData && processedData.preSelectionTestId === '') {
      processedData.preSelectionTestId = null;
    }

    // Handle publishing logic
    if ('isActive' in processedData) {
      if (processedData.isActive && !existingJob.publishedAt) {
        processedData.publishedAt = new Date();
      }
    }

    // Update the job posting
    const updatedJob = await prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        ...processedData,
        updatedAt: new Date(),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
          }
        },
        province: { select: { id: true, name: true, code: true } },
        city: { select: { id: true, name: true, type: true } },
        preSelectionTest: {
          select: {
            id: true,
            title: true,
            isActive: true,
          }
        },
        _count: { select: { applications: true } }
      },
    });

    return NextResponse.json({
      message: 'Job posting updated successfully',
      job: updatedJob
    });

  } catch (error) {
    console.error('Error updating job posting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await context.params;
    const { searchParams } = request.nextUrl;
    const jobId = searchParams.get('jobId');

    if (!companyId || !jobId) {
      return NextResponse.json(
        { error: 'Company ID and Job ID are required' },
        { status: 400 }
      );
    }

    // Validate company admin access
    const authResult = await validateCompanyAccess(companyId);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!authResult.isCompanyAdmin || !authResult.isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized. Only company administrators can delete job postings.' },
        { status: 403 }
      );
    }

    // Check if job exists and belongs to the company
    const existingJob = await prisma.jobPosting.findFirst({
      where: {
        id: jobId,
        companyId: companyId,
      },
      include: {
        company: {
          select: { adminId: true }
        },
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!existingJob) {
      return NextResponse.json({ 
        error: 'Job posting not found or does not belong to this company' 
      }, { status: 404 });
    }

    // Double-check ownership
    if (existingJob.company.adminId !== authResult.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only delete your own company\'s job postings.' },
        { status: 403 }
      );
    }

    // Check if there are existing applications
    if (existingJob._count.applications > 0) {
      // Soft delete by setting isActive to false instead of hard delete
      const updatedJob = await prisma.jobPosting.update({
        where: { id: jobId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          title: true,
          isActive: true,
          updatedAt: true,
        }
      });

      return NextResponse.json({
        message: 'Job posting deactivated successfully (soft delete due to existing applications)',
        job: updatedJob
      });
    } else {
      // Hard delete if no applications exist
      await prisma.jobPosting.delete({
        where: { id: jobId },
      });

      return NextResponse.json({
        message: 'Job posting deleted successfully',
        jobId: jobId
      });
    }

  } catch (error) {
    console.error('Error deleting job posting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
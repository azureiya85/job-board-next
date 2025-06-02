import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateCompanyAccess } from '@/lib/actions/companyAuth';
import { updateJobSchema } from '@/lib/validations/zodJobValidation';
import { ProcessedJobUpdateData } from '@/types';

const prisma = new PrismaClient();

// GET: Get a specific job posting
export async function GET(
  request: NextRequest,
  context: { params: { id: string, jobsId: string } }
) {
  try {
     const { id: companyIdFromPath, jobsId } = context.params;

     const authResult = await validateCompanyAccess(companyIdFromPath); 
    if (!authResult.isAuthenticated) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    // Add role check if only admins can view specific job details via this endpoint
    // if (!authResult.isCompanyAdmin && !authResult.isOwner) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }


    const jobPosting = await prisma.jobPosting.findFirst({
      where: {
        id: jobsId,
        companyId: companyIdFromPath,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
            adminId: true, 
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

    if (!jobPosting) {
      return NextResponse.json({ error: 'Job posting not found or does not belong to this company' }, { status: 404 });
    }
    
    // Example: Further check if the authenticated user is the owner, if this endpoint is strictly for the owner
    // if (authResult.isOwner && jobPosting.company.adminId !== authResult.user?.id) {
    //     return NextResponse.json({ error: 'Unauthorized to view this job' }, { status: 403 });
    // }


    return NextResponse.json(jobPosting);

  } catch (error) {
    console.error('Error fetching job posting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// PUT: Update a specific job posting
export async function PUT(
  request: NextRequest,
   context: { params: { id: string, jobsId: string } }
) {
  try {
   const { id: companyIdFromPath, jobsId } = context.params; 

   const authResult = await validateCompanyAccess(companyIdFromPath);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!authResult.isCompanyAdmin && !authResult.isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized. Only company administrators or owners can update job postings.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = updateJobSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: validationResult.error.format(),
      }, { status: 400 });
    }

    const updateData = validationResult.data;

    const existingJob = await prisma.jobPosting.findFirst({
      where: {
        id: jobsId,
       companyId: companyIdFromPath,
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

    if (authResult.isOwner && existingJob.company.adminId !== authResult.user?.id) {
       // Similar to POST, adjust based on your exact `validateCompanyAccess` logic for owners.
    }

    if (updateData.preSelectionTestId) {
      const test = await prisma.preSelectionTest.findFirst({
        where: {
          id: updateData.preSelectionTestId,
        companyId: companyIdFromPath,
          isActive: true,
        }
      });

      if (!test) {
        return NextResponse.json({
          error: 'Pre-selection test not found or does not belong to your company'
        }, { status: 400 });
      }
    }

    const processedData: ProcessedJobUpdateData = { ...updateData };
    
    if ('provinceId' in processedData && processedData.provinceId === '') {
      processedData.provinceId = null;
    }
    if ('cityId' in processedData && processedData.cityId === '') {
      processedData.cityId = null;
    }
    if ('preSelectionTestId' in processedData && processedData.preSelectionTestId === '') {
      processedData.preSelectionTestId = null;
    }

    if ('isActive' in processedData) {
      if (processedData.isActive && !existingJob.publishedAt) {
        processedData.publishedAt = new Date();
      }
    }

    const updatedJob = await prisma.jobPosting.update({
      where: { id: jobsId }, 
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

// DELETE: Delete (or deactivate) a specific job posting
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string, jobsId: string } }
) {
  try {
    const { id: companyIdFromPath, jobsId } = context.params; 

    const authResult = await validateCompanyAccess(companyIdFromPath); 
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!authResult.isCompanyAdmin && !authResult.isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized. Only company administrators or owners can delete job postings.' },
        { status: 403 }
      );
    }

    const existingJob = await prisma.jobPosting.findFirst({
      where: {
        id: jobsId,
       companyId: companyIdFromPath, 
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

    if (authResult.isOwner && existingJob.company.adminId !== authResult.user?.id) {
      // Similar to POST/PUT, adjust based on your `validateCompanyAccess` logic for owners.
    }

    if (existingJob._count.applications > 0) {
      const updatedJob = await prisma.jobPosting.update({
        where: { id: jobsId },
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
      await prisma.jobPosting.delete({
        where: { id: jobsId },
      });

      return NextResponse.json({
        message: 'Job posting deleted successfully',
        jobsId: jobsId
      });
    }

  } catch (error) {
    console.error('Error deleting job posting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
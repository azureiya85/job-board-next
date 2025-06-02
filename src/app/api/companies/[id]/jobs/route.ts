import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateCompanyAccess } from '@/lib/actions/companyAuth';
import { createJobSchema, companyJobsSchema } from '@/lib/validations/zodJobValidation';

const prisma = new PrismaClient();

// GET: List job postings for a company
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const resolvedParams = await context.params;
    const { id: companyId } = resolvedParams;  // Get companyId from path
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
      where: { id: companyId },
      select: { id: true, name: true }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const where = {
      companyId: companyId, // Use companyId from path
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

// POST: Create a new job posting for a company
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }// Updated context
) {
  try {
    const resolvedParams = await context.params;
    const { id: companyId } = resolvedParams;  // Get companyId from path

    if (!companyId) { 
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const authResult = await validateCompanyAccess(companyId);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!authResult.isCompanyAdmin && !authResult.isOwner) { 
      return NextResponse.json(
        { error: 'Unauthorized. Only company administrators or owners can create job postings.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = createJobSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: validationResult.error.format(),
      }, { status: 400 });
    }

    const jobData = validationResult.data;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, adminId: true }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Double-check ownership if adminId is relevant (or use authResult.isOwner)
    if (authResult.isOwner && company.adminId !== authResult.user?.id) {
    }


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

    const createData = {
      ...jobData,
      companyId,
      provinceId: jobData.provinceId === '' ? null : jobData.provinceId,
      cityId: jobData.cityId === '' ? null : jobData.cityId,
      preSelectionTestId: jobData.preSelectionTestId || null,
      publishedAt: jobData.publishedAt || (jobData.isActive ? new Date() : null),
    };

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
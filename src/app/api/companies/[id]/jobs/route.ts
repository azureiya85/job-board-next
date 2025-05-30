import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { JobCategory, EmploymentType, ExperienceLevel } from '@prisma/client';

const prisma = new PrismaClient();

const companyJobsSchema = z.object({
  take: z.coerce.number().int().positive().max(50).optional().default(10),
  skip: z.coerce.number().int().nonnegative().optional().default(0),
  category: z.nativeEnum(JobCategory).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  search: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = request.nextUrl;
    const paramsObject = Object.fromEntries(searchParams.entries());
    
    const validationResult = companyJobsSchema.safeParse(paramsObject);
    
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: validationResult.error.format()
      }, { status: 400 });
    }

    const { take, skip, category, employmentType, experienceLevel, search } = validationResult.data;

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
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
          province: {
            select: { id: true, name: true, code: true }
          },
          city: {
            select: { id: true, name: true, type: true }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: [
          { isPriority: 'desc' },
          { createdAt: 'desc' }
        ],
        take,
        skip,
      }),
      prisma.jobPosting.count({ where }),
    ]);

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name
      },
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
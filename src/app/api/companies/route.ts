import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { CompanySize } from '@prisma/client';

const prisma = new PrismaClient();

const companiesSearchSchema = z.object({
  take: z.coerce.number().int().positive().max(50).optional().default(10),
  skip: z.coerce.number().int().nonnegative().optional().default(0),
  search: z.string().optional(),
  industry: z.string().optional(),
  size: z.nativeEnum(CompanySize).optional(),
  provinceId: z.string().optional(),
  cityId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const paramsObject = Object.fromEntries(searchParams.entries());
    
    const validationResult = companiesSearchSchema.safeParse(paramsObject);
    
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: validationResult.error.format()
      }, { status: 400 });
    }

    const { take, skip, search, industry, size, provinceId, cityId } = validationResult.data;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(industry && { industry: { contains: industry, mode: 'insensitive' as const } }),
      ...(size && { size }),
      ...(provinceId && { provinceId }),
      ...(cityId && { cityId }),
    };

    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          banner: true, 
          website: true,
          logo: true,
          industry: true,
          size: true,
          foundedYear: true,
          email: true,
          phone: true,
          address: true,
          latitude: true,
          longitude: true,
          provinceId: true,
          cityId: true,
          country: true,
          linkedinUrl: true,
          facebookUrl: true,
          twitterUrl: true,
          instagramUrl: true,
          adminId: true,
          createdAt: true,
          updatedAt: true,
          // Relations
          province: {
            select: { id: true, name: true, code: true }
          },
          city: {
            select: { id: true, name: true, type: true }
          },
          _count: {
            select: {
              jobPostings: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({
      companies,
      pagination: {
        total: totalCount,
        page: Math.floor(skip / take) + 1,
        totalPages: Math.ceil(totalCount / take),
        hasNext: skip + take < totalCount,
        hasPrev: skip > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
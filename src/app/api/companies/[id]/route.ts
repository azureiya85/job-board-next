import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        province: {
          select: { id: true, name: true, code: true }
        },
        city: {
          select: { id: true, name: true, type: true }
        },
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          }
        },
        _count: {
          select: {
            jobPostings: {
              where: { isActive: true }
            },
            companyReviews: true,
          }
        }
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Calculate average rating from reviews
    const reviewStats = await prisma.companyReview.aggregate({
      where: { companyId: id },
      _avg: {
        rating: true,
        cultureRating: true,
        workLifeBalance: true,
        facilitiesRating: true,
        careerRating: true,
      },
    });

    const companyWithStats = {
      ...company,
      stats: {
        activeJobs: company._count.jobPostings,
        totalReviews: company._count.companyReviews,
        averageRating: reviewStats._avg.rating || 0,
        ratings: {
          culture: reviewStats._avg.cultureRating || 0,
          workLifeBalance: reviewStats._avg.workLifeBalance || 0,
          facilities: reviewStats._avg.facilitiesRating || 0,
          career: reviewStats._avg.careerRating || 0,
        }
      }
    };

    return NextResponse.json(companyWithStats);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
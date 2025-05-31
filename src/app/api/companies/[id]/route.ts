import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id },
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
        admin: { 
          select: { id: true, name: true, email: true, profileImage: true } 
        },
        _count: {
          select: {
            jobPostings: { where: { isActive: true } },
            companyReviews: true,
          }
        }
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
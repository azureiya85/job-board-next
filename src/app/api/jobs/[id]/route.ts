import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { JobPostingFeatured } from '@/types'; 

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  try {
    const job = await prisma.jobPosting.findUnique({
      where: {
        id: id,
        isActive: true, // Only fetch active jobs
      },
      select: {
        id: true,
        title: true,
        description: true,
        employmentType: true,
        experienceLevel: true,
        category: true,
        isRemote: true,
        createdAt: true,
        publishedAt: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        isPriority: true,
        tags: true,
        requirements: true,
        benefits: true,
        applicationDeadline: true,
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            size: true,
            description: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
          },
        },
        province: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job as unknown as JobPostingFeatured, { status: 200 });

  } catch (error) {
    console.error('API: Failed to fetch job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
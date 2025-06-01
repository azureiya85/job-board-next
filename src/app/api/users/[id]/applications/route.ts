import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole } from '@prisma/client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: userId } = await params; // Await params before destructuring

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.id !== userId && session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const applications = await prisma.jobApplication.findMany({
      where: {
        userId: userId,
      },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            isRemote: true, // Include if the job is remote
            // Select province and city names
            province: {
              select: {
                name: true,
              },
            },
            city: {
              select: {
                name: true,
              },
            },
            // country: true, // You can also select country if needed
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
        interviewSchedules: {
          select: {
            id: true,
            scheduledAt: true,
            duration: true,
            location: true, // This 'location' is for the interview itself (e.g., office address or meeting link)
            interviewType: true,
            notes: true,
            status: true,
          },
          orderBy: {
            scheduledAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error(`Error fetching applications for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
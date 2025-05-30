import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole } from '@prisma/client'; 

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) { 
  const session = await auth(); 

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Access role and other custom properties with correct typing
  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer) { 
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        provider: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
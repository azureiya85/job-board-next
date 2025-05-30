import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole } from '@prisma/client'; 

export async function GET(
  _request: Request, 
  { params }: { params: { id: string } }
) {
  const session = await auth(); 
  const { id } = params;

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Access role and other custom properties 
  if (session.user.id !== id && session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer) { 
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        isEmailVerified: true,
        emailVerified: true,
        role: true,
        provider: true,
        dateOfBirth: true,
        gender: true,
        lastEducation: true,
        currentAddress: true,
        phoneNumber: true,
        latitude: true,
        longitude: true,
        provinceId: true,
        province: { select: { id: true, name: true }},
        cityId: true,
        city: { select: { id: true, name: true }},
        country: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { updateUserProfileSchema } from '@/lib/zodValidation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: routeParamId } = await params; 

  console.log("SESSION USER ID:", session?.user?.id);
  console.log("ROUTE PARAM ID:", routeParamId);
  console.log("SESSION USER ROLE:", session?.user?.role);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.id !== routeParamId && session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer) {
    console.log("FORBIDDEN: session.user.id !== routeParamId AND role is not ADMIN/Developer");
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: routeParamId }, 
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
        province: { select: { id: true, name: true } },
        cityId: true,
        city: { select: { id: true, name: true } },
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
    console.error(`Error fetching user ${routeParamId}:`, error); // CORRECTED: Use routeParamId here
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: targetUserId } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.id !== targetUserId && session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Forbidden to update this profile' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validationResult = updateUserProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validationResult.error.flatten() }, { status: 400 });
    }

    const updateData = validationResult.data;

    const userToUpdate = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userToUpdate.role === UserRole.USER) {
        const requiredFields: (keyof typeof updateData)[] = ['dateOfBirth', 'gender', 'lastEducation', 'currentAddress'];
        for (const field of requiredFields) {
            if (updateData[field] === null && userToUpdate[field as keyof typeof userToUpdate] !== null) {
            }
             if (updateData[field] === undefined && userToUpdate[field as keyof typeof userToUpdate] === null) {
             }
        }
    }

    // Handle name concatenation
    let finalName: string | undefined = userToUpdate.name ?? undefined; 
    if (updateData.firstName || updateData.lastName) {
        const newFirstName = updateData.firstName ?? userToUpdate.firstName;
        const newLastName = updateData.lastName ?? userToUpdate.lastName;
        finalName = `${newFirstName || ''} ${newLastName || ''}`.trim();
        if (!finalName && userToUpdate.email) finalName = userToUpdate.email; // Fallback to email if name becomes empty
    }


    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...updateData,
        name: finalName, // Apply concatenated name
      },
      select: { // Return a subset of data, similar to GET
        id: true, email: true, name: true, firstName: true, lastName: true, profileImage: true,
        isEmailVerified: true, role: true, dateOfBirth: true, gender: true, lastEducation: true,
        currentAddress: true, phoneNumber: true, provinceId: true, cityId: true, country: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Error updating user ${targetUserId}:`, error);
    if (error instanceof z.ZodError) { // Should be caught by safeParse, but good practice
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
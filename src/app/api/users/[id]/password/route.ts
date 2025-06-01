import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { updatePasswordSchema } from '@/lib/zodValidation';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: targetUserId } = await params;

  if (!session?.user || session.user.id !== targetUserId) {
    return NextResponse.json({ error: 'Unauthorized to change this password' }, { status: 401 });
  }

  // Users who signed up with OAuth (e.g., Google) might not have a password.
//   if (session.user.provider && session.user.provider !== 'EMAIL') {
//     return NextResponse.json({ error: 'Password cannot be changed for OAuth accounts.' }, { status: 400 });
//   }

  try {
    const body = await request.json();
    const validationResult = updatePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }

    const { currentPassword, newPassword } = validationResult.data;

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!user || !user.password) {
      // Should be caught by provider check, but defensive.
      return NextResponse.json({ error: 'User not found or password not set for this account.' }, { status: 404 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
    }

    if (currentPassword === newPassword) {
        return NextResponse.json({ error: 'New password cannot be the same as the current password.' }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { password: hashedNewPassword, updatedAt: new Date() },
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(`Error updating password for user ${targetUserId}:`, error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
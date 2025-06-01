import { NextResponse } from 'next/server';
import { authHelpers } from '@/lib/authHelpers';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { emailService } from '@/services/email.service';
import { generateAndSaveEmailVerificationToken } from '@/lib/userTokenUtils';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// GET Handle email verification with token
export async function GET(request: Request) {
  const requestTimestamp = new Date().toISOString();
  console.log(`API_ROUTE (${requestTimestamp}): GET /api/auth/verify-email received.`);
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    console.log(`API_ROUTE: Token from URL: ${token}`);

    if (!token) {
      console.log("API_ROUTE: Verification token is required - returning 400.");
      return NextResponse.json(
        { message: 'Verification token is required', success: false },
        { status: 400 }
      );
    }

    const result = await authHelpers.verifyEmailToken(token);
    console.log("API_ROUTE: Result from authHelpers.verifyEmailToken:", result);

    return NextResponse.json(
      {
        message: result.message,
        success: result.success,
      },
      { status: result.success ? 200 : 400 }
    );
  } catch (error) {
    console.error(`API_ROUTE: Email verification API error (${requestTimestamp}):`, error);
    return NextResponse.json(
      { message: 'An unexpected error occurred', success: false },
      { status: 500 }
    );
  }
}

const updateEmailSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  userId: z.string(),
});

// PUT Handle email address update (requires authentication)
export async function PUT(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const validationResult = updateEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    const { newEmail, userId } = validationResult.data;
    const newEmailLower = newEmail.toLowerCase();

    // Check authentication and authorization
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.id !== userId && 
        session.user.role !== UserRole.ADMIN && 
        session.user.role !== UserRole.Developer) {
      return NextResponse.json({ error: 'Forbidden to update this email' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userFirstName = user.firstName || user.name || 'User';

    // Check if new email is same as current email
    if (user.email?.toLowerCase() === newEmailLower) {
      if (!user.isEmailVerified) {
        // Resend verification for the same unverified email
        const verificationToken = await generateAndSaveEmailVerificationToken(userId);
        await emailService.sendVerificationEmail(newEmailLower, userFirstName, verificationToken);
        return NextResponse.json({ 
          message: 'This email is already associated with your account. A new verification link has been sent.' 
        });
      }
      return NextResponse.json({ 
        message: 'Email is already set to this address and verified.' 
      }, { status: 200 });
    }

    // Check if new email is already in use by another user
    const existingUserWithNewEmail = await prisma.user.findUnique({
      where: { email: newEmailLower },
    });
    if (existingUserWithNewEmail && existingUserWithNewEmail.id !== userId) {
      return NextResponse.json({ 
        error: 'This email address is already in use by another account.' 
      }, { status: 409 });
    }

    // Update user's email and mark as unverified
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmailLower,
        isEmailVerified: false,
        emailVerified: null,
        updatedAt: new Date(),
      },
    });

    // Generate token and send verification email
    const verificationToken = await generateAndSaveEmailVerificationToken(userId);
    await emailService.sendVerificationEmail(newEmailLower, userFirstName, verificationToken);

    return NextResponse.json({ 
      message: 'Email update initiated. Please check your new email address for a verification link.' 
    });

  } catch (error) {
    console.error('Error updating email:', error);
    
    if (error instanceof Error && error.message.includes('Failed to send email')) {
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again later.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update email' 
    }, { status: 500 });
  }
}

const resendEmailSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  userId: z.string().optional(),
}).refine(data => data.email || data.userId, {
  message: "Either email or userId must be provided"
});

// POST Handle resend verification email (supports both public resend and authenticated user resend)
export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const validationResult = resendEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Invalid input', 
          success: false,
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const { email, userId } = validationResult.data;

    // If userId is provided, this is an authenticated request from user's dashboard
    if (userId) {
      // Check authentication and authorization
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (session.user.id !== userId && 
          session.user.role !== UserRole.ADMIN && 
          session.user.role !== UserRole.Developer) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Find user by ID
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      if (!user.email) {
        return NextResponse.json({ 
          error: 'User does not have an email address set.' 
        }, { status: 400 });
      }
      
      if (user.isEmailVerified) {
        return NextResponse.json({ 
          message: 'Email is already verified.' 
        }, { status: 400 });
      }

      // Generate token and send email
      const userFirstName = user.firstName || user.name || 'User';
      const verificationToken = await generateAndSaveEmailVerificationToken(userId);
      await emailService.sendVerificationEmail(user.email, userFirstName, verificationToken);

      return NextResponse.json({
        message: 'Verification email resent. Please check your inbox.',
        success: true
      });
    }

    // If email is provided, this is a public resend request (original flow)
    if (email) {
      const result = await authHelpers.resendVerificationEmail(email);

      return NextResponse.json(
        {
          message: result.message,
          success: result.success,
        },
        { status: result.success ? 200 : 400 }
      );
    }

    // This shouldn't happen due to schema validation, but just in case
    return NextResponse.json(
      { message: 'Either email or userId must be provided', success: false },
      { status: 400 }
    );

  } catch (error) {
    console.error('Resend verification email API error:', error);
    
    if (error instanceof Error && error.message.includes('Failed to send email')) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'An unexpected error occurred', success: false },
      { status: 500 }
    );
  }
}
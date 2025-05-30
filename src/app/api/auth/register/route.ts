import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/zodValidation'; 
import crypto from 'crypto'; // For generating tokens
// import { sendVerificationEmail } from '@/lib/mail'; // Placeholder for  email sending function

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { firstName, lastName, email, password } = validation.data;

    // Check if user already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 }); // 409 Conflict
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`, 
        email,
        password: hashedPassword,
        role: 'USER', 
        provider: 'EMAIL', 
        isEmailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    // ---- Send verification email (nodemailer logic will go here) ----
    // For now, we'll just log it or skip.
    // try {
    //   await sendVerificationEmail(
    //     newUser.email,
    //     newUser.firstName || 'User',
    //     emailVerificationToken
    //   );
    //   console.log(`Verification email supposedly sent to ${newUser.email} with token ${emailVerificationToken}`);
    // } catch (emailError) {
    //   console.error("Failed to send verification email:", emailError);
    //   // Decide if registration should fail if email sending fails, or proceed.
    //   // For now, we'll proceed. User can request resend later.
    // }
    // -----------------------------------------------------------------


    // Don't return the password or tokens in the response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, emailVerificationToken: _token, ...userWithoutSensitiveData } = newUser;

    return NextResponse.json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: userWithoutSensitiveData, 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
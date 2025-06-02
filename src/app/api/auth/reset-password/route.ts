import { NextResponse } from 'next/server';
import { authHelpers } from '@/lib/authHelpers';
import { resetPasswordSchema } from '@/lib/validations/zodAuthValidation'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmNewPassword } = body;

    if (!token) {
      return NextResponse.json(
        { message: 'Reset token is required', success: false },
        { status: 400 }
      );
    }

    // Validate the new password and confirmNewPassword
    const passwordValidation = resetPasswordSchema.safeParse({ newPassword, confirmNewPassword });
    if (!passwordValidation.success) {
      return NextResponse.json(
        {
          message: 'Invalid password input.',
          errors: passwordValidation.error.flatten().fieldErrors,
          success: false,
        },
        { status: 400 }
      );
    }

    // authHelpers.resetPassword will handle token validation and hashing
    const result = await authHelpers.resetPassword(token, passwordValidation.data.newPassword);

    return NextResponse.json(
      {
        message: result.message,
        success: result.success,
      },
      { status: result.success ? 200 : 400 }
    );

  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred', success: false },
      { status: 500 }
    );
  }
}
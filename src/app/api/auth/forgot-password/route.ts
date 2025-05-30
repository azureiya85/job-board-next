import { NextResponse } from 'next/server';
import { authHelpers } from '@/lib/authHelpers';
import { requestPasswordResetSchema } from '@/lib/zodValidation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = requestPasswordResetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: 'Invalid input.',
          errors: validation.error.flatten().fieldErrors,
          success: false,
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const result = await authHelpers.generatePasswordResetToken(email);
    return NextResponse.json(
      {
        message: result.message, 
        success: true, 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred', success: false },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/zodAuthValidation';
import { authHelpers } from '@/lib/authHelpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await authHelpers.register(validation.data);

    if (!result.success) {
      const statusCode = result.message.includes('already exists') ? 409 : 400;
      return NextResponse.json(
        { message: result.message },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      message: result.message,
      user: result.user,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
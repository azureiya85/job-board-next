import { NextResponse } from 'next/server';
import { authHelpers } from '@/lib/authHelpers';

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

// POST Handle resend verification email
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required', success: false },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format', success: false },
        { status: 400 }
      );
    }

    const result = await authHelpers.resendVerificationEmail(email);

    return NextResponse.json(
      {
        message: result.message,
        success: result.success,
      },
      { status: result.success ? 200 : 400 }
    );
  } catch (error) {
    console.error('Resend verification email API error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred', success: false },
      { status: 500 }
    );
  }
}
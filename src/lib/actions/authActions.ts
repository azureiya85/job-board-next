'use server';

import { signIn as nextAuthServerSignIn, auth as getNextAuthServerSession } from '@/auth'; 
import { LoginFormData, RegisterFormData } from '@/lib/zodValidation';
import { AuthError } from 'next-auth';
import { UserRole } from '@prisma/client'; 
import { authHelpers, RegisterResult } from '@/lib/authHelpers'; 

// This interface is for the data structure expected by the client after login
export interface LoggedInUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole; 
  avatar?: string;
  isVerified: boolean;
}

interface LoginActionResult {
  success: boolean;
  error?: string;
  errorType?: string;
  user?: LoggedInUser;
}

export async function loginWithCredentialsAction(data: LoginFormData): Promise<LoginActionResult> {
  try {
    // nextAuthServerSignIn will use the 'authorize' function from auth.ts,
    await nextAuthServerSignIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    // After successful signIn, fetch the session to return user details
    const session = await getNextAuthServerSession();

    if (!session || !session.user) {
      return {
        success: false,
        error: 'Session not established after login. Please try again.',
        errorType: 'SessionError',
      };
    }

    // Map the session user (which is based on your NextAuth User type) to LoggedInUser
    const loggedInUser: LoggedInUser = {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name || undefined,
      role: session.user.role, 
      avatar: session.user.image || undefined,
      isVerified: session.user.isEmailVerified,
    };
    // Update last login time here (as it's a server action)
    await authHelpers.updateLastLogin(loggedInUser.id);


    return { success: true, user: loggedInUser };

  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return {
          success: false,
          error: 'Invalid credentials. Please check your email and password.',
          errorType: error.type,
        };
      }
      console.error('AuthError in loginAction:', error);
      return {
        success: false,
        error: error.message || 'An authentication error occurred.',
        errorType: error.type,
      };
    }
    console.error('Unexpected error in loginAction:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during login. Please try again.',
      errorType: 'UnknownError',
    };
  }
}

// Directly calls the Node.js specific registration logic
export async function registerUserAction(data: RegisterFormData): Promise<RegisterResult> {
  try {
    const result = await authHelpers.register(data);
    return result;
  } catch (error) {
    console.error('Unexpected error in registerUserAction:', error);
    return {
      success: false,
      message: 'An unexpected server error occurred during registration. Please try again.',
    };
  }
}

// Server Actions
export async function verifyEmailTokenAction(token: string): Promise<{ success: boolean; message: string }> {
    return authHelpers.verifyEmailToken(token);
}

export async function generatePasswordResetTokenAction(email: string): Promise<{ success: boolean; message: string }> {
    return authHelpers.generatePasswordResetToken(email);
}

export async function resetPasswordAction(token: string, newPassword: string):Promise<{ success: boolean; message: string }> {
    return authHelpers.resetPassword(token, newPassword);
}

export async function resendVerificationEmailAction(email: string): Promise<{ success: boolean; message: string }> {
    return authHelpers.resendVerificationEmail(email);
}
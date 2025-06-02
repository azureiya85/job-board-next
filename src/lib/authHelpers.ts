import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { emailService } from '@/services/email.service'; 
import { RegisterFormData } from '@/lib/validations/zodAuthValidation';
import { universalCrypto } from '@/lib/crypto';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string; 
  avatar?: string;
  isVerified: boolean;
}

export interface RegisterResult {
  success: boolean;
  message: string;
  user?: Omit<AuthUser, 'password'>; 
}

// Helper function to generate secure random token
const generateSecureToken = (): string => {
  return universalCrypto.generateToken(32); // 32 bytes = 64 hex characters
};

export const authHelpers = { 
  // Register new user
  register: async (data: RegisterFormData): Promise<RegisterResult> => {
    try {
      const { firstName, lastName, email, password } = data;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return { success: false, message: 'User with this email already exists' };
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const emailVerificationToken = generateSecureToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const newUser = await prisma.user.create({
        data: {
          firstName, lastName, name: `${firstName} ${lastName}`, email, password: hashedPassword,
          role: 'USER', provider: 'EMAIL', isEmailVerified: false,
          emailVerificationToken, emailVerificationExpires,
        },
      });
      
      try {
        await emailService.sendVerificationEmail(newUser.email, newUser.firstName || 'User', emailVerificationToken);
      } catch (emailError) { 
        console.error('Failed to send verification email:', emailError); 
      }
      
      const userWithoutSensitive = {
        id: newUser.id, email: newUser.email, name: newUser.name || undefined,
        firstName: newUser.firstName || undefined, lastName: newUser.lastName || undefined,
        role: newUser.role, avatar: newUser.image || undefined, isVerified: newUser.isEmailVerified,
      };
      
      return { 
        success: true, 
        message: 'Registration successful! Please check your email to verify your account.', 
        user: userWithoutSensitive 
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An unexpected error occurred during registration' };
    }
  },

  // Verify credentials for login 
  verifyCredentials: async (email: string, password: string): Promise<AuthUser | null> => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) return null;
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return null;
      return {
        id: user.id, email: user.email, name: user.name || undefined,
        firstName: user.firstName || undefined, lastName: user.lastName || undefined,
        role: user.role, avatar: user.image || undefined, isVerified: user.isEmailVerified,
      };
    } catch (error) {
      console.error('Credential verification error:', error);
      return null;
    }
  },

  // Verify email token
  verifyEmailToken: async (token: string): Promise<{ success: boolean; message: string }> => {
    console.log(`AUTH_HELPER: Verifying token: ${token}`);
    const currentTime = new Date();
    console.log(`AUTH_HELPER: Current server time for expiry check: ${currentTime.toISOString()}`);

    try {
      // Find the user by token regardless of expiry to see if token exists
      const userByTokenOnly = await prisma.user.findFirst({
        where: { emailVerificationToken: token },
      });

      if (!userByTokenOnly) {
        console.log("AUTH_HELPER: No user found with this emailVerificationToken.");
        return { success: false, message: 'Invalid verification token. Token not found in database.' };
      }

      console.log(`AUTH_HELPER: User found by token: ${userByTokenOnly.id}, email: ${userByTokenOnly.email}`);
      console.log(`AUTH_HELPER: Token expires at: ${userByTokenOnly.emailVerificationExpires?.toISOString()}`);
      console.log(`AUTH_HELPER: Is already verified: ${userByTokenOnly.isEmailVerified}`);

      // Check if it's expired or already verified
      if (!userByTokenOnly.emailVerificationExpires || userByTokenOnly.emailVerificationExpires <= currentTime) {
        console.log("AUTH_HELPER: Token is expired.");
        return { success: false, message: 'Verification token has expired.' };
      }

      if (userByTokenOnly.isEmailVerified) {
        console.log("AUTH_HELPER: Email is already verified for this user.");
        return { success: true, message: 'Email address is already verified.' };
      }

      // Token is valid, not expired, and email not yet verified by this token
      await prisma.user.update({
        where: { id: userByTokenOnly.id },
        data: {
          isEmailVerified: true,
          emailVerified: currentTime, 
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });
      console.log("AUTH_HELPER: User email verification status updated successfully.");

      try {
        await emailService.sendWelcomeEmail(userByTokenOnly.email, userByTokenOnly.firstName || 'User');
        console.log("AUTH_HELPER: Welcome email queued/sent.");
      } catch (emailError) {
        console.error('AUTH_HELPER: Failed to send welcome email:', emailError);
      }

      return { success: true, message: 'Email verified successfully! Welcome to our platform.' };
    } catch (error) {
      console.error('AUTH_HELPER: Error during email verification process:', error);
      return { success: false, message: 'An error occurred during email verification' }; 
    }
  },

  // Generate password reset token
  generatePasswordResetToken: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return { 
        success: true, 
        message: 'If an account with this email exists, a password reset link has been sent.' 
      };
      
      const resetToken = generateSecureToken();
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: resetToken, resetPasswordExpires: resetTokenExpires },
      });
      
      try {
        await emailService.sendPasswordResetEmail(user.email, user.firstName || 'User', resetToken);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        return { success: false, message: 'Failed to send password reset email. Please try again.' };
      }
      
      return { success: true, message: 'Password reset link has been sent to your email.' };
    } catch (error) {
      console.error('Password reset token generation error:', error);
      return { success: false, message: 'An error occurred while processing your request' };
    }
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const user = await prisma.user.findFirst({
        where: { resetPasswordToken: token, resetPasswordExpires: { gt: new Date() } },
      });
      if (!user) return { success: false, message: 'Invalid or expired reset token' };
      
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
      });
      
      return { success: true, message: 'Password has been reset successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'An error occurred while resetting your password' };
    }
  },

  // Resend verification email
  resendVerificationEmail: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return { success: false, message: 'User not found' };
      if (user.isEmailVerified && user.emailVerified) { // Check both
        return { success: false, message: 'Email is already verified' };
      }
      
      const emailVerificationToken = generateSecureToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          emailVerificationToken, 
          emailVerificationExpires,
          isEmailVerified: false, 
          emailVerified: null,
        },
      });
      
      await emailService.sendVerificationEmail(user.email, user.firstName || 'User', emailVerificationToken);
      return { success: true, message: 'Verification email has been resent' };
    } catch (error) {
      console.error('Resend verification email error:', error);
      return { success: false, message: 'Failed to resend verification email' };
    }
  },

  // Get user by ID
  getUserById: async (id: string): Promise<AuthUser | null> => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return {
        id: user.id, email: user.email, name: user.name || undefined,
        firstName: user.firstName || undefined, lastName: user.lastName || undefined,
        role: user.role, avatar: user.image || undefined, isVerified: user.isEmailVerified,
      };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  },

  // Update last login time
  updateLastLogin: async (userId: string): Promise<void> => {
    try {
      await prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
    } catch (error) { 
      console.error('Update last login error:', error); 
    }
  },
};
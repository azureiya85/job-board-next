import prisma from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Generates a new email verification token, saves it to the user record,
 * and sets its expiration time (e.g., 24 hours).
 * @param userId The ID of the user for whom to generate the token.
 * @returns The generated verification token.
 */
export async function generateAndSaveEmailVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24 hours

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: token,
      emailVerificationExpires: expires,
      // isEmailVerified is handled by the calling route or the verification endpoint itself
    },
  });
  return token;
}
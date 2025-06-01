import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import cloudinary, { UploadApiResponse } from '@/lib/cloudinary';


export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const { id: targetUserId } = params;

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.id !== targetUserId && session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Forbidden to update this profile image' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('profileImage') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, JPEG, PNG are allowed.' }, { status: 400 });
    }

    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File is too large. Maximum size is 1MB.` }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: `job-portal/profile_images/${targetUserId}`,
          overwrite: true,
        },
        (error, result) => {
          // Type guard for Cloudinary error
          if (error) { // error here is often of type UploadApiErrorResponse or similar
            console.error('Cloudinary upload stream error:', error);
            return reject(error); // Reject with the Cloudinary error object
          }
          if (result) {
            return resolve(result);
          }
          return reject(new Error('Cloudinary upload failed: No result returned'));
        }
      ).end(buffer);
    });

    if (!uploadResult || !uploadResult.secure_url) {
        throw new Error("Cloudinary upload failed or URL not returned.");
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { profileImage: uploadResult.secure_url, updatedAt: new Date() },
      select: { profileImage: true, id: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile image updated successfully.',
      profileImage: updatedUser.profileImage,
    });

  } catch (error) { 
    console.error(`Error uploading profile image for user ${targetUserId}:`, error);

    if (typeof error === 'object' && error !== null && 'message' in error) {
        const e = error as { message: string; http_code?: number; name?: string }; 
        if (e.name === 'Error' && e.message.startsWith('Cloudinary upload failed')) { 
             return NextResponse.json({ error: e.message }, { status: 500 });
        }
        if (e.http_code) {
             return NextResponse.json({ error: `Cloudinary error: ${e.message}` }, { status: e.http_code });
        }
         // Generic error object
        return NextResponse.json({ error: e.message || 'Failed to update profile image.' }, { status: 500 });
    }
    
    // Fallback for unknown error types
    return NextResponse.json({ error: 'An unexpected error occurred during profile image upload.' }, { status: 500 });
  }
}
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  name?: string | null;
  image?: string | null;
  isEmailVerified: boolean;
}

export interface Company {
  id: string;
  name: string;
  logo?: string | null;
  adminId: string;
  admin: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
  };
}

export interface CompanyAuthResult {
  isAuthenticated: boolean;
  isCompanyAdmin: boolean;
  isOwner: boolean;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  } | null;
  error?: string;
}

export async function validateCompanyAccess(companyId: string): Promise<CompanyAuthResult> {
  try {
    // Get the current session
    const session = await auth();
    
    if (!session || !session.user) {
      return {
        isAuthenticated: false,
        isCompanyAdmin: false,
        isOwner: false,
        user: null,
        error: 'Not authenticated'
      };
    }

    // Check if the company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        adminId: true,
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!company) {
      return {
        isAuthenticated: true,
        isCompanyAdmin: false,
        isOwner: false,
        user: {
          id: session.user.id!,
          email: session.user.email!,
          name: session.user.name || undefined,
          role: session.user.role || 'USER'
        },
        error: 'Company not found'
      };
    }

    // Check if the current user is the company admin (owner)
    const isOwner = company.adminId === session.user.id;
    const isCompanyAdmin = session.user.role === 'COMPANY_ADMIN' && isOwner;

    return {
      isAuthenticated: true,
      isCompanyAdmin,
      isOwner,
      user: {
        id: session.user.id!,
        email: session.user.email!,
        name: session.user.name || undefined,
        role: session.user.role || 'USER'
      }
    };

  } catch (error) {
    console.error('Error validating company access:', error);
    return {
      isAuthenticated: false,
      isCompanyAdmin: false,
      isOwner: false,
      user: null,
      error: 'Server error during validation'
    };
  }
}
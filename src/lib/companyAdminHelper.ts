import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export interface UserWithCompany {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  name?: string | null;
  image?: string | null;
  isEmailVerified: boolean;
  companyId?: string | null;
}

export async function getCompanyIdForAdmin(userId: string): Promise<string | null> {
  try {
    const company = await prisma.company.findFirst({
      where: {
        adminId: userId
      },
      select: {
        id: true
      }
    });
    
    return company?.id || null;
  } catch (error) {
    console.error('Error fetching company for admin:', error);
    return null;
  }
}

export async function getCompanyForAdmin(userId: string) {
  try {
    const company = await prisma.company.findFirst({
      where: {
        adminId: userId
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        province: true,
        city: true,
        _count: {
          select: {
            jobPostings: {
              where: {
                isActive: true 
              }
            }
          }
        }
      }
    });
    
    return company;
  } catch (error) {
    console.error('Error fetching company details for admin:', error);
    return null;
  }
}

export async function enrichUserWithCompanyData(user: UserWithCompany): Promise<UserWithCompany> {
  if (user.role === 'COMPANY_ADMIN') {
    const companyId = await getCompanyIdForAdmin(user.id);
    return {
      ...user,
      companyId
    };
  }
  return user;
}
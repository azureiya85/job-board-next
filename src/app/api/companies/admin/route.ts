import { NextResponse } from 'next/server';
import { auth } from '@/auth'; 
import prisma from '@/lib/prisma'; 

export async function GET() {
  try {
    const session = await auth(); // Use auth() directly
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a company admin
    if (session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find the company where this user is the admin
    const company = await prisma.company.findFirst({
      where: {
        adminId: session.user.id
      },
      select: {
        id: true,
        name: true,
        logo: true
      }
    });

    if (!company) {
      return NextResponse.json({ 
        error: 'No company found for this admin',
        companyId: null 
      }, { status: 404 });
    }

    return NextResponse.json({
      companyId: company.id,
      companyName: company.name,
      companyLogo: company.logo
    });

  } catch (error) {
    console.error('Error in company admin API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
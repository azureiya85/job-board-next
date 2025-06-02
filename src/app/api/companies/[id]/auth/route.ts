import { NextRequest, NextResponse } from 'next/server';
import { validateCompanyAccess } from '@/lib/actions/companyAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const companyId = resolvedParams.id;
    const authResult = await validateCompanyAccess(companyId);
    
    return NextResponse.json(authResult);
  } catch (error) {
    console.error('Error in company auth API:', error);
    return NextResponse.json({
      isAuthenticated: false,
      isCompanyAdmin: false,
      isOwner: false,
      user: null,
      error: 'Server error'
    }, { status: 500 });
  }
}
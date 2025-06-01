import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserRole } from '@prisma/client';

const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password', 
  '/auth/confirm-reset-password',
  '/auth/verify-email',   
  '/jobs',                 
  '/companies',            
  '/unauthorized',         
  '/api/auth/csrf',       
  '/api/auth/login',      
  '/api/auth/callback',    
  '/api/auth/session',     
  '/api/auth/signout',    
];

const authenticatedUserRoutes = ['/dashboard'];
const companyAdminRoutes = ['/company/dashboard'];
const developerAdminRoutes = ['/developer/subscriptions', '/developer/assessments'];
const siteAdminRoutes = ['/admin/users', '/admin/analytics', ...developerAdminRoutes];

export default auth(async (req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const currentPath = nextUrl.pathname;

  // Enhanced debugging
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Path:', currentPath);
  console.log('Session object exists:', !!session);
  console.log('Session.user exists:', !!session?.user);
  console.log('Session.user.id:', session?.user?.id);
  console.log('Session.user.email:', session?.user?.email);
  console.log('Session.user.role:', session?.user?.role);
  console.log('Session.user.isEmailVerified:', session?.user?.isEmailVerified);
  
  // Check if we have JWT token info
  console.log('Full session object:', JSON.stringify(session, null, 2));
  
  const isAuthenticated = !!(session?.user?.id); // More strict check
  const isEmailVerified = session?.user?.isEmailVerified ?? false;
  const userRole = session?.user?.role;

  console.log('Computed isAuthenticated:', isAuthenticated);
  console.log('========================');

  // 1. Check if route is public
  const isPublic = publicRoutes.includes(currentPath) || 
                   publicRoutes.some(route => 
                     currentPath.startsWith(route + '/') || 
                     (route.endsWith('/') && currentPath.startsWith(route))
                   );

  console.log('Is public route:', isPublic);

  if (isPublic) {
    // Special handling for auth pages when user is already logged in
    if (isAuthenticated && (currentPath === '/auth/login' || currentPath === '/auth/register')) {
        console.log('Authenticated user trying to access auth page, redirecting...');
        
        if (userRole === UserRole.COMPANY_ADMIN) {
          return NextResponse.redirect(new URL('/company/dashboard', nextUrl.origin));
        }
        if (userRole === UserRole.ADMIN || userRole === UserRole.Developer) {
          return NextResponse.redirect(new URL('/admin/users', nextUrl.origin));
        }
        return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
    }
    
    console.log('Allowing access to public route');
    return NextResponse.next();
  }

  // 2. Authentication required beyond this point
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    const loginUrl = new URL('/auth/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', currentPath);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Email verification check
  const isAuthFlowPage = ['/auth/verify-email', '/api/auth/resend-verification', '/auth/logout']
                        .includes(currentPath);

  if (!isEmailVerified && !isAuthFlowPage) {
    console.log('Email not verified, redirecting to verify-email');
    return NextResponse.redirect(new URL('/auth/verify-email', nextUrl.origin));
  }

  // 4. Role-based access control
  if (developerAdminRoutes.some(route => currentPath.startsWith(route))) {
    if (!userRole || (userRole !== UserRole.Developer && userRole !== UserRole.ADMIN)) { 
      return NextResponse.redirect(new URL('/unauthorized?reason=role_dev', nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (companyAdminRoutes.some(route => currentPath.startsWith(route))) {
    if (!userRole || (userRole !== UserRole.COMPANY_ADMIN && userRole !== UserRole.ADMIN && userRole !== UserRole.Developer)) { 
      return NextResponse.redirect(new URL('/unauthorized?reason=role_company', nextUrl.origin));
    }
    return NextResponse.next();
  }

  const isStrictlySiteAdminRoute = siteAdminRoutes.some(route => currentPath.startsWith(route)) &&
                                 !developerAdminRoutes.some(route => currentPath.startsWith(route));

  if (isStrictlySiteAdminRoute) {
      if (!userRole || (userRole !== UserRole.ADMIN && userRole !== UserRole.Developer)) {
          return NextResponse.redirect(new URL('/unauthorized?reason=role_admin', nextUrl.origin));
      }
      return NextResponse.next();
  }

  // 5. General authenticated user routes
  if (authenticatedUserRoutes.some(route => currentPath.startsWith(route))) {
    if (userRole === UserRole.USER) {
        return NextResponse.next();
    }
    
    // Redirect other roles to their appropriate dashboards
    if (userRole === UserRole.COMPANY_ADMIN) {
        return NextResponse.redirect(new URL('/company/dashboard', nextUrl.origin));
    }
    if (userRole === UserRole.ADMIN || userRole === UserRole.Developer) {
        return NextResponse.redirect(new URL('/admin/users', nextUrl.origin));
    }
  }

  console.log('No specific rule matched, allowing access');
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|images|sw.js|workbox-.*).*)',
  ],
};
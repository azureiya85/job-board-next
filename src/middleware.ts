import { NextResponse } from 'next/server';
import { auth } from '@/auth'; 
import { UserRole } from '@prisma/client'; 

// Define public routes that should not trigger authentication checks
const publicRoutes = [
  '/', // Example: Homepage
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/verify-email', 
  '/jobs', 
  '/companies', 
  // Add other public paths like /about, /contact, etc.
];

// Define routes that require authentication but not a specific role beyond being logged in
// const protectedRoutes = [
//   '/dashboard',
//   '/profile',
//   '/apply', 
//   '/settings',
//   // Add other routes that require a user to be logged in
// ];

// Define routes that require COMPANY_ADMIN role
const companyAdminRoutes = [
  '/company/dashboard',
  '/company/jobs/manage',
  '/company/applicants',
];

// Define routes that require ADMIN or Developer role (site/platform admins)
const siteAdminRoutes = [
  '/admin/users',
  '/admin/analytics',
  '/developer/subscriptions', // Example specific to Developer
  '/developer/assessments',  // Example specific to Developer
];


export default auth(async (req) => {
  const { nextUrl } = req;
  const session = req.auth; // Session is attached to req by the `auth` middleware wrapper

  const isAuthenticated = !!session?.user;
  const isEmailVerified = session?.user?.isEmailVerified ?? false;
  const userRole = session?.user?.role;

  const currentPath = nextUrl.pathname;

  // Allow access to public routes without authentication
  if (publicRoutes.some(route => currentPath === route || (route.endsWith('/') && currentPath.startsWith(route.slice(0, -1))))) {
    return NextResponse.next();
  }

  // --- Authentication Required Beyond This Point ---
  if (!isAuthenticated) {
    const loginUrl = new URL('/auth/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', currentPath);
    return NextResponse.redirect(loginUrl);
  }

  // --- Email Verification Check (for authenticated users on non-public routes) ---
  if (!isEmailVerified && currentPath !== '/auth/verify-email' && currentPath !== '/api/auth/resend-verification') {
     // Check if the current route is NOT the one for displaying the verification message or resending the token
    const verifyEmailUrl = new URL('/auth/verify-email', nextUrl.origin); 
    return NextResponse.redirect(verifyEmailUrl);
  }


  // --- Role-Based Access Control ---

  // Company Admin Routes
  if (companyAdminRoutes.some(route => currentPath.startsWith(route))) {
    if (userRole !== UserRole.COMPANY_ADMIN && userRole !== UserRole.ADMIN && userRole !== UserRole.Developer) { 
      return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin)); 
    }
  }

  // Site Admin / Developer Routes
  if (siteAdminRoutes.some(route => currentPath.startsWith(route))) {
    // Specific check for developer routes if they are distinct
    if (currentPath.startsWith('/developer/') && userRole !== UserRole.Developer && userRole !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin));
    }
    // General check for other admin routes
    if (!currentPath.startsWith('/developer/') && userRole !== UserRole.ADMIN && userRole !== UserRole.Developer) {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin));
    }
  }
  return NextResponse.next();
});


// Ensures this middleware runs on specific paths.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|images).*)',
  ],
};
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  User, 
  LogOut,
  Settings,
  Heart,
  FileText,
  Crown,
  Building2
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStores';
import { useNavbarStore } from '@/stores/navbarStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

export function NavbarDesktop() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { navigationItems } = useNavbarStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Helper function to get profile link based on user role
  const getProfileLink = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'COMPANY_ADMIN':
        // If you have companyId in user object, use it. Otherwise, you'll need to fetch it.
        // For now, you might need to create a separate page that redirects to the correct company
        return user.companyId ? `/companies/${user.companyId}` : '/dashboard/company-redirect';
      case 'ADMIN':
      case 'USER':
      case 'Developer':
      default:
        return '/dashboard';
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {navigationItems.map((item) => (
          <motion.div key={item.href} whileHover={{ y: -2 }}>
            <Link
              href={item.href}
              className="flex items-center space-x-2 text-white hover:text-accent dark:hover:text-accent transition-colors duration-300 font-medium group"
            >
              <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <span>{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Auth Section */}
      <div className="hidden md:flex items-center space-x-4">
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-4">
            {/* Role Badges */}
            {user.role === 'ADMIN' && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                <Crown className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
            {user.role === 'COMPANY_ADMIN' && (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-0">
                <Building2 className="h-3 w-3 mr-1" />
                Company Admin
              </Badge>
            )}
            {user.role === 'Developer' && (
              <Badge className="bg-gradient-to-r from-purple-500 to-purple-700 text-white border-0">
                <Crown className="h-3 w-3 mr-1" />
                Developer
              </Badge>
            )}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full text-white">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">{user.role.replace('_', ' ')}</p>
                </div>
                <DropdownMenuSeparator />
                
                {/* Profile Menu Item - Role-aware */}
                <DropdownMenuItem asChild>
                  <Link href={getProfileLink()} className="flex items-center">
                    {user.role === 'COMPANY_ADMIN' ? (
                      <>
                        <Building2 className="mr-2 h-4 w-4" />
                        Company Profile
                      </>
                    ) : (
                      <>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </>
                    )}
                  </Link>
                </DropdownMenuItem>

                {/* Role-specific menu items */}
                {user.role === 'USER' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/applications" className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        My Applications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/saved-jobs" className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        Saved Jobs
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                {user.role === 'COMPANY_ADMIN' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/companies/${user.companyId || 'manage'}/jobs`} className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Job Management
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center space-x-3 text-white">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="bg-white text-primary hover:bg-accent hover:text-white">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
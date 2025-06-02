'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cog, User, LogOut, Settings, Home, ChevronRight } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home,
    description: 'Track your job application'
  },
  { 
    name: 'Profile', 
    href: '/dashboard/profile', 
    icon: User,
    description: 'Manage your profile'
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings,
    description: 'Account preferences',
    comingSoon: true
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen flex flex-col fixed shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
            <Cog className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground">WorkVault</h1>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Navigation
          </h2>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            
            return (
              <div key={item.name} className="relative">
                <Link
                  href={item.comingSoon ? '#' : item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground",
                    item.comingSoon && "cursor-not-allowed opacity-60"
                  )}
                  onClick={item.comingSoon ? (e) => e.preventDefault() : undefined}
                >
                  <IconComponent className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                  )} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate">{item.name}</span>
                    {!isActive && (
                      <span className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </span>
                    )}
                  </div>
                  {item.comingSoon && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                      Soon
                    </Badge>
                  )}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-primary-foreground" />
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 mt-auto">
        <div className="space-y-2">
          <Separator className="my-2" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
        
        {/* Optional: User info section */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-primary-foreground" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-foreground truncate">Welcome back!</span>
              <span className="text-xs text-muted-foreground truncate">Manage your job search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
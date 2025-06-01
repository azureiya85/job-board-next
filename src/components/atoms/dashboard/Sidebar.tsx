'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cog, User, Briefcase, LogOut } from 'lucide-react'; 
import { signOut } from 'next-auth/react'; 

// const LOGO_URL = "/logo.png"; // Keep for later

const navItems = [
  { name: 'My Applications', href: '/dashboard', icon: Briefcase },
  { name: 'My Profile', href: '/dashboard/profile', icon: User },
  // { name: 'Settings', href: '/dashboard/settings', icon: Settings }, // For future use
];

export default function SidebarNav() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' }); // Redirect to login page after sign out
  };

  return (
    <div className="w-64 bg-primary-600 text-gray-100 min-h-screen flex flex-col fixed"> 
      <div className="p-5 border-b border-gray-700">
        <Link href="/" className="flex items-center gap-2">
          <Cog className="w-8 h-8 text-primary-400" /> 
          <h1 className="text-xl font-semibold">User Dashboard</h1>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
              ${pathname === item.href
                ? ' text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-3 mt-auto border-t border-gray-700">
        <button
          onClick={handleLogout} 
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
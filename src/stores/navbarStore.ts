import { create } from 'zustand';
import { 
  Briefcase, 
  Building, 
  LucideIcon
} from 'lucide-react';

interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavbarState {
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  navigationItems: NavigationItem[];
  
  // Actions
  setIsScrolled: (scrolled: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useNavbarStore = create<NavbarState>((set) => ({
  isScrolled: false,
  isMobileMenuOpen: false,
  navigationItems: [
    { href: '/jobs', label: 'Find Jobs', icon: Briefcase },
    { href: '/companies', label: 'Companies', icon: Building },
  ],
  
  // Actions
  setIsScrolled: (scrolled) => set({ isScrolled: scrolled }),
  setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
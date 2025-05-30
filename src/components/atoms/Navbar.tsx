'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cog } from 'lucide-react';
import { useNavbarStore } from '@/stores/navbarStore';
import { NavbarDesktop } from './NavbarDesktop';
import { NavbarMobile } from './NavbarMobile';

export function Navbar() {
  const { isScrolled, setIsScrolled } = useNavbarStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsScrolled]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-primary/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg'
          : 'bg-primary'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur-md group-hover:blur-lg transition-all duration-300" />
                <Cog className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                Work Vault
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation & Auth */}
          <NavbarDesktop />

          {/* Mobile Menu */}
          <NavbarMobile />
        </div>
      </nav>
    </motion.header>
  );
}
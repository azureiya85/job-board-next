'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  ArrowLeft, 
  MapPin, 
  Building, 
  Briefcase,
  TrendingUp,
  Compass,
  Zap
} from 'lucide-react';

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const floatingElements = [
    { icon: MapPin, delay: 0.5, x: 50, y: -30 },
    { icon: Building, delay: 0.8, x: -40, y: 20 },
    { icon: Briefcase, delay: 1.1, x: 60, y: 40 },
    { icon: TrendingUp, delay: 1.4, x: -50, y: -10 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: 0.1, 
            scale: 1,
            x: element.x,
            y: element.y,
            rotate: 360
          }}
          transition={{ 
            delay: element.delay,
            duration: 2,
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
          className="absolute"
        >
          <element.icon className="h-8 w-8 text-primary" />
        </motion.div>
      ))}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full text-center relative z-10"
      >
        {/* Main 404 Card */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-2xl">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            
            {/* Floating animation element */}
            <div className="absolute top-6 right-6">
              <motion.div
                animate={{ 
                  y: [-10, 10, -10],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="opacity-30"
              >
                <Compass className="h-6 w-6 text-primary" />
              </motion.div>
            </div>

            <CardHeader className="pb-6 relative z-10">
              <motion.div
                variants={itemVariants}
                className="mb-4"
              >
                <div className="relative inline-block">
                  <motion.h1 
                    className="text-9xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent"
                    animate={{ 
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    style={{ backgroundSize: "200% 200%" }}
                  >
                    404
                  </motion.h1>
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="h-8 w-8 text-yellow-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <CardTitle className="text-3xl font-bold text-foreground mb-3">
                  Oops! Page Not Found
                </CardTitle>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Looks like this job opportunity has moved to a new location, 
                  or the page you&apos;re looking for doesn&apos;t exist.
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              {/* Suggestion Cards */}
              <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Search className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Search Jobs</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Find the perfect opportunity for your career
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-foreground">Featured Jobs</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Explore our top recommended positions
                  </p>
                </motion.div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-6"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Link
                    href="/"
                    className="inline-flex w-full items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <Home className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Back to Home
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Link
                    href="/jobs"
                    className="inline-flex w-full items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-foreground font-semibold rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary/50 transition-all duration-300 group"
                  >
                    <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Browse Jobs
                  </Link>
                </motion.div>
              </motion.div>

              {/* Back Link */}
              <motion.div variants={itemVariants} className="pt-4">
                <motion.button
                  onClick={() => window.history.back()}
                  whileHover={{ x: -5 }}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300 group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  Go back to previous page
                </motion.button>
              </motion.div>
            </CardContent>

            {/* Bottom gradient glow */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
          </Card>
        </motion.div>

        {/* Additional Help Badge */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
            whileHover={{ scale: 1.05 }}
          >
            <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white border-0 shadow-sm px-4 py-2 text-sm">
              Need help? Contact our support team
            </Badge>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
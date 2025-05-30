'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  MapPin, 
  Building, 
  DollarSign, 
  Clock,
  TrendingUp,
  Zap,
  Sparkles
} from 'lucide-react';

export default function Loading() {
  const pulseVariants = {
    initial: { scale: 1, opacity: 0.7 },
    animate: { 
      scale: [1, 1.1, 1], 
      opacity: [0.7, 1, 0.7] 
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const sparkleVariants = {
    animate: {
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Skeleton job cards data
  const skeletonCards = Array.from({ length: 3 }, (_, i) => ({
    id: i,
    delay: i * 0.2
  }));

  const iconElements = [
    { icon: Briefcase, delay: 0.3, position: 'top-16 left-16' },
    { icon: MapPin, delay: 0.6, position: 'top-20 right-20' },
    { icon: Building, delay: 0.9, position: 'bottom-20 left-20' },
    { icon: DollarSign, delay: 1.2, position: 'bottom-16 right-16' },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Icons */}
        {iconElements.map((element, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 0.1, 
              scale: 1,
              rotate: 360
            }}
            transition={{ 
              delay: element.delay,
              duration: 2,
              rotate: { duration: 15, repeat: Infinity, ease: "linear" }
            }}
            className={`absolute ${element.position} hidden lg:block`}
          >
            <element.icon className="h-12 w-12 text-primary" />
          </motion.div>
        ))}

        {/* Floating sparkles */}
        <motion.div
          variants={sparkleVariants}
          animate="animate"
          className="absolute top-10 left-1/4"
        >
          <Sparkles className="h-4 w-4 text-yellow-400" />
        </motion.div>
        <motion.div
          variants={sparkleVariants}
          animate="animate"
          style={{ animationDelay: '1s' }}
          className="absolute bottom-10 right-1/4"
        >
          <Zap className="h-4 w-4 text-blue-400" />
        </motion.div>

        <div className="max-w-6xl w-full">
          {/* Main Loading Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Loading Spinner with Job Icon */}
            <motion.div
              className="relative mx-auto mb-8 w-24 h-24"
              variants={floatingVariants}
              animate="animate"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-primary to-purple-500 opacity-75 animate-ping"></div>
              <div className="absolute inset-4 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-lg">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Briefcase className="h-8 w-8 text-primary" />
                </motion.div>
              </div>
            </motion.div>

            {/* Loading Text */}
            <motion.h1 
              className="text-4xl font-bold mb-4"
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                Loading Amazing Jobs
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl text-muted-foreground mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Finding the perfect opportunities for you...
            </motion.p>

            {/* Loading Progress Dots */}
            <motion.div 
              className="flex justify-center gap-2 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>

            {/* Status Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white border-0 shadow-lg px-4 py-2 text-sm">
                <TrendingUp className="mr-2 h-3 w-3" />
                Searching database...
              </Badge>
            </motion.div>
          </motion.div>

          {/* Skeleton Job Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {skeletonCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + card.delay, duration: 0.5 }}
              >
                <Card className="h-full relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-lg">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  
                  <CardContent className="p-6 space-y-4">
                    {/* Company logo skeleton */}
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="flex-1 space-y-2">
                        <motion.div 
                          className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                        />
                        <motion.div 
                          className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                        />
                      </div>
                    </div>

                    {/* Location skeleton */}
                    <motion.div 
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-100/50 dark:bg-gray-800/50"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    >
                      <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    </motion.div>

                    {/* Employment type skeleton */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                      </div>
                      <motion.div 
                        className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>

                    {/* Bottom info skeleton */}
                    <div className="flex items-center justify-between pt-2">
                      <motion.div 
                        className="flex items-center gap-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Loading Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center mt-12"
          >
            <p className="text-sm text-muted-foreground">
              💡 Pro tip: Use filters to narrow down your search and find exactly what you are looking for
            </p>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
}
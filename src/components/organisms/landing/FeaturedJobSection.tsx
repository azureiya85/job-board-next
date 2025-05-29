'use client'

import { FeaturedJobCard } from '@/components/molecules/landing/FeaturedJobCard';
import { JobPostingFeatured } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Sparkles, Briefcase, TrendingUp } from 'lucide-react';

interface FeaturedJobSectionProps {
  jobs: JobPostingFeatured[];
}

export function FeaturedJobSection({ jobs }: FeaturedJobSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!jobs || jobs.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="mb-8 text-3xl font-bold tracking-tight font-heading md:text-4xl text-foreground">
              Newest Opportunities
            </h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Briefcase className="h-5 w-5" />
              <p>No job openings at the moment. Please check back later!</p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Duplicate jobs to create seamless infinite loop
  const duplicatedJobs = [...jobs, ...jobs, ...jobs];
  
  return (
    <section 
      id="featured-jobs" 
      className="py-16 md:py-24 bg-gradient-to-br from-surface-500 via-background to-surface-300 dark:from-secondary-800 dark:via-background dark:to-secondary-900 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl"></div>
        
        {/* Floating sparkles */}
        {[
          { left: 15, top: 20, duration: 4, delay: 0 },
          { left: 75, top: 10, duration: 3.5, delay: 0.5 },
          { left: 45, top: 80, duration: 5, delay: 1 },
          { left: 85, top: 60, duration: 3, delay: 1.5 },
          { left: 25, top: 45, duration: 4.5, delay: 0.8 },
          { left: 65, top: 25, duration: 3.8, delay: 0.3 },
        ].map((sparkle, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: sparkle.duration,
              repeat: Infinity,
              delay: sparkle.delay,
            }}
          >
            <Sparkles className="h-4 w-4 text-primary/30" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="h-4 w-4" />
            Hot Opportunities
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-heading mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Latest Job Openings
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover exciting career opportunities from top companies. Fresh listings updated daily.
          </p>
        </motion.div>

        {/* Infinite Scrolling Carousel */}
        <div className="relative">
          <div 
            className="overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              className="flex gap-0"
              animate={{
                x: isHovered ? 0 : `-${(jobs.length * 344)}px`, // 344px = 320px width + 24px gap
              }}
              transition={{
                duration: isHovered ? 0 : jobs.length * 8, // Slower animation
                ease: "linear",
                repeat: isHovered ? 0 : Infinity,
              }}
              style={{
                width: `${duplicatedJobs.length * 344}px`,
              }}
            >
              {duplicatedJobs.map((job, index) => (
                <FeaturedJobCard
                  key={`${job.id}-${Math.floor(index / jobs.length)}`}
                  job={job}
                  index={index % jobs.length}
                />
              ))}
            </motion.div>
          </div>

          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-surface-500 to-transparent dark:from-secondary-800 dark:to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-surface-500 to-transparent dark:from-secondary-800 dark:to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Hover instruction */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-muted-foreground/70 flex items-center justify-center gap-2">
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.span>
            Hover to pause and explore
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              ✨
            </motion.span>
          </p>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Briefcase className="h-5 w-5" />
            Explore All Opportunities
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
import { HeroSection } from '@/components/organisms/landing/HeroSection';
import { FeaturedJobSection } from '@/components/organisms/landing/FeaturedJobSection';
import { JobPostingFeatured } from '@/types';

interface HeroPageTemplateProps {
  latestJobs: JobPostingFeatured[];
}

export function HeroPageTemplate({ latestJobs }: HeroPageTemplateProps) {
  return (
    <>
      <HeroSection />
      <FeaturedJobSection jobs={latestJobs} />
    </>
  );
}
import { HeroPageTemplate } from '@/components/templates/landing/HeroPageTemplate';
import { getLatestFeaturedJobs } from '@/lib/jobsUtils'; 
import { unstable_noStore as noStore } from 'next/cache';
import { JobListPage } from '@/components/templates/landing/JobListPageTemplate';

export default async function LandingPage() {
  noStore();
  const latestJobs = await getLatestFeaturedJobs(5);
  return (
    <>
      <HeroPageTemplate latestJobs={latestJobs} />
      <JobListPage />
    </>
  );
}
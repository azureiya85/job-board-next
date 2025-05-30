import { notFound } from 'next/navigation';
import { JobPostingFeatured } from '@/types';
import { JobDetailsHeader } from '@/components/templates/jobs/JobDetailsHeader';
import { JobDetailsContent } from '@/components/templates/jobs/JobDetailsContent';
import { JobDetailsRelated } from '@/components/templates/jobs/JobDetailsRelated';

interface JobDetailPageProps {
  params: Promise<{ id: string }>; 
}

// Function to fetch individual job data from the API route
async function fetchJobFromApi(id: string): Promise<JobPostingFeatured | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/jobs/${id}`;

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store', // Fresh data
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Job not found
      }
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const job = await response.json();
    return job as JobPostingFeatured;
  } catch (error) {
    console.error('Failed to fetch job from API:', error);
    return null;
  }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params; 
  const job = await fetchJobFromApi(id);

  if (!job) {
    notFound(); 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <JobDetailsHeader job={job} />
        <JobDetailsContent job={job} />
        <div className="mt-8">
          <JobDetailsRelated currentJob={job} />
        </div>
      </div>
    </div>
  );
}
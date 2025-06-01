'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStores'; 
import ApplicationCard, { ApplicationWithDetails } from '@/components/atoms/dashboard/ApplicationCard';
import ApplicationDetailModal from '@/components/atoms/modals/dashboard/ApplicationDetailsModal';
import { FileText, AlertTriangle } from 'lucide-react';

export default function MyApplicationsPage() {
  const { user } = useAuthStore(); // Or however you get the current user's ID
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);

  useEffect(() => {
    if (user?.id) {
      const fetchApplications = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/users/${user.id}/applications`);
          if (!response.ok) {
            throw new Error(`Failed to fetch applications: ${response.statusText}`);
          }
          const data = await response.json();
          setApplications(data);
        } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchApplications();
    } else {
      setIsLoading(false); // No user ID, nothing to load
    }
  }, [user?.id]);

  const handleViewDetails = (application: ApplicationWithDetails) => {
    setSelectedApplication(application);
  };

  const handleCloseModal = () => {
    setSelectedApplication(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
         <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200 text-red-700 flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-red-500" />
        <div>
          <h3 className="font-semibold">Error loading applications</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Job Applications</h1>
      {applications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Applications Yet</h2>
          <p className="text-gray-500">You haven&lsquo;t applied for any jobs. Start exploring and find your next opportunity!</p>
          {/* Optional: Link to job search page */}
          {/* <Link href="/jobs" className="mt-4 inline-block bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Find Jobs
          </Link> */}
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} onViewDetails={handleViewDetails} />
          ))}
        </div>
      )}
      <ApplicationDetailModal application={selectedApplication} onClose={handleCloseModal} />
    </div>
  );
}
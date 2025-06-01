'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStores'; 
import ProfileDisplay, { UserProfile } from '@/components/molecules/dashboard/ProfileDisplay'; 
import { AlertTriangle } from 'lucide-react';

export default function UserProfilePage() {
  const { user: authUser } = useAuthStore(); 
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser?.id) {
      const fetchUserProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Using your existing API endpoint for user details
          const response = await fetch(`/api/users/${authUser.id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch profile: ${response.statusText}`);
          }
          const data = await response.json();
          setProfileData(data);
        } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserProfile();
    } else {
      setIsLoading(false); // No user ID, nothing to load
    }
  }, [authUser?.id]);

   if (isLoading && !profileData) { // Show full page loader if no data yet
    return (
      <div className="bg-white p-8 rounded-lg shadow-md border animate-pulse">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
       <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200 text-red-700 flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-red-500" />
        <div>
          <h3 className="font-semibold">Error loading profile</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
      <ProfileDisplay user={profileData} /> 
    </div>
  );
}
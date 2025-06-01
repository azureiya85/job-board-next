'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Camera, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { UserRole } from '@prisma/client'; 
import { useProfileEditStore } from '@/stores/profileEditStores';
import { DashboardInfo } from '@/components/organisms/dashboard/DashboardInfo';
import { DashboardPassword } from '@/components/organisms/dashboard/DashboardPassword';
import { DashboardEmail } from '@/components/organisms/dashboard/DashboardEmail';
import { DashboardImage } from '@/components/organisms/dashboard/DashboardImage';


// Define a props type that all tab components will receive
interface TabComponentProps {
  userRole: UserRole;
}

const tabComponents: Record<string, React.FC<TabComponentProps>> = {
  personal: DashboardInfo,
  security: DashboardPassword,
  email: DashboardEmail,
  photo: DashboardImage,
};

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    user,
    initialLoading,
    message,
    activeTab,
    fetchUserData,
    setActiveTab,
    setMessage,
  } = useProfileEditStore();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }
    // Only fetch if user data is not already present or if explicitly needed
    fetchUserData(session.user.id);
  }, [session, status, router, fetchUserData]);


  if (initialLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user && !initialLoading) { // This means fetching failed
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">
            Failed to load profile data. {message?.text && `Error: ${message.text}`}
          </p>
           <button
            onClick={() => session?.user?.id && fetchUserData(session.user.id)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-600">An unexpected error occurred or user data is unavailable.</p>
        </div>
    );
  }

  const ActiveTabComponent = tabComponents[activeTab];

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="cursor-pointer flex items-center text-gray-600 hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md flex items-center ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto text-sm font-medium text-current hover:opacity-75">Dismiss</button>
          </div>
        )}

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'security', label: 'Password', icon: Lock },
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'photo', label: 'Profile Photo', icon: Camera }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center cursor-pointer ${
                  activeTab === id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          {ActiveTabComponent && <ActiveTabComponent userRole={user.role} />}
        </div>
      </div>
    </div>
  );
}
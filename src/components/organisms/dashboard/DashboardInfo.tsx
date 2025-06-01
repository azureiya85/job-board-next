'use client';

import { UserRole } from '@prisma/client';
import { Save, AlertCircle } from 'lucide-react';
import { useProfileEditStore } from '@/stores/profileEditStores';
import { genderOptions, educationOptions } from '@/lib/profileEditHelpers';

interface DashboardInfoProps {
  userRole: UserRole; 
}

export function DashboardInfo({ userRole }: DashboardInfoProps) {
  // Recommended Solution: Select properties individually (no shallow needed, prevents re-renders)
  const profileForm = useProfileEditStore((state) => state.profileForm);
  const setProfileForm = useProfileEditStore((state) => state.setProfileForm);
  const submitProfileForm = useProfileEditStore((state) => state.submitProfileForm);
  const savingProfile = useProfileEditStore((state) => state.savingProfile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitProfileForm();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>
      
      {userRole === UserRole.USER && (
        <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-md">
          <p className="text-primary-800 text-sm">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            As a user, you are required to complete all personal information fields.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name {userRole === UserRole.USER && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={profileForm.firstName}
            onChange={(e) => setProfileForm({ firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={userRole === UserRole.USER}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name {userRole === UserRole.USER && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={profileForm.lastName}
            onChange={(e) => setProfileForm({ lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={userRole === UserRole.USER}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={profileForm.phoneNumber}
            onChange={(e) => setProfileForm({ phoneNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth {userRole === UserRole.USER && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            value={profileForm.dateOfBirth}
            onChange={(e) => setProfileForm({ dateOfBirth: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={userRole === UserRole.USER}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender {userRole === UserRole.USER && <span className="text-red-500">*</span>}
          </label>
          <select
            value={profileForm.gender}
            onChange={(e) => setProfileForm({ gender: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={userRole === UserRole.USER}
          >
            <option value="">Select Gender</option>
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Education Level {userRole === UserRole.USER && <span className="text-red-500">*</span>}
          </label>
          <select
            value={profileForm.lastEducation}
            onChange={(e) => setProfileForm({ lastEducation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={userRole === UserRole.USER}
          >
            <option value="">Select Education Level</option>
            {educationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Address {userRole === UserRole.USER && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={profileForm.currentAddress}
            onChange={(e) => setProfileForm({ currentAddress: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={userRole === UserRole.USER}
            placeholder="Enter your complete address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            value={profileForm.country}
            onChange={(e) => setProfileForm({ country: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={savingProfile}
          className="cursor-pointer transition-colors duration-300 bg-primary-600 hover:bg-accent text-white px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savingProfile ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
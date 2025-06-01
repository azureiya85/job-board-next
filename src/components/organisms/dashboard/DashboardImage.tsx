'use client';

import Image from 'next/image';
import { UserCircle, Save, AlertCircle } from 'lucide-react';
import { useProfileEditStore } from '@/stores/profileEditStores';

export function DashboardImage() {
  // Individual property selection to prevent unnecessary re-renders
  const user = useProfileEditStore((state) => state.user);
  const profileImageFile = useProfileEditStore((state) => state.profileImageFile);
  const profileImagePreview = useProfileEditStore((state) => state.profileImagePreview);
  const setProfileImageFile = useProfileEditStore((state) => state.setProfileImageFile);
  const clearProfileImagePreview = useProfileEditStore((state) => state.clearProfileImagePreview);
  const uploadProfileImage = useProfileEditStore((state) => state.uploadProfileImage);
  const uploadingImage = useProfileEditStore((state) => state.uploadingImage);
  const removeProfileImage = useProfileEditStore((state) => state.removeProfileImage);

  if (!user) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setProfileImageFile(file || null);
    e.target.value = ''; // Reset file input to allow re-selection of the same file
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Photo</h2>
      
      <div className="mb-8">
        <h3 className="font-medium text-gray-800 mb-4">Current Photo</h3>
        <div className="flex items-center space-x-6">
          <div className="relative w-30 h-30"> 
            {user.profileImage ? (
              <Image
                src={user.profileImage}
                alt="Profile"
                width={120}
                height={120}
                className="rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                <UserCircle className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {user.profileImage ? 'You have a profile photo set.' : 'No profile photo set.'}
            </p>
            <p className="text-xs text-gray-500">
              Allowed formats: JPG, JPEG, PNG (max 1MB)
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="font-medium text-gray-800">Upload New Photo</h3>
        <div>
          <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-primary/10 file:text-primary/90
                hover:file:bg-primary/50
                file:cursor-pointer cursor-pointer"
            />
          </label>
          <p className="mt-2 text-xs text-gray-500">
            Maximum file size: 1MB. Supported formats: JPG, JPEG, PNG
          </p>
        </div>

        {profileImagePreview && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-800 mb-3">Preview</h4>
            <div className="flex items-center space-x-6">
              <div className="relative w-30 h-30">
                <Image
                  src={profileImagePreview}
                  alt="Preview"
                  width={120}
                  height={120}
                  className="rounded-full object-cover border-4 border-blue-200"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={uploadProfileImage}
                  disabled={uploadingImage || !profileImageFile}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Photo
                    </>
                  )}
                </button>
                <button
                  onClick={clearProfileImagePreview}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-md border">
          <h4 className="font-medium text-gray-800 mb-2">Photo Guidelines</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use a clear, high-quality photo of yourself</li>
            <li>• Make sure your face is clearly visible</li>
            <li>• Avoid using logos, text, or inappropriate content</li>
            <li>• Square photos work best for profile pictures</li>
          </ul>
        </div>

        {user.profileImage && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3">Remove Current Photo</h4>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently remove your current profile photo.
            </p>
            <button
              onClick={removeProfileImage}
              disabled={uploadingImage}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {uploadingImage ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Removing...
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Remove Photo
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
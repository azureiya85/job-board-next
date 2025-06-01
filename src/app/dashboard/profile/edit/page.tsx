'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  UserCircle,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { Gender, Education, UserRole } from '@prisma/client';

// Types
interface Province {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  isEmailVerified: boolean;
  role: UserRole;
  dateOfBirth: string | null;
  gender: Gender | null;
  lastEducation: Education | null;
  currentAddress: string | null;
  phoneNumber: string | null;
  provinceId: string | null;
  province: Province | null;
  cityId: string | null;
  city: City | null;
  country: string | null;
}

// Constants
const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const educationOptions = [
  { value: 'HIGH_SCHOOL', label: 'High School/Equivalent' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'BACHELOR', label: "Bachelor's Degree" },
  { value: 'MASTER', label: "Master's Degree" },
  { value: 'DOCTORATE', label: 'Doctorate' },
  { value: 'OTHER', label: 'Other' },
];

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    lastEducation: '',
    currentAddress: '',
    country: 'Indonesia'
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [emailForm, setEmailForm] = useState({
    newEmail: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
  try {
    const response = await fetch(`/api/users/${session?.user?.id}`);
    if (!response.ok) throw new Error('Failed to fetch user data');
    
    const userData = await response.json();
    setUser(userData);
    
    // Populate form
    setProfileForm({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phoneNumber: userData.phoneNumber || '',
      dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
      gender: userData.gender || '',
      lastEducation: userData.lastEducation || '',
      currentAddress: userData.currentAddress || '',
      country: userData.country || 'Indonesia'
    });
    
    setEmailForm({
      newEmail: userData.email || ''
    });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    setMessage({ type: 'error', text: 'Failed to load profile data' });
  } finally {
    setLoading(false);
  }
}, [session?.user?.id]);

// Then the useEffect becomes:
useEffect(() => {
  if (status === 'loading') return;
  if (!session?.user) {
    router.push('/auth/login');
    return;
  }
  
  fetchUserData();
}, [session, status, router, fetchUserData]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${user?.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update password');
      }

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update password' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          userId: user?.id
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update email');
      }

      setMessage({ type: 'success', text: result.message });
      await fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error updating email:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update email' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Only JPG, JPEG, PNG are allowed.' });
      return;
    }

    // Validate file size (1MB)
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'File is too large. Maximum size is 1MB.' });
      return;
    }

    setProfileImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!profileImageFile) return;

    setUploadingImage(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('profileImage', profileImageFile);

      const response = await fetch(`/api/users/${user?.id}/profile-image`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const result = await response.json();
      setMessage({ type: 'success', text: result.message });
      
      // Reset upload state
      setProfileImageFile(null);
      setProfileImagePreview(null);
      
      await fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to upload image' 
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleResendEmailVerification = async () => {
    setResendingEmail(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend verification email');
      }

      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      console.error('Error resending email:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to resend verification email' 
      });
    } finally {
      setResendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="cursor-pointer flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        {/* Message Display */}
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
          </div>
        )}

        {/* Tab Navigation */}
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
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <form onSubmit={handleProfileSubmit} className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>
              
              {user.role === 'USER' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 text-sm">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    As a user, you are required to complete all personal information fields.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name {user.role === 'USER' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={user.role === 'USER'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name {user.role === 'USER' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={user.role === 'USER'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth {user.role === 'USER' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={user.role === 'USER'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender {user.role === 'USER' && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={user.role === 'USER'}
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
                    Education Level {user.role === 'USER' && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={profileForm.lastEducation}
                    onChange={(e) => setProfileForm({ ...profileForm, lastEducation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={user.role === 'USER'}
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
                    Current Address {user.role === 'USER' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={profileForm.currentAddress}
                    onChange={(e) => setProfileForm({ ...profileForm, currentAddress: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={user.role === 'USER'}
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
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
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
          )}

          {/* Password Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>
              
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Email Settings</h2>
              
              {/* Current Email Status */}
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">Current Email</h3>
                <p className="text-gray-600">{user.email}</p>
                <div className="mt-2">
                  {user.isEmailVerified ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Not Verified
                      </span>
                      <button
                        onClick={handleResendEmailVerification}
                        disabled={resendingEmail}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendingEmail ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Resend Verification
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

             {/* Change Email Form */}
              <form onSubmit={handleEmailSubmit}>
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You will need to verify the new email address before it becomes active.
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving || emailForm.newEmail === user.email}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Update Email
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Profile Photo Tab */}
          {activeTab === 'photo' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Photo</h2>
              
              {/* Current Photo Display */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-800 mb-4">Current Photo</h3>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt="Profile"
                        width={120}
                        height={120}
                        className="w-30 h-30 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
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

              {/* Upload New Photo */}
              <div className="space-y-6">
                <h3 className="font-medium text-gray-800">Upload New Photo</h3>
                
                {/* File Input */}
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
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        file:cursor-pointer cursor-pointer"
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    Maximum file size: 1MB. Supported formats: JPG, JPEG, PNG
                  </p>
                </div>

                {/* Image Preview */}
                {profileImagePreview && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-800 mb-3">Preview</h4>
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Image
                          src={profileImagePreview}
                          alt="Preview"
                          width={120}
                          height={120}
                          className="w-30 h-30 rounded-full object-cover border-4 border-blue-200"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleImageUpload}
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
                          onClick={() => {
                            setProfileImageFile(null);
                            setProfileImagePreview(null);
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Guidelines */}
                <div className="mt-6 p-4 bg-gray-50 rounded-md border">
                  <h4 className="font-medium text-gray-800 mb-2">Photo Guidelines</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use a clear, high-quality photo of yourself</li>
                    <li>• Make sure your face is clearly visible</li>
                    <li>• Avoid using logos, text, or inappropriate content</li>
                    <li>• Square photos work best for profile pictures</li>
                  </ul>
                </div>

                {/* Remove Photo Option */}
                {user.profileImage && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-3">Remove Current Photo</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      This will permanently remove your current profile photo.
                    </p>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to remove your profile photo?')) {
                          try {
                            setUploadingImage(true);
                            const response = await fetch(`/api/users/${user?.id}/profile-image`, {
                              method: 'DELETE'
                            });
                            
                            if (!response.ok) {
                              throw new Error('Failed to remove photo');
                            }
                            
                            setMessage({ type: 'success', text: 'Profile photo removed successfully!' });
                            await fetchUserData();
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          } catch (error) {
                            setMessage({ type: 'error', text: 'Failed to remove profile photo' });
                          } finally {
                            setUploadingImage(false);
                          }
                        }
                      }}
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
          )}
        </div>
      </div>
    </div>
  );
}
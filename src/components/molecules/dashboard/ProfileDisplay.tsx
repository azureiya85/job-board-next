'use client';
import Image from 'next/image';
import { User, Province, City, Gender, Education } from '@prisma/client'; 
import { Mail, UserCircle, Edit3, ShieldCheck, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns'; 
import Link from 'next/link';

export type UserProfile = User & {
  province?: Province | null;
  city?: City | null;
};

interface ProfileDisplayProps {
  user: UserProfile | null; // Allow null for loading state
}

const genderLabels: Record<Gender, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};

const educationLabels: Record<Education, string> = {
  HIGH_SCHOOL: 'High School/Equivalent',
  DIPLOMA: 'Diploma',
  BACHELOR: "Bachelor's Degree",
  MASTER: "Master's Degree",
  DOCTORATE: 'Doctorate',
  OTHER: 'Other',
};


export default function ProfileDisplay({ user }: ProfileDisplayProps) {
  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const {
    name,
    firstName,
    lastName,
    email,
    profileImage,
    isEmailVerified,
    phoneNumber,
    dateOfBirth,
    gender,
    lastEducation,
    currentAddress,
    city,
    province,
    country,
  } = user;

  const displayName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Profile Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={displayName}
                width={96}
                height={96}
                className="rounded-full object-cover border-2 border-primary-200"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <UserCircle className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-semibold text-gray-800">{displayName}</h2>
            <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-4 h-4" /> {email || 'N/A'}
            </p>
            {isEmailVerified ? (
              <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified
              </span>
            ) : (
              <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                <ShieldAlert className="w-3 h-3 mr-1" /> Not Verified
              </span>
            )}
          </div>
          <Link
            href="/dashboard/profile/edit" // Or your actual edit page route
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Personal Information */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-500">Full Name</label>
            <p className="text-gray-800">{displayName}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Email</label>
            <p className="text-gray-800">{email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Phone Number</label>
            <p className="text-gray-800">{phoneNumber || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Date of Birth</label>
            <p className="text-gray-800">
              {dateOfBirth ? format(new Date(dateOfBirth), 'MMMM d, yyyy') : 'Not provided'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Gender</label>
            <p className="text-gray-800">{gender ? genderLabels[gender] : 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Last Education</label>
            <p className="text-gray-800">{lastEducation ? educationLabels[lastEducation] : 'Not provided'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500">Current Address</label>
            <p className="text-gray-800">
              {currentAddress || 'Not provided'}
              {(city || province || country) && <br />}
              {city?.name}{city && province ? ', ' : ''}{province?.name}
              {(city || province) && country ? ', ' : ''}{country && country !== "Indonesia" ? country : (city || province ? 'Indonesia' : '')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
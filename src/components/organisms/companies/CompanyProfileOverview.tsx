'use client';

import { MapPin, Users, Calendar, Globe, Mail, Phone, Star } from 'lucide-react';
import { useCompanyProfileStore } from '@/stores/companyProfileStores';
import Image from 'next/image';

interface CompanyProfileOverviewProps {
  className?: string;
}

export default function CompanyProfileOverview({ className }: CompanyProfileOverviewProps) {
  const company = useCompanyProfileStore((state) => state.company);

  if (!company) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const formatCompanySize = (size?: string) => {
    if (!size) return 'Not specified';
    
    const sizeMap: Record<string, string> = {
      'STARTUP': '1-10 employees',
      'SMALL': '11-50 employees', 
      'MEDIUM': '51-200 employees',
      'LARGE': '201-1000 employees',
      'ENTERPRISE': '1000+ employees'
    };
    
    return sizeMap[size] || size;
  };

  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating 
            ? 'fill-yellow-200 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Company Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start gap-6">
          {company.logo && (
            <div className="flex-shrink-0">
           <Image
  src={company.logo}
  alt={`${company.name} logo`}
  width={80}
  height={80}
  className="w-20 h-20 rounded-lg object-cover border"
  style={{ width: '80px', height: '80px' }}
  unoptimized={company.logo.startsWith('http')}
/>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {company.name}
                </h1>
                
                {company.industry && (
                  <p className="text-lg text-gray-600 mb-2">
                    {company.industry}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {company.province && company.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{company.city.name}, {company.province.name}</span>
                    </div>
                  )}
                  
                  {company.size && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{formatCompanySize(company.size)}</span>
                    </div>
                  )}
                  
                  {company.foundedYear && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Founded {company.foundedYear}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Rating Summary */}
              {company.stats.totalReviews > 0 && (
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {renderRatingStars(company.stats.averageRating)}
                    </div>
                    <span className="text-lg font-semibold">
                      {company.stats.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {company.stats.totalReviews} reviews
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {company.stats.activeJobs}
          </div>
          <p className="text-gray-600">Active Jobs</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {company.stats.totalReviews}
          </div>
          <p className="text-gray-600">Reviews</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {company.stats.averageRating.toFixed(1)}
          </div>
          <p className="text-gray-600">Rating</p>
        </div>
      </div>

      {/* About Company */}
      {company.description && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            About {company.name}
          </h2>
          <div className="prose max-w-none text-gray-700">
            {company.description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Contact Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {company.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}
            
            {company.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a
                  href={`mailto:${company.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {company.email}
                </a>
              </div>
            )}
            
            {company.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <a
                  href={`tel:${company.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {company.phone}
                </a>
              </div>
            )}
          </div>
          
          <div>
            {company.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <p className="text-gray-700">{company.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Ratings */}
      {company.stats.totalReviews > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Employee Ratings
          </h2>
          
          <div className="space-y-4">
            {[
              { label: 'Company Culture', value: company.stats.ratings.culture },
              { label: 'Work-Life Balance', value: company.stats.ratings.workLifeBalance },
              { label: 'Facilities', value: company.stats.ratings.facilities },
              { label: 'Career Growth', value: company.stats.ratings.career },
            ].map((rating, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  {rating.label}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderRatingStars(rating.value)}
                  </div>
                  <span className="text-sm font-semibold w-8">
                    {rating.value.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
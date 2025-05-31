'use client';

import { MapPin, Users, Calendar, Star } from 'lucide-react';
import { CompanyDetailed } from '@/types';
import Image from 'next/image';

interface CompanyProfileHeaderProps {
  company: CompanyDetailed;
}

export default function CompanyProfileHeader({ company }: CompanyProfileHeaderProps) {
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
    <>
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
    </>
  );
}
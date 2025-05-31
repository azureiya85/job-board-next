'use client';

import { MapPin, Globe, Mail, Phone, Star } from 'lucide-react';
import { CompanyDetailed } from '@/types';

interface CompanyProfileDetailsProps {
  company: CompanyDetailed;
}

export default function CompanyProfileDetails({ company }: CompanyProfileDetailsProps) {
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
    </>
  );
}
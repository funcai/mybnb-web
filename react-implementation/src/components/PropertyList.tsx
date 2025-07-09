import React from 'react';
import { Property } from '../types/property';
import PropertyCard from './PropertyCard';

interface PropertyListProps {
  properties: Property[];
  isLoading?: boolean;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, isLoading = false }) => {

  const handleCardClick = (property: Property) => {
    window.open(property.url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-800 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-slate-700 rounded mb-2 w-32"></div>
                <div className="h-6 bg-slate-700 rounded mb-2 w-64"></div>
                <div className="h-4 bg-slate-700 rounded w-48"></div>
              </div>
              <div className="text-right ml-6">
                <div className="h-8 bg-slate-700 rounded w-24 mb-1"></div>
                <div className="h-4 bg-slate-700 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg">No properties found</div>
        <div className="text-slate-500 text-sm mt-2">Try a different search term</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onClick={() => handleCardClick(property)}
        />
      ))}
    </div>
  );
};

export default PropertyList;
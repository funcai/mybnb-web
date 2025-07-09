import React from 'react';
import { MapPin, Home, Bed } from 'lucide-react';
import { Property } from '../types/property';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const { address, facts } = property;

  return (
    <div 
      onClick={onClick}
      className="bg-slate-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:bg-slate-750 border border-slate-700 hover:border-slate-600"
    >
      {/* Desktop layout */}
      <div className="hidden md:flex items-center justify-between">
        {/* Left side - Property info */}
        <div className="flex-1">
          <div className="flex items-center text-slate-300 mb-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{address.city}, {address.country}</span>
          </div>
          
          <h3 className="text-white font-semibold text-lg mb-2">
            {address.street}, {address.postalCode}
          </h3>
          
          <div className="flex items-center space-x-4 text-slate-400 text-sm">
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              <span>{facts.rooms} room{facts.rooms > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{facts.beds} bed{facts.beds > 1 ? 's' : ''}</span>
            </div>
            <div>
              <span>{facts.area_m2} m²</span>
            </div>
            {facts.furnished && (
              <div className="inline-flex items-center px-2 py-1 bg-green-600 text-green-100 text-xs font-medium rounded-full">
                Furnished
              </div>
            )}
          </div>
        </div>

        {/* Right side - Price */}
        <div className="text-right ml-6">
          <div className="text-2xl font-bold text-white">€{facts.rent_monthly.toLocaleString()}</div>
          <div className="text-slate-400 text-sm">per month</div>
          <div className="text-slate-500 text-xs mt-1">
            Deposit: €{facts.deposit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        {/* Location */}
        <div className="flex items-center text-slate-300 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{address.city}, {address.country}</span>
        </div>
        
        {/* Address */}
        <h3 className="text-white font-semibold text-lg mb-3">
          {address.street}, {address.postalCode}
        </h3>
        
        {/* Property details */}
        <div className="flex flex-wrap items-center gap-3 text-slate-400 text-sm mb-3">
          <div className="flex items-center">
            <Home className="h-4 w-4 mr-1" />
            <span>{facts.rooms} room{facts.rooms > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>{facts.beds} bed{facts.beds > 1 ? 's' : ''}</span>
          </div>
          <div>
            <span>{facts.area_m2} m²</span>
          </div>
        </div>

        {/* Furnished badge */}
        {facts.furnished && (
          <div className="inline-flex items-center px-2 py-1 bg-green-600 text-green-100 text-xs font-medium rounded-full mb-3">
            Furnished
          </div>
        )}
        
        {/* Price section */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <div>
            <div className="text-2xl font-bold text-white">€{facts.rent_monthly.toLocaleString()}</div>
            <div className="text-slate-400 text-sm">per month</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 text-xs">Deposit</div>
            <div className="text-slate-300 text-sm">€{facts.deposit.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
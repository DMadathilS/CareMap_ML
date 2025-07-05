import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Map, List } from 'lucide-react';
import { Clinic } from '../types';
import { ClinicCard } from './ClinicCard';
import { MapView } from './MapView';

interface ClinicResultsProps {
  clinics: Clinic[];
  userLocation?: any;
}

export const ClinicResults: React.FC<ClinicResultsProps> = ({ 
  clinics, 
  userLocation, 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
    console.log(clinics)
  const handleClinicSelect = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    if (viewMode === 'list') {
      setViewMode('map');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Nearby Clinics</h3>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
            
            {/* Scroll Controls (only show in list view) */}
            {viewMode === 'list' && (
              <div className="flex gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          Found {clinics.length} clinics near your location ({userLocation.city})
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'list' ? (
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {clinics.map((clinic) => (
              <div key={clinic.location_ID} className="flex-shrink-0 w-80">
                <div onClick={() => handleClinicSelect(clinic)} className="cursor-pointer">
                  <ClinicCard clinic={clinic} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-96">
            <MapView
              clinics={clinics}
              userLocation={userLocation}
              selectedClinic={selectedClinic}
              onClinicSelect={setSelectedClinic}
            />
          </div>
        )}
      </div>
    </div>
  );
};
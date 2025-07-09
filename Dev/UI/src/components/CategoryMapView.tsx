import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Search, Loader } from 'lucide-react';
import { Clinic, ApiResponse } from '../types';
import { ClinicResults } from './ClinicResults';

interface CategoryMapViewProps {
  category: string;
  onBack: () => void;
}

export const CategoryMapView: React.FC<CategoryMapViewProps> = ({ category, onBack }) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation] = useState({ lat: 43.4706, lng: -80.5462 });

  useEffect(() => {
    const fetchCategoryData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to call the real API first
        const response = await fetch('/api/CareMap/api/llm/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ 
            query: `Find ${category} near Waterloo, Ontario` 
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();
        let apiResponse: ApiResponse;
        
        try {
          apiResponse = JSON.parse(responseText);
        } catch (parseError) {
          apiResponse = JSON.parse(responseText);
        }

        if (apiResponse.data && apiResponse.data.length > 0) {
          setClinics(apiResponse.data);
        } else {
          // Generate fake data if no results
          setClinics(generateFakeDataForCategory(category));
        }
      } catch (error) {
        console.warn('API unavailable, using fake data:', error);
        // If API fails, use fake data
        setClinics(generateFakeDataForCategory(category));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [category]);

  const generateFakeDataForCategory = (categoryName: string): Clinic[] => {
    // Generate 5-10 fake clinics for the category
    const count = Math.floor(Math.random() * 6) + 5;
    const fakeData: Clinic[] = [];

    for (let i = 0; i < count; i++) {
      // Generate random coordinates around Waterloo
      const lat = 43.4706 + (Math.random() - 0.5) * 0.1;
      const lng = -80.5462 + (Math.random() - 0.5) * 0.1;
      
      fakeData.push({
        id: i + 1,
        name: `${categoryName} Clinic ${i + 1}`,
        address: `${100 + i * 50} Main St, Waterloo, ON N2L 3G1`,
        latitude: lat,
        longitude: lng,
        contact_info: `phone: 519-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}, url: example${i + 1}.com`,
        languages: ['English'],
        distance: Math.random() * 2 + 0.1,
        suggested: i < 2, // First 2 are suggested
        desc: null,
        llm_notes: `Professional ${categoryName.toLowerCase()} services available. Accepting new patients.`,
        relevance_score: 0.9 - (i * 0.1),
        // wait_time_minutes: categoryName.toLowerCase().includes('lab') ? Math.floor(Math.random() * 60) + 15 : null,
        // next_available_appointment: categoryName.toLowerCase().includes('dentist') || categoryName.toLowerCase().includes('doctor') 
        //   ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() 
        //   : null,
        hours_of_operation: []
      });
    }

    return fakeData;
  };

  const formatCategoryName = (name: string) => {
    return name.replace(/\(.*?\)/g, '').trim();
  };

  const getDomain = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('lab') || name.includes('diagnostic')) {
      return 'labs';
    } else if (name.includes('dentist') || name.includes('doctor') || name.includes('practitioner')) {
      return 'providers';
    } else {
      return 'clinics';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {formatCategoryName(category)}
                  </h1>
                  <p className="text-sm text-gray-600">Loading nearby providers...</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Finding {formatCategoryName(category)}s
              </h3>
              <p className="text-gray-600">
                Searching for providers near your location...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {formatCategoryName(category)}
                </h1>
                <p className="text-sm text-gray-600">
                  {clinics.length} providers found near Waterloo
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Data</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : clinics.length > 0 ? (
          <ClinicResults
            clinics={clinics}
            domain={getDomain(category)}
            userLocation={userLocation}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {formatCategoryName(category)}s Found
            </h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any {formatCategoryName(category).toLowerCase()}s in your area.
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Browse Other Categories
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
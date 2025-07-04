import React from 'react';
import { MapPin, Phone, Globe, Armchair as Wheelchair, Languages } from 'lucide-react';
import { Clinic } from '../types';

interface ClinicCardProps {
  clinic: Clinic;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({ clinic }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 p-6 transition-all duration-300 hover:shadow-xl ${
      clinic.suggested ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
    }`}>
      {clinic.suggested && (
        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
          Recommended
        </div>
      )}
      
      <h3 className="font-bold text-lg text-gray-900 mb-3">{clinic.name}</h3>
      
      {clinic.bot && (
        <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-800 text-sm">{clinic.bot}</p>
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-gray-700 text-sm">{clinic.address}</p>
            <p className="text-gray-500 text-xs mt-1">
              {clinic.location.latitude.toFixed(4)}, {clinic.location.longitude.toFixed(4)}
            </p>
          </div>
        </div>
        
        {clinic.contact_information.phone.length > 0 && (
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-500" />
            <div className="text-sm text-gray-700">
              {clinic.contact_information.phone.map((phone, index) => (
                <div key={index}>{phone}</div>
              ))}
            </div>
          </div>
        )}
        
        {clinic.contact_information.url && (
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-500" />
            <a 
              href={clinic.contact_information.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Visit Website
            </a>
          </div>
        )}
        
        <div className="flex items-center gap-4 pt-2">
          {clinic.wheelchair_accessible && (
            <div className="flex items-center gap-1">
              <Wheelchair className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">Accessible</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Languages className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">
              {clinic.languages.join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
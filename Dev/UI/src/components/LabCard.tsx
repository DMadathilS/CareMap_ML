import React from 'react';
import { MapPin, Phone, Clock, Calendar, Info } from 'lucide-react';

interface Lab {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_info: string;
  languages: string[];
  distance: number;
  suggested: boolean;
  desc: string;
  llm_notes?: string;
  wait_time_minutes?: number;
  next_available_appointment?: string;
}

interface LabCardProps {
  lab: Lab;
}

export const LabCard: React.FC<LabCardProps> = ({ lab }) => {
  const formatDateTime = (iso: string | undefined): string => {
    if (!iso) return "N/A";
    const date = new Date(iso);
    return date.toLocaleString('en-CA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-md border-2 p-6 mb-4 transition-all duration-300 hover:shadow-xl ${
      lab.suggested ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
    }`}>
      {lab.suggested && (
        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
          Recommended
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{lab.name}</h3>

      <div className="text-sm text-gray-600 mb-4">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
          <div>
            <p>{lab.address}</p>
            <p className="text-xs text-gray-500 mt-0.5">Lat: {lab.latitude.toFixed(4)}, Lon: {lab.longitude.toFixed(4)}</p>
          </div>
        </div>

        {lab.contact_info && (
          <div className="flex items-center gap-2 mt-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <p>{lab.contact_info}</p>
          </div>
        )}

        {lab.wait_time_minutes != null && (
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <p>{lab.wait_time_minutes} min wait</p>
          </div>
        )}

        {lab.next_available_appointment && (
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <p>Next Available: {formatDateTime(lab.next_available_appointment)}</p>
          </div>
        )}

        {lab.languages.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">Languages: {lab.languages.join(', ')}</div>
        )}

        {lab.desc && (
          <div className="mt-4 border-t pt-3 text-sm text-gray-700">
            <Info className="inline-block w-4 h-4 mr-1 text-blue-400" /> {lab.desc}
          </div>
        )}
      </div>
    </div>
  );
};

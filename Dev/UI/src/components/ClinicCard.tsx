import React from 'react';
import { MapPin, Phone, Globe, Armchair as Wheelchair, Languages, Clock, CalendarDays } from 'lucide-react';
import { Clinic } from '../types';

interface ClinicCardProps {
  clinic: Clinic;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({ clinic }) => {
  const formatHours = (hours: Clinic['hours_of_operation'] = []) => {
    return hours.map((h) => {
      const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][h.day_of_week];
      return h.closed ? `${day}: Closed` : `${day}: ${h.open_time?.slice(0, 5)} - ${h.close_time?.slice(0, 5)}`;
    });

  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border-2 p-6 transition-all duration-300 hover:shadow-xl ${
        clinic.suggested ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
      }`}
    >
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
        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-gray-700 text-sm">{clinic.address}</p>
            {/* <p className="text-gray-500 text-xs mt-1">
              {clinic.location.latitude.toFixed(4)}, {clinic.location.longitude.toFixed(4)}
            </p> */}
          </div>
        </div>

        {/* Phone */}
        {clinic.contact_information?.phone?.length > 0 && (
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-500" />
            <div className="text-sm text-gray-700">
              {clinic.contact_information.phone.map((phone, index) => (
                <div key={index}>{phone}</div>
              ))}
            </div>
          </div>
        )}

        {/* Website */}
        {clinic.contact_information?.url && (
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

        {/* Wait Time */}
        {clinic.wait_time_minutes != null && (
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-orange-600">Wait Time: {clinic.wait_time_minutes} mins</span>
          </div>
        )}

        {/* Next Appointment */}
        {clinic.next_available_appointment != null && (
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-green-600">
              Next Appointment: {new Date(clinic.next_available_appointment).toLocaleString()}
            </span>
          </div>
        )}

        {/* Hours of Operation */}
         {/* Hours Tooltip */}
      {clinic.hours_of_operation && clinic.hours_of_operation.length > 0 && (
        <div className="mt-2">
          <p
            className="text-sm text-gray-700 font-semibold underline cursor-help"
            title={formatHours(clinic.hours_of_operation).join("\n")}
          >
            Hours of Operation: (hover to view)
          </p>
        </div>
      )}

        {/* Accessibility and Languages */}
        <div className="flex items-center gap-4 pt-2">
          {clinic.wheelchair_accessible && (
            <div className="flex items-center gap-1">
              <Wheelchair className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">Accessible</span>
            </div>
          )}

          {clinic.languages?.length > 0 && (
            <div className="flex items-center gap-1">
              <Languages className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600">{clinic.languages.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
